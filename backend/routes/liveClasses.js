const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const router = express.Router();

// Schedule a live class (teacher only)
router.post('/', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
  try {
    const { courseId, title, description, scheduledTime, duration, meetingLink, capacity } = req.body;
    const classId = uuidv4();

    if (!courseId || !scheduledTime) {
      return res.status(400).json({ error: 'Course ID and scheduled time required' });
    }

    // Verify teacher owns this course
    const { data: course } = await supabase
      .from('courses')
      .select('teacher_id')
      .eq('id', courseId)
      .single();

    if (!course || course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to schedule class for this course' });
    }

    const { data: liveClass, error } = await supabaseAdmin
      .from('live_classes')
      .insert({
        id: classId,
        course_id: courseId,
        teacher_id: req.user.id,
        title: title || 'Live Class',
        description: description || '',
        scheduled_time: scheduledTime,
        duration: duration || 60, // minutes
        meeting_link: meetingLink || null,
        capacity: capacity || 50,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to schedule live class' });
    }

    res.status(201).json({
      message: 'Live class scheduled successfully',
      liveClass
    });
  } catch (error) {
    console.error('Live class scheduling error:', error);
    res.status(500).json({ error: 'Failed to schedule live class' });
  }
});

// Get all live classes for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { data: liveClasses, error } = await supabase
      .from('live_classes')
      .select('*')
      .eq('course_id', req.params.courseId)
      .order('scheduled_time', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch live classes' });
    }

    // Separate upcoming and past classes
    const now = new Date();
    const upcoming = liveClasses.filter(lc => new Date(lc.scheduled_time) > now);
    const past = liveClasses.filter(lc => new Date(lc.scheduled_time) <= now);

    res.json({
      message: 'Live classes fetched successfully',
      liveClasses: {
        upcoming,
        past,
        total: liveClasses.length
      }
    });
  } catch (error) {
    console.error('Live classes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch live classes' });
  }
});

// Get all upcoming live classes (for student)
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const now = new Date().toISOString();

    // Get enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', req.user.id);

    if (!enrollments || enrollments.length === 0) {
      return res.json({
        message: 'No upcoming live classes',
        liveClasses: []
      });
    }

    const courseIds = enrollments.map(e => e.course_id);

    // Get upcoming live classes
    const { data: liveClasses, error } = await supabase
      .from('live_classes')
      .select('*, courses (title)')
      .in('course_id', courseIds)
      .gt('scheduled_time', now)
      .order('scheduled_time', { ascending: true })
      .limit(10);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch live classes' });
    }

    res.json({
      message: 'Upcoming live classes fetched successfully',
      liveClasses: liveClasses || []
    });
  } catch (error) {
    console.error('Upcoming classes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming classes' });
  }
});

// Get single live class details
router.get('/:classId', async (req, res) => {
  try {
    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .select('*, courses (title), users (full_name, profile_image)')
      .eq('id', req.params.classId)
      .single();

    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    // Get attendees count
    const { count: attendeesCount } = await supabase
      .from('class_attendees')
      .select('*', { count: 'exact' })
      .eq('class_id', req.params.classId);

    res.json({
      message: 'Live class details fetched successfully',
      liveClass: {
        ...liveClass,
        attendeesCount: attendeesCount || 0
      }
    });
  } catch (error) {
    console.error('Live class fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch live class' });
  }
});

// Join live class (student)
router.post('/:classId/join', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const studentId = req.user.id;
    const attendanceId = uuidv4();

    // Check if already joined
    const { data: existing } = await supabase
      .from('class_attendees')
      .select('id')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already joined this class' });
    }

    const { data: attendance, error } = await supabaseAdmin
      .from('class_attendees')
      .insert({
        id: attendanceId,
        class_id: classId,
        student_id: studentId,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to join class' });
    }

    res.json({
      message: 'Joined live class successfully',
      attendance
    });
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ error: 'Failed to join class' });
  }
});

// Upload class document
router.post('/:classId/documents', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = {
      id: uuidv4(),
      classId: req.params.classId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user.id
    };

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Update live class (teacher only)
router.put('/:classId', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
  try {
    // Verify teacher owns this class
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('teacher_id')
      .eq('id', req.params.classId)
      .single();

    if (!liveClass || liveClass.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this class' });
    }

    const { title, description, meetingLink, status } = req.body;
    const updates = {
      ...(title && { title }),
      ...(description && { description }),
      ...(meetingLink && { meeting_link: meetingLink }),
      ...(status && { status }),
      updated_at: new Date().toISOString()
    };

    const { data: updatedClass, error } = await supabaseAdmin
      .from('live_classes')
      .update(updates)
      .eq('id', req.params.classId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update live class' });
    }

    res.json({
      message: 'Live class updated successfully',
      liveClass: updatedClass
    });
  } catch (error) {
    console.error('Live class update error:', error);
    res.status(500).json({ error: 'Failed to update live class' });
  }
});

// Start live class (teacher only)
router.post('/:classId/start', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
  try {
    // Verify teacher owns this class
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('teacher_id')
      .eq('id', req.params.classId)
      .single();

    if (!liveClass || liveClass.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to start this class' });
    }

    const { data: updatedClass, error } = await supabaseAdmin
      .from('live_classes')
      .update({
        status: 'live',
        started_at: new Date().toISOString()
      })
      .eq('id', req.params.classId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to start live class' });
    }

    res.json({
      message: 'Live class started',
      liveClass: updatedClass
    });
  } catch (error) {
    console.error('Start class error:', error);
    res.status(500).json({ error: 'Failed to start live class' });
  }
});

// End live class (teacher only)
router.post('/:classId/end', authenticateToken, authorizeRole(['teacher']), async (req, res) => {
  try {
    // Verify teacher owns this class
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('teacher_id')
      .eq('id', req.params.classId)
      .single();

    if (!liveClass || liveClass.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to end this class' });
    }

    const { data: updatedClass, error } = await supabaseAdmin
      .from('live_classes')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', req.params.classId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to end live class' });
    }

    res.json({
      message: 'Live class ended',
      liveClass: updatedClass
    });
  } catch (error) {
    console.error('End class error:', error);
    res.status(500).json({ error: 'Failed to end live class' });
  }
});

// Get class attendees
router.get('/:classId/attendees', authenticateToken, async (req, res) => {
  try {
    const { data: attendees, error } = await supabase
      .from('class_attendees')
      .select('*, users (full_name, profile_image)')
      .eq('class_id', req.params.classId)
      .order('joined_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch attendees' });
    }

    res.json({
      message: 'Class attendees fetched successfully',
      attendees: attendees || [],
      totalCount: attendees?.length || 0
    });
  } catch (error) {
    console.error('Attendees fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
});

module.exports = router;
