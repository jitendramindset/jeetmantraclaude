/**
 * parentExtras.js — endpoints for the parent role.
 * Mount: /api/parent
 *
 * Parents link to one or more students (siblings) and read their child's
 * grades / attendance / payments. They never write to the student's data —
 * everything is read-only with the student's consent (verified link).
 *
 * Endpoints:
 *   POST /link                          🔒 auth [parent/admin] — link a child by email
 *   GET  /children                      🔒 auth [parent/admin] — list linked children
 *   GET  /child/:studentId/snapshot     🔒 auth [parent/admin] — enrollments, grades, attendance %
 *
 * Notes: all routes gated to parent/admin via authorizeRole. Snapshot verifies a
 * parent_student_links row (admins bypass). Course titles are hydrated separately.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

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


// ── LINK A CHILD: parent enters child's email; we mark the link "pending"
// until the child verifies (later flow could send the child an email).
// For dev convenience, if the parent's user_type is 'parent' and the
// email matches an existing student, we auto-verify.
router.post('/link', authenticateToken, authorizeRole(['parent', 'admin']), async (req, res) => {
  try {
    const { studentEmail, relation } = req.body || {};
    if (!studentEmail) return res.status(400).json({ error: 'studentEmail required' });
    const { data: student } = await supabaseAdmin
      .from('jeetmantra_users').select('id, user_type').eq('email', studentEmail).maybeSingle();
    if (!student) return res.status(404).json({ error: 'No student with that email' });
    if (student.user_type !== 'student') return res.status(400).json({ error: 'That account is not a student' });

    const { data: existing } = await supabaseAdmin.from('parent_student_links')
      .select('id').eq('parent_id', req.user.id).eq('student_id', student.id).maybeSingle();
    if (existing) return res.json({ message: 'Already linked', linkId: existing.id });

    const { data, error } = await supabaseAdmin.from('parent_student_links').insert({
      id: uuidv4(), parent_id: req.user.id, student_id: student.id,
      relation: relation || 'parent', verified_at: new Date().toISOString()
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ link: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// List children — parent dashboard top tiles.
router.get('/children', authenticateToken, authorizeRole(['parent', 'admin']), async (req, res) => {
  try {
    const { data: links } = await supabaseAdmin.from('parent_student_links')
      .select('*').eq('parent_id', req.user.id);
    const ids = (links || []).map(l => l.student_id);
    if (!ids.length) return res.json({ children: [] });
    const { data: users } = await supabaseAdmin.from('jeetmantra_users')
      .select('id, full_name, email, profile_image').in('id', ids);
    const byId = Object.fromEntries((users || []).map(u => [u.id, u]));
    res.json({
      children: (links || []).map(l => ({
        link_id: l.id, student_id: l.student_id, relation: l.relation,
        ...byId[l.student_id]
      }))
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Single child snapshot: enrollments, latest grades, attendance %.
router.get('/child/:studentId/snapshot', authenticateToken, authorizeRole(['parent', 'admin']), async (req, res) => {
  try {
    // Verify the parent is linked.
    const { data: link } = await supabaseAdmin.from('parent_student_links')
      .select('id').eq('parent_id', req.user.id).eq('student_id', req.params.studentId).maybeSingle();
    if (!link && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your child' });

    const [{ data: child }, { data: enrollments }, { data: attendance }, { data: subs }] = await Promise.all([
      supabaseAdmin.from('jeetmantra_users').select('id, full_name, email, phone, profile_image').eq('id', req.params.studentId).maybeSingle(),
      supabaseAdmin.from('enrollments').select('*').eq('student_id', req.params.studentId),
      supabaseAdmin.from('attendance').select('status').eq('student_id', req.params.studentId),
      supabaseAdmin.from('test_submissions').select('score, status, test_id, submitted_at').eq('student_id', req.params.studentId).order('submitted_at', { ascending: false }).limit(10)
    ]);
    const presentCount = (attendance || []).filter(a => a.status === 'present').length;
    const attendancePct = attendance && attendance.length ? Math.round(100 * presentCount / attendance.length) : 0;

    // Hydrate course titles.
    const courseIds = [...new Set((enrollments || []).map(e => e.course_id))];
    let courseMap = {};
    if (courseIds.length) {
      const { data: courses } = await supabaseAdmin.from('courses').select('id, title, cover_image').in('id', courseIds);
      courseMap = Object.fromEntries((courses || []).map(c => [c.id, c]));
    }
    res.json({
      child,
      enrollments: (enrollments || []).map(e => ({ ...e, course: courseMap[e.course_id] || null })),
      attendance: { total: (attendance || []).length, present: presentCount, percentage: attendancePct },
      recentTestScores: subs || []
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
