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

// ── CONTINUE LEARNING — what the student should pick up next.
// Returns the lecture immediately after their last-completed one in each
// enrolled course (or the first lecture if nothing completed yet).
router.get('/continue-learning', authenticateToken, async (req, res) => {
  try {
    const { data: enrollments } = await supabaseAdmin.from('enrollments')
      .select('course_id, progress').eq('student_id', req.user.id);
    const courseIds = (enrollments || []).map(e => e.course_id);
    if (!courseIds.length) return res.json({ items: [] });
    const [{ data: courses }, { data: allLectures }, { data: done }] = await Promise.all([
      supabaseAdmin.from('courses').select('id, title, cover_image').in('id', courseIds),
      supabaseAdmin.from('course_lectures').select('*').in('course_id', courseIds).order('order_index'),
      supabaseAdmin.from('lecture_progress').select('lecture_id, course_id').eq('student_id', req.user.id)
    ]);
    const doneSet = new Set((done || []).map(d => d.lecture_id));
    const courseById = Object.fromEntries((courses || []).map(c => [c.id, c]));
    const lecturesByCourse = {};
    (allLectures || []).forEach(l => { (lecturesByCourse[l.course_id] = lecturesByCourse[l.course_id] || []).push(l); });
    const items = courseIds.map(cid => {
      const lectures = lecturesByCourse[cid] || [];
      const next = lectures.find(l => !doneSet.has(l.id));
      if (!next) return null;
      const enr = enrollments.find(e => e.course_id === cid);
      return {
        course_id: cid,
        course_title: courseById[cid]?.title || 'Course',
        cover_image: courseById[cid]?.cover_image || null,
        next_lecture_id: next.id, next_lecture_title: next.title,
        next_lecture_duration: next.duration || null,
        progress: enr?.progress || 0,
        completed: lectures.filter(l => doneSet.has(l.id)).length,
        total: lectures.length
      };
    }).filter(Boolean);
    res.json({ items });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ATTENDANCE REPORT CARD — per-course attendance % + present/absent/late
// breakdown for the logged-in student (or any student if teacher passes ?studentId).
router.get('/attendance-report', authenticateToken, async (req, res) => {
  try {
    const studentId = (req.user.role !== 'student' && req.query.studentId) ? req.query.studentId : req.user.id;
    const { data: rows } = await supabaseAdmin.from('attendance').select('*').eq('student_id', studentId);
    // Group by course.
    const byCourse = {};
    (rows || []).forEach(r => {
      const c = byCourse[r.course_id] || { course_id: r.course_id, total: 0, present: 0, absent: 0, late: 0 };
      c.total++; if (r.status === 'present') c.present++; else if (r.status === 'absent') c.absent++; else if (r.status === 'late') c.late++;
      byCourse[r.course_id] = c;
    });
    const courseIds = Object.keys(byCourse);
    let titleMap = {};
    if (courseIds.length) {
      const { data: courses } = await supabaseAdmin.from('courses').select('id, title').in('id', courseIds);
      titleMap = Object.fromEntries((courses || []).map(c => [c.id, c.title]));
    }
    const report = Object.values(byCourse).map(c => ({
      ...c, course_title: titleMap[c.course_id] || 'Course',
      percentage: c.total ? Math.round(100 * c.present / c.total) : 0
    }));
    const grandTotal = report.reduce((a, c) => a + c.total, 0);
    const grandPresent = report.reduce((a, c) => a + c.present, 0);
    res.json({ report, overall: { total: grandTotal, present: grandPresent, percentage: grandTotal ? Math.round(100 * grandPresent / grandTotal) : 0 } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PER-LECTURE NOTE — student saves a private note tied to a lecture.
// (Reuses the existing notes table with a lecture_id reference.)
router.put('/lectures/:lectureId/note', authenticateToken, async (req, res) => {
  try {
    const { note } = req.body || {};
    // Store on lecture_progress.note? Simpler: a dedicated student note row.
    const { data: existing } = await supabaseAdmin.from('student_notes')
      .select('id').eq('student_id', req.user.id).eq('lecture_id', req.params.lectureId).maybeSingle();
    if (existing) {
      await supabaseAdmin.from('student_notes').update({ content: note, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('student_notes').insert({
        id: require('uuid').v4(), student_id: req.user.id, lecture_id: req.params.lectureId,
        title: 'Lecture note', content: note, created_at: new Date().toISOString()
      });
    }
    res.json({ message: 'Note saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── LESSON PROGRESS — student marks a lecture complete; we recompute the
// course's progress % into enrollments.progress so the dashboard / reader
// reflect it immediately and the certificate gate (≥80%) works.
router.post('/progress/lecture', authenticateToken, async (req, res) => {
  try {
    const { courseId, lectureId } = req.body || {};
    if (!courseId || !lectureId) return res.status(400).json({ error: 'courseId + lectureId required' });
    // Idempotent: upsert by (student, lecture) so re-marking is a no-op.
    const { data: existing } = await supabaseAdmin.from('lecture_progress')
      .select('id').eq('student_id', req.user.id).eq('lecture_id', lectureId).maybeSingle();
    if (!existing) {
      await supabaseAdmin.from('lecture_progress').insert({
        id: require('uuid').v4(), student_id: req.user.id, course_id: courseId,
        lecture_id: lectureId, completed: true
      });
    }
    // Recompute %: done / total lectures in this course.
    const [{ count: total }, { count: done }] = await Promise.all([
      supabaseAdmin.from('course_lectures').select('id', { count: 'exact', head: true }).eq('course_id', courseId),
      supabaseAdmin.from('lecture_progress').select('id', { count: 'exact', head: true }).eq('course_id', courseId).eq('student_id', req.user.id)
    ]);
    const pct = total ? Math.round(100 * done / total) : 0;
    await supabaseAdmin.from('enrollments').update({ progress: pct })
      .eq('student_id', req.user.id).eq('course_id', courseId);
    res.json({ progress: pct, done, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/progress/:courseId', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('lecture_progress')
      .select('lecture_id, completed_at')
      .eq('student_id', req.user.id).eq('course_id', req.params.courseId);
    res.json({ completed: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── WISHLIST: ♡ a course from marketplace. Student-only writes; reads
// return the list with hydrated course info.
const { v4: uuidv4w } = require('uuid');
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const { data: rows } = await supabaseAdmin.from('course_wishlist')
      .select('*').eq('student_id', req.user.id).order('created_at', { ascending: false });
    const ids = (rows || []).map(r => r.course_id);
    if (!ids.length) return res.json({ items: [] });
    const { data: courses } = await supabaseAdmin.from('courses')
      .select('id, title, description, category, level, price, cover_image, teacher_id').in('id', ids);
    const byId = Object.fromEntries((courses || []).map(c => [c.id, c]));
    res.json({ items: (rows || []).map(r => ({ ...r, course: byId[r.course_id] || null })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/wishlist/:courseId', authenticateToken, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('course_wishlist')
      .select('id').eq('student_id', req.user.id).eq('course_id', req.params.courseId).maybeSingle();
    if (existing) return res.json({ message: 'Already on wishlist', id: existing.id });
    const { data, error } = await supabaseAdmin.from('course_wishlist').insert({
      id: uuidv4w(), student_id: req.user.id, course_id: req.params.courseId
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ item: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/wishlist/:courseId', authenticateToken, async (req, res) => {
  try {
    await supabaseAdmin.from('course_wishlist').delete()
      .eq('student_id', req.user.id).eq('course_id', req.params.courseId);
    res.json({ message: 'Removed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── COURSE COMPARISON: GET /api/student/compare?ids=a,b,c — returns up to
// 3 courses with side-by-side stats (price, rating, lecture count, etc.).
router.get('/compare', authenticateToken, async (req, res) => {
  try {
    const ids = String(req.query.ids || '').split(',').filter(Boolean).slice(0, 3);
    if (ids.length < 2) return res.status(400).json({ error: 'pass 2-3 course ids in ?ids=a,b,c' });
    const { data: courses } = await supabaseAdmin.from('courses')
      .select('*').in('id', ids);
    const out = await Promise.all((courses || []).map(async c => {
      const [{ count: lectures }, { count: tests }, { count: reviews }, { data: revs }] = await Promise.all([
        supabaseAdmin.from('course_lectures').select('id', { count: 'exact', head: true }).eq('course_id', c.id),
        supabaseAdmin.from('course_tests').select('id', { count: 'exact', head: true }).eq('course_id', c.id),
        supabaseAdmin.from('course_reviews').select('id', { count: 'exact', head: true }).eq('course_id', c.id),
        supabaseAdmin.from('course_reviews').select('rating').eq('course_id', c.id)
      ]);
      const avgRating = revs && revs.length ? +(revs.reduce((s, r) => s + r.rating, 0) / revs.length).toFixed(1) : null;
      return { ...c, lectures, tests, reviews, avgRating };
    }));
    res.json({ courses: out });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
