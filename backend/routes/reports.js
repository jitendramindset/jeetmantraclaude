/**
 * reports.js — content moderation queue (/api/reports).
 *
 * Sprint 3. Any authenticated user can flag content; admin works the queue.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

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


async function auditLog(actorId, action, targetId, metadata) {
  try {
    await supabaseAdmin.from('audit_log').insert({
      id: uuidv4(), actor_id: actorId, action, target_id: targetId || null,
      metadata: metadata || null, occurred_at: new Date().toISOString()
    });
  } catch (_) {}
}

// POST / — caller flags content.
router.post('/', authenticateToken, validate('contentReportCreate'), async (req, res) => {
  try {
    const { target_type, target_id, reason } = req.validatedData;
    const row = {
      id: uuidv4(), target_type, target_id, reporter_id: req.user.id,
      reason, status: 'pending', created_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin.from('content_reports')
      .insert(row).select().single();
    if (error) return res.status(500).json({ error: 'Failed to create report' });
    res.status(201).json({ report: data });
  } catch (e) {
    console.error('reports create error', e);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// GET / — admin list.
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status, target_type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let q = supabaseAdmin.from('content_reports').select('*');
    if (status) q = q.eq('status', status);
    if (target_type) q = q.eq('target_type', target_type);
    const { data, error } = await q.order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);
    if (error) return res.status(500).json({ error: 'Failed to list reports' });
    res.json({ reports: data || [], page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    console.error('reports list error', e);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

// POST /:id/decide — admin decides.
router.post('/:id/decide', authenticateToken, authorizeRole(['admin']),
  validate('contentReportDecide'), async (req, res) => {
  try {
    const { decision, notes } = req.validatedData;
    const { data: existing } = await supabaseAdmin.from('content_reports')
      .select('*').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Report not found' });

    const status = decision === 'action' ? 'actioned' : 'dismissed';
    const { data, error } = await supabaseAdmin.from('content_reports').update({
      status, decided_by: req.user.id, decided_at: new Date().toISOString()
    }).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: 'Failed to decide report' });

    await auditLog(req.user.id, 'report.decide', req.params.id, {
      target_type: existing.target_type, target_id: existing.target_id,
      decision, notes: notes || null
    });
    res.json({ report: data });
  } catch (e) {
    console.error('reports decide error', e);
    res.status(500).json({ error: 'Failed to decide report' });
  }
});

module.exports = router;
