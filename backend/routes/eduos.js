/**
 * eduos.js — Phases 2C..5 of the EduOS roadmap.
 *
 * Mounted at /api/eduos. Groups every roadmap feature in one file so the
 * server.js mount list stays short; each section is clearly demarcated.
 *
 *   /batches            — cohort scheduling (Phase 2C)
 *   /qr/*               — QR-code attendance (Phase 2C)
 *   /notify/*           — notifications service (Phase 3A)
 *   /forum/*            — discussion forum per course (Phase 3A)
 *   /polls/*            — live polls during class (Phase 3B)
 *   /report-card/:id    — AI report card + risk score (Phase 3B)
 *   /admissions/*       — admissions ERP (Phase 3C)
 *   /fees/*             — fee plans + invoices (Phase 3C)
 *   /payroll/*          — staff payroll (Phase 3C)
 *   /leave/*            — staff leave (Phase 3C)
 *   /tenant/*           — subdomain + branding (Phase 4)
 *   /franchise/*        — branch rollup (Phase 4)
 *   /ai/proctor-verdict — Phase 5 advanced proctor judgement
 *   /ai/ocr             — homework scanner (Phase 5)
 */
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { requireCapability } = require('../middleware/requireCapability');
const { CREATOR_ROLES, INSTITUTION_ROLES, STUDENT_ROLES, PARENT_ROLES } = require('../config/roles');
const { validate } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

// S1-3 fix: institution-scoped routes below used .eq('institution_id', resolveInstitutionForAdmin(req)),
// which works when the caller IS the institution but causes admin queries to
// return zero rows. This helper lets admin override the scope via
// ?institution_id=X (so platform staff can manage any tenant's ops), while
// non-admin callers stay locked to their own institution_id (== req.user.id).
function resolveInstitutionForAdmin(req) {
  if (req.user.role === 'admin' && req.query.institution_id) return req.query.institution_id;
  return req.user.id;
}

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


// ── Ownership helper used by batches/qr/forums/etc.
async function ownsCourse(courseId, userId) {
  const { data: c } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).maybeSingle();
  return c && c.teacher_id === userId;
}

// ════════════════════════════════════════════════════════════════════
// PHASE 2C — BATCHES (course cohorts) + QR ATTENDANCE
// ════════════════════════════════════════════════════════════════════

// List batches for a course.
router.get('/courses/:courseId/batches', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('course_batches')
      .select('*').eq('course_id', req.params.courseId).order('start_date');
    // Hydrate teacher names for main/alternate assignment display.
    const tids = [...new Set((data || []).flatMap(b => [b.main_teacher_id, b.alt_teacher_id]).filter(Boolean))];
    let names = {};
    if (tids.length) {
      const { data: us } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', tids);
      names = Object.fromEntries((us || []).map(u => [u.id, u.full_name || u.email]));
    }
    const batches = (data || []).map(b => ({ ...b, main_teacher_name: names[b.main_teacher_id] || null, alt_teacher_name: names[b.alt_teacher_id] || null }));
    res.json({ batches });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create a batch for a course (course owner or admin).
router.post('/courses/:courseId/batches', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    if (!(await ownsCourse(req.params.courseId, req.user.id)) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not your course' });
    }
    const { name, startDate, endDate, capacity, schedulePattern, classGrade, mainTeacherId, altTeacherId } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const { data, error } = await supabaseAdmin.from('course_batches').insert({
      id: uuidv4(), course_id: req.params.courseId, name,
      start_date: startDate || null, end_date: endDate || null,
      capacity: Number(capacity) || 100, schedule_pattern: schedulePattern || null,
      class_grade: classGrade || null, main_teacher_id: mainTeacherId || req.user.id, alt_teacher_id: altTeacherId || null,
      status: 'active'
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ batch: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update a batch (rename, reschedule, reassign main/alternate teacher).
router.put('/batches/:batchId', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { name, startDate, endDate, capacity, schedulePattern, classGrade, mainTeacherId, altTeacherId, status } = req.body || {};
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (startDate !== undefined) updates.start_date = startDate || null;
    if (endDate !== undefined) updates.end_date = endDate || null;
    if (capacity !== undefined) updates.capacity = Number(capacity) || 100;
    if (schedulePattern !== undefined) updates.schedule_pattern = schedulePattern;
    if (classGrade !== undefined) updates.class_grade = classGrade;
    if (mainTeacherId !== undefined) updates.main_teacher_id = mainTeacherId || null;
    if (altTeacherId !== undefined) updates.alt_teacher_id = altTeacherId || null;
    if (status !== undefined) updates.status = status;
    const { data, error } = await supabaseAdmin.from('course_batches').update(updates).eq('id', req.params.batchId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ batch: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Enroll a student in a batch.
router.post('/batches/:batchId/enroll', authenticateToken, async (req, res) => {
  try {
    const studentId = req.body?.studentId || req.user.id;
    // Capacity check
    const { data: batch } = await supabaseAdmin.from('course_batches').select('capacity').eq('id', req.params.batchId).maybeSingle();
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    const { count } = await supabaseAdmin.from('batch_enrollments').select('id', { count: 'exact', head: true }).eq('batch_id', req.params.batchId);
    if ((count || 0) >= batch.capacity) return res.status(400).json({ error: 'Batch full' });
    const { data: existing } = await supabaseAdmin.from('batch_enrollments').select('id').eq('batch_id', req.params.batchId).eq('student_id', studentId).maybeSingle();
    if (existing) return res.json({ message: 'Already enrolled' });
    const { data, error } = await supabaseAdmin.from('batch_enrollments').insert({
      id: uuidv4(), batch_id: req.params.batchId, student_id: studentId
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ enrollment: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Roster of students enrolled in a batch (creator/admin).
router.get('/batches/:batchId/roster', authenticateToken, authorizeRole([...CREATOR_ROLES, 'admin']), async (req, res) => {
  try {
    const { data: rows } = await supabaseAdmin.from('batch_enrollments').select('*').eq('batch_id', req.params.batchId);
    const ids = (rows || []).map(r => r.student_id);
    if (!ids.length) return res.json({ roster: [] });
    const { data: users } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email, phone').in('id', ids);
    const byId = Object.fromEntries((users || []).map(u => [u.id, u]));
    res.json({ roster: (rows || []).map(r => ({ ...r, ...byId[r.student_id] })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── QR ATTENDANCE
// Teacher generates a per-class token (valid 10 min). Token is the QR payload.
router.post('/qr/generate', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { courseId, batchId, classDate } = req.body || {};
    if (!courseId) return res.status(400).json({ error: 'courseId required' });
    const token = crypto.randomBytes(12).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabaseAdmin.from('qr_attendance_tokens').insert({
      token, course_id: courseId, teacher_id: req.user.id,
      batch_id: batchId || null,
      class_date: classDate || new Date().toISOString().slice(0, 10),
      expires_at: expiresAt
    });
    res.json({ token, expiresAt, qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent('jm-attend:' + token)}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Student scans → POST with token → attendance row written (idempotent).
router.post('/qr/check-in', authenticateToken, async (req, res) => {
  try {
    const raw = String(req.body?.token || '').replace(/^jm-attend:/, '');
    if (!raw) return res.status(400).json({ error: 'token required' });
    const { data: t } = await supabaseAdmin.from('qr_attendance_tokens').select('*').eq('token', raw).maybeSingle();
    if (!t) return res.status(404).json({ error: 'Invalid token' });
    if (new Date(t.expires_at) < new Date()) return res.status(400).json({ error: 'Token expired' });
    // Look up student's enrollment.
    const { data: enr } = await supabaseAdmin.from('enrollments').select('id').eq('course_id', t.course_id).eq('student_id', req.user.id).maybeSingle();
    if (!enr) return res.status(403).json({ error: 'Not enrolled in this course' });
    // Idempotent — UPDATE if exists, else INSERT.
    const { data: existing } = await supabaseAdmin.from('attendance').select('id').eq('enrollment_id', enr.id).eq('date', t.class_date).maybeSingle();
    if (existing) {
      await supabaseAdmin.from('attendance').update({ status: 'present' }).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('attendance').insert({
        id: uuidv4(), enrollment_id: enr.id, course_id: t.course_id, student_id: req.user.id,
        status: 'present', date: t.class_date, recorded_by: t.teacher_id,
        created_at: new Date().toISOString()
      });
    }
    res.json({ message: '✓ Attendance marked', date: t.class_date });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════
// PHASE 3A — NOTIFICATIONS SERVICE (pluggable providers) + FORUMS
// ════════════════════════════════════════════════════════════════════

// Pluggable provider registry. Each provider implements send(notif). In dev
// we log; flip the env vars to wire real Twilio / SendGrid / FCM / WhatsApp.
const providers = {
  email: async (n) => {
    if (process.env.SENDGRID_API_KEY) {
      // Real SendGrid v3 mail/send integration
      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: n.to }] }],
            from: { email: process.env.SENDGRID_FROM || 'noreply@jeetmantra.com', name: 'JeetMantra' },
            subject: n.title || 'Notification from JeetMantra',
            content: [{ type: 'text/html', value: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#f97316">${n.title || ''}</h2><p>${n.body || ''}</p>${n.link ? `<p><a href="${n.link}" style="background:#f97316;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Open</a></p>` : ''}<hr style="border:none;border-top:1px solid #eee;margin:20px 0"><p style="color:#999;font-size:12px">JeetMantra EduOS</p></div>` }]
          })
        });
        if (res.ok || res.status === 202) {
          const msgId = res.headers.get('x-message-id') || ('sg_' + uuidv4().slice(0, 8));
          return { sent: true, provider: 'sendgrid', externalId: msgId };
        }
        const errText = await res.text().catch(() => '');
        console.warn('SendGrid error:', res.status, errText);
        return { sent: false, provider: 'sendgrid', error: errText };
      } catch (e) {
        console.warn('SendGrid fetch error:', e.message);
        return { sent: false, provider: 'sendgrid', error: e.message };
      }
    }
    console.log(`📧 [email] to=${n.to} subject="${n.title}"\n${n.body}\n`);
    return { sent: true, provider: 'console-stub' };
  },
  sms: async (n) => {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const auth = Buffer.from(process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN).toString('base64');
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ To: n.to, From: process.env.TWILIO_FROM || '+10000000000', Body: (n.title ? n.title + ': ' : '') + n.body })
        });
        const data = await res.json();
        return { sent: !!data.sid, provider: 'twilio', externalId: data.sid || ('tw_' + uuidv4().slice(0, 8)) };
      } catch (e) {
        console.warn('Twilio error:', e.message);
        return { sent: false, provider: 'twilio', error: e.message };
      }
    }
    console.log(`📱 [sms] to=${n.to} ${n.body}`);
    return { sent: true, provider: 'console-stub' };
  },
  whatsapp: async (n) => {
    if (process.env.WHATSAPP_BUSINESS_TOKEN) {
      // WhatsApp Cloud API — requires a verified phone number ID
      try {
        const phoneId = process.env.WHATSAPP_PHONE_ID || '';
        const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + process.env.WHATSAPP_BUSINESS_TOKEN, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messaging_product: 'whatsapp', to: n.to, type: 'text', text: { body: (n.title ? n.title + '\n' : '') + n.body } })
        });
        const data = await res.json();
        return { sent: !!data.messages, provider: 'whatsapp-cloud', externalId: data.messages?.[0]?.id || ('wa_' + uuidv4().slice(0, 8)) };
      } catch (e) {
        console.warn('WhatsApp error:', e.message);
        return { sent: false, provider: 'whatsapp-cloud', error: e.message };
      }
    }
    console.log(`💬 [whatsapp] to=${n.to} ${n.body}`);
    return { sent: true, provider: 'console-stub' };
  },
  push: async (n) => {
    if (process.env.FCM_SERVER_KEY) {
      try {
        const res = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: { 'Authorization': 'key=' + process.env.FCM_SERVER_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: n.to, notification: { title: n.title, body: n.body }, data: { link: n.link || '' } })
        });
        const data = await res.json();
        return { sent: data.success > 0, provider: 'fcm', externalId: data.results?.[0]?.message_id || ('fcm_' + uuidv4().slice(0, 8)) };
      } catch (e) {
        console.warn('FCM error:', e.message);
        return { sent: false, provider: 'fcm', error: e.message };
      }
    }
    console.log(`🔔 [push] to=${n.to} ${n.title}`);
    return { sent: true, provider: 'console-stub' };
  }
};

// Internal helper — exported via a tiny side-channel for other routes to
// trigger notifications. Always writes a notifications row for the in-app
// center even if no external provider is configured.
async function notify({ userId, channel, type, title, body, link, to }) {
  const id = uuidv4();
  let providerName = 'in-app';
  if (channel && providers[channel]) {
    try {
      const r = await providers[channel]({ to, title, body, link });
      providerName = r.provider || channel;
    } catch (e) { console.warn('notify provider err', e.message); }
  }
  await supabaseAdmin.from('notifications').insert({
    id, user_id: userId, channel: channel || 'in-app', type: type || 'info',
    title, body, link, provider: providerName, status: 'sent'
  });
  // Recipient ≠ requester → clear their notification/dashboard cache now so the
  // unread count is fresh on the next poll (syncMiddleware only sees the writer).
  try { require('../middleware/datasync').invalidateUser(userId, ['/api/notifications', '/api/dashboard']); } catch (_) {}
  return id;
}
router.notify = notify; // attach for cross-route imports

// List notifications for the caller.
router.get('/notify', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('notifications')
      .select('*').eq('user_id', req.user.id).order('sent_at', { ascending: false }).limit(50);
    const unread = (data || []).filter(n => !n.read_at).length;
    res.json({ notifications: data || [], unread });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Mark all of the caller's notifications read.
router.post('/notify/mark-read', authenticateToken, async (req, res) => {
  try {
    await supabaseAdmin.from('notifications').update({ read_at: new Date().toISOString() })
      .eq('user_id', req.user.id).is('read_at', null);
    res.json({ message: 'All marked read' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin can send a test notification to any user.
router.post('/notify/send', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { userId, channel, title, body, link } = req.body || {};
    if (!userId || !title) return res.status(400).json({ error: 'userId + title required' });
    const { data: u } = await supabaseAdmin.from('jeetmantra_users').select('email, phone').eq('id', userId).maybeSingle();
    const to = channel === 'sms' || channel === 'whatsapp' ? u?.phone : u?.email;
    const id = await notify({ userId, channel: channel || 'in-app', type: 'admin-broadcast', title, body, link, to });
    res.json({ notificationId: id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── FORUM — threads + nested replies on a course.
router.get('/forum/:courseId', authenticateToken, async (req, res) => {
  try {
    const { data: threads } = await supabaseAdmin.from('forum_threads')
      .select('*').eq('course_id', req.params.courseId).order('pinned', { ascending: false }).order('created_at', { ascending: false });
    // Hydrate author names + reply counts in batch.
    const tids = (threads || []).map(t => t.id);
    const aids = [...new Set((threads || []).map(t => t.author_id))];
    let userMap = {}, replyCount = {};
    if (aids.length) {
      const { data: users } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name').in('id', aids);
      userMap = Object.fromEntries((users || []).map(u => [u.id, u.full_name]));
    }
    if (tids.length) {
      const { data: rcounts } = await supabaseAdmin.from('forum_replies').select('thread_id').in('thread_id', tids);
      (rcounts || []).forEach(r => { replyCount[r.thread_id] = (replyCount[r.thread_id] || 0) + 1; });
    }
    res.json({ threads: (threads || []).map(t => ({ ...t, author_name: userMap[t.author_id] || '—', replies: replyCount[t.id] || 0 })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create a new forum thread on a course.
router.post('/forum/:courseId', authenticateToken, async (req, res) => {
  try {
    const { title, body } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const { data, error } = await supabaseAdmin.from('forum_threads').insert({
      id: uuidv4(), course_id: req.params.courseId, author_id: req.user.id, title, body: body || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ thread: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Fetch a thread + its replies (author names hydrated).
router.get('/forum/thread/:threadId', authenticateToken, async (req, res) => {
  try {
    const { data: thread } = await supabaseAdmin.from('forum_threads').select('*').eq('id', req.params.threadId).maybeSingle();
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const { data: replies } = await supabaseAdmin.from('forum_replies').select('*').eq('thread_id', req.params.threadId).order('created_at');
    const aids = [...new Set([thread.author_id, ...(replies || []).map(r => r.author_id)])];
    const { data: users } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name').in('id', aids);
    const map = Object.fromEntries((users || []).map(u => [u.id, u.full_name]));
    res.json({
      thread: { ...thread, author_name: map[thread.author_id] || '—' },
      replies: (replies || []).map(r => ({ ...r, author_name: map[r.author_id] || '—' }))
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Post a reply (optionally nested via parentId) to a thread.
router.post('/forum/thread/:threadId/reply', authenticateToken, async (req, res) => {
  try {
    const { body, parentId } = req.body || {};
    if (!body) return res.status(400).json({ error: 'body required' });
    const { data, error } = await supabaseAdmin.from('forum_replies').insert({
      id: uuidv4(), thread_id: req.params.threadId, parent_id: parentId || null,
      author_id: req.user.id, body
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ reply: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── FORUM MODERATION — flag, delete threads/replies (teachers + admins)
router.post('/forum/flag/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body || {};
    const table = type === 'thread' ? 'forum_threads' : 'forum_replies';
    const { data, error } = await supabaseAdmin.from(table)
      .update({ flagged: true, flag_reason: reason || 'Reported by user', flagged_by: req.user.id, flagged_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Flagged for review', data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/forum/thread/:threadId', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    // Delete replies first, then thread
    await supabaseAdmin.from('forum_replies').delete().eq('thread_id', req.params.threadId);
    const { error } = await supabaseAdmin.from('forum_threads').delete().eq('id', req.params.threadId);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Thread deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/forum/reply/:replyId', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('forum_replies').delete().eq('id', req.params.replyId);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Reply deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════
// PHASE 3B — LIVE POLLS + AI REPORT CARD
// ════════════════════════════════════════════════════════════════════

// Create a live poll for a class (teacher/creator).
router.post('/polls', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { classId, question, options } = req.body || {};
    if (!classId || !question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'classId, question, options[2+] required' });
    }
    const { data, error } = await supabaseAdmin.from('class_polls').insert({
      id: uuidv4(), class_id: classId, teacher_id: req.user.id,
      question, options, status: 'open'
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ poll: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Cast/replace the caller's vote on an open poll (one vote per student).
router.post('/polls/:pollId/vote', authenticateToken, async (req, res) => {
  try {
    const { choice } = req.body || {};
    if (!choice) return res.status(400).json({ error: 'choice required' });
    const { data: poll } = await supabaseAdmin.from('class_polls').select('status, options').eq('id', req.params.pollId).maybeSingle();
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    if (poll.status !== 'open') return res.status(400).json({ error: 'Poll closed' });
    if (!poll.options.includes(choice)) return res.status(400).json({ error: 'Invalid choice' });
    const { error } = await supabaseAdmin.from('class_poll_votes').upsert({
      id: uuidv4(), poll_id: req.params.pollId, student_id: req.user.id, choice
    }, { onConflict: 'poll_id,student_id' });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Vote recorded' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Tally of votes per option for a poll.
router.get('/polls/:pollId/results', authenticateToken, async (req, res) => {
  try {
    const { data: poll } = await supabaseAdmin.from('class_polls').select('*').eq('id', req.params.pollId).maybeSingle();
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    const { data: votes } = await supabaseAdmin.from('class_poll_votes').select('choice').eq('poll_id', req.params.pollId);
    const tally = {};
    (poll.options || []).forEach(o => tally[o] = 0);
    (votes || []).forEach(v => { tally[v.choice] = (tally[v.choice] || 0) + 1; });
    res.json({ poll, tally, total: (votes || []).length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Close a poll so no further votes are accepted (owning teacher).
router.post('/polls/:pollId/close', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    await supabaseAdmin.from('class_polls').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', req.params.pollId).eq('teacher_id', req.user.id);
    res.json({ message: 'Closed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── AI REPORT CARD + dropout risk for a student.
router.get('/report-card/:studentId', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    // Permission: self, parent of, or creator/admin.
    if (studentId !== req.user.id && !CREATOR_ROLES.includes(req.user.role) && req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const [{ data: student }, { data: enrollments }, { data: attendance }, { data: subs }] = await Promise.all([
      supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').eq('id', studentId).maybeSingle(),
      supabaseAdmin.from('enrollments').select('course_id, progress').eq('student_id', studentId),
      supabaseAdmin.from('attendance').select('status, date').eq('student_id', studentId),
      supabaseAdmin.from('test_submissions').select('score, status, submitted_at').eq('student_id', studentId)
    ]);
    const att = (attendance || []);
    const presentPct = att.length ? Math.round(100 * att.filter(a => a.status === 'present').length / att.length) : 0;
    const avgScore = subs && subs.length ? Math.round(subs.reduce((s, x) => s + (Number(x.score) || 0), 0) / subs.length) : null;
    // Naive risk model: low attendance + low score + low progress = high risk.
    const avgProgress = enrollments && enrollments.length ? enrollments.reduce((s, e) => s + (Number(e.progress) || 0), 0) / enrollments.length : 0;
    let risk = 'low';
    const score = presentPct + (avgScore || 0) + avgProgress;
    if (score < 90) risk = 'high';
    else if (score < 180) risk = 'medium';

    let narrative = '';
    try {
      const { ai } = require('../config/aiProvider');
      const out = await ai(req.user.id,
        'You write concise, kind report-card narratives for students. Reply in 3-4 sentences.',
        `Student: ${student?.full_name || studentId}\nAttendance: ${presentPct}%\nAvg test score: ${avgScore ?? 'n/a'}\nCourses progress: ${Math.round(avgProgress)}%\nWrite a balanced report-card paragraph highlighting strengths + areas to improve.`,
        { action: 'report-card' });
      narrative = out.text;
    } catch (e) {
      narrative = `${student?.full_name || 'Student'} has ${presentPct}% attendance and an average score of ${avgScore ?? 'n/a'} across ${subs?.length || 0} tests. Course progress averages ${Math.round(avgProgress)}%. (AI narrative unavailable: ${e.message})`;
    }
    res.json({
      student, narrative,
      stats: { attendancePct: presentPct, avgScore, avgProgress: Math.round(avgProgress), testsTaken: subs?.length || 0 },
      risk
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════
// PHASE 3C — ERP: ADMISSIONS / FEES / PAYROLL / LEAVE
// ════════════════════════════════════════════════════════════════════

// Admissions (school/coaching/admin only).
router.get('/admissions', authenticateToken, authorizeRole(INSTITUTION_ROLES), async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('admissions').select('*').eq('institution_id', resolveInstitutionForAdmin(req)).order('applied_at', { ascending: false });
    const counts = { applied: 0, interview: 0, admitted: 0, rejected: 0 };
    (data || []).forEach(a => { counts[a.stage] = (counts[a.stage] || 0) + 1; });
    res.json({ admissions: data || [], counts });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/admissions', authenticateToken, requireCapability('admissions.manage'), validate('admissionCreate'), async (req, res) => {
  try {
    const { studentName, studentEmail, studentPhone, courseId, notes } = req.validatedData;
    const { data, error } = await supabaseAdmin.from('admissions').insert({
      id: uuidv4(), institution_id: req.user.id,
      student_name: studentName, student_email: studentEmail || null,
      student_phone: studentPhone || null, course_id: courseId || null,
      stage: 'applied', notes: notes || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ admission: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/admissions/:id', authenticateToken, requireCapability('admissions.manage'), validate('admissionUpdate'), async (req, res) => {
  try {
    const { stage, notes } = req.validatedData;
    const updates = { updated_at: new Date().toISOString() };
    if (stage) updates.stage = stage;
    if (notes !== undefined) updates.notes = notes;
    const { data, error } = await supabaseAdmin.from('admissions').update(updates)
      .eq('id', req.params.id).eq('institution_id', resolveInstitutionForAdmin(req)).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ admission: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Fee plans.
router.get('/fees/plans', authenticateToken, authorizeRole(INSTITUTION_ROLES), async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('fee_plans').select('*').eq('institution_id', resolveInstitutionForAdmin(req));
    res.json({ plans: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/fees/plans', authenticateToken, requireCapability('billing.manage'), validate('feePlanCreate'), async (req, res) => {
  try {
    const { name, amount, frequency, courseId } = req.validatedData;
    const { data, error } = await supabaseAdmin.from('fee_plans').insert({
      id: uuidv4(), institution_id: req.user.id, name,
      amount: Number(amount), frequency: frequency || 'monthly',
      course_id: courseId || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ plan: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Fee invoices.
router.get('/fees/invoices', authenticateToken, authorizeRole([...INSTITUTION_ROLES, 'parent', 'student']), async (req, res) => {
  try {
    let q = supabaseAdmin.from('fee_invoices').select('*');
    if (INSTITUTION_ROLES.includes(req.user.role)) q = q.eq('institution_id', resolveInstitutionForAdmin(req));
    else q = q.eq('student_id', req.user.id);
    const { data } = await q.order('due_date', { ascending: false });
    res.json({ invoices: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/fees/invoices', authenticateToken, requireCapability('billing.manage'), validate('feeInvoiceCreate'), async (req, res) => {
  try {
    const { studentId, feePlanId, amount, dueDate } = req.validatedData;
    const { data, error } = await supabaseAdmin.from('fee_invoices').insert({
      id: uuidv4(), institution_id: req.user.id, student_id: studentId,
      fee_plan_id: feePlanId || null, amount: Number(amount),
      due_date: dueDate || null, status: 'pending'
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    // Fire-and-forget notification to student.
    notify({
      userId: studentId, channel: 'in-app', type: 'fee.invoice',
      title: `Fee invoice ₹${amount} ready`,
      body: dueDate ? `Due on ${dueDate}` : 'Please pay at your earliest convenience.',
      link: '/dashboard.html#fees'
    }).catch(() => {});
    res.status(201).json({ invoice: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/fees/invoices/:id/pay', authenticateToken, async (req, res) => {
  try {
    // Ownership gate (was authenticateToken-only → any user could mark ANY
    // invoice paid by id). Allowed: the institution that issued it, the student
    // it belongs to, or admin.
    const { data: inv } = await supabaseAdmin.from('fee_invoices')
      .select('institution_id, student_id').eq('id', req.params.id).maybeSingle();
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    const isAdmin = req.user.role === 'admin';
    const isInstitution = INSTITUTION_ROLES.includes(req.user.role) && inv.institution_id === resolveInstitutionForAdmin(req);
    const isStudent = inv.student_id === req.user.id;
    if (!isAdmin && !isInstitution && !isStudent) {
      return res.status(403).json({ error: 'Not authorized to settle this invoice' });
    }
    await supabaseAdmin.from('fee_invoices').update({
      status: 'paid', paid_at: new Date().toISOString()
    }).eq('id', req.params.id);
    res.json({ message: 'Marked paid' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Send fee reminders for invoices due in next 7 days.
router.post('/fees/send-reminders', authenticateToken, requireCapability('billing.manage'), async (req, res) => {
  try {
    const sevenDaysOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: due } = await supabaseAdmin.from('fee_invoices').select('*')
      .eq('institution_id', resolveInstitutionForAdmin(req)).eq('status', 'pending')
      .lte('due_date', sevenDaysOut);
    let sent = 0;
    for (const inv of (due || [])) {
      await notify({
        userId: inv.student_id, channel: 'email', type: 'fee.reminder',
        title: `Fee reminder: ₹${inv.amount}`,
        body: `Your fee is due ${inv.due_date}. Please pay to continue uninterrupted access.`
      });
      sent++;
    }
    res.json({ remindersSent: sent });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Payroll.
router.get('/payroll', authenticateToken, authorizeRole(INSTITUTION_ROLES), async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('staff_payroll').select('*').eq('institution_id', resolveInstitutionForAdmin(req)).order('created_at', { ascending: false });
    res.json({ payroll: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/payroll', authenticateToken, requireCapability('payroll.manage'), validate('payrollCreate'), async (req, res) => {
  try {
    const { staffId, periodMonth, baseSalary, bonuses, deductions } = req.validatedData;
    const net = Number(baseSalary) + (Number(bonuses) || 0) - (Number(deductions) || 0);
    const { data, error } = await supabaseAdmin.from('staff_payroll').insert({
      id: uuidv4(), institution_id: req.user.id, staff_id: staffId,
      period_month: periodMonth || new Date().toISOString().slice(0, 7),
      base_salary: Number(baseSalary), bonuses: Number(bonuses) || 0,
      deductions: Number(deductions) || 0, net_pay: net, status: 'pending'
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ payroll: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/payroll/:id/pay', authenticateToken, requireCapability('payroll.manage'), async (req, res) => {
  try {
    await supabaseAdmin.from('staff_payroll').update({
      status: 'paid', paid_at: new Date().toISOString()
    }).eq('id', req.params.id).eq('institution_id', resolveInstitutionForAdmin(req));
    res.json({ message: 'Marked paid' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Leave.
router.get('/leave', authenticateToken, async (req, res) => {
  try {
    let q = supabaseAdmin.from('staff_leave').select('*');
    if (INSTITUTION_ROLES.includes(req.user.role)) q = q.eq('institution_id', resolveInstitutionForAdmin(req));
    else q = q.eq('staff_id', req.user.id);
    const { data } = await q.order('created_at', { ascending: false });
    res.json({ requests: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/leave', authenticateToken, validate('leaveCreate'), async (req, res) => {
  try {
    const { institutionId, leaveType, fromDate, toDate, reason } = req.validatedData;
    const { data, error } = await supabaseAdmin.from('staff_leave').insert({
      id: uuidv4(), institution_id: institutionId, staff_id: req.user.id,
      leave_type: leaveType || 'casual', from_date: fromDate, to_date: toDate,
      reason: reason || null, status: 'pending'
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ request: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/leave/:id/decide', authenticateToken, requireCapability('hr.manage'), validate('leaveDecide'), async (req, res) => {
  try {
    const { decision } = req.validatedData; // 'approved' | 'rejected'
    await supabaseAdmin.from('staff_leave').update({
      status: decision === 'approved' ? 'approved' : 'rejected',
      approved_by: req.user.id, decided_at: new Date().toISOString()
    }).eq('id', req.params.id).eq('institution_id', resolveInstitutionForAdmin(req));
    res.json({ message: 'Decision recorded' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════
// PHASE 4 — MULTI-TENANT: SUBDOMAIN + BRANDING + FRANCHISE
// ════════════════════════════════════════════════════════════════════

router.get('/tenant/branding', async (req, res) => {
  try {
    // Resolves branding for a Host header or ?sub=. Public so it can be
    // fetched before login to skin the marketplace.
    const host = (req.query.sub || req.headers.host || '').split(':')[0].split('.')[0];
    if (!host) return res.json({ branding: null });
    const { data } = await supabaseAdmin.from('jeetmantra_users')
      .select('id, full_name, subdomain, brand_logo, brand_color, brand_name')
      .eq('subdomain', host).maybeSingle();
    res.json({ branding: data || null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/tenant/branding', authenticateToken, requireCapability('org.branding'), validate('tenantBranding'), async (req, res) => {
  try {
    const { subdomain, brandLogo, brandColor, brandName } = req.validatedData;
    const updates = {};
    if (subdomain !== undefined) updates.subdomain = subdomain ? String(subdomain).toLowerCase() : null;
    if (brandLogo !== undefined) updates.brand_logo = brandLogo;
    if (brandColor !== undefined) updates.brand_color = brandColor;
    if (brandName !== undefined) updates.brand_name = brandName;
    const { data, error } = await supabaseAdmin.from('jeetmantra_users').update(updates).eq('id', req.user.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ tenant: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Franchise — top-level owner sees a rollup of every branch (institution).
router.get('/franchise/branches', authenticateToken, authorizeRole(['franchise', 'admin']), async (req, res) => {
  try {
    const { data: links } = await supabaseAdmin.from('franchise_branches').select('*').eq('franchise_id', req.user.id);
    const ids = (links || []).map(l => l.institution_id);
    let summaries = [];
    if (ids.length) {
      const [{ data: insts }, { data: courses }, { data: enrollments }] = await Promise.all([
        supabaseAdmin.from('jeetmantra_users').select('id, full_name, brand_name').in('id', ids),
        supabaseAdmin.from('courses').select('id, teacher_id').in('teacher_id', ids),
        supabaseAdmin.from('enrollments').select('course_id, student_id, courses(teacher_id)')
      ]);
      const courseByInst = {};
      (courses || []).forEach(c => { (courseByInst[c.teacher_id] = courseByInst[c.teacher_id] || []).push(c.id); });
      summaries = (insts || []).map(i => {
        const courseIds = courseByInst[i.id] || [];
        const studentCount = new Set((enrollments || []).filter(e => courseIds.includes(e.course_id)).map(e => e.student_id)).size;
        return { id: i.id, name: i.brand_name || i.full_name, courses: courseIds.length, students: studentCount };
      });
    }
    res.json({ branches: summaries });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Link an institution as a branch under this franchise.
router.post('/franchise/branches', authenticateToken, authorizeRole(['franchise', 'admin']), async (req, res) => {
  try {
    const { institutionId, branchName } = req.body || {};
    if (!institutionId) return res.status(400).json({ error: 'institutionId required' });
    const { data, error } = await supabaseAdmin.from('franchise_branches').insert({
      id: uuidv4(), franchise_id: req.user.id, institution_id: institutionId, branch_name: branchName || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ branch: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════
// PHASE 5 — AI PROCTORING V2 + OCR HOMEWORK SCANNER + VOICE
// ════════════════════════════════════════════════════════════════════

// AI verdict on a session: rolls up proctoring_events and asks the LLM to
// decide if cheating is likely. Read-only — doesn't mutate anything.
router.get('/ai/proctor-verdict/:sessionId', authenticateToken, authorizeRole([...CREATOR_ROLES, 'admin']), async (req, res) => {
  try {
    const { data: events } = await supabaseAdmin.from('proctoring_events')
      .select('*').eq('session_id', req.params.sessionId).order('occurred_at');
    if (!events || !events.length) {
      return res.json({ verdict: { status: 'clean', risk: 'low', confidence: 0.9 }, events: [] });
    }
    // Rule-of-thumb risk scoring before LLM (fallback if AI is missing).
    const tabSwitches = events.filter(e => e.event_type === 'tab_switched_away').length;
    const copies = events.filter(e => e.event_type === 'copy_blocked').length;
    const clicks = events.filter(e => e.event_type === 'right_click_blocked').length;
    let baselineRisk = 'low';
    if (tabSwitches >= 5 || copies >= 5) baselineRisk = 'high';
    else if (tabSwitches >= 2 || copies >= 2) baselineRisk = 'medium';

    let narrative = `${tabSwitches} tab-switch · ${copies} copy attempts · ${clicks} right-click events. Risk: ${baselineRisk}.`;
    try {
      const { ai } = require('../config/aiProvider');
      const out = await ai(req.user.id,
        'You judge online exam integrity from proctoring telemetry. Reply concisely in 2-3 sentences.',
        `Events log (${events.length}):\n${events.slice(0, 30).map(e => `- ${e.event_type} @ ${e.occurred_at}`).join('\n')}\n\nIs cheating likely? What patterns concern you?`,
        { action: 'proctor-verdict' });
      narrative = out.text;
    } catch (_) { /* fall back to rule-based */ }
    res.json({ verdict: { status: baselineRisk === 'low' ? 'clean' : 'review', risk: baselineRisk }, narrative, events });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// OCR — upload an image of a hand-written page → extract text + optional AI grade.
const uploadDir = path.join(__dirname, '..', 'uploads', 'ocr');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const ocrStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'ocr-' + Date.now() + '-' + file.originalname.replace(/[^\w.-]/g, '_'))
});
const ocrUpload = multer({ storage: ocrStorage, limits: { fileSize: 10 * 1024 * 1024 } });
router.post('/ai/ocr', authenticateToken, ocrUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image required' });
    const url = '/uploads/ocr/' + req.file.filename;
    // Vision OCR — real impl would call OpenAI vision / Google Vision.
    // For now stash a stub record so the UI flow works end-to-end.
    let extracted = '(OCR provider not configured — image stored for manual review)';
    let aiGrade = null;
    // OpenAI Vision OCR when a server-side key is present.
    if (process.env.OPENAI_API_KEY) {
      try {
        const b64 = fs.readFileSync(req.file.path).toString('base64');
        const mime = req.file.mimetype || 'image/png';
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: [
              { type: 'text', text: 'Transcribe all hand-written or printed text in this image. Reply with only the transcript, no commentary.' },
              { type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } }
            ] }],
            max_tokens: 800
          })
        });
        const j = await r.json();
        const txt = j.choices?.[0]?.message?.content?.trim();
        if (txt) extracted = txt;
      } catch (visionErr) { console.warn('OCR vision failed:', visionErr.message); }
    }
    const { data, error } = await supabaseAdmin.from('ocr_scans').insert({
      id: uuidv4(), user_id: req.user.id, image_url: url,
      extracted_text: extracted, kind: req.body?.kind || 'homework',
      ai_grade: aiGrade
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ scan: data, message: 'Image uploaded; OCR pending (vision provider not configured)' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/ai/ocr/my', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('ocr_scans').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(50);
    res.json({ scans: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Voice search — accept a transcript (from browser SpeechRecognition) +
// search across courses / lectures / threads. Returns top matches with type.
router.get('/ai/voice-search', authenticateToken, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ results: [] });
    const [{ data: courses }, { data: lectures }, { data: threads }] = await Promise.all([
      supabaseAdmin.from('courses').select('id, title, description').ilike('title', `%${q}%`).limit(10),
      supabaseAdmin.from('course_lectures').select('id, title, course_id').ilike('title', `%${q}%`).limit(10),
      supabaseAdmin.from('forum_threads').select('id, title, course_id').ilike('title', `%${q}%`).limit(10)
    ]);
    const results = [
      ...(courses || []).map(r => ({ type: 'course', id: r.id, title: r.title })),
      ...(lectures || []).map(r => ({ type: 'lecture', id: r.id, title: r.title, course_id: r.course_id })),
      ...(threads || []).map(r => ({ type: 'thread', id: r.id, title: r.title, course_id: r.course_id }))
    ];
    res.json({ results, query: q });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
