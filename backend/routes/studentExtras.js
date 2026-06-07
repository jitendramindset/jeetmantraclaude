/**
 * studentExtras.js — student-facing extras:
 *   - notes      (per course / per lecture)
 *   - sessions   (time tracking)
 *   - progress   (computed from enrollments + attendance)
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ── NOTES ──────────────────────────────────────────────────────────────
router.get('/notes', authenticateToken, async (req, res) => {
  const { courseId } = req.query;
  let q = supabaseAdmin.from('student_notes').select('*').eq('student_id', req.user.id).order('updated_at', { ascending: false });
  if (courseId) q = q.eq('course_id', courseId);
  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ notes: data || [] });
});

router.post('/notes', authenticateToken, async (req, res) => {
  const { courseId, lectureId, title, content } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  const { data, error } = await supabaseAdmin.from('student_notes').insert({
    id: uuidv4(),
    student_id: req.user.id,
    course_id: courseId || null,
    lecture_id: lectureId || null,
    title: title || 'Untitled note',
    content
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ note: data });
});

router.put('/notes/:id', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const { data, error } = await supabaseAdmin.from('student_notes').update({
    title, content, updated_at: new Date().toISOString()
  }).eq('id', req.params.id).eq('student_id', req.user.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ note: data });
});

router.delete('/notes/:id', authenticateToken, async (req, res) => {
  const { error } = await supabaseAdmin.from('student_notes').delete().eq('id', req.params.id).eq('student_id', req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Note removed' });
});

// ── SESSIONS (time tracking) ───────────────────────────────────────────
// Client pings /sessions/start when the dashboard opens, /sessions/end on
// unload. Optionally tag a session with course_id when inside a lecture.
router.post('/sessions/start', authenticateToken, async (req, res) => {
  const { context, courseId } = req.body;
  const { data, error } = await supabaseAdmin.from('user_sessions').insert({
    id: uuidv4(),
    user_id: req.user.id,
    context: context || 'dashboard',
    course_id: courseId || null
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  // touch last_active
  await supabaseAdmin.from('jeetmantra_users').update({ last_active: new Date().toISOString() }).eq('id', req.user.id);
  res.json({ session: data });
});

router.post('/sessions/end', authenticateToken, async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  const { data: existing } = await supabaseAdmin.from('user_sessions').select('started_at').eq('id', sessionId).single();
  if (!existing) return res.status(404).json({ error: 'session not found' });
  // Postgres `TIMESTAMP` (no TZ) comes back as a naive ISO string like
  // "2026-06-08T07:30:00". JS interprets that as LOCAL time, which on an
  // IST host inflates durations by 5h30m. Force UTC parsing.
  const startedAt = parseUtc(existing.started_at);
  const duration = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const { data, error } = await supabaseAdmin.from('user_sessions').update({
    ended_at: new Date().toISOString(),
    duration_seconds: duration
  }).eq('id', sessionId).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ session: data, durationSeconds: duration });
});

function parseUtc(s) {
  if (!s) return Date.now();
  // Already has TZ designator?
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s).getTime();
  return new Date(s + 'Z').getTime();
}

// Total time across all sessions in a window
router.get('/time-summary', authenticateToken, async (req, res) => {
  const { since } = req.query;
  let q = supabaseAdmin.from('user_sessions').select('duration_seconds, context, started_at').eq('user_id', req.user.id);
  if (since) q = q.gte('started_at', since);
  const { data } = await q;
  const total = (data || []).reduce((s, r) => s + (r.duration_seconds || 0), 0);
  res.json({
    totalSeconds: total,
    sessions: (data || []).length,
    formatted: formatDuration(total)
  });
});

function formatDuration(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

// ── PROGRESS (per course) ──────────────────────────────────────────────
router.get('/progress', authenticateToken, async (req, res) => {
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments').select('*, courses(id,title,category)').eq('student_id', req.user.id);
  const rows = await Promise.all((enrollments || []).map(async (e) => {
    const [lectures, attendance] = await Promise.all([
      supabaseAdmin.from('course_lectures').select('id', { count: 'exact', head: true }).eq('course_id', e.course_id),
      supabaseAdmin.from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', req.user.id).eq('course_id', e.course_id).eq('status', 'present')
    ]);
    const total = lectures.count || 0;
    const present = attendance.count || 0;
    const pct = total ? Math.round((present / total) * 100) : (e.progress_percentage || 0);
    return {
      enrollment_id: e.id,
      course: e.courses,
      progress_percentage: pct,
      total_lectures: total,
      attended: present
    };
  }));
  res.json({ progress: rows });
});

// GET /api/student/test-history — every test the student has taken
router.get('/test-history', authenticateToken, async (req, res) => {
  try {
    const { data: subs } = await supabaseAdmin.from('test_submissions').select('*').eq('student_id', req.user.id).order('submitted_at', { ascending: false });
    const testIds = (subs || []).map(s => s.test_id);
    let tests = [];
    if (testIds.length) {
      const { data } = await supabaseAdmin.from('course_tests').select('id, title, total_marks, course_id, courses(title)').in('id', testIds);
      tests = data || [];
    }
    const byId = Object.fromEntries(tests.map(t => [t.id, t]));
    res.json({
      history: (subs || []).map(s => ({
        ...s,
        test: byId[s.test_id] || null,
        percentage: byId[s.test_id]?.total_marks ? Math.round((s.score / byId[s.test_id].total_marks) * 100) : null
      }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/student/submission-history — every assignment the student submitted
router.get('/submission-history', authenticateToken, async (req, res) => {
  try {
    const { data: subs } = await supabaseAdmin.from('assignments').select('*, courses(title)').eq('student_id', req.user.id).order('updated_at', { ascending: false });
    res.json({ submissions: subs || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
