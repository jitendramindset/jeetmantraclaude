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
