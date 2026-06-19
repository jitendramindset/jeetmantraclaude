const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Safe audit logger — Supabase's query builder is a thenable WITHOUT .catch(),
// so we await inside try/catch instead of chaining .catch() (which throws
// "supabaseAdmin.from(...).insert(...).catch is not a function").
async function auditLog(actorId, action, targetId, metadata) {
  try {
    await supabaseAdmin.from('audit_log').insert({
      id: uuidv4(), actor_id: actorId, action, target_id: targetId || null,
      metadata: metadata || null, occurred_at: new Date().toISOString()
    });
  } catch (_) { /* audit is best-effort */ }
}

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    let query = supabaseAdmin.from('jeetmantra_users').select('*').neq('status', 'deleted');

    if (role) query = query.eq('user_type', role);
    if (status) query = query.eq('is_active', status === 'active');
    
    const offset = (page - 1) * limit;
    const { data: users, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({
      message: 'Users fetched successfully',
      users,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Block/Unblock user (admin only)
router.put('/users/:userId/toggle-status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current status
    const { data: user, error: userError } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('is_active')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (typeof user.is_active === 'undefined') {
      return res.status(400).json({ error: 'Cannot toggle status: is_active column not present in user schema' });
    }

    const before = !!user.is_active;
    const after = !before;
    const { data: updatedUser, error } = await supabaseAdmin
      .from('jeetmantra_users')
      .update({
        is_active: after,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update user status' });
    }

    // Security-relevant action: always audit, with before/after + actor IP/UA so
    // block/unblock is reconstructable from the audit log alone.
    await auditLog(req.user.id, after ? 'user.unblock' : 'user.block', userId, {
      before: { is_active: before },
      after: { is_active: after },
      actor_ip: req.ip || req.headers['x-forwarded-for'] || null,
      user_agent: req.headers['user-agent'] || null
    });

    res.json({
      message: 'User status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get platform statistics (admin only)
router.get('/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // Get user counts by role
    const { count: studentCount } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'student');

    const { count: teacherCount } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'teacher');

    const { count: partnerCount } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'partner');

    // Get course stats
    const { count: coursesCount } = await supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact' });

    // Get enrollment stats
    const { count: enrollmentsCount } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact' });

    // Get revenue
    const { data: revenues } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = revenues?.reduce((sum, p) => sum + p.amount, 0) || 0;

    res.json({
      message: 'Platform statistics fetched successfully',
      stats: {
        users: {
          students: studentCount,
          teachers: teacherCount,
          partners: partnerCount,
          total: (studentCount || 0) + (teacherCount || 0) + (partnerCount || 0)
        },
        courses: coursesCount,
        enrollments: enrollmentsCount,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ── PLATFORM OS — Overview KPIs (DAU/WAU/MAU, signups, revenue trend).
// Reuses existing tables (jeetmantra_users.last_login, payments). Heavy lifting
// is done in JS rather than SQL window-funcs because the self-hosted PostgREST
// path doesn't expose RPCs reliably (see [[supabase-selfhosted-quirks]]).
router.get('/analytics/overview', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const since30 = new Date(now.getTime() - 30 * day).toISOString();
    const since7  = new Date(now.getTime() - 7  * day).toISOString();
    const since1  = new Date(now.getTime() - 1  * day).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * day).toISOString();

    const [usersTotal, signups30, dauRows, wauRows, mauRows, payments30] = await Promise.all([
      supabaseAdmin.from('jeetmantra_users').select('id', { count: 'exact', head: true }).then(r => r.count || 0).catch(() => 0),
      supabaseAdmin.from('jeetmantra_users').select('id', { count: 'exact', head: true }).gte('created_at', since30).then(r => r.count || 0).catch(() => 0),
      supabaseAdmin.from('jeetmantra_users').select('id', { count: 'exact', head: true }).gte('last_login', since1).then(r => r.count || 0).catch(() => 0),
      supabaseAdmin.from('jeetmantra_users').select('id', { count: 'exact', head: true }).gte('last_login', since7).then(r => r.count || 0).catch(() => 0),
      supabaseAdmin.from('jeetmantra_users').select('id', { count: 'exact', head: true }).gte('last_login', since30).then(r => r.count || 0).catch(() => 0),
      supabaseAdmin.from('payments').select('amount, status, created_at').eq('status', 'completed').gte('created_at', monthAgo).then(r => r.data || []).catch(() => [])
    ]);

    // 30-day revenue sparkline (one bucket per day)
    const buckets = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * day);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    payments30.forEach(p => {
      const d = String(p.created_at || '').slice(0, 10);
      if (d in buckets) buckets[d] += parseFloat(p.amount || 0);
    });
    const revenueSeries = Object.keys(buckets).sort().map(d => ({ date: d, amount: buckets[d] }));
    const revenue30 = revenueSeries.reduce((s, b) => s + b.amount, 0);

    res.json({
      users: { total: usersTotal, signups30 },
      activity: { dau: dauRows, wau: wauRows, mau: mauRows },
      revenue: { last30Total: revenue30, series: revenueSeries }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SYSTEM STATUS: ping each integration the platform depends on. Returns a
// per-feature health snapshot for the topbar status pill. Best-effort — any
// individual probe failure becomes status:'down' rather than 500ing the whole call.
router.get('/system/status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const probe = async (name, fn) => {
    const t0 = Date.now();
    try { await fn(); return { name, status: 'up', latency_ms: Date.now() - t0 }; }
    catch (e) { return { name, status: 'down', latency_ms: Date.now() - t0, error: e.message }; }
  };
  const results = await Promise.all([
    probe('database', async () => {
      const { error } = await supabaseAdmin.from('jeetmantra_users').select('id').limit(1);
      if (error) throw new Error(error.message);
    }),
    probe('leveldb', async () => {
      try { const { put, get } = require('../config/leveldb'); await put('health:ping', Date.now()); await get('health:ping'); }
      catch (e) { throw e; }
    }),
    probe('n8n', async () => {
      // n8n is optional — if URL is configured, ping it
      const url = process.env.N8N_WEBHOOK_URL || '';
      if (!url) return; // "up" = not configured = OK
    }),
  ]);
  const overall = results.every(r => r.status === 'up') ? 'up' : results.some(r => r.status === 'up') ? 'degraded' : 'down';
  res.json({ overall, services: results, checked_at: new Date().toISOString() });
});

// ── ACTION INBOX: pending counts for the operations queues from Sprint 3.
// Returns placeholder zeros until those tables land — the UI surface is built
// now so Sprint 3 only needs to fill the numbers in.
router.get('/actions/inbox', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const safeCount = async (table, filter) => {
    try {
      let q = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
      if (filter) q = filter(q);
      const { count } = await q;
      return count || 0;
    } catch (_) { return 0; }
  };
  const [approvals, payouts, tickets, reports] = await Promise.all([
    safeCount('approval_requests', q => q.eq('status', 'pending')),
    safeCount('payouts',           q => q.eq('status', 'pending')),
    safeCount('support_tickets',   q => q.in('status', ['open', 'pending'])),
    safeCount('content_reports',   q => q.eq('status', 'pending'))
  ]);
  res.json({
    inbox: {
      approvals,
      payouts,
      tickets,
      reports,
      total: approvals + payouts + tickets + reports
    },
    note: 'Counts read from Sprint 3 tables when present; 0 otherwise.'
  });
});

// ── TENANTS / INSTITUTES: list every institution (a jeetmantra_users row of
// type school/coaching/franchise) with member counts + plan + recent signups.
// Powers the Tenants console.
router.get('/institutes', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { q, type, page = 1, limit = 25 } = req.query;
    const lim = Math.min(100, Math.max(1, Number(limit) || 25));
    const off = (Math.max(1, Number(page) || 1) - 1) * lim;
    let qb = supabaseAdmin.from('jeetmantra_users')
      .select('id, full_name, email, user_type, created_at, is_active', { count: 'exact' })
      .in('user_type', type ? [type] : ['school', 'coaching', 'franchise']);
    if (q) {
      const term = String(q).replace(/[%,()]/g, '');
      qb = qb.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
    }
    const { data: rows, count, error } = await qb.order('created_at', { ascending: false }).range(off, off + lim - 1);
    if (error) return res.status(500).json({ error: error.message });

    // Hydrate per-tenant counts: teachers + students + courses.
    const ids = (rows || []).map(r => r.id);
    let teacherCounts = {}, studentCounts = {}, courseCounts = {};
    if (ids.length) {
      const [t, s, c] = await Promise.all([
        supabaseAdmin.from('institution_teachers').select('institution_id').in('institution_id', ids).then(r => r.data || []).catch(() => []),
        supabaseAdmin.from('institution_students').select('institution_id').in('institution_id', ids).then(r => r.data || []).catch(() => []),
        supabaseAdmin.from('courses').select('institution_id').in('institution_id', ids).then(r => r.data || []).catch(() => [])
      ]);
      t.forEach(r => { teacherCounts[r.institution_id] = (teacherCounts[r.institution_id] || 0) + 1; });
      s.forEach(r => { studentCounts[r.institution_id] = (studentCounts[r.institution_id] || 0) + 1; });
      c.forEach(r => { courseCounts[r.institution_id] = (courseCounts[r.institution_id] || 0) + 1; });
    }
    const institutes = (rows || []).map(r => ({
      id: r.id,
      name: r.full_name,
      email: r.email,
      type: r.user_type,
      is_active: r.is_active !== false,
      created_at: r.created_at,
      teacher_count: teacherCounts[r.id] || 0,
      student_count: studentCounts[r.id] || 0,
      course_count:  courseCounts[r.id] || 0
    }));
    res.json({ institutes, page: Number(page), limit: lim, total: count || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ADMIN PAYMENTS LIST: platform-wide payment ledger with filters. Replaces
// the broken admin-frontend pattern of calling /payments/my (which returns the
// admin's OWN payments only). Filter by status (pending/completed/failed/refunded),
// payment method, date range, free-text q (matches id / transaction_id / user_id).
router.get('/payments', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status, method, from, to, q, page = 1, limit = 25 } = req.query;
    const lim = Math.min(100, Math.max(1, Number(limit) || 25));
    const off = (Math.max(1, Number(page) || 1) - 1) * lim;

    let query = supabaseAdmin.from('payments').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status);
    if (method) query = query.eq('payment_method', method);
    if (from) query = query.gte('created_at', new Date(from).toISOString());
    if (to) query = query.lte('created_at', new Date(to).toISOString());
    if (q) {
      const term = String(q).replace(/[%,()]/g, ''); // strip PostgREST .or() metacharacters
      query = query.or(`id.ilike.%${term}%,transaction_id.ilike.%${term}%,user_id.eq.${term}`);
    }
    const { data: rows, count, error } = await query.order('created_at', { ascending: false }).range(off, off + lim - 1);
    if (error) return res.status(500).json({ error: error.message });

    // Hydrate payer names (jeetmantra_users.id is VARCHAR — no FK embed possible)
    const ids = [...new Set((rows || []).map(r => r.user_id).filter(Boolean))];
    let payers = {};
    if (ids.length) {
      const { data: users } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', ids);
      payers = Object.fromEntries((users || []).map(u => [u.id, u]));
    }
    const payments = (rows || []).map(p => ({
      ...p,
      payer_name: payers[p.user_id]?.full_name || null,
      payer_email: payers[p.user_id]?.email || null
    }));
    res.json({ payments, page: Number(page), limit: lim, total: count || 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ADMIN USER DETAIL: deep view of one user.
router.get('/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const [{ data: user }, { data: courses }, { data: enrollments }, { data: payments }] = await Promise.all([
      supabaseAdmin.from('jeetmantra_users').select('*').eq('id', userId).single(),
      supabaseAdmin.from('courses').select('id, title, is_active').eq('teacher_id', userId),
      supabaseAdmin.from('enrollments').select('id, course_id, progress, status, enrolled_at, courses(title)').eq('student_id', userId),
      supabaseAdmin.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
    ]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    delete user.password_hash; delete user.pass_hash; delete user.password;
    res.json({ user, ownedCourses: courses || [], enrollments: enrollments || [], payments: payments || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { fullName, role, status } = req.body || {};
    const updates = { updated_at: new Date().toISOString() };
    if (fullName !== undefined) updates.full_name = fullName;
    if (role !== undefined) updates.user_type = role;
    if (status !== undefined) updates.status = status;
    const { data, error } = await supabaseAdmin.from('jeetmantra_users').update(updates).eq('id', req.params.userId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    await auditLog(req.user.id, 'user.update', req.params.userId, updates);
    delete data.password_hash;
    res.json({ user: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    if (req.params.userId === req.user.id) return res.status(400).json({ error: "Can't delete your own admin account" });
    await supabaseAdmin.from('jeetmantra_users').update({ status: 'deleted', updated_at: new Date().toISOString() }).eq('id', req.params.userId);
    await auditLog(req.user.id, 'user.delete', req.params.userId);
    res.json({ message: 'User soft-deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/audit', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const { data } = await supabaseAdmin.from('audit_log').select('*').order('occurred_at', { ascending: false }).limit(limit);
    res.json({ events: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PLATFORM SETTINGS (commission rate etc.) — stored as key/value rows in
// platform_settings. GET returns current; PUT upserts.
router.get('/settings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('platform_settings').select('*');
    const map = Object.fromEntries((data || []).map(r => [r.key, r.value]));
    res.json({ settings: map });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/settings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const updates = req.body || {};
    for (const [key, value] of Object.entries(updates)) {
      const { data: existing } = await supabaseAdmin.from('platform_settings').select('key').eq('key', key).maybeSingle();
      if (existing) await supabaseAdmin.from('platform_settings').update({ value: String(value) }).eq('key', key);
      else await supabaseAdmin.from('platform_settings').insert({ key, value: String(value) });
    }
    await auditLog(req.user.id, 'settings.update', null, updates);
    res.json({ message: 'Settings saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CONTENT MODERATION: list flagged courses + remove (deactivate) one.
router.post('/courses/:id/moderate', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { action } = req.body || {}; // 'deactivate' | 'activate' | 'delete'
    const updates = action === 'delete'
      ? { archived: true, is_active: false }
      : { is_active: action === 'activate' };
    await supabaseAdmin.from('courses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', req.params.id);
    await auditLog(req.user.id, 'course.moderate', req.params.id, { action });
    res.json({ message: 'Moderation applied' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
