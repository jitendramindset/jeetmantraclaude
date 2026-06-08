const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get my enrollments
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          category,
          level,
          price,
          teacher_id,
          batch_timing
        )
      `)
      .eq('student_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch enrollments' });
    }

    res.json({
      message: 'Enrollments fetched successfully',
      enrollments
    });
  } catch (error) {
    console.error('Enrollments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Enroll in course
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const enrollmentId = uuidv4();

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const { data: enrollment, error } = await supabaseAdmin
      .from('enrollments')
      .insert({
        id: enrollmentId,
        course_id: courseId,
        student_id: req.user.id,
        enrollment_date: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to enroll in course' });
    }

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// Get course students (teacher only)
router.get('/course/:courseId/students', authenticateToken, async (req, res) => {
  try {
    // Verify teacher owns this course (admin client — anon key is invalid on
    // self-hosted; service client always works).
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('teacher_id')
      .eq('id', req.params.courseId)
      .single();

    if (!course || course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Fetch enrollments, then hydrate student profiles with a SEPARATE lookup —
    // the users(...) FK embed fails because jeetmantra_users.id is VARCHAR.
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('course_id', req.params.courseId);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
    const ids = [...new Set((enrollments || []).map(e => e.student_id).filter(Boolean))];
    let userMap = {};
    if (ids.length) {
      const { data: users } = await supabaseAdmin
        .from('jeetmantra_users').select('id, full_name, email, phone, profile_image').in('id', ids);
      userMap = Object.fromEntries((users || []).map(u => [u.id, u]));
    }
    res.json({
      message: 'Students fetched successfully',
      students: (enrollments || []).map(e => ({ ...e, users: userMap[e.student_id] || null }))
    });
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Cancel enrollment
router.delete('/:enrollmentId', authenticateToken, async (req, res) => {
  try {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('id', req.params.enrollmentId)
      .single();

    if (!enrollment || enrollment.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabaseAdmin
      .from('enrollments')
      .delete()
      .eq('id', req.params.enrollmentId);

    if (error) {
      return res.status(400).json({ error: 'Failed to cancel enrollment' });
    }

    res.json({ message: 'Enrollment cancelled successfully' });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel enrollment' });
  }
});

module.exports = router;
