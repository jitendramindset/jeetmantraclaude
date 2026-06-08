const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { CREATOR_ROLES } = require('../config/roles');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const { category, level, page = 1, limit = 12 } = req.query;
    let query = supabase.from('courses').select('*').eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (level) query = query.eq('level', level);

    const offset = (page - 1) * limit;
    const { data: courses, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // Table may not exist yet — return empty list gracefully
      console.warn('Courses table error:', error.message);
      return res.json({ message: 'Courses fetched successfully', courses: [], page: parseInt(page), limit: parseInt(limit) });
    }

    res.json({
      message: 'Courses fetched successfully',
      courses: courses || [],
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Courses fetch error:', error);
    res.json({ message: 'Courses fetched successfully', courses: [], page: 1, limit: 12 });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get teacher info
    const { data: teacher } = await supabase
      .from('jeetmantra_users')
      .select('id, full_name, profile_image, institution')
      .eq('id', course.teacher_id)
      .single();

    // Get enrolled students count
    const { count: enrolledCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact' })
      .eq('course_id', course.id);

    res.json({
      message: 'Course fetched successfully',
      course: {
        ...course,
        teacher,
        enrolledStudents: enrolledCount
      }
    });
  } catch (error) {
    console.error('Course fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course (teacher only)
router.post('/', authenticateToken, authorizeRole(CREATOR_ROLES), validate('courseCreate'), async (req, res) => {
  try {
    const courseId = uuidv4();
    const { title, description, category, level, price, startDate, endDate, maxStudents, batchTiming } = req.validatedData;

    // Only include optional columns when provided so DB defaults apply otherwise.
    const insertData = {
      id: courseId,
      teacher_id: req.user.id,
      title,
      description: description || '',
      category: category || 'General',
      level: level || 'beginner',
      price: price || 0,
      is_active: true,
      created_at: new Date().toISOString()
    };
    if (startDate) insertData.start_date = startDate;
    if (endDate) insertData.end_date = endDate;
    if (maxStudents) insertData.max_students = maxStudents;
    if (batchTiming) insertData.batch_timing = batchTiming;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create course' });
    }

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course (teacher only)
router.put('/:id', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    // Verify ownership
    const { data: course } = await supabase
      .from('courses')
      .select('teacher_id')
      .eq('id', req.params.id)
      .single();

    if (!course || course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const { title, description, category, level, price, startDate, endDate, maxStudents, batchTiming, coverImage, is_active } = req.body;
    const updates = {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(level && { level }),
      ...(price && { price }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(maxStudents && { max_students: maxStudents }),
      ...(batchTiming && { batch_timing: batchTiming }),
      ...(coverImage && { cover_image: coverImage }),
      ...(typeof is_active !== 'undefined' && { is_active }),
      updated_at: new Date().toISOString()
    };

    const { data: updatedCourse, error } = await supabaseAdmin
      .from('courses')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update course' });
    }

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Course update error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course (teacher only)
router.delete('/:id', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    // Verify ownership
    const { data: course } = await supabase
      .from('courses')
      .select('teacher_id')
      .eq('id', req.params.id)
      .single();

    if (!course || course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: 'Failed to delete course' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Course deletion error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// GET /api/courses/:id/students — teacher views every enrolled student with
// computed progress + last attendance date. Used by the Configure modal's
// Students tab.
router.get('/:id/students', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    // Ownership check (teacher only or admin)
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id, title').eq('id', courseId).single();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.user.role !== 'admin' && course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your course' });
    }
    // Enrollments
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('*').eq('course_id', courseId);
    if (!enrollments?.length) return res.json({ course, students: [] });
    const studentIds = enrollments.map(e => e.student_id);
    const { data: students } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email, last_active').in('id', studentIds);
    const byId = Object.fromEntries((students || []).map(s => [s.id, s]));
    // Total lectures (shared across all students)
    const { count: totalLectures } = await supabaseAdmin.from('course_lectures').select('id', { count: 'exact', head: true }).eq('course_id', courseId);
    // Per-student attendance count + last date
    const rows = await Promise.all(enrollments.map(async (e) => {
      const [{ count: present }, { data: lastRow }] = await Promise.all([
        supabaseAdmin.from('attendance').select('id', { count: 'exact', head: true }).eq('course_id', courseId).eq('student_id', e.student_id).eq('status', 'present'),
        supabaseAdmin.from('attendance').select('date').eq('course_id', courseId).eq('student_id', e.student_id).order('date', { ascending: false }).limit(1).maybeSingle()
      ]);
      const pct = totalLectures ? Math.round(((present || 0) / totalLectures) * 100) : 0;
      const student = byId[e.student_id] || {};
      return {
        enrollment_id: e.id,
        student_id: e.student_id,
        full_name: student.full_name || '—',
        email: student.email || '',
        last_active: student.last_active || null,
        attended_lectures: present || 0,
        total_lectures: totalLectures || 0,
        progress_percentage: pct,
        last_attendance_date: lastRow?.date || null,
        enrolled_at: e.enrollment_date || e.created_at
      };
    }));
    res.json({ course, students: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── COMPLETION CERTIFICATE: serves an HTML certificate the browser can
// print to PDF. Requires the student to be enrolled with ≥80% progress.
router.get('/:id/certificate', authenticateToken, async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { data: enr } = await supabaseAdmin.from('enrollments')
      .select('*, courses(title, category, level)').eq('course_id', courseId).eq('student_id', req.user.id).maybeSingle();
    if (!enr) return res.status(403).send('You are not enrolled in this course.');
    const progress = Number(enr.progress) || 0;
    if (progress < 80) return res.status(400).send('Certificate available once progress reaches 80% (current: ' + progress + '%).');
    const { data: user } = await supabaseAdmin.from('jeetmantra_users').select('full_name, email').eq('id', req.user.id).single();
    const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = `JM-${courseId.slice(0,4)}-${req.user.id.slice(0,4)}-${Date.now().toString(36).toUpperCase()}`;
    const esc = s => String(s||'').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Certificate — ${esc(enr.courses?.title)}</title>
<style>
@page{size:A4 landscape;margin:0}
body{margin:0;font-family:'Georgia',serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f4f1ea}
.cert{width:1000px;padding:60px;background:#fffdf7;border:16px double #b89d63;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.15)}
h1{font-size:48px;color:#6b4e16;margin:0 0 6px;letter-spacing:4px}
.sub{font-size:14px;color:#8a7044;letter-spacing:3px;text-transform:uppercase;margin-bottom:36px}
.awarded{font-size:18px;color:#444;margin-bottom:10px}
.name{font-size:54px;color:#222;font-style:italic;margin:14px 0 22px;border-bottom:2px solid #b89d63;padding-bottom:14px;display:inline-block;min-width:60%}
.line{font-size:16px;color:#555;line-height:1.6;margin:18px 0}
.course{font-size:28px;color:#6b4e16;font-weight:600}
.foot{display:flex;justify-content:space-between;margin-top:50px;font-size:13px;color:#555}
.sig{border-top:1px solid #888;padding-top:6px;min-width:200px}
.no-print{position:fixed;top:10px;right:10px}
@media print{.no-print{display:none}}
button{padding:8px 14px;border:0;border-radius:6px;background:#6b4e16;color:#fff;cursor:pointer;font-family:sans-serif}
</style></head><body>
<div class="no-print"><button onclick="window.print()">🖨 Print / Save as PDF</button></div>
<div class="cert">
  <h1>CERTIFICATE</h1><div class="sub">of completion</div>
  <div class="awarded">This is to certify that</div>
  <div class="name">${esc(user?.full_name || user?.email || 'Student')}</div>
  <div class="line">has successfully completed the course</div>
  <div class="course">${esc(enr.courses?.title || 'Course')}</div>
  <div class="line">${esc(enr.courses?.category || '')} · ${esc(enr.courses?.level || '')} · ${progress}% complete</div>
  <div class="foot">
    <div class="sig">JeetMantra Platform<br>Issued ${date}</div>
    <div class="sig">Certificate ID<br>${certId}</div>
  </div>
</div></body></html>`);
  } catch (e) {
    res.status(500).send('Certificate generation failed: ' + e.message);
  }
});

module.exports = router;
