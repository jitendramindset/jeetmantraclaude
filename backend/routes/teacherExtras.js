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
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ── TIMETABLE: live + assignments + tests in [from, to] for caller's courses
router.get('/timetable', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date();
    const to = req.query.to ? new Date(req.query.to) : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { data: courses } = await supabaseAdmin.from('courses').select('id, title').eq('teacher_id', req.user.id);
    const courseIds = (courses || []).map(c => c.id);
    if (!courseIds.length) return res.json({ events: [] });
    const courseTitleById = Object.fromEntries((courses || []).map(c => [c.id, c.title]));
    const [live, assignments, tests] = await Promise.all([
      supabaseAdmin.from('live_classes')
        .select('id, title, scheduled_time, duration, status, course_id')
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
      status: l.status, course_id: l.course_id, course_title: courseTitleById[l.course_id]
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
    const { courseId, title, description, startTime, duration, meetingLink, daysOfWeek, weeks } = req.body;
    if (!courseId || !startTime || !Array.isArray(daysOfWeek) || !daysOfWeek.length || !weeks)
      return res.status(400).json({ error: 'courseId, startTime, daysOfWeek[], weeks required' });
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
          meeting_link: meetingLink || null,
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

module.exports = router;
