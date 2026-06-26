/**
 * translations.js — persisted, entity-scoped content translations.
 * Mount: /api/translations  (all 🔒 JWT)
 *
 *   POST   /api/translations/content      — translate-or-fetch one field of an entity
 *   GET    /api/translations/content      — list translations for an entity in a locale
 *   DELETE /api/translations/content/:id  — admin only; audit-logged
 *   GET    /api/translations/missing      — admin only; entities lacking a target_lang translation
 *
 * Where /api/ai/translate localizes ad-hoc UI strings batch-wise into LevelDB,
 * this layer pins one translation to one (entity_type, entity_id, field,
 * target_lang). Sprint 5 admin will surface this as a "translation queue".
 */
const express = require('express');
const crypto = require('crypto');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { ai } = require('../config/aiProvider');

const router = express.Router();

// Keep these lists in sync with backend/routes/ai.js TR_LANGS and with the
// migration's CHECK constraint on content_translations.entity_type.
const TR_LANGS = {
  en: 'English', hi: 'Hindi', bn: 'Bengali', mr: 'Marathi', ta: 'Tamil',
  te: 'Telugu', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi',
  ml: 'Malayalam', or: 'Odia', ur: 'Urdu'
};
const ENTITY_TYPES = [
  'course','topic','lecture','material','test','question',
  'assignment','certificate','notification','message'
];

// Map entity_type → { table, fields } so /missing can compute coverage.
// Best-effort: only entity types we know how to discover are listed; others
// return [] from /missing (see spec).
const ENTITY_SOURCES = {
  course:      { table: 'courses',          idCol: 'id', fields: ['title','description'] },
  topic:       { table: 'course_topics',    idCol: 'id', fields: ['title','description'] },
  lecture:     { table: 'topic_lectures',   idCol: 'id', fields: ['title','description'] },
  assignment:  { table: 'assignments',      idCol: 'id', fields: ['title','description'] },
  test:        { table: 'tests',            idCol: 'id', fields: ['title','description'] }
};

const sha1 = s => crypto.createHash('sha1').update(String(s || '')).digest('hex');

function parseSingle(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  const raw = (fenced ? fenced[1] : text).trim();
  // Tolerant: accept JSON-array-of-one, JSON-string, or raw text.
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v) && v.length) return String(v[0]);
    if (typeof v === 'string') return v;
  } catch (_) { /* fall through */ }
  return raw;
}

// Joi schema for POST /content. Defined inline (not in validation.js) because
// it's specific to this route and avoids polluting the global schema map.
const contentBodySchema = Joi.object({
  entity_type: Joi.string().valid(...ENTITY_TYPES).required(),
  entity_id:   Joi.string().required(),
  field:       Joi.string().max(64).required(),
  target_lang: Joi.string().valid(...Object.keys(TR_LANGS)).required(),
  source_lang: Joi.string().valid(...Object.keys(TR_LANGS)).optional(),
  source_text: Joi.string().allow('').optional(),
  force:       Joi.boolean().optional()
});

// Best-effort audit logger (matches admin.js pattern).
async function auditLog(actorId, action, targetId, metadata) {
  try {
    await supabaseAdmin.from('audit_log').insert({
      id: uuidv4(), actor_id: actorId, action, target_id: targetId || null,
      metadata: metadata || null, occurred_at: new Date().toISOString()
    });
  } catch (_) { /* audit is best-effort */ }
}

// ── POST /content — translate-or-fetch one field of an entity.
router.post('/content', authenticateToken, async (req, res) => {
  try {
    const { error: vErr, value } = contentBodySchema.validate(req.body || {});
    if (vErr) return res.status(400).json({
      error: 'Validation failed',
      details: vErr.details.map(d => ({ field: d.path.join('.'), message: d.message }))
    });
    const { entity_type, entity_id, field, target_lang } = value;
    const source_lang = (value.source_lang || 'en').toLowerCase();
    const force = !!value.force;

    // Resolve source text. Prefer the caller-supplied snapshot — they know
    // which field they care about and we don't have a generic getter.
    let sourceText = (typeof value.source_text === 'string') ? value.source_text : '';
    if (!sourceText) {
      // Best-effort fetch from a known source table.
      const src = ENTITY_SOURCES[entity_type];
      if (src && src.fields.includes(field)) {
        try {
          const { data } = await supabaseAdmin.from(src.table)
            .select(field).eq(src.idCol, entity_id).single();
          if (data && data[field] != null) sourceText = String(data[field]);
        } catch (_) { /* leave blank → 400 below */ }
      }
    }
    if (!sourceText) return res.status(400).json({ error: 'source_text required (and not discoverable for this entity)' });

    const source_hash = sha1(sourceText);

    // Identity short-circuit: source and target are the same language.
    if (source_lang === target_lang) {
      return res.json({
        text: sourceText, source_hash, generated_by: null,
        generated_at: new Date().toISOString(), cached: false, identity: true
      });
    }

    // Cache hit: existing row with matching source_hash, unless forced.
    if (!force) {
      try {
        const { data: existing } = await supabaseAdmin.from('content_translations')
          .select('id, text, source_hash, generated_by, generated_at')
          .eq('entity_type', entity_type).eq('entity_id', entity_id)
          .eq('field', field).eq('target_lang', target_lang)
          .single();
        if (existing && existing.source_hash === source_hash) {
          return res.json({
            text: existing.text, source_hash: existing.source_hash,
            generated_by: existing.generated_by, generated_at: existing.generated_at,
            cached: true
          });
        }
      } catch (_) { /* no row → translate below */ }
    }

    // Translate via the AI provider. Same prompt style as ai.js batch
    // localizer, but for a single string — reply must be JSON array of 1.
    const srcName = TR_LANGS[source_lang] || 'the source language';
    const sys = `You are a professional content localizer for an education platform. Translate the input string from ${srcName} to ${TR_LANGS[target_lang]}. Preserve emoji, numbers, %, currency symbols and placeholders such as {x} or :id exactly. Do NOT translate brand names (JeetMantra, EduOS) or code. Reply with ONLY a JSON array containing exactly one translated string — no keys, no prose, no markdown.`;
    let translated = null;
    try {
      const out = await ai(req.user.id, sys, JSON.stringify([sourceText]), { json: true, action: 'translate-content' });
      translated = parseSingle(out.text);
    } catch (e) {
      return res.status(e.code === 'RATE_LIMITED' ? 429 : 502)
        .json({ error: e.message || 'Translation failed', code: e.code, degraded: true });
    }
    if (!translated) return res.status(502).json({ error: 'AI returned unparseable response' });

    // Upsert via delete-then-insert (matches our unique-key shape and avoids
    // PostgREST upsert quirks).
    try {
      await supabaseAdmin.from('content_translations')
        .delete()
        .eq('entity_type', entity_type).eq('entity_id', entity_id)
        .eq('field', field).eq('target_lang', target_lang);
    } catch (_) { /* ignore — first insert */ }

    const row = {
      id: uuidv4(),
      entity_type, entity_id, field,
      source_lang, target_lang, source_hash,
      text: translated, generated_by: 'ai',
      generated_at: new Date().toISOString()
    };
    try {
      await supabaseAdmin.from('content_translations').insert(row);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to persist translation: ' + (e.message || 'unknown') });
    }

    res.json({
      text: row.text, source_hash, generated_by: 'ai',
      generated_at: row.generated_at, cached: false
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /content — all per-field translations for an entity in one language.
router.get('/content', authenticateToken, async (req, res) => {
  try {
    const { entity_type, entity_id, target_lang } = req.query;
    if (!entity_type || !ENTITY_TYPES.includes(entity_type)) {
      return res.status(400).json({ error: 'Valid entity_type required' });
    }
    if (!entity_id) return res.status(400).json({ error: 'entity_id required' });
    if (!target_lang || !TR_LANGS[String(target_lang).toLowerCase()]) {
      return res.status(400).json({ error: 'Valid target_lang required' });
    }
    const { data, error } = await supabaseAdmin.from('content_translations')
      .select('id, field, source_lang, target_lang, source_hash, text, generated_by, generated_at')
      .eq('entity_type', entity_type).eq('entity_id', entity_id)
      .eq('target_lang', String(target_lang).toLowerCase());
    if (error) return res.status(500).json({ error: 'Failed to fetch translations' });
    res.json({ translations: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DELETE /content/:id — admin only, audit-logged.
router.delete('/content/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { data: existing } = await supabaseAdmin.from('content_translations')
      .select('id, entity_type, entity_id, field, target_lang')
      .eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Translation not found' });
    const { error } = await supabaseAdmin.from('content_translations').delete().eq('id', id);
    if (error) return res.status(500).json({ error: 'Failed to delete' });
    await auditLog(req.user.id, 'translation.delete', id, existing);
    res.json({ message: 'Deleted', id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /missing — admin queue. Entities of the given type without a
// translation in target_lang. Best-effort: only known entity types yield
// results; everything else returns [].
router.get('/missing', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { entity_type, target_lang } = req.query;
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 50));
    if (!entity_type || !ENTITY_TYPES.includes(entity_type)) {
      return res.status(400).json({ error: 'Valid entity_type required' });
    }
    if (!target_lang || !TR_LANGS[String(target_lang).toLowerCase()]) {
      return res.status(400).json({ error: 'Valid target_lang required' });
    }
    const src = ENTITY_SOURCES[entity_type];
    if (!src) return res.json({ entities: [], note: 'No known source table for this entity_type' });
    const tl = String(target_lang).toLowerCase();

    // Pull a window of source rows; we'll filter against translations.
    const selectCols = [src.idCol, ...src.fields].join(', ');
    const { data: rows, error } = await supabaseAdmin.from(src.table)
      .select(selectCols).order(src.idCol, { ascending: false }).limit(limit * 2);
    if (error) return res.status(500).json({ error: 'Failed to scan source table' });
    if (!rows || !rows.length) return res.json({ entities: [] });

    const ids = rows.map(r => r[src.idCol]);
    const { data: trans } = await supabaseAdmin.from('content_translations')
      .select('entity_id, field')
      .eq('entity_type', entity_type).eq('target_lang', tl)
      .in('entity_id', ids);
    const have = new Set((trans || []).map(t => `${t.entity_id}::${t.field}`));

    const missing = [];
    for (const row of rows) {
      const id = row[src.idCol];
      const missingFields = src.fields.filter(f => row[f] != null && String(row[f]).trim() && !have.has(`${id}::${f}`));
      if (missingFields.length) {
        missing.push({ entity_type, entity_id: id, missing_fields: missingFields });
        if (missing.length >= limit) break;
      }
    }
    res.json({ entities: missing, target_lang: tl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
