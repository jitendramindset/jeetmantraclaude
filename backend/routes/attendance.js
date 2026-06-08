const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { CREATOR_ROLES } = require('../config/roles');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Record attendance (teacher only)
router.post('/', authenticateToken, authorizeRole(CREATOR_ROLES), validate('recordAttendance'), async (req, res) => {
  try {
    const { enrollmentId, status, classDate } = req.validatedData;
    const attendanceId = uuidv4();

    // Verify teacher owns this enrollment's course
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('*, courses (teacher_id)')
      .eq('id', enrollmentId)
      .single();

    if (!enrollment || enrollment.courses.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to record attendance' });
    }

    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .insert({
        id: attendanceId,
        enrollment_id: enrollmentId,
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        status,
        date: classDate,
        recorded_by: req.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to record attendance' });
    }

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance
    });
  } catch (error) {
    console.error('Attendance record error:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Get attendance history
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('student_id', req.params.studentId)
      .order('date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch attendance' });
    }

    // Calculate attendance percentage
    const total = attendance?.length || 0;
    const present = attendance?.filter(a => a.status === 'present')?.length || 0;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.json({
      message: 'Attendance fetched successfully',
      attendance,
      summary: {
        total,
        present,
        absent: attendance?.filter(a => a.status === 'absent')?.length || 0,
        late: attendance?.filter(a => a.status === 'late')?.length || 0,
        percentage
      }
    });
  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get course attendance
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('course_id', req.params.courseId)
      .order('date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch attendance' });
    }

    res.json({
      message: 'Course attendance fetched successfully',
      attendance
    });
  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// GET /api/attendance/log/:courseId — full attendance log for a course.
// Students see only their own rows; teachers see everyone's.
router.get('/log/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    let q = supabaseAdmin.from('attendance').select('*').eq('course_id', courseId).order('date', { ascending: false });
    if (req.user.role === 'student') {
      q = q.eq('student_id', req.user.id);
    } else if (req.user.role === 'teacher') {
      // Verify teacher owns the course
      const { data: course } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single();
      if (!course || course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    }
    const { data: rows } = await q;
    // Hydrate student names (for teachers) and compute summary
    let studentMap = {};
    if (req.user.role === 'teacher' && rows?.length) {
      const ids = [...new Set(rows.map(r => r.student_id))];
      const { data: students } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', ids);
      studentMap = Object.fromEntries((students || []).map(s => [s.id, s]));
    }
    const enriched = (rows || []).map(r => ({
      ...r,
      student_name: studentMap[r.student_id]?.full_name || null
    }));
    const present = enriched.filter(r => r.status === 'present').length;
    const total = enriched.length;
    res.json({
      log: enriched,
      summary: { total, present, absent: enriched.filter(r => r.status === 'absent').length, late: enriched.filter(r => r.status === 'late').length, percentage: total ? Math.round((present / total) * 100) : 0 }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
