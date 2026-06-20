/**
 * notificationsAdmin.js — notification template + broadcast admin
 * (/api/notifications-admin).
 *
 * Sprint 3. Admin manages templates and triggers broadcasts. Actual delivery is
 * the n8n addon's job — we just queue rows in notification_log.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

async function auditLog(actorId, action, targetId, metadata) {
  try {
    await supabaseAdmin.from('audit_log').insert({
      id: uuidv4(), actor_id: actorId, action, target_id: targetId || null,
      metadata: metadata || null, occurred_at: new Date().toISOString()
    });
  } catch (_) {}
}

// GET /templates — admin list.
router.get('/templates', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { key, locale, channel } = req.query;
    let q = supabaseAdmin.from('notification_templates').select('*');
    if (key) q = q.eq('key', key);
    if (locale) q = q.eq('locale', locale);
    if (channel) q = q.eq('channel', channel);
    const { data, error } = await q.order('updated_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Failed to list templates' });
    res.json({ templates: data || [] });
  } catch (e) {
    console.error('templates list error', e);
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

// POST /templates — create.
router.post('/templates', authenticateToken, authorizeRole(['admin']),
  validate('notificationTemplateCreate'), async (req, res) => {
  try {
    const { key, channel, locale, subject, body } = req.validatedData;
    const row = {
      id: uuidv4(), key, channel, locale, subject: subject || null,
      body, version: 1, updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin.from('notification_templates')
      .insert(row).select().single();
    if (error) return res.status(500).json({ error: 'Failed to create template' });
    await auditLog(req.user.id, 'notification.template.create', data.id, { key, channel, locale });
    res.status(201).json({ template: data });
  } catch (e) {
    console.error('templates create error', e);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// PUT /templates/:id — update + version bump.
router.put('/templates/:id', authenticateToken, authorizeRole(['admin']),
  validate('notificationTemplateUpdate'), async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('notification_templates')
      .select('*').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Template not found' });
    const patch = {
      ...req.validatedData,
      version: (existing.version || 1) + 1,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin.from('notification_templates')
      .update(patch).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: 'Failed to update template' });
    await auditLog(req.user.id, 'notification.template.update', data.id, { version: patch.version });
    res.json({ template: data });
  } catch (e) {
    console.error('templates update error', e);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /templates/:id
router.delete('/templates/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('notification_templates')
      .delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Failed to delete template' });
    await auditLog(req.user.id, 'notification.template.delete', req.params.id, null);
    res.json({ deleted: true });
  } catch (e) {
    console.error('templates delete error', e);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// POST /broadcast — fan out queued notification_log rows.
// audience: { role? } -> all users with that user_type.
//           { user_ids[] } -> explicit list.
//           { institution_id } -> all users in that institution (via user_roles).
router.post('/broadcast', authenticateToken, authorizeRole(['admin']),
  validate('notificationBroadcast'), async (req, res) => {
  try {
    const { template_key, audience, channel, payload } = req.validatedData;
    const ch = channel || 'in_app';

    let recipientIds = [];
    if (Array.isArray(audience.user_ids) && audience.user_ids.length) {
      recipientIds = audience.user_ids;
    } else if (audience.role) {
      const { data } = await supabaseAdmin.from('jeetmantra_users')
        .select('id').eq('user_type', audience.role);
      recipientIds = (data || []).map(r => r.id);
    } else if (audience.institution_id) {
      const { data } = await supabaseAdmin.from('user_roles')
        .select('user_id').eq('institution_id', audience.institution_id);
      recipientIds = [...new Set((data || []).map(r => r.user_id))];
    }

    if (!recipientIds.length) {
      return res.status(400).json({ error: 'Audience resolved to zero recipients' });
    }

    const now = new Date().toISOString();
    const rows = recipientIds.map(rid => ({
      id: uuidv4(), recipient_id: rid, template_key, channel: ch,
      status: 'queued', payload: payload || null, sent_at: null
    }));
    // chunked insert to avoid oversized requests.
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const { error } = await supabaseAdmin.from('notification_log')
        .insert(rows.slice(i, i + chunkSize));
      if (error) return res.status(500).json({ error: 'Failed to queue broadcast' });
    }

    await auditLog(req.user.id, 'notification.broadcast', null, {
      template_key, channel: ch, count: rows.length, audience
    });
    res.status(201).json({ queued: rows.length });
  } catch (e) {
    console.error('broadcast error', e);
    res.status(500).json({ error: 'Failed to broadcast' });
  }
});

// GET /log — filters.
router.get('/log', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { recipient_id, status, from, to } = req.query;
    let q = supabaseAdmin.from('notification_log').select('*');
    if (recipient_id) q = q.eq('recipient_id', recipient_id);
    if (status) q = q.eq('status', status);
    if (from) q = q.gte('sent_at', from);
    if (to) q = q.lte('sent_at', to);
    const { data, error } = await q.order('sent_at', { ascending: false }).limit(500);
    if (error) return res.status(500).json({ error: 'Failed to fetch log' });
    res.json({ log: data || [] });
  } catch (e) {
    console.error('notif log error', e);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
});

module.exports = router;
