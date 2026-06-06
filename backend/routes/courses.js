const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
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
router.post('/', authenticateToken, authorizeRole(['teacher']), validate('courseCreate'), async (req, res) => {
  try {
    const courseId = uuidv4();
    const { title, description, category, level, price, startDate, endDate, maxStudents, batchTiming } = req.validatedData;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert({
        id: courseId,
        teacher_id: req.user.id,
        title,
        description,
        category,
        level,
        price,
        start_date: startDate,
        end_date: endDate,
        max_students: maxStudents,
        batch_timing: batchTiming,
        is_active: true,
        created_at: new Date().toISOString()
      })
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
router.put('/:id', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
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
router.delete('/:id', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
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

module.exports = router;
