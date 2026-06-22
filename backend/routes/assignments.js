/**
 * assignments.js — assignments lifecycle.
 *
 *   POST   /api/assignments                       — teacher creates (per course)
 *   GET    /api/assignments?courseId=             — list for a course (anyone with access)
 *   GET    /api/assignments/my                    — student: list their assignments across enrolled courses
 *   POST   /api/assignments/:id/submit            — student submits (url + optional notes)
 *   PUT    /api/assignments/:id/grade             — teacher grades (score + feedback)
 *   DELETE /api/assignments/:id                   — teacher deletes
 *
 * The `assignments` table has a slightly awkward shape — `student_id` is on
 * the row but for a course-wide assignment that should be null. We treat
 * `student_id IS NULL` rows as "template" assignments (the work itself) and
 * generate per-student submission rows separately via `submission_url` /
 * `status` updates when a student submits. For the MVP, the simplest path is:
 *   - teacher creates an assignment row (student_id = null, status pending)
 *   - when a student submits, we create a new row with their student_id +
 *     submission_url + status='submitted'
 *   - teacher grades by updating that per-student row
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { CREATOR_ROLES } = require('../config/roles');
const { validate } = require('../middleware/validation');
const { requireCapability } = require('../middleware/requireCapability');
const { v4: uuidv4 } = require('uuid');
const { awardForEvent } = require('../services/award');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads', 'assignments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const ALLOWED_MIME = /^(application\/(pdf|msword|vnd\.(openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|ms-excel|ms-powerpoint))|image\/(jpeg|png|gif|webp)|video\/(mp4|webm)|audio\/(mpeg|ogg|webm|wav)|text\/(plain|csv))$/i;
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`)
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.test(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('File type not allowed'), { status: 415 }));
  }
});

// Helper: confirm caller owns the course
async function ownsCourse(courseId, user) {
  const { data } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single();
  if (!data) return false;
  return user.role === 'admin' || data.teacher_id === user.id;
}

// Best-effort: log a submission to the activity wall AND notify the course
// teacher. Lazy-requires to avoid circular deps; never throws (wrapped in
// try/catch by callers).
async function announceSubmission({ template, student, kind }) {
  const studentName = student.full_name || student.email || 'A student';
  const label = kind === 'test' ? 'test' : 'assignment';
  const msg = `📝 ${studentName} submitted ${label}: ${template.title || 'Untitled'}`;
  try {
    const { logEvent } = require('./activity');
    await logEvent({
      eventType: `${label}_submitted`,
      actorId: student.id,
      targetUserId: template.teacher_id || null,
      courseId: template.course_id || null,
      payload: { assignmentId: template.id, title: template.title },
      message: msg
    });
  } catch (e) { console.warn('announceSubmission logEvent failed:', e.message); }
  try {
    if (template.teacher_id) {
      const eduos = require('./eduos');
      if (typeof eduos.notify === 'function') {
        await eduos.notify({
          userId: template.teacher_id,
          channel: 'in-app',
          type: 'submission',
          title: `New ${label} submission`,
          body: msg,
          link: template.course_id ? `/dashboard.html#course-${template.course_id}` : null
        });
      }
    }
  } catch (e) { console.warn('announceSubmission notify failed:', e.message); }
}

// POST /api/assignments — teacher creates an assignment template
router.post('/', authenticateToken, requireCapability('assignment.manage'), validate('assignmentCreate'), async (req, res) => {
  try {
    const { courseId, title, description, dueDate, topicId } = req.body;
    if (!courseId || !title || !dueDate) {
      return res.status(400).json({ error: 'courseId, title, and dueDate required' });
    }
    if (!(await ownsCourse(courseId, req.user))) {
      return res.status(403).json({ error: 'Not your course' });
    }
    const { data, error } = await supabaseAdmin.from('assignments').insert({
      id: uuidv4(),
      course_id: courseId,
      teacher_id: req.user.id,
      topic_id: topicId || null,
      student_id: null,                          // template row — actual submissions are separate
      title,
      description: description || '',
      due_date: dueDate,
      status: 'pending'
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Assignment created', assignment: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/assignments?courseId= — list assignments for a course.
// Teachers see all rows (template + every submission); students see template +
// only their own submission row.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ error: 'courseId required' });
    let q = supabaseAdmin.from('assignments').select('*').eq('course_id', courseId).order('due_date', { ascending: true });
    if (req.user.role === 'student') {
      // Templates (student_id NULL) + this student's submissions
      const { data: templates } = await supabaseAdmin.from('assignments').select('*').eq('course_id', courseId).is('student_id', null);
      const { data: mine } = await supabaseAdmin.from('assignments').select('*').eq('course_id', courseId).eq('student_id', req.user.id);
      // Merge: for each template, attach this student's submission if any
      const submByTemplate = {};
      (mine || []).forEach(m => { if (m.parent_id) submByTemplate[m.parent_id] = m; });
      const rows = (templates || []).map(t => ({ ...t, mySubmission: submByTemplate[t.id] || null }));
      return res.json({ assignments: rows });
    }
    const { data } = await q;
    res.json({ assignments: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/assignments/my — student's homework across all enrolled courses
router.get('/my', authenticateToken, async (req, res) => {
  try {
    // Get student's enrolled courses
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('course_id, courses(title)').eq('student_id', req.user.id);
    const courseIds = (enrollments || []).map(e => e.course_id);
    if (!courseIds.length) return res.json({ assignments: [] });
    const titleByCourse = Object.fromEntries((enrollments || []).map(e => [e.course_id, e.courses?.title]));
    const { data: templates } = await supabaseAdmin.from('assignments').select('*').in('course_id', courseIds).is('student_id', null).order('due_date', { ascending: true });
    const { data: mine } = await supabaseAdmin.from('assignments').select('*').in('course_id', courseIds).eq('student_id', req.user.id);
    const submByParent = {};
    (mine || []).forEach(m => { if (m.parent_id) submByParent[m.parent_id] = m; });
    const rows = (templates || []).map(t => ({
      ...t,
      course_title: titleByCourse[t.course_id] || null,
      mySubmission: submByParent[t.id] || null
    }));
    res.json({ assignments: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/assignments/:id/submit — student submits work for an assignment
// template. Accepts EITHER JSON {submissionUrl, notes} OR multipart with
// fields submissionUrl/notes/file. If a file is uploaded, its served URL is
// used as the submission_url and an existing URL is treated as a fallback.
router.post('/:id/submit', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { notes } = req.body;
    let submissionUrl = req.body.submissionUrl;
    if (req.file) submissionUrl = `/uploads/assignments/${req.file.filename}`;
    if (!submissionUrl) return res.status(400).json({ error: 'submissionUrl or file required' });
    // Fetch the template row
    const { data: template } = await supabaseAdmin.from('assignments').select('*').eq('id', req.params.id).single();
    if (!template) return res.status(404).json({ error: 'Assignment not found' });
    if (template.student_id) return res.status(400).json({ error: 'Not a template assignment' });
    // Prevent duplicate submission
    const { data: existing } = await supabaseAdmin.from('assignments').select('id').eq('parent_id', template.id).eq('student_id', req.user.id).maybeSingle();
    if (existing) {
      // Update instead of duplicate
      const { data, error } = await supabaseAdmin.from('assignments').update({
        submission_url: submissionUrl, status: 'submitted', feedback: notes || null, updated_at: new Date().toISOString()
      }).eq('id', existing.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      announceSubmission({ template, student: req.user, kind: 'assignment' }).catch(() => {});
      return res.json({ message: 'Submission updated', assignment: data });
    }
    const { data, error } = await supabaseAdmin.from('assignments').insert({
      id: uuidv4(),
      parent_id: template.id,
      course_id: template.course_id,
      teacher_id: template.teacher_id,
      topic_id: template.topic_id,
      student_id: req.user.id,
      title: template.title,
      description: template.description,
      due_date: template.due_date,
      submission_url: submissionUrl,
      feedback: notes || null,
      status: 'submitted'
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    announceSubmission({ template, student: req.user, kind: 'assignment' }).catch(() => {});

    // Sprint 5 award pipeline (assignment_submitted is unique per template, so
    // repeat re-submissions of the same assignment don't double-award).
    awardForEvent({
      userId: req.user.id, eventType: 'assignment_submitted',
      refTable: 'assignments', refId: template.id,
      metadata: { course_id: template.course_id, title: template.title }
    }).catch(() => {});

    res.status(201).json({ message: 'Submitted', assignment: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/assignments/:id — teacher edits the assignment TEMPLATE (title/desc/due)
router.put('/:id', authenticateToken, requireCapability('assignment.manage'), validate('assignmentEdit'), async (req, res) => {
  try {
    const { data: row } = await supabaseAdmin.from('assignments').select('teacher_id, student_id').eq('id', req.params.id).single();
    if (!row) return res.status(404).json({ error: 'Assignment not found' });
    if (row.teacher_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your assignment' });
    if (row.student_id) return res.status(400).json({ error: 'Cannot edit a student submission via this route — use /grade instead' });
    const { title, description, dueDate, topicId } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (dueDate !== undefined) updates.due_date = dueDate;
    if (topicId !== undefined) updates.topic_id = topicId || null;
    const { data, error } = await supabaseAdmin.from('assignments').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ assignment: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/assignments/:id/grade — teacher grades a per-student submission
router.put('/:id/grade', authenticateToken, requireCapability('assignment.grade'), validate('assignmentGrade'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    if (grade == null) return res.status(400).json({ error: 'grade required' });
    // Verify ownership via the row's teacher_id
    const { data: row } = await supabaseAdmin.from('assignments').select('teacher_id').eq('id', req.params.id).single();
    if (!row || row.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your assignment' });
    const { data, error } = await supabaseAdmin.from('assignments').update({
      grade: parseInt(grade, 10),
      feedback: feedback || null,
      status: 'graded',
      updated_at: new Date().toISOString()
    }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Graded', assignment: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/assignments/:id — teacher deletes (template or submission)
router.delete('/:id', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  const { data: row } = await supabaseAdmin.from('assignments').select('teacher_id').eq('id', req.params.id).single();
  if (!row || row.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your assignment' });
  const { error } = await supabaseAdmin.from('assignments').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Removed' });
});

// GET /api/assignments/:id/submissions — teacher views every student's
// submission for one assignment (template), hydrated with names.
router.get('/:id/submissions', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data: template } = await supabaseAdmin.from('assignments').select('teacher_id, title, course_id').eq('id', req.params.id).single();
    if (!template) return res.status(404).json({ error: 'Assignment not found' });
    if (template.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your assignment' });
    const { data: subs } = await supabaseAdmin.from('assignments').select('*').eq('parent_id', req.params.id).order('updated_at', { ascending: false });
    const studentIds = (subs || []).map(s => s.student_id).filter(Boolean);
    let students = [];
    if (studentIds.length) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', studentIds);
      students = data || [];
    }
    const byId = Object.fromEntries(students.map(s => [s.id, s]));
    res.json({
      template,
      submissions: (subs || []).map(s => ({ ...s, ...byId[s.student_id] }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
