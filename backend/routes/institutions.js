/**
 * institutions.js — schools & coaching centers managing their roster of
 * teachers (and students). Both school and coaching roles can use these:
 * the "institution" is just the user_id of the school/coaching user.
 *
 *   GET    /api/institutions/teachers          — list teachers linked to me
 *   POST   /api/institutions/teachers          — link a teacher by email + subject
 *   DELETE /api/institutions/teachers/:linkId  — unlink
 *   GET    /api/institutions/students          — list students linked to me
 *   POST   /api/institutions/students          — link a student by email + class
 *   GET    /api/institutions/dashboard         — aggregate roster overview
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const INSTITUTIONS = ['school', 'coaching', 'admin'];

// ── TEACHERS ───────────────────────────────────────────────────────────
router.get('/teachers', authenticateToken, authorizeRole(INSTITUTIONS), async (req, res) => {
  const { data: links } = await supabaseAdmin
    .from('institution_teachers')
    .select('*')
    .eq('institution_id', req.user.id)
    .eq('is_active', true);
  // Hydrate teacher rows
  const ids = (links || []).map(l => l.teacher_id);
  let teachers = [];
  if (ids.length) {
    const { data } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('id, full_name, email, phone, last_active')
      .in('id', ids);
    teachers = data || [];
  }
  const byId = Object.fromEntries(teachers.map(t => [t.id, t]));
  res.json({
    teachers: (links || []).map(l => ({
      link_id: l.id,
      subject: l.subject,
      role: l.role,
      joined_at: l.joined_at,
      ...byId[l.teacher_id]
    }))
  });
});

router.post('/teachers', authenticateToken, authorizeRole(INSTITUTIONS), async (req, res) => {
  const { email, subject, role } = req.body;
  if (!email) return res.status(400).json({ error: 'teacher email required' });
  // Find the teacher account
  const { data: teacher } = await supabaseAdmin
    .from('jeetmantra_users').select('id, user_type, full_name').eq('email', email).single();
  if (!teacher) return res.status(404).json({ error: 'No user found with that email' });
  if (teacher.user_type !== 'teacher') return res.status(400).json({ error: 'User is not a teacher (role=' + teacher.user_type + ')' });
  // Insert link
  const { data, error } = await supabaseAdmin.from('institution_teachers').insert({
    id: uuidv4(),
    institution_id: req.user.id,
    teacher_id: teacher.id,
    subject: subject || null,
    role: role || 'teacher'
  }).select().single();
  if (error) {
    // Friendly message for the uniqueness constraint instead of leaking SQL.
    if ((error.message || '').includes('duplicate key')) {
      return res.status(409).json({ error: `Already linked: ${teacher.full_name || email}${subject ? ' for ' + subject : ''}` });
    }
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json({ message: 'Teacher linked', link: data, teacher });
});

router.delete('/teachers/:linkId', authenticateToken, authorizeRole(INSTITUTIONS), async (req, res) => {
  const { error } = await supabaseAdmin.from('institution_teachers')
    .delete().eq('id', req.params.linkId).eq('institution_id', req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Teacher unlinked' });
});

// ── STUDENTS ───────────────────────────────────────────────────────────
router.get('/students', authenticateToken, authorizeRole(INSTITUTIONS), async (req, res) => {
  const { data: links } = await supabaseAdmin
    .from('institution_students').select('*').eq('institution_id', req.user.id);
  const ids = (links || []).map(l => l.student_id);
  let students = [];
  if (ids.length) {
    const { data } = await supabaseAdmin
      .from('jeetmantra_users').select('id, full_name, email, phone, last_active').in('id', ids);
    students = data || [];
  }
  const byId = Object.fromEntries(students.map(s => [s.id, s]));
  res.json({
    students: (links || []).map(l => ({ link_id: l.id, class_label: l.class_label, joined_at: l.joined_at, ...byId[l.student_id] }))
  });
});

router.post('/students', authenticateToken, authorizeRole(INSTITUTIONS), async (req, res) => {
  const { email, classLabel } = req.body;
  if (!email) return res.status(400).json({ error: 'student email required' });
  const { data: student } = await supabaseAdmin
    .from('jeetmantra_users').select('id, user_type').eq('email', email).single();
  if (!student) return res.status(404).json({ error: 'No user with that email' });
  if (student.user_type !== 'student') return res.status(400).json({ error: 'User is not a student' });
  const { data, error } = await supabaseAdmin.from('institution_students').insert({
    id: uuidv4(), institution_id: req.user.id, student_id: student.id, class_label: classLabel || null
  }).select().single();
  if (error) {
    if ((error.message || '').includes('duplicate key')) {
      return res.status(409).json({ error: `Student ${email} is already linked to this institution` });
    }
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json({ message: 'Student linked', link: data });
});

// ── DASHBOARD AGG ──────────────────────────────────────────────────────
// What does an institution want to see at a glance?
//  - teacher count, student count, total courses (by linked teachers), upcoming live classes.
router.get('/dashboard', authenticateToken, authorizeRole(INSTITUTIONS), async (req, res) => {
  const { data: teacherLinks } = await supabaseAdmin
    .from('institution_teachers').select('teacher_id').eq('institution_id', req.user.id).eq('is_active', true);
  const teacherIds = (teacherLinks || []).map(t => t.teacher_id);
  const { count: studentCount } = await supabaseAdmin
    .from('institution_students').select('id', { count: 'exact', head: true }).eq('institution_id', req.user.id);
  let courses = [], liveClasses = [];
  if (teacherIds.length) {
    const { data: cs } = await supabaseAdmin.from('courses').select('id, title, category, level, price, is_active, teacher_id').in('teacher_id', teacherIds);
    courses = cs || [];
    const courseIds = courses.map(c => c.id);
    if (courseIds.length) {
      const { data: lcs } = await supabaseAdmin.from('live_classes')
        .select('id, title, scheduled_time, status, course_id').in('course_id', courseIds).limit(20);
      liveClasses = lcs || [];
    }
  }
  res.json({
    teacherCount: teacherIds.length,
    studentCount: studentCount || 0,
    courseCount: courses.length,
    courses,
    upcomingLiveClasses: liveClasses.filter(l => l.status === 'scheduled' || l.status === 'live')
  });
});

// ── FOR TEACHERS: which institutions am I in? ──────────────────────────
// Returns every institution this user is linked to — as a teacher OR as a
// student — so the dashboard can show "you belong to N institutions, switch
// active one." Single user id, many memberships.
router.get('/my-institutions', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const [tRes, sRes] = await Promise.all([
    supabaseAdmin.from('institution_teachers').select('*').eq('teacher_id', userId).eq('is_active', true),
    supabaseAdmin.from('institution_students').select('*').eq('student_id', userId).eq('is_active', true)
  ]);
  const tLinks = tRes.data || [];
  const sLinks = sRes.data || [];
  const ids = [...new Set([...tLinks.map(l => l.institution_id), ...sLinks.map(l => l.institution_id)])];
  let institutions = [];
  if (ids.length) {
    const { data } = await supabaseAdmin
      .from('jeetmantra_users').select('id, full_name, email, user_type').in('id', ids);
    institutions = data || [];
  }
  const byId = Object.fromEntries(institutions.map(i => [i.id, i]));
  const merged = [
    ...tLinks.map(l => ({
      link_id: l.id, institution_id: l.institution_id,
      name: byId[l.institution_id]?.full_name || 'Institution',
      type: byId[l.institution_id]?.user_type || 'school',
      role: 'teacher', subject: l.subject || null
    })),
    ...sLinks.map(l => ({
      link_id: l.id, institution_id: l.institution_id,
      name: byId[l.institution_id]?.full_name || 'Institution',
      type: byId[l.institution_id]?.user_type || 'school',
      role: 'student', subject: null
    }))
  ];
  res.json({ institutions: merged, count: merged.length });
});

module.exports = router;
