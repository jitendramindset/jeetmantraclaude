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

// Can this user see the FULL content of a course (vs only preview items)?
// True for the course owner/admin and for enrolled students. Used to gate the
// content READ endpoints so paid lectures/materials/tests aren't leaked to any
// logged-in user. Non-viewers still get is_preview items for the course preview.
async function canViewFull(courseId, user) {
  if (!user) return false;
  const { allowed } = await ownsCourse(courseId, user);
  if (allowed) return true;
  const { data } = await supabaseAdmin.from('enrollments')
    .select('id').eq('course_id', courseId).eq('student_id', user.id).maybeSingle();
  return !!data;
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
  const full = await canViewFull(req.params.courseId, req.user);
  res.json({ topics: full ? (data || []) : (data || []).filter(t => t.is_preview) });
});

router.post('/:courseId/topics', authenticateToken, async (req, res) => {
  const { allowed } = await ownsCourse(req.params.courseId, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, order_index, imageUrl, attachmentUrl, linkUrl, notes, isPreview } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const { data, error } = await supabaseAdmin.from('course_topics').insert({
    id: uuidv4(), course_id: req.params.courseId, title,
    description: description || '', order_index: order_index || 0,
    image_url: imageUrl || null, attachment_url: attachmentUrl || null,
    link_url: linkUrl || null, notes: notes || null, is_preview: !!isPreview
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ topic: data });
});

// PUT /api/course-content/topics/:id — edit title/description/order
router.put('/topics/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_topics', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, orderIndex, imageUrl, attachmentUrl, linkUrl, notes, isPreview } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (orderIndex !== undefined) updates.order_index = orderIndex;
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (attachmentUrl !== undefined) updates.attachment_url = attachmentUrl;
  if (linkUrl !== undefined) updates.link_url = linkUrl;
  if (notes !== undefined) updates.notes = notes;
  if (isPreview !== undefined) updates.is_preview = !!isPreview;
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
  const full = await canViewFull(req.params.courseId, req.user);
  res.json({ lectures: full ? (data || []) : (data || []).filter(l => l.is_preview) });
});

router.post('/:courseId/lectures', authenticateToken, upload.single('video'), async (req, res) => {
  const { allowed } = await ownsCourse(req.params.courseId, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { topicId, title, description, duration, isRecorded, lectureDate, orderIndex, isPreview } = req.body;
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
    is_preview: isPreview === true || isPreview === 'true',
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
  // Materials have no preview flag — only owners/enrolled students see them.
  const full = await canViewFull(req.params.courseId, req.user);
  res.json({ materials: full ? (data || []) : [] });
});

router.post('/:courseId/materials', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { allowed } = await ownsCourse(req.params.courseId, req.user);
    if (!allowed) return res.status(403).json({ error: 'Not your course' });
    const { title, type, url, topicId, description } = req.body;
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
      description: description || null,
      type: type || 'file',
      url: finalUrl,
      file_size: fileSize
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    // Best-effort: index the uploaded document for RAG (PDF/text). Async, never
    // blocks the response — embeddings/keyword index build in the background.
    if (req.file) {
      try {
        const rag = require('./rag');
        rag.indexFromMaterial(data).then(r => {
          if (r && r.chunks) console.log(`rag: indexed material ${data.id} -> ${r.chunks} chunks (${r.mode})`);
        }).catch(() => {});
      } catch (e) { /* rag unavailable */ }
    }
    res.status(201).json({ material: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/materials/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_materials', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, type, url, topicId, description } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (type !== undefined) updates.type = type;
  if (url !== undefined) updates.url = url;
  if (topicId !== undefined) updates.topic_id = topicId || null;
  if (description !== undefined) updates.description = description;
  const { data, error } = await supabaseAdmin.from('course_materials').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ material: data });
});

router.delete('/materials/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_materials', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { error } = await supabaseAdmin.from('course_materials').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  // Best-effort: drop any RAG chunks indexed from this material.
  try { await supabaseAdmin.from('rag_chunks').delete().eq('material_id', req.params.id); } catch (e) {}
  res.json({ message: 'Material removed' });
});

// ── TESTS ──────────────────────────────────────────────────────────────
router.get('/:courseId/tests', authenticateToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('course_tests').select('*').eq('course_id', req.params.courseId).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  const full = await canViewFull(req.params.courseId, req.user);
  res.json({ tests: full ? (data || []) : [] });
});

router.post('/:courseId/tests', authenticateToken, async (req, res) => {
  const { allowed } = await ownsCourse(req.params.courseId, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, totalMarks, durationMinutes, scheduledFor, topicId,
          shuffleQuestions, shuffleOptions, negativeMarks, proctored } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const { data, error } = await supabaseAdmin.from('course_tests').insert({
    id: uuidv4(),
    course_id: req.params.courseId,
    topic_id: topicId || null,
    title,
    description: description || '',
    total_marks: totalMarks || 100,
    duration_minutes: durationMinutes || 60,
    scheduled_for: scheduledFor || null,
    shuffle_questions: !!shuffleQuestions,
    shuffle_options: !!shuffleOptions,
    negative_marks: Number(negativeMarks) || 0,
    proctored: !!proctored
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ test: data });
});

router.put('/tests/:id', authenticateToken, async (req, res) => {
  const { allowed } = await ownsContentItem('course_tests', req.params.id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, totalMarks, durationMinutes, scheduledFor, topicId,
          shuffleQuestions, shuffleOptions, negativeMarks, proctored } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (totalMarks !== undefined) updates.total_marks = Number(totalMarks);
  if (durationMinutes !== undefined) updates.duration_minutes = Number(durationMinutes);
  if (scheduledFor !== undefined) updates.scheduled_for = scheduledFor || null;
  if (topicId !== undefined) updates.topic_id = topicId || null;
  if (shuffleQuestions !== undefined) updates.shuffle_questions = !!shuffleQuestions;
  if (shuffleOptions !== undefined) updates.shuffle_options = !!shuffleOptions;
  if (negativeMarks !== undefined) updates.negative_marks = Number(negativeMarks);
  if (proctored !== undefined) updates.proctored = !!proctored;
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
  const [{ data: questions, error }, { data: test }] = await Promise.all([
    supabaseAdmin.from('course_questions').select('*').eq('test_id', req.params.testId).order('order_index'),
    supabaseAdmin.from('course_tests').select('shuffle_questions, shuffle_options, pool_size').eq('id', req.params.testId).single()
  ]);
  if (error) return res.status(400).json({ error: error.message });
  let qs = questions || [];
  if (req.user.role === 'student') {
    // Strip correct answers and (for match/multi) the answer ordering.
    qs = qs.map(q => {
      const clean = { ...q, correct_answer: null, explanation: null };
      if (q.type === 'match' && q.match_pairs) {
        const r = [...(q.match_pairs.right || [])].sort(() => Math.random() - 0.5);
        clean.match_pairs = { left: q.match_pairs.left, right: r };
      }
      // MCQ + multi-select both shuffle their option list when enabled.
      if ((q.type === 'mcq' || q.type === 'multi') && Array.isArray(q.options) && test?.shuffle_options) {
        clean.options = [...q.options].sort(() => Math.random() - 0.5);
      }
      return clean;
    });
    if (test?.shuffle_questions) qs = [...qs].sort(() => Math.random() - 0.5);
    // Question pool: if pool_size set and < total, serve a random subset.
    if (test?.pool_size && test.pool_size > 0 && test.pool_size < qs.length) {
      qs = [...qs].sort(() => Math.random() - 0.5).slice(0, test.pool_size);
    }
  }
  res.json({ questions: qs });
});

// POST /api/course-content/tests/:testId/questions
// Supports type ∈ { mcq, true_false, short, long, fill, match } plus an optional
// section_id, image_url and match_pairs (for type:match).
router.post('/tests/:testId/questions', authenticateToken, async (req, res) => {
  const { data: test } = await supabaseAdmin.from('course_tests').select('course_id').eq('id', req.params.testId).single();
  if (!test) return res.status(404).json({ error: 'Test not found' });
  const { allowed } = await ownsCourse(test.course_id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { type, questionText, options, correctAnswer, marks, difficulty, explanation, orderIndex, sectionId, imageUrl, matchPairs } = req.body;
  if (!questionText) return res.status(400).json({ error: 'questionText required' });
  const t = type || 'mcq';
  if (t === 'mcq' && (!Array.isArray(options) || options.length < 2)) {
    return res.status(400).json({ error: 'MCQ questions require at least 2 options' });
  }
  if (t === 'match' && (!matchPairs || !Array.isArray(matchPairs.left) || !Array.isArray(matchPairs.right) || matchPairs.left.length < 2)) {
    return res.status(400).json({ error: 'Match questions require {left:[], right:[]} arrays with 2+ items' });
  }
  const { data, error } = await supabaseAdmin.from('course_questions').insert({
    id: uuidv4(),
    test_id: req.params.testId,
    type: t,
    question_text: questionText,
    options: options || null,
    correct_answer: correctAnswer || null,
    match_pairs: matchPairs || null,
    image_url: imageUrl || null,
    section_id: sectionId || null,
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
  const { questionText, options, correctAnswer, marks, difficulty, explanation, orderIndex, type, sectionId, imageUrl, matchPairs } = req.body;
  const updates = {};
  if (type !== undefined) updates.type = type;
  if (questionText !== undefined) updates.question_text = questionText;
  if (options !== undefined) updates.options = options;
  if (correctAnswer !== undefined) updates.correct_answer = correctAnswer;
  if (matchPairs !== undefined) updates.match_pairs = matchPairs;
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (sectionId !== undefined) updates.section_id = sectionId;
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
  // Auto-grade all six types: mcq, true_false, short, long, fill, match.
  // Honors course_tests.negative_marks (subtracted on each wrong answer).
  const [{ data: questions }, { data: testRow }] = await Promise.all([
    supabaseAdmin.from('course_questions').select('*').eq('test_id', session.test_id),
    supabaseAdmin.from('course_tests').select('total_marks, negative_marks').eq('id', session.test_id).single()
  ]);
  const neg = Number(testRow?.negative_marks) || 0;
  const norm = s => String(s == null ? '' : s).trim().toLowerCase();
  let score = 0, totalFromQuestions = 0;
  (questions || []).forEach(q => {
    const qMarks = Number(q.marks) || 1;
    totalFromQuestions += qMarks;
    const a = answers?.[q.id];
    if (a == null || a === '') return; // unattempted — no marks, no negative
    let correct = false;
    if (q.type === 'long') {
      // Essay — never auto-graded; teacher grades manually later.
      return;
    } else if (q.type === 'fill') {
      // correct_answer may be a single string or "|"-separated synonyms.
      const valid = String(q.correct_answer || '').split('|').map(norm).filter(Boolean);
      correct = valid.includes(norm(a));
    } else if (q.type === 'multi') {
      // Multi-select: correct_answer is "|"-separated set of right options;
      // student answer is an array (or "|"-joined). Full marks only if the
      // chosen set equals the correct set exactly; partial credit otherwise
      // (correct picks − wrong picks, floored at 0, scaled by marks).
      const correctSet = new Set(String(q.correct_answer || '').split('|').map(norm).filter(Boolean));
      const chosen = Array.isArray(a) ? a.map(norm) : String(a).split('|').map(norm).filter(Boolean);
      const chosenSet = new Set(chosen);
      const hits = [...chosenSet].filter(x => correctSet.has(x)).length;
      const wrong = [...chosenSet].filter(x => !correctSet.has(x)).length;
      if (hits === correctSet.size && wrong === 0) { correct = true; }
      else if (correctSet.size > 0) {
        const partial = Math.max(0, (hits - wrong)) / correctSet.size;
        if (partial > 0) { score += qMarks * partial; return; }
        if (neg > 0) score -= neg;
        return;
      }
    } else if (q.type === 'match') {
      // a is an object { leftItem: studentRight, ... } against q.match_pairs
      // which stores { left:[], right:[] } in matching index order.
      const pairs = q.match_pairs || {};
      const lefts = pairs.left || [];
      const rights = pairs.right || [];
      if (lefts.length && typeof a === 'object') {
        const wrongs = lefts.filter((l, i) => norm(a[l]) !== norm(rights[i])).length;
        if (wrongs === 0) correct = true;
        // Partial credit: full marks if all correct; else fractional.
        if (!correct && lefts.length > 0) {
          score += qMarks * (lefts.length - wrongs) / lefts.length;
          return;
        }
      }
    } else {
      // mcq, true_false, short — exact-match (case-insensitive trim).
      correct = q.correct_answer != null && norm(a) === norm(q.correct_answer);
    }
    if (correct) score += qMarks;
    else if (neg > 0) score -= neg;
  });
  if (score < 0) score = 0;
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
  // Best-effort: surface the submission on the teacher's wall + notify them.
  announceTestSubmission(session.test_id, req.user).catch(() => {});
  res.json({ session: updated, scoreEarned: score, totalMarks });
});

// Log a test submission to the activity wall and notify the course teacher.
// Lazy-requires to avoid circular deps; never throws.
async function announceTestSubmission(testId, student) {
  try {
    const { data: test } = await supabaseAdmin.from('course_tests')
      .select('title, course_id').eq('id', testId).single();
    if (!test) return;
    const { data: course } = await supabaseAdmin.from('courses')
      .select('teacher_id').eq('id', test.course_id).single();
    const studentName = student.full_name || student.email || 'A student';
    const msg = `🧪 ${studentName} submitted test: ${test.title || 'Untitled'}`;
    try {
      const { logEvent } = require('./activity');
      await logEvent({
        eventType: 'test_submitted', actorId: student.id,
        targetUserId: course?.teacher_id || null, courseId: test.course_id || null,
        payload: { testId, title: test.title }, message: msg
      });
    } catch (e) { console.warn('announceTestSubmission logEvent failed:', e.message); }
    if (course?.teacher_id) {
      const eduos = require('./eduos');
      if (typeof eduos.notify === 'function') {
        await eduos.notify({
          userId: course.teacher_id, channel: 'in-app', type: 'submission',
          title: 'New test submission', body: msg,
          link: test.course_id ? `/dashboard.html#course-${test.course_id}` : null
        });
      }
    }
  } catch (e) { console.warn('announceTestSubmission failed:', e.message); }
}

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
  // Group flat content under its topic so the workspace Topics tab and the grid
  // "Explore" tree can show per-chapter rollups. Flat arrays are ALSO returned
  // unchanged so the book reader (which reads full.lectures/materials) still works.
  const nestTopics = (tps) => tps.map(t => ({
    ...t,
    lectures: lectures.filter(l => l.topic_id === t.id),
    materials: materials.filter(m => m.topic_id === t.id),
    tests: tests.filter(x => x.topic_id === t.id)
  }));
  // Gate paid content: non-owner/non-enrolled callers get only preview items
  // (so the course preview still works without leaking the full curriculum).
  const full = await canViewFull(courseId, req.user);
  if (full) return res.json({ course, topics: nestTopics(topics), lectures, materials, tests });
  res.json({
    course,
    topics: topics.filter(t => t.is_preview),
    lectures: lectures.filter(l => l.is_preview),
    materials: [],
    tests: [],
    preview: true
  });
});

// ── TEST SECTIONS: sub-divisions of a test with per-section duration ────
router.get('/tests/:testId/sections', authenticateToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('test_sections').select('*').eq('test_id', req.params.testId).order('order_index');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ sections: data || [] });
});

router.post('/tests/:testId/sections', authenticateToken, async (req, res) => {
  const { data: test } = await supabaseAdmin.from('course_tests').select('course_id').eq('id', req.params.testId).single();
  if (!test) return res.status(404).json({ error: 'Test not found' });
  const { allowed } = await ownsCourse(test.course_id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, durationMinutes, orderIndex } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const { data, error } = await supabaseAdmin.from('test_sections').insert({
    id: uuidv4(), test_id: req.params.testId, title, description: description || null,
    duration_minutes: Number(durationMinutes) || null, order_index: Number(orderIndex) || 0
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ section: data });
});

router.put('/sections/:id', authenticateToken, async (req, res) => {
  const { data: row } = await supabaseAdmin.from('test_sections').select('id, test_id').eq('id', req.params.id).single();
  if (!row) return res.status(404).json({ error: 'Section not found' });
  const { data: test } = await supabaseAdmin.from('course_tests').select('course_id').eq('id', row.test_id).single();
  const { allowed } = await ownsCourse(test.course_id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { title, description, durationMinutes, orderIndex } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (durationMinutes !== undefined) updates.duration_minutes = Number(durationMinutes);
  if (orderIndex !== undefined) updates.order_index = Number(orderIndex);
  const { data, error } = await supabaseAdmin.from('test_sections').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ section: data });
});

router.delete('/sections/:id', authenticateToken, async (req, res) => {
  const { data: row } = await supabaseAdmin.from('test_sections').select('id, test_id').eq('id', req.params.id).single();
  if (!row) return res.status(404).json({ error: 'Section not found' });
  const { data: test } = await supabaseAdmin.from('course_tests').select('course_id').eq('id', row.test_id).single();
  const { allowed } = await ownsCourse(test.course_id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  await supabaseAdmin.from('test_sections').delete().eq('id', req.params.id);
  res.json({ message: 'Section removed' });
});

// ── QUESTION IMAGE UPLOAD: multipart, stores under uploads/courses/qimg-*.
const qimgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'qimg-' + Date.now() + '-' + file.originalname.replace(/[^\w.-]/g, '_'))
});
const qimgUpload = multer({ storage: qimgStorage, limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/questions/upload-image', authenticateToken, qimgUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image file required' });
  res.json({ url: '/uploads/courses/' + req.file.filename });
});

// ── Generic media upload (topic image, topic attachment, profile photo, etc.).
// Returns a URL the caller can store on any row. 20 MB cap.
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'media-' + Date.now() + '-' + file.originalname.replace(/[^\w.-]/g, '_'))
});
const mediaUpload = multer({ storage: mediaStorage, limits: { fileSize: 20 * 1024 * 1024 } });
router.post('/upload', authenticateToken, mediaUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  res.json({ url: '/uploads/courses/' + req.file.filename, name: req.file.originalname, size: req.file.size });
});

// ── QUESTION BANK: reusable questions belonging to the teacher.
router.get('/question-bank', authenticateToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('question_bank').select('*').eq('owner_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ items: data || [] });
});

router.post('/question-bank', authenticateToken, async (req, res) => {
  const { type, questionText, options, correctAnswer, matchPairs, marks, difficulty, explanation, imageUrl, tags } = req.body;
  if (!questionText) return res.status(400).json({ error: 'questionText required' });
  const { data, error } = await supabaseAdmin.from('question_bank').insert({
    id: uuidv4(), owner_id: req.user.id, type: type || 'mcq',
    question_text: questionText, options: options || null,
    correct_answer: correctAnswer || null, match_pairs: matchPairs || null,
    marks: Number(marks) || 1, difficulty: difficulty || 'medium',
    explanation: explanation || null, image_url: imageUrl || null,
    tags: Array.isArray(tags) ? tags : null
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ item: data });
});

router.delete('/question-bank/:id', authenticateToken, async (req, res) => {
  const { data: row } = await supabaseAdmin.from('question_bank').select('owner_id').eq('id', req.params.id).single();
  if (!row || row.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your bank item' });
  await supabaseAdmin.from('question_bank').delete().eq('id', req.params.id);
  res.json({ message: 'Removed' });
});

// Copy a bank item into a specific test as a question.
router.post('/tests/:testId/questions/from-bank/:bankId', authenticateToken, async (req, res) => {
  const { data: test } = await supabaseAdmin.from('course_tests').select('course_id').eq('id', req.params.testId).single();
  if (!test) return res.status(404).json({ error: 'Test not found' });
  const { allowed } = await ownsCourse(test.course_id, req.user);
  if (!allowed) return res.status(403).json({ error: 'Not your course' });
  const { data: bank } = await supabaseAdmin.from('question_bank').select('*').eq('id', req.params.bankId).single();
  if (!bank || bank.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your bank item' });
  const { data, error } = await supabaseAdmin.from('course_questions').insert({
    id: uuidv4(), test_id: req.params.testId, type: bank.type,
    question_text: bank.question_text, options: bank.options,
    correct_answer: bank.correct_answer, match_pairs: bank.match_pairs,
    image_url: bank.image_url, marks: bank.marks, difficulty: bank.difficulty,
    explanation: bank.explanation, order_index: 0
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ question: data });
});

// ── PROCTORING: students log suspicious events (tab-switch, fullscreen exit,
// face-not-visible) during a test session; teachers fetch the timeline.
router.post('/sessions/:id/proctor-event', authenticateToken, async (req, res) => {
  const { data: session } = await supabaseAdmin.from('test_sessions').select('student_id').eq('id', req.params.id).single();
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.student_id !== req.user.id) return res.status(403).json({ error: 'Not your session' });
  const { eventType, metadata } = req.body || {};
  const { data, error } = await supabaseAdmin.from('proctoring_events').insert({
    id: uuidv4(), session_id: req.params.id, student_id: req.user.id,
    event_type: eventType || 'unknown', metadata: metadata || null
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ event: data });
});

router.get('/sessions/:id/proctor-events', authenticateToken, async (req, res) => {
  const { data: session } = await supabaseAdmin.from('test_sessions').select('*, course_tests(course_id)').eq('id', req.params.id).single();
  if (!session) return res.status(404).json({ error: 'Session not found' });
  // Student can view their own; teacher can view if they own the course.
  if (session.student_id !== req.user.id) {
    const courseId = session.course_tests?.course_id;
    if (courseId) {
      const { allowed } = await ownsCourse(courseId, req.user);
      if (!allowed) return res.status(403).json({ error: 'Not your session' });
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
  const { data } = await supabaseAdmin.from('proctoring_events').select('*').eq('session_id', req.params.id).order('occurred_at');
  res.json({ events: data || [] });
});

module.exports = router;
