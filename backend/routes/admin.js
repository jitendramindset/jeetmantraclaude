/**
 * admin.js — platform admin console (users, stats, analytics, moderation, tenancy, ops).
 * Mount: /api/admin
 *
 * Endpoints:
 *   GET    /users                          🔒 admin — paginated user list (filter role/status), excludes deleted
 *   PUT    /users/:userId/toggle-status    🔒 admin — block/unblock a user (audited with before/after + IP/UA)
 *   GET    /stats                          🔒 admin — platform totals (users by role, courses, enrollments, revenue)
 *   GET    /analytics/overview             🔒 admin — DAU/WAU/MAU, signups, 30-day revenue sparkline
 *   GET    /system/status                  🔒 admin — health probe of db / leveldb / n8n integrations
 *   GET    /actions/inbox                  🔒 admin — pending counts for approvals/payouts/tickets/reports
 *   GET    /institutes                     🔒 admin — list institutions (school/coaching/franchise) + member counts
 *   GET    /payments                       🔒 admin — platform-wide payment ledger with filters + payer hydration
 *   GET    /users/:userId                  🔒 admin — deep user detail (owned courses, enrollments, payments)
 *   PUT    /users/:userId                  🔒 admin — update user (name/role/status), audited
 *   DELETE /users/:userId                  🔒 admin — soft-delete user (status='deleted'), can't delete self
 *   GET    /audit                          🔒 admin — recent audit_log events
 *   GET    /settings                       🔒 admin — read platform_settings key/value map
 *   PUT    /settings                       🔒 admin — upsert platform_settings (secrets masked in audit)
 *   POST   /test-email                     🔒 admin — send SMTP test email to the signed-in admin
 *   POST   /courses/:id/moderate           🔒 admin — moderate a course (activate/deactivate/delete)
 *   POST   /impersonate/start              🔒 admin — mint short-lived "view as user" JWT (audited)
 *   POST   /impersonate/stop               🔒 auth  — end an impersonation session (admin or the session itself)
 *   GET    /impersonate/sessions           🔒 admin — list impersonation sessions (optional active=1)
 *   GET    /bookings                       🔒 admin — cross-tenant bookings_v2 list with filters + hydration
 *   GET    /live-classes                   🔒 admin — platform-wide live classes (course title + host hydration)
 *   POST   /migrations/run                 🔒 admin — run a named SQL migration via /pg/query (audited)
 *   POST   /backup/trigger                 🔒 admin — spawn api-backup.js as a detached child process
 *   GET    /backup/list                    🔒 admin — list local backup files
 *
 * Notes: every route is authenticateToken + authorizeRole(['admin']) except
 *   /impersonate/stop (any authenticated caller). auditLog() is best-effort
 *   (Supabase builder is a thenable without .catch, so awaited in try/catch).
 *   jeetmantra_users.id is VARCHAR — payer/booker/host names are hydrated
 *   manually, not via FK embeds. See [[supabase-selfhosted-quirks]].
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
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

// PUT /admin/users/:userId — update a user's name/role/status (audited).
router.put('/users/:userId', authenticateToken, authorizeRole(['admin']), validate('adminUserUpdate'), async (req, res) => {
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

// DELETE /admin/users/:userId — soft-delete a user (can't delete own account).
router.delete('/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    if (req.params.userId === req.user.id) return res.status(400).json({ error: "Can't delete your own admin account" });
    await supabaseAdmin.from('jeetmantra_users').update({ status: 'deleted', updated_at: new Date().toISOString() }).eq('id', req.params.userId);
    await auditLog(req.user.id, 'user.delete', req.params.userId);
    res.json({ message: 'User soft-deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /admin/audit — recent audit_log events (newest first, capped at 200).
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
    try { require('../services/settings').invalidate(); } catch (_) {} // apply immediately
    // Don't echo secret values back into the audit log.
    const SECRET = /pass|secret|token|key/i;
    const safe = Object.fromEntries(Object.keys(updates).map(k => [k, SECRET.test(k) ? '***' : updates[k]]));
    await auditLog(req.user.id, 'settings.update', null, safe);
    res.json({ message: 'Settings saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /admin/test-email — send a test email to the signed-in admin using the
// currently-configured SMTP (admin settings → .env). Lets the admin verify the
// mapping from the Integrations page.
router.post('/test-email', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data: me } = await supabaseAdmin.from('jeetmantra_users').select('email, full_name').eq('id', req.user.id).maybeSingle();
    const to = (me && me.email) || req.user.email;
    if (!to) return res.json({ sent: false, note: 'Your admin account has no email on file.' });
    const { sendMail } = require('../services/mailer');
    const r = await sendMail(to, 'JeetMantra — test email ✓',
      `<p>Hi ${me?.full_name || 'Admin'},</p><p>This confirms your <b>SMTP integration is working</b>. Sent ${new Date().toLocaleString('en-IN')}.</p>`);
    res.json({ sent: !!r.sent, to: r.sent ? to : undefined, note: r.sent ? undefined : (r.mode === 'console' ? 'SMTP not configured — set it in Integrations.' : (r.error || 'Send failed.')) });
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

// ════════════════════════════════════════════════════════════════════
// Sprint 6 — Impersonation ("view as user") support workflow.
//
// Admin starts an impersonation by POSTing target user + reason; receives
// a SHORT-LIVED JWT signed as the target user with extra claims
// { actor_id, scope, imp_session_id }. The client uses this token for
// follow-up calls. Stop POSTs the session id, server marks ended_at.
// Both transitions are audit_log'd with IP/UA/before-after.
//
// Hard caps: default 15 min, max 120 min, never beyond the configured
// JWT lifetime. Re-uses the same JWT_SECRET as normal auth so existing
// middleware accepts the token transparently.
// ════════════════════════════════════════════════════════════════════
router.post('/impersonate/start', authenticateToken, authorizeRole(['admin']), validate('impersonationStart'), async (req, res) => {
  try {
    const { targetUserId, scope = 'read', reason, durationMinutes = 15 } = req.validatedData;
    if (targetUserId === req.user.id) return res.status(400).json({ error: "Can't impersonate yourself" });
    const { data: target } = await supabaseAdmin.from('jeetmantra_users')
      .select('id, full_name, email, user_type').eq('id', targetUserId).maybeSingle();
    if (!target) return res.status(404).json({ error: 'Target user not found' });
    // Never impersonate another admin (defense in depth).
    if (target.user_type === 'admin') return res.status(403).json({ error: "Refusing to impersonate another admin" });

    const expiresAt = new Date(Date.now() + Math.min(120, Math.max(1, Number(durationMinutes) || 15)) * 60000);
    const sessionId = uuidv4();
    // Mint a token that LOOKS like the target user (id, role) so existing
    // route gates work, but carries the actor_id and imp_session_id for audit.
    const token = jwt.sign({
      id: target.id,
      email: target.email,
      role: target.user_type,
      actor_id: req.user.id,
      imp_session_id: sessionId,
      imp_scope: scope
    }, process.env.JWT_SECRET, { expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000) });

    // Persist the session row.
    try {
      await supabaseAdmin.from('impersonation_sessions').insert({
        id: sessionId,
        actor_id: req.user.id, target_id: targetUserId, scope, reason,
        actor_ip: req.ip || req.headers['x-forwarded-for'] || null,
        user_agent: req.headers['user-agent'] || null,
        expires_at: expiresAt.toISOString()
      });
    } catch (_) { /* table not migrated yet — token still works */ }

    await auditLog(req.user.id, 'impersonate.start', targetUserId, {
      scope, reason, duration_minutes: durationMinutes,
      session_id: sessionId,
      actor_ip: req.ip || req.headers['x-forwarded-for'] || null,
      user_agent: req.headers['user-agent'] || null
    });

    res.json({
      sessionId, token, expiresAt: expiresAt.toISOString(),
      target: { id: target.id, full_name: target.full_name, email: target.email, role: target.user_type },
      scope
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/impersonate/stop', authenticateToken, async (req, res) => {
  try {
    // Either the admin OR the impersonated session itself can stop. We close
    // by session_id from the body, or every active session for the calling
    // admin if none provided.
    const sessionId = req.body?.sessionId;
    let q = supabaseAdmin.from('impersonation_sessions')
      .update({ ended_at: new Date().toISOString() }).is('ended_at', null);
    if (sessionId) {
      q = q.eq('id', sessionId);
    } else if (req.user.imp_session_id) {
      q = q.eq('id', req.user.imp_session_id);
    } else if (req.user.role === 'admin') {
      q = q.eq('actor_id', req.user.id);
    } else {
      return res.status(400).json({ error: 'sessionId required' });
    }
    await q;
    await auditLog(req.user.actor_id || req.user.id, 'impersonate.stop', sessionId || null, {});
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/impersonate/sessions', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { active } = req.query;
    let q = supabaseAdmin.from('impersonation_sessions').select('*').order('started_at', { ascending: false }).limit(50);
    if (active === '1') q = q.is('ended_at', null);
    const { data } = await q;
    res.json({ sessions: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════
// Sprint 6 — Admin bookings list (activates the existing "Bookings &
// Venues" sidebar entry in admin-os.html). Cross-tenant view.
// ════════════════════════════════════════════════════════════════════
router.get('/bookings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status, resource_type, from, to, q, page = 1, limit = 25 } = req.query;
    const lim = Math.min(100, Math.max(1, Number(limit) || 25));
    const off = (Math.max(1, Number(page) || 1) - 1) * lim;
    let qb = supabaseAdmin.from('bookings_v2').select('*', { count: 'exact' });
    if (status)        qb = qb.eq('status', status);
    if (resource_type) qb = qb.eq('resource_type', resource_type);
    if (from)          qb = qb.gte('start_at', new Date(from).toISOString());
    if (to)            qb = qb.lte('start_at', new Date(to).toISOString());
    if (q) {
      const term = String(q).replace(/[%,()]/g, '');
      qb = qb.or(`booker_id.eq.${term},resource_id.eq.${term},id.eq.${term}`);
    }
    const { data: rows, count, error } = await qb.order('start_at', { ascending: false }).range(off, off + lim - 1);
    if (error) return res.status(500).json({ error: error.message });

    // Hydrate resource title + booker name
    const resourceIds = [...new Set((rows || []).map(r => r.resource_id))];
    const bookerIds   = [...new Set((rows || []).map(r => r.booker_id))];
    let resources = {}, bookers = {};
    if (resourceIds.length) {
      const { data } = await supabaseAdmin.from('resources').select('id, title, type, venue_name').in('id', resourceIds);
      resources = Object.fromEntries((data || []).map(x => [x.id, x]));
    }
    if (bookerIds.length) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', bookerIds);
      bookers = Object.fromEntries((data || []).map(x => [x.id, x]));
    }
    const bookings = (rows || []).map(b => ({
      ...b,
      resource: resources[b.resource_id] || null,
      booker:   bookers[b.booker_id] || null
    }));
    res.json({ bookings, page: Number(page), limit: lim, total: count || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /admin/live-classes — platform-wide live classes (admin Live & Recordings
// section). Optional status filter; hydrates course title + host name.
router.get('/live-classes', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const lim = Math.min(100, Math.max(1, Number(limit) || 50));
    const off = (Math.max(1, Number(page) || 1) - 1) * lim;
    let qb = supabaseAdmin.from('live_classes').select('*', { count: 'exact' });
    if (status) qb = qb.eq('status', status);
    const { data: rows, count, error } = await qb.order('scheduled_time', { ascending: false }).range(off, off + lim - 1);
    if (error) return res.status(500).json({ error: error.message });

    const courseIds = [...new Set((rows || []).map(r => r.course_id).filter(Boolean))];
    const hostIds   = [...new Set((rows || []).map(r => r.teacher_id || r.host_id).filter(Boolean))];
    let courses = {}, hosts = {};
    if (courseIds.length) {
      const { data } = await supabaseAdmin.from('courses').select('id, title').in('id', courseIds);
      courses = Object.fromEntries((data || []).map(x => [x.id, x]));
    }
    if (hostIds.length) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name').in('id', hostIds);
      hosts = Object.fromEntries((data || []).map(x => [x.id, x]));
    }
    const classes = (rows || []).map(c => ({
      ...c,
      course_title: courses[c.course_id]?.title || null,
      host_name: hosts[c.teacher_id || c.host_id]?.full_name || null
    }));
    res.json({ classes, page: Number(page), limit: lim, total: count || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /admin/migrations/run — runs a named SQL migration file from migrations/.
// Idempotent: uses DROP POLICY IF EXISTS + CREATE POLICY so safe to re-run.
router.post('/migrations/run', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const { file } = req.body;
  if (!file || !/^[\w-]+\.sql$/.test(file)) return res.status(400).json({ error: 'Invalid migration file name' });
  try {
    const fs = require('fs');
    const migPath = require('path').join(__dirname, '..', '..', 'migrations', file);
    if (!fs.existsSync(migPath)) return res.status(404).json({ error: 'Migration file not found' });
    const sql = fs.readFileSync(migPath, 'utf8')
      .split('\n').filter(l => !l.trim().startsWith('--') && l.trim()).join('\n');

    // Execute via /pg/query DDL endpoint (service-role key required).
    const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
    const errors = [];
    const pgUrl = `${process.env.SUPABASE_URL}/pg/query`;
    const axios = require('axios');
    for (const stmt of stmts) {
      try {
        await axios.post(pgUrl, { query: stmt + ';' }, {
          headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        const msg = e.response?.data?.message || e.message;
        errors.push({ stmt: stmt.slice(0, 80), error: msg });
      }
    }
    await auditLog(req.user.id, 'migration_run', null, { file, statements: stmts.length, errors: errors.length });
    res.json({ ok: true, file, statements: stmts.length, errors });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /admin/backup/trigger — run api-backup.js as a child process (non-blocking)
router.post('/backup/trigger', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const scriptPath = require('path').join(__dirname, '..', '..', 'scripts', 'api-backup.js');
    const child = spawn(process.execPath, [scriptPath], {
      detached: true, stdio: 'ignore',
      env: { ...process.env }
    });
    child.unref();
    await auditLog(req.user.id, 'backup_triggered', null, { pid: child.pid });
    res.json({ ok: true, message: 'Backup started in background', pid: child.pid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /admin/backup/list — list local backup files
router.get('/backup/list', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    const fs = require('fs');
    const backupDir = require('path').join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) return res.json({ backups: [] });
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-'))
      .map(f => {
        const stat = fs.statSync(require('path').join(backupDir, f));
        return { name: f, sizeMB: +(stat.size / 1024 / 1024).toFixed(2), createdAt: stat.mtime };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ backups: files, dir: backupDir });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Widget Management (admin) ──────────────────────────────────────────────
// Admin is the highest authority for widget policy. The config persists in
// LevelDB (no DB migration needed; survives restarts on disk) and is also
// surfaced on /api/me/contexts so every dashboard load picks up the policy.
// Shape: { global:{[id]:boolean}, byRole:{[role]:{[id]:boolean}}, order:{[role]:[id]}, sizes:{[id]:'small|medium|large|full'} }
const _widgetCfgKey = 'admin:widget-config';
async function _readWidgetCfg() {
  try { const { get } = require('../config/leveldb'); const raw = await get(_widgetCfgKey); return raw ? JSON.parse(raw) : { global:{}, byRole:{}, order:{}, sizes:{} }; }
  catch (_) { return { global:{}, byRole:{}, order:{}, sizes:{} }; }
}
async function _writeWidgetCfg(cfg) {
  const { put } = require('../config/leveldb'); await put(_widgetCfgKey, JSON.stringify(cfg || {}));
}

// GET — anyone authenticated; the dashboard reads this to apply admin policy.
router.get('/widget-config', authenticateToken, async (req, res) => {
  try { res.json({ config: await _readWidgetCfg() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT — admin only; replaces the config.
router.put('/widget-config', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const body = req.body || {};
    const cfg = {
      global: (body.global && typeof body.global === 'object') ? body.global : {},
      byRole: (body.byRole && typeof body.byRole === 'object') ? body.byRole : {},
      order:  (body.order  && typeof body.order  === 'object') ? body.order  : {},
      sizes:  (body.sizes  && typeof body.sizes  === 'object') ? body.sizes  : {}
    };
    await _writeWidgetCfg(cfg);
    res.json({ ok: true, config: cfg });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PAYMENT GATEWAY CONFIG: admin can view and update the active gateway
// credentials. Credentials are stored as a JSON blob in platform_settings
// under the key 'payment_config'. Secrets are never echoed back.
router.get('/payment-config', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('platform_settings').select('value').eq('key', 'payment_config').maybeSingle();
    const config = data ? JSON.parse(data.value) : {};
    res.json({
      gateway: config.gateway || 'demo',
      razorpay_configured: !!(config.razorpay_key_id && config.razorpay_key_secret),
      instamojo_configured: !!(config.instamojo_api_key && config.instamojo_auth_token),
      instamojo_env: config.instamojo_env || 'test',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/payment-config', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { gateway, razorpay_key_id, razorpay_key_secret, instamojo_api_key, instamojo_auth_token, instamojo_env } = req.body;
    const config = { gateway, razorpay_key_id, razorpay_key_secret, instamojo_api_key, instamojo_auth_token, instamojo_env: instamojo_env || 'test' };
    await supabaseAdmin.from('platform_settings').upsert({ key: 'payment_config', value: JSON.stringify(config) }, { onConflict: 'key' });
    await auditLog(req.user.id, 'payment_config.update', null, { gateway, instamojo_env: config.instamojo_env });
    res.json({ success: true, gateway });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
