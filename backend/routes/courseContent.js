/**
 * courseContent.js — endpoints for rich course content:
 *   - topics            (chapters/units)
 *   - lectures          (recorded videos / scheduled sessions)
 *   - materials         (files, images, pdfs, links, notes)
 *   - tests             (quizzes / exams)
 *   - test_submissions
 *   - cover image upload
 *
 * All write endpoints require an authenticated user. Most require that the
 * caller owns the course (course.teacher_id === req.user.id) or is an admin.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads', 'courses');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
  }),
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

// Check that the caller can edit this course. Returns the course or null.
async function ownsCourse(courseId, user) {
  const { data: course } = await supabaseAdmin
    .from('courses').select('id, teacher_id').eq('id', courseId).single();
  if (!course) return { course: null, allowed: false };
  const allowed = user.role === 'admin' || course.teacher_id === user.id;
  return { course, allowed };
}

// Look up a content row by id, then check ownership of its course.
// Used by every PUT/DELETE on a single resource so non-owners can't mutate.
async function ownsContentItem(table, id, user) {
  const { data: row } = await supabaseAdmin.from(table).select('id, course_id').eq('id', id).single();
  if (!row) return { row: null, allowed: false };
  const { allowed, course } = await ownsCourse(row.course_id, user);
  return { row, allowed, course };
}

// ── COVER IMAGE UPLOAD ─────────────────────────────────────────────────
// POST /api/course-content/:courseId/cover — multipart with field "cover"
router.post('/:courseId/cover', authenticateToken, upload.single('cover'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { allowed } = await ownsCourse(courseId, req.user);
    if (!allowed) return res.status(403).json({ error: 'Not your course' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/courses/${req.file.filename}`;
    const { data, error } = await supabaseAdmin
      .from('courses').update({ cover_image: url }).eq('id', courseId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Cover uploaded', cover: url, course: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── TOPICS ─────────────────────────────────────────────────────────────
router.get('/:courseId/topics', authenticateToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('course_topics').select('*').eq('course_id', req.params.courseId).order('order_index');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ topics: data || [] });
});

router.post('/:courseId/topics', authenticateToken, async (req, res) => {
  const { allowed } = await ownsCourse(req.params.courseId, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, order_index } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const { data, error } = await supabaseAdmin.from('course_topics').insert({
    id: uuidv4(), course_id: req.params.courseId, title, description: description || '', order_index: order_index || 0
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ topic: data });
});

// PUT /api/course-content/topics/:id — edit title/description/order
router.put('/topics/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_topics', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, orderIndex } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (orderIndex !== undefined) updates.order_index = orderIndex;
  const { data, error } = await supabaseAdmin.from('course_topics').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ topic: data });
});

router.delete('/topics/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_topics', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { error } = await supabaseAdmin.from('course_topics').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Topic removed' });
});

// ── LECTURES ───────────────────────────────────────────────────────────
router.get('/:courseId/lectures', authenticateToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('course_lectures').select('*').eq('course_id', req.params.courseId).order('order_index');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ lectures: data || [] });
});

router.post('/:courseId/lectures', authenticateToken, upload.single('video'), async (req, res) => {
  const { allowed } = await ownsCourse(req.params.courseId, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { topicId, title, description, duration, isRecorded, lectureDate, orderIndex } = req.body;
  let videoUrl = req.body.videoUrl;
  if (req.file) videoUrl = `/uploads/courses/${req.file.filename}`;
  if (!title) return res.status(400).json({ error: 'title required' });
  const { data, error } = await supabaseAdmin.from('course_lectures').insert({
    id: uuidv4(),
    course_id: req.params.courseId,
    topic_id: topicId || null,
    title,
    description: description || '',
    video_url: videoUrl || null,
    duration: duration ? Number(duration) : null,
    is_recorded: isRecorded !== false && isRecorded !== 'false',
    lecture_date: lectureDate || null,
    order_index: orderIndex ? Number(orderIndex) : 0
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ lecture: data });
});

router.put('/lectures/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_lectures', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, videoUrl, duration, isRecorded, lectureDate, orderIndex, topicId } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (videoUrl !== undefined) updates.video_url = videoUrl;
  if (duration !== undefined) updates.duration = Number(duration);
  if (isRecorded !== undefined) updates.is_recorded = isRecorded === true || isRecorded === 'true';
  if (lectureDate !== undefined) updates.lecture_date = lectureDate;
  if (orderIndex !== undefined) updates.order_index = Number(orderIndex);
  if (topicId !== undefined) updates.topic_id = topicId || null;
  const { data, error } = await supabaseAdmin.from('course_lectures').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ lecture: data });
});

router.delete('/lectures/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_lectures', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { error } = await supabaseAdmin.from('course_lectures').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Lecture removed' });
});

// ── MATERIALS (files / links / images) ─────────────────────────────────
router.get('/:courseId/materials', authenticateToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('course_materials').select('*').eq('course_id', req.params.courseId).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ materials: data || [] });
});

router.post('/:courseId/materials', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { allowed } = await ownsCourse(req.params.courseId, req.user);
    if (!allowed) return res.status(403).json({ error: 'Not your course' });
    const { title, type, url, topicId } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    let finalUrl = url || null;
    let fileSize = null;
    if (req.file) {
      finalUrl = `/uploads/courses/${req.file.filename}`;
      fileSize = req.file.size;
    }
    const { data, error } = await supabaseAdmin.from('course_materials').insert({
      id: uuidv4(),
      course_id: req.params.courseId,
      topic_id: topicId || null,
      title,
      type: type || 'file',
      url: finalUrl,
      file_size: fileSize
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ material: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/materials/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_materials', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, type, url, topicId } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (type !== undefined) updates.type = type;
  if (url !== undefined) updates.url = url;
  if (topicId !== undefined) updates.topic_id = topicId || null;
  const { data, error } = await supabaseAdmin.from('course_materials').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ material: data });
});

router.delete('/materials/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_materials', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { error } = await supabaseAdmin.from('course_materials').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Material removed' });
});

// ── TESTS ──────────────────────────────────────────────────────────────
router.get('/:courseId/tests', authenticateToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('course_tests').select('*').eq('course_id', req.params.courseId).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ tests: data || [] });
});

router.post('/:courseId/tests', authenticateToken, async (req, res) => {
  const { allowed } = await ownsCourse(req.params.courseId, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, totalMarks, durationMinutes, scheduledFor, topicId } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const { data, error } = await supabaseAdmin.from('course_tests').insert({
    id: uuidv4(),
    course_id: req.params.courseId,
    topic_id: topicId || null,
    title,
    description: description || '',
    total_marks: totalMarks || 100,
    duration_minutes: durationMinutes || 60,
    scheduled_for: scheduledFor || null
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ test: data });
});

router.put('/tests/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_tests', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, totalMarks, durationMinutes, scheduledFor, topicId } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (totalMarks !== undefined) updates.total_marks = Number(totalMarks);
  if (durationMinutes !== undefined) updates.duration_minutes = Number(durationMinutes);
  if (scheduledFor !== undefined) updates.scheduled_for = scheduledFor || null;
  if (topicId !== undefined) updates.topic_id = topicId || null;
  const { data, error } = await supabaseAdmin.from('course_tests').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ test: data });
});

router.delete('/tests/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_tests', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { error } = await supabaseAdmin.from('course_tests').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Test removed' });
});

// ── QUESTIONS — the actual items inside a test ──────────────────────────
// GET /api/course-content/tests/:testId/questions
router.get('/tests/:testId/questions', authenticateToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('course_questions').select('*').eq('test_id', req.params.testId).order('order_index');
  if (error) return res.status(400).json({ error: error.message });
  // For students viewing during a test, strip correct_answer + explanation.
  // Teachers + admin see full row.
  if (req.user.role === 'student') {
    return res.json({ questions: (data || []).map(q => ({ ...q, correct_answer: null, explanation: null })) });
  }
  res.json({ questions: data || [] });
});

// POST /api/course-content/tests/:testId/questions
router.post('/tests/:testId/questions', authenticateToken, async (req, res) => {
  // Verify ownership via the test's course
  const { data: test } = await supabaseAdmin.from('course_tests').select('course_id').eq('id', req.params.testId).single();
  if (!test) return res.status(404).json({ error: 'Test not found' });
  const { allowed } = await ownsCourse(test.course_id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { type, questionText, options, correctAnswer, marks, difficulty, explanation, orderIndex } = req.body;
  if (!questionText) return res.status(400).json({ error: 'questionText required' });
  // MCQ must carry at least 2 options — otherwise students will see an empty
  // radio group / fall through to a free-text box that can never auto-grade.
  if ((type || 'mcq') === 'mcq' && (!Array.isArray(options) || options.length < 2)) {
    return res.status(400).json({ error: 'MCQ questions require at least 2 options' });
  }
  const { data, error } = await supabaseAdmin.from('course_questions').insert({
    id: uuidv4(),
    test_id: req.params.testId,
    type: type || 'mcq',
    question_text: questionText,
    options: options || null,
    correct_answer: correctAnswer || null,
    marks: Number(marks) || 1,
    difficulty: difficulty || 'medium',
    explanation: explanation || null,
    order_index: Number(orderIndex) || 0
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ question: data });
});

// PUT /api/course-content/questions/:id — edit
router.put('/questions/:id', authenticateToken, async (req, res) => {
  const { data: row } = await supabaseAdmin.from('course_questions').select('id, test_id').eq('id', req.params.id).single();
  if (!row) return res.status(404).json({ error: 'Question not found' });
  const { data: test } = await supabaseAdmin.from('course_tests').select('course_id').eq('id', row.test_id).single();
  const { allowed } = await ownsCourse(test.course_id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { questionText, options, correctAnswer, marks, difficulty, explanation, orderIndex, type } = req.body;
  const updates = {};
  if (type !== undefined) updates.type = type;
  if (questionText !== undefined) updates.question_text = questionText;
  if (options !== undefined) updates.options = options;
  if (correctAnswer !== undefined) updates.correct_answer = correctAnswer;
  if (marks !== undefined) updates.marks = Number(marks);
  if (difficulty !== undefined) updates.difficulty = difficulty;
  if (explanation !== undefined) updates.explanation = explanation;
  if (orderIndex !== undefined) updates.order_index = Number(orderIndex);
  const { data, error } = await supabaseAdmin.from('course_questions').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ question: data });
});

// DELETE /api/course-content/questions/:id
router.delete('/questions/:id', authenticateToken, async (req, res) => {
  const { data: row } = await supabaseAdmin.from('course_questions').select('id, test_id').eq('id', req.params.id).single();
  if (!row) return res.status(404).json({ error: 'Question not found' });
  const { data: test } = await supabaseAdmin.from('course_tests').select('course_id').eq('id', row.test_id).single();
  const { allowed } = await ownsCourse(test.course_id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { error } = await supabaseAdmin.from('course_questions').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Question removed' });
});

// ── TEST SESSIONS — student starts → submits a test ──────────────────────
// POST /api/course-content/tests/:testId/session/start
router.post('/tests/:testId/session/start', authenticateToken, async (req, res) => {
  // Re-use any in_progress session for this student
  const { data: existing } = await supabaseAdmin.from('test_sessions')
    .select('*').eq('test_id', req.params.testId).eq('student_id', req.user.id).eq('status', 'in_progress').maybeSingle();
  if (existing) return res.json({ session: existing, resumed: true });
  const { data, error } = await supabaseAdmin.from('test_sessions').insert({
    id: uuidv4(),
    test_id: req.params.testId,
    student_id: req.user.id,
    answers: {},
    status: 'in_progress'
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ session: data, resumed: false });
});

// POST /api/course-content/sessions/:id/submit
router.post('/sessions/:id/submit', authenticateToken, async (req, res) => {
  const { answers } = req.body;
  const { data: session } = await supabaseAdmin.from('test_sessions').select('*').eq('id', req.params.id).single();
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.student_id !== req.user.id) return res.status(403).json({ error: 'Not your session' });
  if (session.status !== 'in_progress') return res.status(400).json({ error: 'Session already submitted' });
  // Auto-grade MCQ + true_false (and exact-match short answers).
  const [{ data: questions }, { data: testRow }] = await Promise.all([
    supabaseAdmin.from('course_questions').select('*').eq('test_id', session.test_id),
    supabaseAdmin.from('course_tests').select('total_marks').eq('id', session.test_id).single()
  ]);
  let score = 0, totalFromQuestions = 0;
  (questions || []).forEach(q => {
    totalFromQuestions += q.marks || 1;
    const a = answers?.[q.id];
    if (a && q.correct_answer && String(a).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase()) {
      score += q.marks || 1;
    }
  });
  // Prefer the test's authoritative total_marks; fall back to summing question
  // marks if the test row is missing or out of sync.
  const totalMarks = testRow?.total_marks || totalFromQuestions;
  const { data: updated, error } = await supabaseAdmin.from('test_sessions').update({
    answers: answers || {},
    score,
    submitted_at: new Date().toISOString(),
    status: 'submitted'
  }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  // Mirror to test_submissions (legacy summary read by /api/student/test-history).
  // The table has UNIQUE(test_id, student_id), so retakes must UPDATE — not
  // INSERT — otherwise old scores are returned forever.
  const { data: existingSub } = await supabaseAdmin.from('test_submissions')
    .select('id').eq('test_id', session.test_id).eq('student_id', req.user.id).maybeSingle();
  if (existingSub) {
    await supabaseAdmin.from('test_submissions').update({
      score, status: 'submitted', submitted_at: new Date().toISOString()
    }).eq('id', existingSub.id);
  } else {
    await supabaseAdmin.from('test_submissions').insert({
      id: uuidv4(), test_id: session.test_id, student_id: req.user.id, score, status: 'submitted'
    });
  }
  res.json({ session: updated, scoreEarned: score, totalMarks });
});

router.post('/tests/:testId/submit', authenticateToken, async (req, res) => {
  const { score } = req.body;
  const { data, error } = await supabaseAdmin.from('test_submissions').insert({
    id: uuidv4(),
    test_id: req.params.testId,
    student_id: req.user.id,
    score: score || null,
    status: 'submitted'
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ submission: data });
});

// ── PUBLIC PREVIEW (no auth) — used by marketplace browsers. Returns title,
// description, cover, topics list, and content COUNTS only. Lecture URLs,
// material URLs etc. are stripped so unenrolled users can't access the goods.
router.get('/:courseId/preview', async (req, res) => {
  const courseId = req.params.courseId;
  const [course, topics, lecturesCount, materialsCount, testsCount] = await Promise.all([
    supabaseAdmin.from('courses').select('id,title,description,category,level,price,cover_image').eq('id', courseId).single().then(r => r.data),
    supabaseAdmin.from('course_topics').select('id,title,description,order_index').eq('course_id', courseId).order('order_index').then(r => r.data || []),
    supabaseAdmin.from('course_lectures').select('id', { count: 'exact', head: true }).eq('course_id', courseId).then(r => r.count || 0),
    supabaseAdmin.from('course_materials').select('id', { count: 'exact', head: true }).eq('course_id', courseId).then(r => r.count || 0),
    supabaseAdmin.from('course_tests').select('id', { count: 'exact', head: true }).eq('course_id', courseId).then(r => r.count || 0)
  ]);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({
    course,
    topics,
    lectures: Array.from({ length: lecturesCount }).map(() => ({})),  // placeholder array so .length works on the client
    materials: Array.from({ length: materialsCount }).map(() => ({})),
    tests: Array.from({ length: testsCount }).map(() => ({}))
  });
});

// ── COURSE DETAIL (all content in one shot — used by Configure modal) ──
router.get('/:courseId/full', authenticateToken, async (req, res) => {
  const courseId = req.params.courseId;
  const [course, topics, lectures, materials, tests] = await Promise.all([
    supabaseAdmin.from('courses').select('*').eq('id', courseId).single().then(r => r.data),
    supabaseAdmin.from('course_topics').select('*').eq('course_id', courseId).order('order_index').then(r => r.data || []),
    supabaseAdmin.from('course_lectures').select('*').eq('course_id', courseId).order('order_index').then(r => r.data || []),
    supabaseAdmin.from('course_materials').select('*').eq('course_id', courseId).order('created_at', { ascending: false }).then(r => r.data || []),
    supabaseAdmin.from('course_tests').select('*').eq('course_id', courseId).order('created_at', { ascending: false }).then(r => r.data || [])
  ]);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ course, topics, lectures, materials, tests });
});

module.exports = router;
