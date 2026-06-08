const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { CREATOR_ROLES } = require('../config/roles');
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
router.post('/', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
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

    // Fetch the class so we can return meeting_link to the client (the UI
    // opens it in a new tab on join). Also verifies the class exists.
    const { data: liveClass } = await supabaseAdmin
      .from('live_classes')
      .select('id, title, status, meeting_link, course_id')
      .eq('id', classId)
      .single();
    if (!liveClass) return res.status(404).json({ error: 'Live class not found' });
    if (liveClass.status === 'completed' || liveClass.status === 'cancelled') {
      return res.status(400).json({ error: 'This class is no longer available' });
    }

    // Check if already joined — if so, re-return meeting_link so the user can rejoin.
    const { data: existing } = await supabaseAdmin
      .from('class_attendees')
      .select('id')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin
        .from('class_attendees')
        .insert({
          id: uuidv4(),
          class_id: classId,
          student_id: studentId,
          joined_at: new Date().toISOString()
        });
      if (error) return res.status(400).json({ error: 'Failed to join class: ' + error.message });
    }

    res.json({
      message: existing ? 'Rejoining live class' : 'Joined live class successfully',
      meetingLink: liveClass.meeting_link,
      classId: liveClass.id,
      title: liveClass.title
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
router.put('/:classId', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
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
router.post('/:classId/start', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
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
router.post('/:classId/end', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
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

// GET /api/live-classes/:id/attendees — teacher views who joined.
// Uses the service client + a separate user lookup since jeetmantra_users.id
// is VARCHAR and the FK embed isn't possible.
router.get('/:id/attendees', authenticateToken, async (req, res) => {
  try {
    // Verify the caller is the class's teacher (or admin)
    const { data: cls } = await supabaseAdmin.from('live_classes').select('teacher_id, title, status').eq('id', req.params.id).single();
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    if (req.user.role !== 'admin' && cls.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your class' });
    }
    const { data: rows } = await supabaseAdmin.from('class_attendees').select('*').eq('class_id', req.params.id).order('joined_at', { ascending: true });
    const ids = (rows || []).map(r => r.student_id);
    let students = [];
    if (ids.length) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', ids);
      students = data || [];
    }
    const byId = Object.fromEntries(students.map(s => [s.id, s]));
    res.json({
      class: cls,
      attendees: (rows || []).map(r => ({ ...r, ...byId[r.student_id] }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── AI SUMMARY: generate post-class notes from title/description/duration.
// Called by the teacher after ending the class; stored on live_classes.summary
// so students see it next time they open the class.
router.post('/:id/summary', authenticateToken, async (req, res) => {
  try {
    const { data: cls } = await supabaseAdmin.from('live_classes').select('*').eq('id', req.params.id).single();
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    if (req.user.role !== 'admin' && cls.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your class' });
    // If a custom transcript/notes string was provided, prefer that; else
    // synthesize from the class metadata.
    const { transcript } = req.body || {};
    const { ai } = require('../config/aiProvider');
    let summary = '';
    try {
      const dur = cls.started_at && cls.ended_at
        ? Math.round((new Date(cls.ended_at) - new Date(cls.started_at)) / 60000)
        : (cls.duration || 60);
      const out = await ai(req.user.id,
        'You write concise post-class notes for students. Use markdown headings.',
        `Class title: ${cls.title}\nDescription: ${cls.description || '(none)'}\nDuration: ${dur} minutes\n${transcript ? 'Transcript / teacher notes:\n' + transcript : ''}\n\nWrite student-facing notes covering: 1) Key points (3-5 bullets), 2) Things to remember, 3) Practice/homework suggestion (1-2 items).`,
        { action: 'class-summary' });
      summary = out.text || '';
    } catch (e) {
      summary = `# ${cls.title}\n\n${cls.description || ''}\n\nClass duration: ${cls.duration || 60} min. (AI summary unavailable: ${e.message})`;
    }
    await supabaseAdmin.from('live_classes').update({ summary, summary_at: new Date().toISOString() }).eq('id', req.params.id);
    res.json({ summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
