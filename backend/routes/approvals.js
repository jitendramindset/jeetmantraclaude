/**
 * approvals.js — unified approvals queue (/api/approvals).
 *
 * Sprint 3. Admin works the queue (list / inspect / decide). Any authenticated
 * user can SUBMIT a new approval request (teacher onboarding, course publish,
 * payout, KYC). The decide endpoint writes audit_log via the helper pattern.
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
  } catch (_) { /* best-effort */ }
}

// Best-effort hydration of jeetmantra_users.id (VARCHAR — no FK embed).
async function hydrateUsers(ids) {
  const clean = [...new Set((ids || []).filter(Boolean))];
  if (!clean.length) return {};
  const { data } = await supabaseAdmin
    .from('jeetmantra_users').select('id, full_name, email').in('id', clean);
  const map = {};
  (data || []).forEach(u => { map[u.id] = u; });
  return map;
}

// Best-effort: try to fetch the target row for context (courses/users/payouts).
async function hydrateTarget(type, targetId) {
  if (!targetId) return null;
  const tableByType = {
    course: 'courses',
    teacher: 'jeetmantra_users',
    kyc: 'jeetmantra_users',
    payout: 'payouts'
  };
  const table = tableByType[type];
  if (!table) return null;
  try {
    const { data } = await supabaseAdmin.from(table).select('*').eq('id', targetId).maybeSingle();
    return data || null;
  } catch (_) { return null; }
}

// GET / — admin list with filters.
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let q = supabaseAdmin.from('approval_requests').select('*');
    if (status) q = q.eq('status', status);
    if (type) q = q.eq('type', type);
    const { data, error } = await q.order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);
    if (error) return res.status(500).json({ error: 'Failed to list approvals' });

    const users = await hydrateUsers((data || []).map(r => r.applicant_id));
    const enriched = (data || []).map(r => ({ ...r, applicant: users[r.applicant_id] || null }));
    res.json({ approvals: enriched, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    console.error('approvals list error', e);
    res.status(500).json({ error: 'Failed to list approvals' });
  }
});

// GET /:id — admin single with target hydrate.
router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('approval_requests').select('*').eq('id', req.params.id).maybeSingle();
    if (error) return res.status(500).json({ error: 'Failed to fetch approval' });
    if (!data) return res.status(404).json({ error: 'Approval not found' });
    const users = await hydrateUsers([data.applicant_id, data.decided_by]);
    const target = await hydrateTarget(data.type, data.target_id);
    res.json({
      approval: { ...data, applicant: users[data.applicant_id] || null,
        decider: users[data.decided_by] || null, target }
    });
  } catch (e) {
    console.error('approvals get error', e);
    res.status(500).json({ error: 'Failed to fetch approval' });
  }
});

// POST / — caller submits an approval request.
router.post('/', authenticateToken, validate('approvalCreate'), async (req, res) => {
  try {
    const { type, target_id, metadata, reason } = req.validatedData;
    const row = {
      id: uuidv4(), type, target_id: target_id || null,
      applicant_id: req.user.id, status: 'pending',
      reason: reason || null, metadata: metadata || null,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin
      .from('approval_requests').insert(row).select().single();
    if (error) return res.status(500).json({ error: 'Failed to create approval' });
    res.status(201).json({ approval: data });
  } catch (e) {
    console.error('approvals create error', e);
    res.status(500).json({ error: 'Failed to create approval' });
  }
});

// POST /:id/decide — admin approves/rejects.
router.post('/:id/decide', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { decision, reason } = req.body || {};
    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be approve|reject' });
    }
    const { data: existing, error: e1 } = await supabaseAdmin
      .from('approval_requests').select('*').eq('id', req.params.id).maybeSingle();
    if (e1) return res.status(500).json({ error: 'Failed to fetch approval' });
    if (!existing) return res.status(404).json({ error: 'Approval not found' });

    const status = decision === 'approve' ? 'approved' : 'rejected';
    const { data, error } = await supabaseAdmin.from('approval_requests').update({
      status, decided_by: req.user.id, decided_at: new Date().toISOString(),
      reason: reason || existing.reason || null
    }).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: 'Failed to decide' });

    await auditLog(req.user.id, 'approval.decide', req.params.id, {
      type: existing.type, target_id: existing.target_id, decision
    });
    res.json({ approval: data });
  } catch (e) {
    console.error('approvals decide error', e);
    res.status(500).json({ error: 'Failed to decide' });
  }
});

module.exports = router;
