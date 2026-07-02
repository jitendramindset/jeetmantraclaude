/**
 * support.js — internal helpdesk (/api/support).
 *
 * Sprint 3. Tickets + threaded messages. Admin sees everything; requesters see
 * only their own ticket and the non-internal messages on it.
 *
 * Mount: /api/support
 *
 * Endpoints (all 🔒 JWT):
 *   GET  /tickets                 — list tickets (own for users; all + filters for admin)
 *   POST /tickets                 — open a new ticket (Joi: supportTicketCreate)
 *   GET  /tickets/:id             — ticket + messages (owner or admin)
 *   POST /tickets/:id/messages    — add a message (Joi: supportMessage)
 *   PUT  /tickets/:id             — admin only: update status/priority/assignee (Joi: supportTicketUpdate)
 *
 * Notes: requester-vs-admin scoping enforced per route. Non-admins can only see
 * is_internal=false messages and cannot mark their own messages internal. PUT is
 * gated by authorizeRole(['admin']).
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


async function loadTicket(id) {
  const { data } = await supabaseAdmin.from('support_tickets').select('*')
    .eq('id', id).maybeSingle();
  return data;
}

// GET /tickets
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const { status, priority, assignee_id } = req.query;
    let q = supabaseAdmin.from('support_tickets').select('*');
    if (req.user.role !== 'admin') {
      q = q.eq('requester_id', req.user.id);
    } else {
      if (assignee_id) q = q.eq('assignee_id', assignee_id);
    }
    if (status) q = q.eq('status', status);
    if (priority) q = q.eq('priority', priority);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Failed to list tickets' });
    res.json({ tickets: data || [] });
  } catch (e) {
    console.error('support list error', e);
    res.status(500).json({ error: 'Failed to list tickets' });
  }
});

// POST /tickets — open a new ticket.
router.post('/tickets', authenticateToken, validate('supportTicketCreate'), async (req, res) => {
  try {
    const { subject, body, priority, tenant_id } = req.validatedData;
    const now = new Date().toISOString();
    const row = {
      id: uuidv4(), requester_id: req.user.id, tenant_id: tenant_id || null,
      subject, body, status: 'open', priority: priority || 'normal',
      created_at: now, updated_at: now
    };
    const { data, error } = await supabaseAdmin.from('support_tickets')
      .insert(row).select().single();
    if (error) return res.status(500).json({ error: 'Failed to create ticket' });
    res.status(201).json({ ticket: data });
  } catch (e) {
    console.error('support create error', e);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /tickets/:id — owner or admin.
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await loadTicket(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && ticket.requester_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    let mq = supabaseAdmin.from('support_ticket_messages').select('*')
      .eq('ticket_id', req.params.id).order('created_at', { ascending: true });
    if (!isAdmin) mq = mq.eq('is_internal', false);
    const { data: messages } = await mq;
    res.json({ ticket, messages: messages || [] });
  } catch (e) {
    console.error('support get error', e);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// POST /tickets/:id/messages — owner or admin add message.
router.post('/tickets/:id/messages', authenticateToken,
  validate('supportMessage'), async (req, res) => {
  try {
    const ticket = await loadTicket(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && ticket.requester_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { body, is_internal } = req.validatedData;
    const row = {
      id: uuidv4(), ticket_id: req.params.id, sender_id: req.user.id,
      body, is_internal: isAdmin ? !!is_internal : false,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin.from('support_ticket_messages')
      .insert(row).select().single();
    if (error) return res.status(500).json({ error: 'Failed to post message' });

    // bump ticket updated_at
    await supabaseAdmin.from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    res.status(201).json({ message: data });
  } catch (e) {
    console.error('support message error', e);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// PUT /tickets/:id — admin updates status/priority/assignee.
router.put('/tickets/:id', authenticateToken, authorizeRole(['admin']),
  validate('supportTicketUpdate'), async (req, res) => {
  try {
    const patch = { ...req.validatedData, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin.from('support_tickets')
      .update(patch).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: 'Failed to update ticket' });
    if (!data) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ ticket: data });
  } catch (e) {
    console.error('support update error', e);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

module.exports = router;
