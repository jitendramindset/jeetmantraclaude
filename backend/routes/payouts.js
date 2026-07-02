/**
 * payouts.js — payout requests (/api/payouts).
 *
 * Sprint 3. Sellers/creators request payouts; admin approves / marks paid.
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

// GET / — admin lists all; non-admin lists own.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, payee_id } = req.query;
    let q = supabaseAdmin.from('payouts').select('*');
    if (req.user.role !== 'admin') {
      q = q.eq('payee_id', req.user.id);
    } else {
      if (payee_id) q = q.eq('payee_id', payee_id);
    }
    if (status) q = q.eq('status', status);
    const { data, error } = await q.order('requested_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Failed to list payouts' });
    res.json({ payouts: data || [] });
  } catch (e) {
    console.error('payouts list error', e);
    res.status(500).json({ error: 'Failed to list payouts' });
  }
});

// GET /my — caller's own payouts.
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('payouts').select('*')
      .eq('payee_id', req.user.id).order('requested_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Failed to list payouts' });
    res.json({ payouts: data || [] });
  } catch (e) {
    console.error('payouts/my error', e);
    res.status(500).json({ error: 'Failed to list payouts' });
  }
});

// POST / — caller requests a payout.
router.post('/', authenticateToken, validate('payoutCreate'), async (req, res) => {
  try {
    const { amount, notes, currency } = req.validatedData;
    const row = {
      id: uuidv4(), payee_id: req.user.id, amount, currency: currency || 'INR',
      status: 'pending', notes: notes || null,
      requested_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin.from('payouts').insert(row).select().single();
    if (error) return res.status(500).json({ error: 'Failed to create payout' });
    res.status(201).json({ payout: data });
  } catch (e) {
    console.error('payouts create error', e);
    res.status(500).json({ error: 'Failed to create payout' });
  }
});

// POST /:id/decide — admin approves/rejects/marks paid.
router.post('/:id/decide', authenticateToken, authorizeRole(['admin']),
  validate('payoutDecide'), async (req, res) => {
  try {
    const { decision, gateway_ref, notes } = req.validatedData;
    const { data: existing, error: e1 } = await supabaseAdmin
      .from('payouts').select('*').eq('id', req.params.id).maybeSingle();
    if (e1) return res.status(500).json({ error: 'Failed to fetch payout' });
    if (!existing) return res.status(404).json({ error: 'Payout not found' });

    const now = new Date().toISOString();
    const patch = { notes: notes || existing.notes || null };
    if (decision === 'approve') {
      patch.status = 'approved';
      patch.approved_by = req.user.id;
      patch.approved_at = now;
    } else if (decision === 'reject') {
      patch.status = 'rejected';
      patch.approved_by = req.user.id;
      patch.approved_at = now;
    } else if (decision === 'paid') {
      patch.status = 'paid';
      patch.paid_at = now;
      if (gateway_ref) patch.gateway_ref = gateway_ref;
    }
    const { data, error } = await supabaseAdmin.from('payouts').update(patch)
      .eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: 'Failed to decide payout' });

    await auditLog(req.user.id, 'payout.decide', req.params.id, {
      decision, gateway_ref: gateway_ref || null, amount: existing.amount
    });
    res.json({ payout: data });
  } catch (e) {
    console.error('payouts decide error', e);
    res.status(500).json({ error: 'Failed to decide payout' });
  }
});

module.exports = router;
