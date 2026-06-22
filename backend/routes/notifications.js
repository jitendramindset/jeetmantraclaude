/**
 * notifications.js — dedicated user notifications.
 *
 * Mount: /api/notifications
 *
 * Separate from /api/activity (which is shared course/wall events) and from
 * /api/notifications-admin (broadcast / template administration). This is the
 * per-user inbox the topbar bell + NotificationCenter consume.
 *
 *   GET  /              — caller's notifications, paginated; ?status=unread to filter
 *   GET  /unread        — { total } unread count for the badge
 *   POST /:id/read      — mark one as read
 *   POST /read-all      — mark every unread for the caller
 *   DELETE /:id         — remove (soft via is_read=true is enough; we hard-delete for now)
 *
 * Producers write rows via the award pipeline (services/award.js writeNotification).
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// NOTE: the notifications table tracks read-state with a nullable `read_at`
// timestamp (NULL = unread) and orders by `sent_at` — there is no is_read /
// created_at column (that mismatch previously 500'd this endpoint). We expose
// derived `is_read` + `created_at` aliases in the response so the frontend can
// rely on either name.
const withAliases = (n) => ({ ...n, is_read: n.read_at != null, created_at: n.sent_at });

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const lim = Math.min(100, Math.max(1, Number(limit) || 25));
    const off = (Math.max(1, Number(page) || 1) - 1) * lim;
    let q = supabaseAdmin.from('notifications').select('*', { count: 'exact' }).eq('user_id', req.user.id);
    if (status === 'unread') q = q.is('read_at', null);
    if (status === 'read')   q = q.not('read_at', 'is', null);
    const { data, count, error } = await q.order('sent_at', { ascending: false }).range(off, off + lim - 1);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ notifications: (data || []).map(withAliases), page: Number(page), limit: lim, total: count || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const { count } = await supabaseAdmin.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id).is('read_at', null);
    res.json({ total: count || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('notifications')
      .update({ read_at: new Date().toISOString() }).eq('id', req.params.id).eq('user_id', req.user.id).select().maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data)  return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification: withAliases(data) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    await supabaseAdmin.from('notifications').update({ read_at: new Date().toISOString() })
      .eq('user_id', req.user.id).is('read_at', null);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await supabaseAdmin.from('notifications').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
