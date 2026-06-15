const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Optional institution-scoping. When the client sends X-Active-Institution: <id>
// (or ?inst=<id>), we narrow course lists to those owned by that institution.
// Validates membership: the caller must be linked to the institution as a
// teacher or student, else the header is ignored.
async function resolveInstitution(req) {
  const id = req.headers['x-active-institution'] || req.query.inst;
  if (!id) return null;
  const userId = req.user.id;
  const [{ data: t }, { data: s }] = await Promise.all([
    require('../config/supabase').supabaseAdmin.from('institution_teachers').select('id').eq('institution_id', id).eq('teacher_id', userId).maybeSingle(),
    require('../config/supabase').supabaseAdmin.from('institution_students').select('id').eq('institution_id', id).eq('student_id', userId).maybeSingle()
  ]);
  return (t || s) ? id : null;
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const instId = await resolveInstitution(req);
    let dashboardData = {};

    if (role === 'student') {
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('*, courses(id,title,category,teacher_id,batch_timing,price,cover_image)')
        .eq('student_id', userId).limit(6);
      const enrolledCourseIds = (enrollments || []).map(e => e.course_id);
      const hasCourses = enrolledCourseIds.length > 0;
      const empty = Promise.resolve({ data: [] });

      // All of the following are independent (depend only on userId / courseIds),
      // so run them CONCURRENTLY instead of ~8 serial round-trips.
      const [
        { data: liveClasses }, { data: lectureCounts }, { data: attendCounts },
        { data: recordedLectures }, { data: homework }, { data: skills },
        { data: feedback }, { data: purchases }
      ] = await Promise.all([
        hasCourses ? supabaseAdmin.from('live_classes').select('*, courses(title)').in('course_id', enrolledCourseIds).in('status', ['scheduled', 'live']).order('scheduled_time', { ascending: true }).limit(5) : empty,
        hasCourses ? supabaseAdmin.from('course_lectures').select('course_id').in('course_id', enrolledCourseIds) : empty,
        hasCourses ? supabaseAdmin.from('attendance').select('course_id').eq('student_id', userId).eq('status', 'present').in('course_id', enrolledCourseIds) : empty,
        supabaseAdmin.from('lectures').select('*').eq('is_recorded', true).limit(5),
        supabaseAdmin.from('assignments').select('*').eq('student_id', userId).order('due_date', { ascending: true }).limit(5),
        supabaseAdmin.from('user_skills').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(3),
        supabaseAdmin.from('feedback').select('*').eq('from_user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabaseAdmin.from('marketplace_purchases').select('*, marketplace_listings(*, courses(title,category))').eq('buyer_id', userId).limit(5)
      ]);

      // Batched progress maps (no N+1).
      const lectureCountMap = {}, attendCountMap = {};
      (lectureCounts || []).forEach(l => { lectureCountMap[l.course_id] = (lectureCountMap[l.course_id] || 0) + 1; });
      (attendCounts || []).forEach(a => { attendCountMap[a.course_id] = (attendCountMap[a.course_id] || 0) + 1; });
      const enrichedEnrollments = (enrollments || []).map(e => {
        const total = lectureCountMap[e.course_id] || 0;
        const present = attendCountMap[e.course_id] || 0;
        const pct = total ? Math.round((present / total) * 100) : (e.progress_percentage || 0);
        return { ...e, progress_percentage: pct, attended_lectures: present, total_lectures: total };
      });
      dashboardData = {
        enrolledCourses: enrichedEnrollments,
        liveClasses: liveClasses || [],
        recordedLectures: recordedLectures || [],
        homework: homework || [],
        skillsThisWeek: skills || [],
        classReviews: feedback || [],
        marketplacePurchases: purchases || []
      };

    } else if (role === 'teacher') {
      // When an active institution is set, narrow to courses the teacher
      // teaches inside THAT institution. Without the header, behavior is
      // unchanged (every course they own).
      let teacherCoursesQ = supabaseAdmin.from('courses').select('*').eq('teacher_id', userId);
      if (instId) teacherCoursesQ = teacherCoursesQ.eq('institution_id', instId);
      const { data: courses } = await teacherCoursesQ;
      const courseIds = courses?.map(c => c.id) || [];
      const { data: bookings } = courseIds.length
        ? await supabaseAdmin.from('bookings').select('*').in('course_id', courseIds).limit(10)
        : { data: [] };
      const { data: attendance } = courseIds.length
        ? await supabaseAdmin.from('attendance').select('*').in('course_id', courseIds).order('date', { ascending: false }).limit(20)
        : { data: [] };
      // Real live classes from live_classes table (was incorrectly querying courses)
      const { data: liveClasses } = courseIds.length
        ? await supabaseAdmin.from('live_classes').select('*, courses(title)').in('course_id', courseIds).order('scheduled_time', { ascending: false }).limit(10)
        : { data: [] };
      // Enrollments for the teacher's courses — used by Take Attendance modal
      const { data: enrollments } = courseIds.length
        ? await supabaseAdmin.from('enrollments').select('id, course_id, student_id, status, courses(title)').in('course_id', courseIds).limit(50)
        : { data: [] };
      // Attach student names for the picker
      let enrichedEnrollments = enrollments || [];
      if (enrichedEnrollments.length) {
        const studentIds = [...new Set(enrichedEnrollments.map(e => e.student_id))];
        const { data: students } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', studentIds);
        const byId = Object.fromEntries((students || []).map(s => [s.id, s]));
        enrichedEnrollments = enrichedEnrollments.map(e => ({
          ...e,
          student_name: byId[e.student_id]?.full_name || byId[e.student_id]?.email || 'Student'
        }));
      }
      const { data: earnings } = await supabaseAdmin.from('earnings').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10);
      const { data: listings } = await supabaseAdmin.from('marketplace_listings').select('*, courses(title)').eq('seller_id', userId);
      const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
      dashboardData = {
        courses: courses || [],
        bookings: bookings || [],
        attendance: attendance || [],
        liveClasses: liveClasses || [],
        enrollments: enrichedEnrollments,
        earnings: earnings || [],
        totalEarnings,
        marketplaceListings: listings || []
      };

    } else if (role === 'partner') {
      // Partner-specific bookings (service bookings, by partner_id)
      const { data: partnerBookings } = await supabaseAdmin.from('bookings').select('*').eq('partner_id', userId).order('booking_date', { ascending: false });
      // Add all the creator-style data (courses they own, live classes, etc.)
      const creator = await fetchCreatorData(userId);
      dashboardData = {
        ...creator,
        // Override bookings with partner-specific (preserves the old semantics for the partner stats)
        bookings: partnerBookings || creator.bookings
      };

    } else if (role === 'admin') {
      const { data: allUsers } = await supabaseAdmin
        .from('jeetmantra_users')
        .select('id,email,full_name,user_type,created_at,is_active')
        .order('created_at', { ascending: false }).limit(20);
      const { data: allCourses } = await supabaseAdmin
        .from('courses')
        .select('id,title,category,price,is_active,created_at')
        .order('created_at', { ascending: false }).limit(20);
      const { data: recentPayments } = await supabaseAdmin.from('payments').select('*').order('created_at', { ascending: false }).limit(10);
      const { data: marketplaceListings } = await supabaseAdmin
        .from('marketplace_listings')
        .select('*, courses(title)')
        .limit(20);
      const { count: userCount } = await supabaseAdmin.from('jeetmantra_users').select('id', { count: 'exact', head: true }).neq('status', 'deleted');
      const { count: courseCount } = await supabaseAdmin.from('courses').select('id', { count: 'exact', head: true });
      dashboardData = {
        users: allUsers || [],
        courses: allCourses || [],
        recentPayments: recentPayments || [],
        marketplaceListings: marketplaceListings || [],
        stats: { totalUsers: userCount || 0, totalCourses: courseCount || 0 }
      };

    } else if (role === 'school') {
      const { data: profile } = await supabaseAdmin.from('school_profiles').select('*').eq('user_id', userId).single();
      const { data: activeCourses } = await supabaseAdmin.from('courses').select('*').eq('is_active', true).limit(12);
      const { data: payments } = await supabaseAdmin.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
      const creator = await fetchCreatorData(userId);
      dashboardData = {
        ...creator,
        profile: profile || {},
        availableCourses: activeCourses || [],
        payments: payments || []
      };

    } else if (role === 'coaching') {
      const { data: profile } = await supabaseAdmin.from('coaching_profiles').select('*').eq('user_id', userId).single();
      const { data: activeCourses } = await supabaseAdmin.from('courses').select('*').eq('is_active', true).limit(12);
      const creator = await fetchCreatorData(userId);
      dashboardData = {
        ...creator,
        profile: profile || {},
        availableCourses: activeCourses || []
      };
    }

    res.json({ message: 'Dashboard data fetched successfully', role, dashboard: dashboardData });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Shared computation: any user who can OWN courses (teacher, school,
// coaching, partner) gets back their owned courses + the same downstream
// arrays. Returns a partial dashboardData object ready to merge into the
// role-specific one.
async function fetchCreatorData(userId) {
  const { data: courses } = await supabaseAdmin.from('courses').select('*').eq('teacher_id', userId);
  const courseIds = (courses || []).map(c => c.id);
  let bookings = [], attendance = [], liveClasses = [], enrollments = [];
  if (courseIds.length) {
    [bookings, attendance, liveClasses, enrollments] = await Promise.all([
      supabaseAdmin.from('bookings').select('*').in('course_id', courseIds).limit(10).then(r => r.data || []),
      supabaseAdmin.from('attendance').select('*').in('course_id', courseIds).order('date', { ascending: false }).limit(20).then(r => r.data || []),
      supabaseAdmin.from('live_classes').select('*, courses(title)').in('course_id', courseIds).order('scheduled_time', { ascending: false }).limit(10).then(r => r.data || []),
      supabaseAdmin.from('enrollments').select('id, course_id, student_id, status, courses(title)').in('course_id', courseIds).limit(50).then(r => r.data || [])
    ]);
    // Hydrate student names on enrollments
    if (enrollments.length) {
      const sids = [...new Set(enrollments.map(e => e.student_id))];
      const { data: students } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', sids);
      const byId = Object.fromEntries((students || []).map(s => [s.id, s]));
      enrollments = enrollments.map(e => ({ ...e, student_name: byId[e.student_id]?.full_name || byId[e.student_id]?.email || 'Student' }));
    }
  }
  const { data: earnings } = await supabaseAdmin.from('earnings').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10);
  const { data: listings } = await supabaseAdmin.from('marketplace_listings').select('*, courses(title)').eq('seller_id', userId);
  const totalEarnings = (earnings || []).reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  return {
    courses: courses || [],
    bookings, attendance, liveClasses, enrollments,
    earnings: earnings || [],
    totalEarnings,
    marketplaceListings: listings || []
  };
}

module.exports = router;
