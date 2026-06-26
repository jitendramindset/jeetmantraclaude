/**
 * courses.js — course catalog: public browse/detail + owner CRUD, students,
 *   analytics, duplication, reviews and a printable completion certificate.
 * Mount: /api/courses
 *
 * Endpoints:
 *   GET    /                                 🌐 PUBLIC — list active courses (or ?mine=1 → owner's, token-decoded)
 *   GET    /slug/:slug                       🌐 PUBLIC — fetch a course by SEO slug
 *   GET    /search/nearby                    🌐 PUBLIC — location/mode/city search with haversine ranking
 *   GET    /:id                              🌐 PUBLIC — course detail + teacher + enrolled count
 *   POST   /                                 🔒 course.create — create a course (institution-scoped)
 *   PUT    /:id                              🔒 course.edit, owner — update a course
 *   DELETE /:id                              🔒 course.delete, owner — delete a course
 *   GET    /:id/students                     🔒 owner/admin — enrolled students + progress + attendance
 *   GET    /:id/analytics                    🔒 owner/admin — aggregate metrics (students, completion, revenue)
 *   GET    /:id/students/:studentId/detail   🔒 owner/admin — per-student progress/subs/activity/doubts
 *   POST   /:id/duplicate                    🔒 CREATOR_ROLES, owner — deep-copy course + content
 *   GET    /:id/certificate                  🔒 enrolled ≥80% — printable HTML completion certificate
 *   GET    /:id/reviews                      🌐 PUBLIC — reviews list + average + count
 *   POST   /:id/reviews                      🔒 enrolled — upsert caller's 1-5 rating/review
 *
 * Notes: Public reads use supabaseAdmin and filter is_active where relevant.
 * Ownership is enforced by comparing courses.teacher_id to req.user.id (admins
 * bypass on the read/detail endpoints). Writes use requireCapability; create
 * tags institution_id via resolveInstitution (requireTeacher).
 */
const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { CREATOR_ROLES } = require('../config/roles');
const { resolveInstitution } = require('../middleware/resolveInstitution');
const { requireCapability } = require('../middleware/requireCapability');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// SEO slug helper: lowercase, strip accents/punctuation, hyphenate.
function slugify(s) {
  return String(s || '').toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// Haversine distance in km between two lat/long points.
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get all courses (public) or teacher's own courses (?mine=1 with auth token)
router.get('/', async (req, res) => {
  try {
    const { category, level, page = 1, limit = 12, mine } = req.query;
    // mine=1: return only courses owned by the authenticated teacher
    if (mine === '1') {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      let teacherId = null;
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jeetmantra_secret_2024');
          teacherId = decoded.id || decoded.userId || decoded.sub;
        } catch(e) {}
      }
      if (!teacherId) return res.json({ courses: [], _debug: 'no_teacher_id' });
      const { data: courses, error } = await supabaseAdmin
        .from('courses').select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[courses?mine=1] supabase error:', error.message);
        return res.json({ courses: [], _debug: error.message });
      }
      return res.json({ courses: courses || [] });
    }

    let query = supabaseAdmin.from('courses').select('*').eq('is_active', true);

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

// ── SEO: fetch a course by its slug (clean public URL). ────────────────
router.get('/slug/:slug', async (req, res) => {
  try {
    const { data: course } = await supabaseAdmin.from('courses').select('*').eq('slug', req.params.slug).maybeSingle();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ course });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── LOCATION SEARCH: find courses near a point (or by city), filter by mode.
// Query: lat, lng, radius(km, default 50), mode(online|offline|hybrid), city, q.
router.get('/search/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 50, mode, city, q } = req.query;
    let query = supabaseAdmin.from('courses').select('*').eq('is_active', true);
    if (mode) query = query.eq('class_mode', mode);
    if (city) query = query.ilike('city', `%${city}%`);
    if (q) query = query.ilike('title', `%${q}%`);
    const { data: courses, error } = await query.limit(300);
    if (error) return res.json({ courses: [] });
    let results = courses || [];
    // Distance ranking when caller shares coordinates.
    if (lat && lng) {
      const la = parseFloat(lat), lo = parseFloat(lng), rad = parseFloat(radius);
      results = results
        .map(c => (c.latitude != null && c.longitude != null)
          ? { ...c, distance_km: Math.round(distanceKm(la, lo, c.latitude, c.longitude) * 10) / 10 }
          : { ...c, distance_km: null })
        .filter(c => c.distance_km == null || c.distance_km <= rad)
        .sort((a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9));
    }
    res.json({ courses: results, count: results.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/courses/:id — public course detail + teacher info + enrolled count
router.get('/:id', async (req, res) => {
  try {
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get teacher info
    const { data: teacher } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('id, full_name, profile_image, institution')
      .eq('id', course.teacher_id)
      .single();

    // Get enrolled students count
    const { count: enrolledCount } = await supabaseAdmin
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
router.post('/', authenticateToken, requireCapability('course.create'), validate('courseCreate'), async (req, res) => {
  try {
    const courseId = uuidv4();
    const { title, description, category, level, price, startDate, endDate, maxStudents, batchTiming,
            metaDescription, keywords, slug: rawSlug, city, area, latitude, longitude, classMode,
            ageGroup, freeListing, demoClass, timing, instituteName } = req.validatedData;

    // SEO slug: from provided slug or title; sanitized + made unique with a short id.
    const baseSlug = slugify(rawSlug || title);
    const slug = baseSlug ? `${baseSlug}-${courseId.slice(0, 6)}` : courseId.slice(0, 8);

    // Only include optional columns when provided so DB defaults apply otherwise.
    const insertData = {
      id: courseId,
      teacher_id: req.user.id,
      title,
      description: description || '',
      category: category || 'General',
      level: level || 'beginner',
      price: price || 0,
      slug,
      meta_description: metaDescription || (description || '').slice(0, 160) || null,
      keywords: keywords || null,
      is_active: true,
      created_at: new Date().toISOString()
    };
    if (startDate) insertData.start_date = startDate;
    if (endDate) insertData.end_date = endDate;
    if (maxStudents) insertData.max_students = maxStudents;
    if (batchTiming) insertData.batch_timing = batchTiming;
    if (city) insertData.city = city;
    if (area) insertData.area = area;
    if (latitude != null && latitude !== '') insertData.latitude = Number(latitude);
    if (longitude != null && longitude !== '') insertData.longitude = Number(longitude);
    if (classMode) insertData.class_mode = classMode; // online | offline | hybrid
    if (ageGroup) insertData.age_group = ageGroup;
    if (timing) insertData.timing = timing;
    if (instituteName) insertData.institute_name = instituteName;
    if (typeof freeListing === 'boolean') insertData.free_listing = freeListing;
    if (typeof demoClass === 'boolean') insertData.demo_class = demoClass;

    // Tag the course to an institution so institute-scoped dashboards return it.
    // Prefer an explicit institutionId from the form, else the teacher's active
    // institution (X-Active-Institution header). Both are validated against
    // membership via resolveInstitution so a caller can't tag arbitrary orgs.
    // requireTeacher: tagging a course to an institution is a teaching action,
    // so only teaching membership qualifies (a user merely enrolled there as a
    // student must not be able to publish a course under that institution).
    let institutionId = req.validatedData.institutionId;
    if (institutionId && institutionId !== 'all') {
      const verified = await resolveInstitution({ headers: { 'x-active-institution': institutionId }, query: {}, user: req.user }, { requireTeacher: true });
      institutionId = verified && verified !== 'all' ? verified : null;
    } else {
      const active = await resolveInstitution(req, { requireTeacher: true });
      institutionId = active && active !== 'all' ? active : null;
    }
    if (institutionId) insertData.institution_id = institutionId;

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
router.put('/:id', authenticateToken, requireCapability('course.edit'), async (req, res) => {
  try {
    // Verify ownership
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('teacher_id')
      .eq('id', req.params.id)
      .single();

    if (!course || course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const { title, description, category, level, price, startDate, endDate, maxStudents, batchTiming, coverImage, is_active, archived,
            metaDescription, keywords, city, area, latitude, longitude, classMode,
            ageGroup, freeListing, demoClass, timing, instituteName } = req.body;
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
      ...(metaDescription !== undefined && { meta_description: metaDescription }),
      ...(keywords !== undefined && { keywords }),
      ...(city !== undefined && { city }),
      ...(area !== undefined && { area }),
      ...(latitude !== undefined && latitude !== '' && { latitude: Number(latitude) }),
      ...(longitude !== undefined && longitude !== '' && { longitude: Number(longitude) }),
      ...(classMode !== undefined && { class_mode: classMode }),
      ...(ageGroup !== undefined && { age_group: ageGroup }),
      ...(timing !== undefined && { timing }),
      ...(instituteName !== undefined && { institute_name: instituteName }),
      ...(typeof freeListing === 'boolean' && { free_listing: freeListing }),
      ...(typeof demoClass === 'boolean' && { demo_class: demoClass }),
      ...(typeof is_active !== 'undefined' && { is_active }),
      ...(typeof archived !== 'undefined' && { archived }),
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
router.delete('/:id', authenticateToken, requireCapability('course.delete'), async (req, res) => {
  try {
    // Verify ownership
    const { data: course } = await supabaseAdmin
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
      const pct = totalLectures ? Math.min(100, Math.round(((present || 0) / totalLectures) * 100)) : 0;
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

// GET /api/courses/:id/analytics — aggregate course analytics for the workspace
// Analytics tab: students, completion rate, average attendance, revenue.
// Teacher/admin only. Each metric is guarded so a missing table/column yields 0.
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id, title, price').eq('id', courseId).single();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.user.role !== 'admin' && course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your course' });
    }
    const [enrollments, totalLecturesRes, presentRes, paymentsRes] = await Promise.all([
      supabaseAdmin.from('enrollments').select('id, student_id, progress_percentage, status').eq('course_id', courseId).then(r => r.data || []).catch(() => []),
      supabaseAdmin.from('course_lectures').select('id', { count: 'exact', head: true }).eq('course_id', courseId).then(r => r.count || 0).catch(() => 0),
      supabaseAdmin.from('attendance').select('id', { count: 'exact', head: true }).eq('course_id', courseId).eq('status', 'present').then(r => r.count || 0).catch(() => 0),
      supabaseAdmin.from('payments').select('amount, status').eq('course_id', courseId).then(r => r.data || []).catch(() => [])
    ]);
    const studentCount = new Set(enrollments.map(e => e.student_id)).size;
    const totalLectures = totalLecturesRes || 0;
    // Completion: prefer stored progress_percentage; fall back to attendance ratio.
    const withProgress = enrollments.filter(e => e.progress_percentage != null);
    let completionRate;
    if (withProgress.length) {
      completionRate = Math.round(withProgress.reduce((s, e) => s + Number(e.progress_percentage || 0), 0) / withProgress.length);
    } else {
      completionRate = (totalLectures && studentCount) ? Math.min(100, Math.round((presentRes / (studentCount * totalLectures)) * 100)) : 0;
    }
    const avgAttendance = (totalLectures && studentCount) ? Math.min(100, Math.round((presentRes / (studentCount * totalLectures)) * 100)) : 0;
    // Revenue: sum of completed payments, else estimate paid enrollments × price.
    let revenue = paymentsRes
      .filter(p => !p.status || ['paid', 'success', 'completed', 'captured'].includes(String(p.status).toLowerCase()))
      .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    if (!revenue && course.price) revenue = studentCount * Number(course.price || 0);
    res.json({
      analytics: {
        students: studentCount,
        completionRate,
        avgAttendance,
        revenue,
        totalLectures,
        presentRecords: presentRes
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PER-STUDENT DETAIL: progress, attendance, assignment + test submissions,
// recent activity, and course-chat messages (doubts/questions). Teacher/admin
// only. Powers the student-detail panel.
router.get('/:id/students/:studentId/detail', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id, studentId = req.params.studentId;
    const { data: course } = await supabaseAdmin.from('courses').select('teacher_id, title').eq('id', courseId).single();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.user.role !== 'admin' && course.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });

    const { data: student } = await supabaseAdmin.from('jeetmantra_users')
      .select('id, full_name, email, phone, last_active').eq('id', studentId).single();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Lectures total + attendance present count.
    const [{ count: totalLectures }, { count: present }, { data: enrollment }] = await Promise.all([
      supabaseAdmin.from('course_lectures').select('id', { count: 'exact', head: true }).eq('course_id', courseId),
      supabaseAdmin.from('attendance').select('id', { count: 'exact', head: true }).eq('course_id', courseId).eq('student_id', studentId).eq('status', 'present'),
      supabaseAdmin.from('enrollments').select('*').eq('course_id', courseId).eq('student_id', studentId).maybeSingle()
    ]);
    const progressPct = totalLectures ? Math.min(100, Math.round(((present || 0) / totalLectures) * 100)) : (enrollment?.progress_percentage || 0);

    // Assignment submissions by this student in this course (student_id rows are
    // the per-student submissions; join template title via parent_id).
    const { data: subs } = await supabaseAdmin.from('assignments')
      .select('id, parent_id, title, status, grade, feedback, submission_url, updated_at, due_date')
      .eq('course_id', courseId).eq('student_id', studentId).order('updated_at', { ascending: false });

    // Test submissions: test_submissions joined to course_tests for titles.
    const { data: courseTests } = await supabaseAdmin.from('course_tests').select('id, title, total_marks').eq('course_id', courseId);
    const testIds = (courseTests || []).map(t => t.id);
    let testSubs = [];
    if (testIds.length) {
      const { data: ts } = await supabaseAdmin.from('test_submissions')
        .select('test_id, score, status, submitted_at').eq('student_id', studentId).in('test_id', testIds);
      const testById = Object.fromEntries((courseTests || []).map(t => [t.id, t]));
      testSubs = (ts || []).map(s => ({ ...s, title: testById[s.test_id]?.title || 'Test', total_marks: testById[s.test_id]?.total_marks || 100 }));
    }

    // Recent activity by this student in this course.
    const { data: activity } = await supabaseAdmin.from('activity_feed')
      .select('event_type, message, created_at').eq('actor_id', studentId).eq('course_id', courseId)
      .order('created_at', { ascending: false }).limit(20);

    // Doubts/questions: messages this student posted in the course chat room.
    let doubts = [];
    try {
      const { data: room } = await supabaseAdmin.from('chat_rooms').select('id').eq('course_id', courseId).eq('type', 'course').maybeSingle();
      if (room) {
        const { data: msgs } = await supabaseAdmin.from('chat_messages')
          .select('content, created_at').eq('room_id', room.id).eq('sender_id', studentId)
          .order('created_at', { ascending: false }).limit(20);
        doubts = msgs || [];
      }
    } catch (e) { /* chat not available */ }

    res.json({
      student,
      progress: { percentage: progressPct, attended_lectures: present || 0, total_lectures: totalLectures || 0, enrolled_at: enrollment?.enrollment_date || enrollment?.created_at || null },
      assignments: subs || [],
      tests: testSubs,
      activity: activity || [],
      doubts
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DUPLICATE COURSE: deep-copies a course + its topics/lectures/materials/
// tests/questions into a new "(Copy)" course owned by the same teacher.
router.post('/:id/duplicate', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  let newId;
  try {
    const srcId = req.params.id;
    const { data: src } = await supabaseAdmin.from('courses').select('*').eq('id', srcId).single();
    if (!src) return res.status(404).json({ error: 'Course not found' });
    if (src.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your course' });

    newId = uuidv4();
    const { id, created_at, updated_at, ...rest } = src;
    await supabaseAdmin.from('courses').insert({
      ...rest, id: newId, title: (src.title || 'Course') + ' (Copy)',
      is_active: false, created_at: new Date().toISOString()
    });

    // Copy topics, remembering old→new id map so child rows can re-link.
    const topicMap = {};
    const { data: topics } = await supabaseAdmin.from('course_topics').select('*').eq('course_id', srcId);
    for (const t of (topics || [])) {
      const nt = uuidv4(); topicMap[t.id] = nt;
      const { id: _i, created_at: _c, ...tr } = t;
      await supabaseAdmin.from('course_topics').insert({ ...tr, id: nt, course_id: newId });
    }
    const { data: lectures } = await supabaseAdmin.from('course_lectures').select('*').eq('course_id', srcId);
    for (const l of (lectures || [])) {
      const { id: _i, created_at: _c, ...lr } = l;
      await supabaseAdmin.from('course_lectures').insert({ ...lr, id: uuidv4(), course_id: newId, topic_id: topicMap[l.topic_id] || null });
    }
    const { data: materials } = await supabaseAdmin.from('course_materials').select('*').eq('course_id', srcId);
    for (const m of (materials || [])) {
      const { id: _i, created_at: _c, ...mr } = m;
      await supabaseAdmin.from('course_materials').insert({ ...mr, id: uuidv4(), course_id: newId, topic_id: topicMap[m.topic_id] || null });
    }
    // Copy tests + their questions.
    const { data: tests } = await supabaseAdmin.from('course_tests').select('*').eq('course_id', srcId);
    for (const t of (tests || [])) {
      const nt = uuidv4();
      const { id: _i, created_at: _c, ...tr } = t;
      await supabaseAdmin.from('course_tests').insert({ ...tr, id: nt, course_id: newId, topic_id: topicMap[t.topic_id] || null });
      const { data: qs } = await supabaseAdmin.from('course_questions').select('*').eq('test_id', t.id);
      for (const q of (qs || [])) {
        const { id: _qi, created_at: _qc, ...qr } = q;
        await supabaseAdmin.from('course_questions').insert({ ...qr, id: uuidv4(), test_id: nt, section_id: null });
      }
    }
    res.status(201).json({ message: 'Course duplicated', courseId: newId });
  } catch (e) {
    console.error('duplicate error', e);
    // Rollback: clean up partial data if the duplicate failed mid-way.
    // This is a best-effort cleanup since Supabase JS doesn't support
    // multi-table transactions. Delete in reverse dependency order.
    if (typeof newId !== 'undefined') {
      try {
        await supabaseAdmin.from('course_questions').delete().in('test_id',
          ((await supabaseAdmin.from('course_tests').select('id').eq('course_id', newId)).data || []).map(t => t.id));
        await supabaseAdmin.from('course_tests').delete().eq('course_id', newId);
        await supabaseAdmin.from('course_materials').delete().eq('course_id', newId);
        await supabaseAdmin.from('course_lectures').delete().eq('course_id', newId);
        await supabaseAdmin.from('course_topics').delete().eq('course_id', newId);
        await supabaseAdmin.from('courses').delete().eq('id', newId);
        console.log('duplicate rollback: cleaned up partial course', newId);
      } catch (cleanupErr) {
        console.error('duplicate rollback failed:', cleanupErr.message);
      }
    }
    res.status(500).json({ error: 'Duplication failed: ' + e.message });
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

// ── COURSE REVIEWS — student rates 1-5 with optional text. One review per
// student per course (UNIQUE constraint at the DB). Marketplace cards read
// average + count from here.
router.get('/:id/reviews', async (req, res) => {
  try {
    const { data: rows } = await supabaseAdmin.from('course_reviews')
      .select('*').eq('course_id', req.params.id).order('created_at', { ascending: false });
    const ids = (rows || []).map(r => r.student_id);
    let users = {};
    if (ids.length) {
      const { data: u } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, profile_image').in('id', ids);
      users = Object.fromEntries((u || []).map(x => [x.id, x]));
    }
    const reviews = (rows || []).map(r => ({ ...r, user: users[r.student_id] || null }));
    const avg = reviews.length ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2) : 0;
    res.json({ reviews, average: avg, count: reviews.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/courses/:id/reviews — enrolled student upserts their 1-5 rating/review
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, review } = req.body || {};
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return res.status(400).json({ error: 'rating must be 1-5' });
    // Must be enrolled in the course to review.
    const { data: enr } = await supabaseAdmin.from('enrollments')
      .select('id').eq('course_id', req.params.id).eq('student_id', req.user.id).maybeSingle();
    if (!enr) return res.status(403).json({ error: 'Enroll first before reviewing' });
    // UPSERT — students can update their own review.
    const { data: existing } = await supabaseAdmin.from('course_reviews')
      .select('id').eq('course_id', req.params.id).eq('student_id', req.user.id).maybeSingle();
    if (existing) {
      const { data, error } = await supabaseAdmin.from('course_reviews').update({ rating: r, review: review || null })
        .eq('id', existing.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ review: data, updated: true });
    }
    const { data, error } = await supabaseAdmin.from('course_reviews').insert({
      id: uuidv4(), course_id: req.params.id, student_id: req.user.id, rating: r, review: review || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ review: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
