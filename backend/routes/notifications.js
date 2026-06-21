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

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const lim = Math.min(100, Math.max(1, Number(limit) || 25));
    const off = (Math.max(1, Number(page) || 1) - 1) * lim;
    let q = supabaseAdmin.from('notifications').select('*', { count: 'exact' }).eq('user_id', req.user.id);
    if (status === 'unread') q = q.eq('is_read', false);
    if (status === 'read')   q = q.eq('is_read', true);
    const { data, count, error } = await q.order('created_at', { ascending: false }).range(off, off + lim - 1);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ notifications: data || [], page: Number(page), limit: lim, total: count || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const { count } = await supabaseAdmin.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id).eq('is_read', false);
    res.json({ total: count || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('notifications')
      .update({ is_read: true }).eq('id', req.params.id).eq('user_id', req.user.id).select().maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data)  return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    await supabaseAdmin.from('notifications').update({ is_read: true })
      .eq('user_id', req.user.id).eq('is_read', false);
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
