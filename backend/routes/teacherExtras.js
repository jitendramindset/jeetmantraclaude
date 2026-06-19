/**
 * teacherExtras.js — extras for teachers (and other creators) to fully run
 * their classes.
 *
 *   GET    /api/teacher/timetable             — events between `from` and `to`
 *                                                (live classes, assignment due
 *                                                dates, scheduled tests)
 *   POST   /api/teacher/live-classes/recurring — expand a recurrence pattern
 *                                                into N rows in one transaction
 *   POST   /api/teacher/attendance/bulk        — mark a list of students at once
 *   POST   /api/teacher/announcement           — broadcast to a course's chat room
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { CREATOR_ROLES } = require('../config/roles');
const { resolveInstitution } = require('../middleware/resolveInstitution');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ── TIMETABLE: live + assignments + tests in [from, to] for caller's courses
router.get('/timetable', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date();
    const to = req.query.to ? new Date(req.query.to) : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
    // Scope to the active institution when a specific one is selected; 'all' or
    // none → every course the teacher owns.
    const instId = await resolveInstitution(req);
    let coursesQ = supabaseAdmin.from('courses').select('id, title').eq('teacher_id', req.user.id);
    if (instId && instId !== 'all') coursesQ = coursesQ.eq('institution_id', instId);
    const { data: courses } = await coursesQ;
    const courseIds = (courses || []).map(c => c.id);
    if (!courseIds.length) return res.json({ events: [] });
    const courseTitleById = Object.fromEntries((courses || []).map(c => [c.id, c.title]));
    const [live, assignments, tests] = await Promise.all([
      supabaseAdmin.from('live_classes')
        .select('id, title, scheduled_time, duration, status, course_id, is_online, venue')
        .in('course_id', courseIds)
        .gte('scheduled_time', from.toISOString())
        .lte('scheduled_time', to.toISOString()),
      supabaseAdmin.from('assignments')
        .select('id, title, due_date, course_id, student_id')
        .in('course_id', courseIds)
        .gte('due_date', from.toISOString())
        .lte('due_date', to.toISOString())
        .is('student_id', null),
      supabaseAdmin.from('course_tests')
        .select('id, title, scheduled_for, duration_minutes, course_id')
        .in('course_id', courseIds)
        .not('scheduled_for', 'is', null)
        .gte('scheduled_for', from.toISOString())
        .lte('scheduled_for', to.toISOString())
    ]);
    const events = [];
    (live.data || []).forEach(l => events.push({
      type: 'live', id: l.id, title: l.title, start: l.scheduled_time, duration: l.duration || 60,
      status: l.status, course_id: l.course_id, course_title: courseTitleById[l.course_id],
      is_online: l.is_online !== false, venue: l.venue || null
    }));
    (assignments.data || []).forEach(a => events.push({
      type: 'assignment', id: a.id, title: a.title, start: a.due_date, duration: 0,
      course_id: a.course_id, course_title: courseTitleById[a.course_id]
    }));
    (tests.data || []).forEach(t => events.push({
      type: 'test', id: t.id, title: t.title, start: t.scheduled_for, duration: t.duration_minutes || 60,
      course_id: t.course_id, course_title: courseTitleById[t.course_id]
    }));
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    res.json({ events, range: { from: from.toISOString(), to: to.toISOString() } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── RECURRING LIVE CLASS: expand pattern into rows
// Body: { courseId, title, description, startTime, duration, meetingLink,
//         daysOfWeek: [0..6], weeks: integer }
router.post('/live-classes/recurring', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { courseId, title, description, startTime, duration, meetingLink, daysOfWeek, weeks, isOnline, venue } = req.body;
    if (!courseId || !startTime || !Array.isArray(daysOfWeek) || !daysOfWeek.length || !weeks)
      return res.status(400).json({ error: 'courseId, startTime, daysOfWeek[], weeks required' });
    const online = isOnline !== false; // default online
    if (!online && !venue) return res.status(400).json({ error: 'venue required for offline classes' });
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });

    // Walk day-by-day from baseDate for `weeks*7` days, pushing on each
    // day-of-week match. Simpler than offset math, no off-by-one when the
    // base day isn't in daysOfWeek, no duplicate weeks.
    const baseDate = new Date(startTime);
    const dowSet = new Set(daysOfWeek.map(Number));
    const totalDays = weeks * 7;
    const rows = [];
    for (let i = 0; i < totalDays; i++) {
      const target = new Date(baseDate);
      target.setDate(target.getDate() + i);
      if (dowSet.has(target.getDay())) {
        rows.push({
          id: uuidv4(),
          course_id: courseId,
          teacher_id: req.user.id,
          title: title || 'Live Class',
          description: description || '',
          scheduled_time: target.toISOString(),
          duration: duration || 60,
          meeting_link: online ? (meetingLink || null) : null,
          is_online: online,
          venue: online ? null : venue,
          status: 'scheduled',
          created_at: new Date().toISOString()
        });
      }
    }
    const { error } = await supabaseAdmin.from('live_classes').insert(rows);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Recurring class scheduled', created: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ATTENDANCE ROSTER: enrollments hydrated with student name + any existing
// attendance rows for that date — used by the bulk-mark grid UI.
router.get('/attendance/roster/:courseId', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { courseId } = req.params;
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id, title').eq('id', courseId).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('*').eq('course_id', courseId);
    const studentIds = (enrollments || []).map(e => e.student_id);
    let studentMap = {};
    if (studentIds.length) {
      const { data: students } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', studentIds);
      studentMap = Object.fromEntries((students || []).map(s => [s.id, s]));
    }
    // Existing attendance rows for this date (so the grid can pre-select state)
    const { data: existing } = await supabaseAdmin
      .from('attendance').select('*').eq('course_id', courseId).eq('date', date);
    const existingByEnr = Object.fromEntries((existing || []).map(a => [a.enrollment_id, a]));
    const roster = (enrollments || []).map(e => ({
      enrollment_id: e.id,
      student_id: e.student_id,
      student_name: studentMap[e.student_id]?.full_name || e.student_id.slice(0, 8),
      student_email: studentMap[e.student_id]?.email || '',
      status: existingByEnr[e.id]?.status || null,
      attendance_id: existingByEnr[e.id]?.id || null
    }));
    res.json({ course: { id: courseId, title: course.title }, date, roster });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BULK ATTENDANCE (mixed status): mark each student with their own status.
// Body: { courseId, classDate, marks: [{ enrollmentId, status }] }
// Existing rows for the same (enrollment, date) are UPDATED, not duplicated.
router.post('/attendance/bulk-mixed', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { courseId, classDate, marks } = req.body;
    if (!courseId || !classDate || !Array.isArray(marks) || !marks.length)
      return res.status(400).json({ error: 'courseId, classDate, marks[] required' });
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    const enrIds = marks.map(m => m.enrollmentId);
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('*').in('id', enrIds).eq('course_id', courseId);
    const enrById = Object.fromEntries((enrollments || []).map(e => [e.id, e]));
    const { data: existing } = await supabaseAdmin.from('attendance')
      .select('id, enrollment_id').eq('course_id', courseId).eq('date', classDate);
    const existingByEnr = Object.fromEntries((existing || []).map(a => [a.enrollment_id, a.id]));
    let updated = 0, inserted = 0;
    for (const m of marks) {
      const enr = enrById[m.enrollmentId];
      if (!enr) continue;
      const status = ['present', 'absent', 'late'].includes(m.status) ? m.status : 'present';
      const existingId = existingByEnr[m.enrollmentId];
      if (existingId) {
        await supabaseAdmin.from('attendance').update({ status }).eq('id', existingId);
        updated++;
      } else {
        await supabaseAdmin.from('attendance').insert({
          id: uuidv4(),
          enrollment_id: enr.id,
          course_id: courseId,
          student_id: enr.student_id,
          status,
          date: classDate,
          recorded_by: req.user.id,
          created_at: new Date().toISOString()
        });
        inserted++;
      }
    }
    res.status(201).json({ message: 'Attendance saved', updated, inserted });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BOOKINGS (full): bookings for the teacher's courses, hydrated with
// student name + course title — what the dashboard's Bookings page reads.
router.get('/bookings', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: courses } = await supabaseAdmin.from('courses').select('id, title').eq('teacher_id', req.user.id);
    const courseIds = (courses || []).map(c => c.id);
    if (!courseIds.length) return res.json({ bookings: [] });
    const courseById = Object.fromEntries((courses || []).map(c => [c.id, c]));
    const { data: bookings } = await supabaseAdmin.from('bookings').select('*').in('course_id', courseIds).order('created_at', { ascending: false });
    const studentIds = [...new Set((bookings || []).map(b => b.student_id).filter(Boolean))];
    let studentMap = {};
    if (studentIds.length) {
      const { data: students } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email, phone').in('id', studentIds);
      studentMap = Object.fromEntries((students || []).map(s => [s.id, s]));
    }
    const enriched = (bookings || []).map(b => ({
      ...b,
      course_title: courseById[b.course_id]?.title || '—',
      student_name: studentMap[b.student_id]?.full_name || '—',
      student_email: studentMap[b.student_id]?.email || '',
      student_phone: studentMap[b.student_id]?.phone || ''
    }));
    res.json({ bookings: enriched });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PAYMENTS + EARNINGS combined view for teacher.
router.get('/payments', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const [{ data: earnings }, { data: payments }] = await Promise.all([
      supabaseAdmin.from('earnings').select('*').eq('user_id', req.user.id).order('date', { ascending: false }),
      supabaseAdmin.from('payments').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false })
    ]);
    const total = (earnings || []).reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const pending = (payments || []).filter(p => p.status === 'pending').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const paid = (payments || []).filter(p => p.status === 'paid' || p.status === 'completed').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    res.json({
      earnings: earnings || [],
      payments: payments || [],
      summary: { totalEarned: total, pending, paid }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BULK ATTENDANCE: mark every enrollment present (or with override list)
// Body: { courseId, classDate, status?, enrollmentIds? }
router.post('/attendance/bulk', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { courseId, classDate, enrollmentIds, status } = req.body;
    if (!courseId || !classDate) return res.status(400).json({ error: 'courseId and classDate required' });
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    let enrollments;
    if (Array.isArray(enrollmentIds) && enrollmentIds.length) {
      const { data } = await supabaseAdmin.from('enrollments').select('*').in('id', enrollmentIds).eq('course_id', courseId);
      enrollments = data || [];
    } else {
      const { data } = await supabaseAdmin.from('enrollments').select('*').eq('course_id', courseId);
      enrollments = data || [];
    }
    if (!enrollments.length) return res.json({ message: 'No enrollments to mark', created: 0 });
    const rows = enrollments.map(e => ({
      id: uuidv4(),
      enrollment_id: e.id,
      course_id: courseId,
      student_id: e.student_id,
      status: status || 'present',
      date: classDate,
      recorded_by: req.user.id,
      created_at: new Date().toISOString()
    }));
    const { error } = await supabaseAdmin.from('attendance').insert(rows);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Bulk attendance recorded', created: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── TEST ANALYTICS: per-question pass rate + top wrong answer + score
// distribution. Walks every submitted session and tallies which questions
// the cohort got wrong most often.
router.get('/tests/:testId/analytics', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { testId } = req.params;
    // Ownership via course
    const { data: test } = await supabaseAdmin.from('course_tests').select('course_id, title, total_marks').eq('id', testId).single();
    if (!test) return res.status(404).json({ error: 'Test not found' });
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', test.course_id).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });

    const [{ data: questions }, { data: sessions }] = await Promise.all([
      supabaseAdmin.from('course_questions').select('*').eq('test_id', testId).order('order_index'),
      supabaseAdmin.from('test_sessions').select('*').eq('test_id', testId).eq('status', 'submitted')
    ]);
    const totalAttempts = (sessions || []).length;
    const scores = (sessions || []).map(s => Number(s.score) || 0);
    const norm = s => String(s == null ? '' : s).trim().toLowerCase();

    const perQuestion = (questions || []).map(q => {
      let correct = 0, attempted = 0;
      const wrongAnswers = {}; // tally of wrong responses
      (sessions || []).forEach(s => {
        const a = s.answers?.[q.id];
        if (a == null || a === '') return;
        attempted++;
        let isCorrect = false;
        if (q.type === 'long') return; // skipped (manual grading)
        if (q.type === 'fill') {
          const valid = String(q.correct_answer || '').split('|').map(norm).filter(Boolean);
          isCorrect = valid.includes(norm(a));
        } else if (q.type === 'match' && typeof a === 'object') {
          const lefts = q.match_pairs?.left || [];
          const rights = q.match_pairs?.right || [];
          isCorrect = lefts.length > 0 && lefts.every((l, i) => norm(a[l]) === norm(rights[i]));
        } else {
          isCorrect = q.correct_answer != null && norm(a) === norm(q.correct_answer);
        }
        if (isCorrect) correct++;
        else { const key = typeof a === 'object' ? JSON.stringify(a) : String(a).slice(0, 50); wrongAnswers[key] = (wrongAnswers[key] || 0) + 1; }
      });
      const topWrong = Object.entries(wrongAnswers).sort((a, b) => b[1] - a[1])[0];
      return {
        id: q.id, type: q.type, question_text: q.question_text,
        marks: q.marks, difficulty: q.difficulty,
        attempted, correct,
        pass_rate: attempted ? Math.round(100 * correct / attempted) : 0,
        top_wrong_answer: topWrong ? { value: topWrong[0], count: topWrong[1] } : null
      };
    });

    // Score distribution buckets (0-20% / 20-40% / ... / 80-100%)
    const buckets = [0, 0, 0, 0, 0];
    const tm = test.total_marks || 100;
    scores.forEach(s => {
      const pct = (s / tm) * 100;
      const i = Math.min(4, Math.floor(pct / 20));
      buckets[i]++;
    });
    const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    res.json({
      test: { id: testId, title: test.title, total_marks: tm },
      totalAttempts,
      mean_score: Number(mean.toFixed(2)),
      score_distribution: buckets.map((c, i) => ({ range: `${i * 20}-${(i + 1) * 20}%`, count: c })),
      per_question: perQuestion
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── INVOICES / BILLING (CRM-style) ────────────────────────────────────
// Teachers / partners issue invoices to clients (students or external).
router.get('/invoices', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('invoices')
      .select('*').eq('owner_id', req.user.id).order('created_at', { ascending: false });
    const rows = data || [];
    const summary = {
      total: rows.length,
      paid: rows.filter(r => r.status === 'paid').length,
      paidAmount: rows.filter(r => r.status === 'paid').reduce((s, r) => s + (Number(r.total) || 0), 0),
      pending: rows.filter(r => r.status === 'pending' || r.status === 'draft').length,
      pendingAmount: rows.filter(r => r.status === 'pending' || r.status === 'draft').reduce((s, r) => s + (Number(r.total) || 0), 0),
      overdue: rows.filter(r => r.status === 'pending' && r.due_date && new Date(r.due_date) < new Date()).length
    };
    res.json({ invoices: rows, summary });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/invoices', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { clientName, clientEmail, clientId, items, taxPercent, dueDate, notes } = req.body || {};
    if (!clientName) return res.status(400).json({ error: 'clientName required' });
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'at least one line item required' });
    const sanitized = items.map(it => ({
      description: String(it.description || ''),
      qty: Number(it.qty) || 1,
      rate: Number(it.rate) || 0,
      amount: (Number(it.qty) || 1) * (Number(it.rate) || 0)
    }));
    const subtotal = sanitized.reduce((s, it) => s + it.amount, 0);
    const tp = Number(taxPercent) || 0;
    const tax = +(subtotal * tp / 100).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    // Sequential invoice number per owner: count existing + 1, padded.
    const { count } = await supabaseAdmin.from('invoices')
      .select('id', { count: 'exact', head: true }).eq('owner_id', req.user.id);
    const invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + String((count || 0) + 1).padStart(4, '0');
    const { data, error } = await supabaseAdmin.from('invoices').insert({
      id: uuidv4(), owner_id: req.user.id, client_id: clientId || null,
      client_name: clientName, client_email: clientEmail || null,
      invoice_number: invoiceNumber, items: sanitized,
      subtotal, tax_percent: tp, tax_amount: tax, total, amount: total,
      status: 'pending', due_date: dueDate || null, notes: notes || null,
      created_at: new Date().toISOString()
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ invoice: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/invoices/:id', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: row } = await supabaseAdmin.from('invoices').select('owner_id').eq('id', req.params.id).maybeSingle();
    if (!row) return res.status(404).json({ error: 'Invoice not found' });
    if (row.owner_id !== req.user.id) return res.status(403).json({ error: 'Not yours' });
    const { status, paidAt, notes } = req.body || {};
    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (status === 'paid' && !paidAt) updates.paid_at = new Date().toISOString();
    if (paidAt) updates.paid_at = paidAt;
    if (notes !== undefined) updates.notes = notes;
    const { data, error } = await supabaseAdmin.from('invoices').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ invoice: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Printable invoice HTML (browser → Save as PDF).
router.get('/invoices/:id/pdf', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: inv } = await supabaseAdmin.from('invoices').select('*').eq('id', req.params.id).single();
    if (!inv || inv.owner_id !== req.user.id) return res.status(403).send('Not yours');
    const { data: me } = await supabaseAdmin.from('jeetmantra_users').select('full_name, email, phone, street, city, state_region, postal_code, country').eq('id', req.user.id).single();
    const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(inv.invoice_number)}</title>
<style>
@page{size:A4;margin:0}body{margin:0;font-family:'Segoe UI',sans-serif;color:#111;padding:32px;background:#f8f7fc;min-height:100vh}
.sheet{max-width:780px;margin:0 auto;background:#fff;border-radius:12px;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,.06)}
.row{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px}
h1{font-size:32px;letter-spacing:-.02em;color:#7c3aed;margin:0}
.label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#888;font-weight:700;margin-bottom:4px}
table{width:100%;border-collapse:collapse;margin-top:14px}
th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#666;border-bottom:2px solid #e5e3ed;padding:10px 8px}
td{padding:10px 8px;border-bottom:1px solid #f0eff5}
.tot{margin-top:18px;padding:14px;background:#f8f7fc;border-radius:8px;display:grid;gap:6px}
.tot .line{display:flex;justify-content:space-between;font-size:14px}
.tot .grand{font-size:20px;font-weight:800;color:#7c3aed;padding-top:8px;border-top:1px solid #ddd}
.no-print{text-align:center;margin-bottom:14px}
@media print{.no-print{display:none}body{background:#fff;padding:0}.sheet{box-shadow:none;border-radius:0}}
button{padding:8px 18px;border:0;border-radius:6px;background:#7c3aed;color:#fff;cursor:pointer;font-weight:700}
</style></head><body>
<div class="no-print"><button onclick="window.print()">🖨 Print / Save as PDF</button></div>
<div class="sheet">
  <div class="row">
    <div><h1>INVOICE</h1><div class="label" style="margin-top:6px">${esc(inv.invoice_number)}</div></div>
    <div style="text-align:right"><div class="label">From</div><strong>${esc(me?.full_name || '')}</strong><div style="font-size:12px;color:#666">${esc(me?.email || '')}<br>${esc(me?.phone || '')}<br>${esc(me?.street || '')}<br>${esc([me?.city, me?.state_region, me?.postal_code].filter(Boolean).join(', '))}<br>${esc(me?.country || '')}</div></div>
  </div>
  <div class="row">
    <div><div class="label">Billed to</div><strong>${esc(inv.client_name)}</strong><div style="font-size:12px;color:#666">${esc(inv.client_email || '')}</div></div>
    <div style="text-align:right"><div class="label">Issued</div>${new Date(inv.created_at).toLocaleDateString('en-IN')}<br><div class="label" style="margin-top:8px">Due</div>${inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '—'}<br><div class="label" style="margin-top:8px">Status</div><span style="color:${inv.status === 'paid' ? '#10b981' : '#f59e0b'};font-weight:700;text-transform:uppercase">${esc(inv.status)}</span></div>
  </div>
  <table>
    <thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${(inv.items || []).map(it => `<tr><td>${esc(it.description)}</td><td style="text-align:right">${it.qty}</td><td style="text-align:right">${fmt(it.rate)}</td><td style="text-align:right"><strong>${fmt(it.amount)}</strong></td></tr>`).join('')}</tbody>
  </table>
  <div class="tot">
    <div class="line"><span>Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
    <div class="line"><span>GST (${inv.tax_percent || 0}%)</span><span>${fmt(inv.tax_amount)}</span></div>
    <div class="line grand"><span>Total</span><span>${fmt(inv.total)}</span></div>
  </div>
  ${inv.notes ? `<div style="margin-top:18px;font-size:12px;color:#666"><div class="label">Notes</div>${esc(inv.notes)}</div>` : ''}
</div></body></html>`);
  } catch (e) { res.status(500).send('Invoice render failed: ' + e.message); }
});

// ── CALENDAR MONTH: events for a calendar grid (default: current month).
// Returns live classes, assignment due dates and tests in {YYYY-MM-DD: [...]}.
router.get('/calendar', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1); // 1..12
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const { data: courses } = await supabaseAdmin.from('courses').select('id, title').eq('teacher_id', req.user.id);
    const courseIds = (courses || []).map(c => c.id);
    if (!courseIds.length) return res.json({ year, month, days: {} });
    const courseTitleById = Object.fromEntries((courses || []).map(c => [c.id, c.title]));

    const [live, assignments, tests] = await Promise.all([
      supabaseAdmin.from('live_classes')
        .select('id, title, scheduled_time, duration, status, course_id, topic_id')
        .in('course_id', courseIds).gte('scheduled_time', from.toISOString()).lte('scheduled_time', to.toISOString()),
      supabaseAdmin.from('assignments')
        .select('id, title, due_date, course_id, student_id')
        .in('course_id', courseIds).gte('due_date', from.toISOString()).lte('due_date', to.toISOString()).is('student_id', null),
      supabaseAdmin.from('course_tests')
        .select('id, title, scheduled_for, duration_minutes, course_id')
        .not('scheduled_for', 'is', null).in('course_id', courseIds)
        .gte('scheduled_for', from.toISOString()).lte('scheduled_for', to.toISOString())
    ]);

    // Group by YYYY-MM-DD.
    const days = {};
    const put = (dateIso, ev) => { const k = dateIso.slice(0, 10); (days[k] = days[k] || []).push(ev); };
    (live.data || []).forEach(l => put(l.scheduled_time, {
      type: 'live', id: l.id, title: l.title, time: l.scheduled_time, duration: l.duration,
      course_title: courseTitleById[l.course_id], status: l.status
    }));
    (assignments.data || []).forEach(a => put(a.due_date, {
      type: 'assignment', id: a.id, title: a.title, time: a.due_date,
      course_title: courseTitleById[a.course_id]
    }));
    (tests.data || []).forEach(t => put(t.scheduled_for, {
      type: 'test', id: t.id, title: t.title, time: t.scheduled_for, duration: t.duration_minutes,
      course_title: courseTitleById[t.course_id]
    }));
    res.json({ year, month, days });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BOOKING DETAIL + CANCEL/RESCHEDULE/REFUND ─────────────────────────
router.get('/bookings/:id', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: b } = await supabaseAdmin.from('bookings').select('*').eq('id', req.params.id).single();
    if (!b) return res.status(404).json({ error: 'Booking not found' });
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id, title').eq('id', b.course_id).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your booking' });
    const { data: student } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email, phone').eq('id', b.student_id).maybeSingle();
    const { data: payment } = await supabaseAdmin.from('payments').select('*').eq('user_id', b.student_id).eq('course_id', b.course_id).order('created_at', { ascending: false }).maybeSingle();
    res.json({ booking: { ...b, course_title: course.title }, student, payment });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/teacher/bookings/:id — reschedule or change status.
router.put('/bookings/:id', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: b } = await supabaseAdmin.from('bookings').select('course_id').eq('id', req.params.id).single();
    if (!b) return res.status(404).json({ error: 'Booking not found' });
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', b.course_id).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your booking' });
    const { status, scheduledFor, notes } = req.body || {};
    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (scheduledFor !== undefined) updates.scheduled_for = scheduledFor || null;
    if (notes !== undefined) updates.notes = notes;
    const { data, error } = await supabaseAdmin.from('bookings').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ booking: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/teacher/bookings/:id/cancel — cancel + auto-refund tied payment.
router.post('/bookings/:id/cancel', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: b } = await supabaseAdmin.from('bookings').select('*').eq('id', req.params.id).single();
    if (!b) return res.status(404).json({ error: 'Booking not found' });
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', b.course_id).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your booking' });
    await supabaseAdmin.from('bookings').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', req.params.id);
    // Flip any paid payment for this (user, course) to refunded — production
    // would call Razorpay's /payments/:id/refund here too.
    if (b.student_id && b.course_id) {
      await supabaseAdmin.from('payments')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('user_id', b.student_id).eq('course_id', b.course_id).eq('status', 'paid');
    }
    res.json({ message: 'Booking cancelled and payment marked refunded' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── MANUAL ESSAY GRADING: list ungraded long-answer responses for the
// teacher's courses, and POST a score + feedback per (sessionId, questionId).
router.get('/essays/pending', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: courses } = await supabaseAdmin.from('courses').select('id, title').eq('teacher_id', req.user.id);
    const courseIds = (courses || []).map(c => c.id);
    if (!courseIds.length) return res.json({ items: [] });
    // Find all submitted sessions whose tests belong to my courses
    const { data: tests } = await supabaseAdmin.from('course_tests').select('id, title, course_id').in('course_id', courseIds);
    const testMap = Object.fromEntries((tests || []).map(t => [t.id, t]));
    const testIds = (tests || []).map(t => t.id);
    if (!testIds.length) return res.json({ items: [] });
    const { data: sessions } = await supabaseAdmin.from('test_sessions').select('*').in('test_id', testIds).eq('status', 'submitted');
    const { data: questions } = await supabaseAdmin.from('course_questions').select('*').in('test_id', testIds).eq('type', 'long');
    const qMap = Object.fromEntries((questions || []).map(q => [q.id, q]));
    const items = [];
    (sessions || []).forEach(s => {
      const ans = s.answers || {};
      Object.keys(ans).forEach(qId => {
        const q = qMap[qId]; if (!q) return;
        const graded = s.manual_grades?.[qId];
        if (graded != null) return;
        items.push({
          session_id: s.id, question_id: qId, student_id: s.student_id,
          test: testMap[s.test_id], question_text: q.question_text,
          max_marks: q.marks, answer: ans[qId], submitted_at: s.submitted_at
        });
      });
    });
    res.json({ items });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/essays/grade', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { sessionId, questionId, score, feedback } = req.body || {};
    if (!sessionId || !questionId || score == null) return res.status(400).json({ error: 'sessionId, questionId, score required' });
    // Ownership via session → test → course
    const { data: sess } = await supabaseAdmin.from('test_sessions').select('*, course_tests(course_id)').eq('id', sessionId).single();
    if (!sess) return res.status(404).json({ error: 'Session not found' });
    const courseId = sess.course_tests?.course_id;
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });

    const grades = sess.manual_grades || {};
    grades[questionId] = { score: Number(score), feedback: feedback || '', graded_by: req.user.id, at: new Date().toISOString() };
    // Recompute final score: existing score + sum of manual_grades values.
    const sumManual = Object.values(grades).reduce((a, g) => a + (Number(g.score) || 0), 0);
    const newScore = (Number(sess.score) || 0) + Number(score);
    await supabaseAdmin.from('test_sessions').update({
      manual_grades: grades, score: newScore, updated_at: new Date().toISOString()
    }).eq('id', sessionId);
    // Mirror into test_submissions for /test-history display.
    await supabaseAdmin.from('test_submissions').update({ score: newScore }).eq('test_id', sess.test_id).eq('student_id', sess.student_id);
    res.json({ message: 'Graded', totalManual: sumManual, newScore });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CSV EXPORT: attendance | grades | earnings. Tiny no-dep CSV serializer.
function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = v => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return cols.join(',') + '\n' + rows.map(r => cols.map(c => esc(r[c])).join(',')).join('\n');
}
router.get('/export', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const type = req.query.type;
    const { data: courses } = await supabaseAdmin.from('courses').select('id, title').eq('teacher_id', req.user.id);
    const courseIds = (courses || []).map(c => c.id);
    const courseTitleById = Object.fromEntries((courses || []).map(c => [c.id, c.title]));
    let rows = [];
    if (type === 'attendance' && courseIds.length) {
      const { data } = await supabaseAdmin.from('attendance').select('*').in('course_id', courseIds).order('date', { ascending: false });
      const studentIds = [...new Set((data || []).map(a => a.student_id))];
      const { data: students } = studentIds.length
        ? await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', studentIds)
        : { data: [] };
      const sMap = Object.fromEntries((students || []).map(s => [s.id, s]));
      rows = (data || []).map(a => ({
        date: a.date, course: courseTitleById[a.course_id] || '',
        student_name: sMap[a.student_id]?.full_name || '',
        student_email: sMap[a.student_id]?.email || '',
        status: a.status
      }));
    } else if (type === 'grades' && courseIds.length) {
      const { data: subs } = await supabaseAdmin.from('test_submissions').select('*, course_tests(title, course_id)').order('submitted_at', { ascending: false });
      const mine = (subs || []).filter(s => courseIds.includes(s.course_tests?.course_id));
      const studentIds = [...new Set(mine.map(s => s.student_id))];
      const { data: students } = studentIds.length
        ? await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', studentIds)
        : { data: [] };
      const sMap = Object.fromEntries((students || []).map(s => [s.id, s]));
      rows = mine.map(s => ({
        submitted_at: s.submitted_at, test: s.course_tests?.title || '',
        course: courseTitleById[s.course_tests?.course_id] || '',
        student_name: sMap[s.student_id]?.full_name || '',
        student_email: sMap[s.student_id]?.email || '',
        score: s.score, status: s.status
      }));
    } else if (type === 'earnings') {
      const { data } = await supabaseAdmin.from('earnings').select('*').eq('user_id', req.user.id).order('date', { ascending: false });
      rows = (data || []).map(e => ({ date: e.date, source: e.source, amount: e.amount, currency: e.currency || 'INR' }));
    } else {
      return res.status(400).json({ error: 'type must be attendance | grades | earnings' });
    }
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${type}-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(toCsv(rows));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ANNOUNCEMENT: broadcast a message to the course's chat room
// Body: { courseId, message }
router.post('/announcement', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { courseId, message } = req.body;
    if (!courseId || !message) return res.status(400).json({ error: 'courseId and message required' });
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id, title').eq('id', courseId).single();
    if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    // Ensure room exists
    let { data: room } = await supabaseAdmin.from('chat_rooms').select('id').eq('course_id', courseId).eq('type', 'course').maybeSingle();
    if (!room) {
      const r = await supabaseAdmin.from('chat_rooms').insert({
        id: uuidv4(), type: 'course', course_id: courseId, name: course.title
      }).select().single();
      room = r.data;
    }
    // Auto-add caller as member, then post the announcement (prefixed for clarity)
    await supabaseAdmin.from('chat_room_members').insert({
      id: uuidv4(), room_id: room.id, user_id: req.user.id
    }).then(() => {}).catch(() => {});
    const { data: msg, error } = await supabaseAdmin.from('chat_messages').insert({
      id: uuidv4(),
      room_id: room.id,
      sender_id: req.user.id,
      content: '📢 ANNOUNCEMENT: ' + message
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Announcement sent', chatMessage: msg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /teacher/recordings — all saved recordings for teacher's live classes
router.get('/recordings', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: courses } = await supabaseAdmin
      .from('courses').select('id, title').eq('teacher_id', req.user.id);
    const courseIds = (courses || []).map(c => c.id);
    if (!courseIds.length) return res.json({ recordings: [] });
    const { data: classes } = await supabaseAdmin
      .from('live_classes').select('id, title, course_id, scheduled_time, recording_url, recording_duration')
      .in('course_id', courseIds)
      .not('recording_url', 'is', null)
      .order('scheduled_time', { ascending: false });
    const courseTitle = Object.fromEntries((courses || []).map(c => [c.id, c.title]));
    const recordings = (classes || []).map(c => ({
      id: c.id,
      class_title: c.title,
      course_title: courseTitle[c.course_id] || '',
      url: c.recording_url,
      duration: c.recording_duration || null,
      created_at: c.scheduled_time
    }));
    res.json({ recordings });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
