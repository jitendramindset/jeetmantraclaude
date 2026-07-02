/**
 * dashboard.js — single role-aware dashboard aggregator.
 * Mount: /api/dashboard
 *
 * Endpoints:
 *   GET /   🔒 — role-specific dashboard payload (see below)
 *
 * Notes: One authenticated endpoint that branches on req.user.role to assemble
 * the home dashboard:
 *   - student          → enrollments (+progress), live classes, recorded lectures,
 *                        homework, skills, reviews, marketplace purchases
 *   - teacher          → owned courses (institution-scoped via X-Active-Institution),
 *                        bookings, attendance, live classes, enrollments, earnings +
 *                        a command-center KPI block (concurrent, each guarded → 0)
 *   - partner/school/coaching → fetchCreatorData() base + role extras
 *   - admin            → recent users/courses/payments/listings + platform stats
 * Queries run concurrently where independent; per-metric failures degrade to 0
 * rather than failing the whole response.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { resolveInstitution } = require('../middleware/resolveInstitution');
const { countUnread } = require('../services/chatUnread');

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


// GET /api/dashboard — assemble the role-specific dashboard payload
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
      // When a SPECIFIC active institution is set, narrow to courses the teacher
      // teaches inside THAT institution. 'all' (combined view) or no header →
      // every course they own (the union across all their institutions).
      let teacherCoursesQ = supabaseAdmin.from('courses').select('*').eq('teacher_id', userId);
      if (instId && instId !== 'all') teacherCoursesQ = teacherCoursesQ.eq('institution_id', instId);
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

      // ── Command-center KPI metrics. Each query is guarded so one failure
      // (e.g. a column absent on a given deploy) yields 0 instead of blanking
      // the whole dashboard. Run concurrently — all depend only on courseIds.
      const nowIso = new Date().toISOString();
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const notifSince = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const [studentsCount, pendingAssignments, upcomingClasses, recordingsCount, testsPending, notifications, unreadMessages, monthEarnRows] = await Promise.all([
        courseIds.length
          ? supabaseAdmin.from('enrollments').select('student_id').in('course_id', courseIds)
              .then(r => new Set((r.data || []).map(e => e.student_id)).size).catch(() => 0)
          : Promise.resolve(0),
        courseIds.length
          ? supabaseAdmin.from('assignments').select('id', { count: 'exact', head: true })
              .in('course_id', courseIds).not('student_id', 'is', null).is('grade', null)
              .then(r => r.count || 0).catch(() => 0)
          : Promise.resolve(0),
        courseIds.length
          ? supabaseAdmin.from('live_classes').select('id', { count: 'exact', head: true })
              .in('course_id', courseIds).eq('status', 'scheduled').gte('scheduled_time', nowIso)
              .then(r => r.count || 0).catch(() => 0)
          : Promise.resolve(0),
        courseIds.length
          ? supabaseAdmin.from('live_classes').select('id', { count: 'exact', head: true })
              .in('course_id', courseIds).not('recording_url', 'is', null)
              .then(r => r.count || 0).catch(() => 0)
          : Promise.resolve(0),
        courseIds.length
          ? supabaseAdmin.from('course_tests').select('id', { count: 'exact', head: true })
              .in('course_id', courseIds).not('scheduled_for', 'is', null).gte('scheduled_for', nowIso)
              .then(r => r.count || 0).catch(() => 0)
          : Promise.resolve(0),
        courseIds.length
          ? supabaseAdmin.from('activity_feed').select('id', { count: 'exact', head: true })
              .or(`target_user_id.eq.${userId},course_id.in.(${courseIds.join(',')})`).gte('created_at', notifSince)
              .then(r => r.count || 0).catch(() => 0)
          : supabaseAdmin.from('activity_feed').select('id', { count: 'exact', head: true })
              .eq('target_user_id', userId).gte('created_at', notifSince).then(r => r.count || 0).catch(() => 0),
        countUnread(userId).catch(() => 0),
        supabaseAdmin.from('earnings').select('amount').eq('user_id', userId)
          .gte('date', monthStart.toISOString()).then(r => r.data || []).catch(() => [])
      ]);
      const monthlyEarnings = monthEarnRows.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

      dashboardData = {
        courses: courses || [],
        bookings: bookings || [],
        attendance: attendance || [],
        liveClasses: liveClasses || [],
        enrollments: enrichedEnrollments,
        earnings: earnings || [],
        totalEarnings,
        // Command-center KPIs
        monthlyEarnings,
        studentsCount,
        pendingAssignments,
        upcomingClasses,
        recordingsCount,
        testsPending,
        notifications,
        unreadMessages,
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
