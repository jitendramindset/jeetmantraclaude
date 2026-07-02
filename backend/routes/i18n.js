/**
 * i18n.js — Phase D (Sprint 11) UI string bundles.
 *
 * EDUOS_GAP_ANALYSIS_V2 §5/§20: the app shell needs localized labels (distinct
 * from content_translations, which localizes user content). The frontend loads
 * GET /api/i18n/:lang once and renders chrome in that language.
 *
 * Mount: /api/i18n. The :lang bundle is public (no PII). Admin can upsert.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();
// Auto-wrap async route handlers so unhandled rejections reach the global error handler
const asyncHandler = require('../utils/asyncHandler');
['get','post','put','delete','patch'].forEach(m => {
  const orig = router[m].bind(router);
  router[m] = (...args) => {
    const last = args[args.length - 1];
    if (typeof last === 'function' && last.constructor.name === 'AsyncFunction') {
      args[args.length - 1] = asyncHandler(last);
    }
    return orig(...args);
  };
});


// GET /api/i18n/:lang — flat { key: value } bundle for a language.
router.get('/:lang', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('ui_strings')
      .select('key, value').eq('lang', req.params.lang);
    if (error) return res.json({ lang: req.params.lang, strings: {}, note: 'ui_strings not migrated' });
    const strings = Object.fromEntries((data || []).map(r => [r.key, r.value]));
    res.json({ lang: req.params.lang, strings });
  } catch (e) { res.json({ lang: req.params.lang, strings: {} }); }
});

// PUT /api/i18n/:lang — admin upsert of a bundle ({ key: value, ... }).
router.put('/:lang', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const lang = req.params.lang;
    const entries = Object.entries(req.body || {}).filter(([k, v]) => typeof v === 'string');
    if (!entries.length) return res.status(400).json({ error: 'No string entries provided' });
    const rows = entries.map(([key, value]) => ({ key, lang, value, updated_at: new Date().toISOString() }));
    const { error } = await supabaseAdmin.from('ui_strings').upsert(rows, { onConflict: 'key,lang' });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true, updated: rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
