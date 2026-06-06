const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let dashboardData = {};

    if (role === 'student') {
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('*, courses(id,title,category,teacher_id,batch_timing,price)')
        .eq('student_id', userId).limit(6);
      const { data: liveClasses } = await supabaseAdmin.from('courses').select('*').eq('is_live', true).limit(3);
      const { data: recordedLectures } = await supabaseAdmin.from('lectures').select('*').eq('is_recorded', true).limit(5);
      const { data: homework } = await supabaseAdmin.from('assignments').select('*').eq('student_id', userId).order('due_date', { ascending: true }).limit(5);
      const { data: skills } = await supabaseAdmin.from('user_skills').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(3);
      const { data: feedback } = await supabaseAdmin.from('feedback').select('*').eq('from_user_id', userId).order('created_at', { ascending: false }).limit(5);
      const { data: purchases } = await supabaseAdmin.from('marketplace_purchases').select('*, marketplace_listings(*, courses(title,category))').eq('buyer_id', userId).limit(5);
      dashboardData = {
        enrolledCourses: enrollments || [],
        liveClasses: liveClasses || [],
        recordedLectures: recordedLectures || [],
        homework: homework || [],
        skillsThisWeek: skills || [],
        classReviews: feedback || [],
        marketplacePurchases: purchases || []
      };

    } else if (role === 'teacher') {
      const { data: courses } = await supabaseAdmin.from('courses').select('*').eq('teacher_id', userId);
      const courseIds = courses?.map(c => c.id) || [];
      const { data: bookings } = courseIds.length
        ? await supabaseAdmin.from('bookings').select('*').in('course_id', courseIds).limit(10)
        : { data: [] };
      const { data: attendance } = courseIds.length
        ? await supabaseAdmin.from('attendance').select('*').in('course_id', courseIds).order('date', { ascending: false }).limit(20)
        : { data: [] };
      const { data: liveClasses } = await supabaseAdmin.from('courses').select('*').eq('teacher_id', userId).eq('is_live', true);
      const { data: earnings } = await supabaseAdmin.from('earnings').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10);
      const { data: listings } = await supabaseAdmin.from('marketplace_listings').select('*, courses(title)').eq('seller_id', userId);
      const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
      dashboardData = {
        courses: courses || [],
        bookings: bookings || [],
        attendance: attendance || [],
        liveClasses: liveClasses || [],
        earnings: earnings || [],
        totalEarnings,
        marketplaceListings: listings || []
      };

    } else if (role === 'partner') {
      const { data: bookings } = await supabaseAdmin.from('bookings').select('*').eq('partner_id', userId).order('booking_date', { ascending: false });
      const { data: earnings } = await supabaseAdmin.from('earnings').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10);
      const { data: listings } = await supabaseAdmin.from('marketplace_listings').select('*, courses(title,category)').eq('seller_id', userId);
      const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
      dashboardData = {
        bookings: bookings || [],
        earnings: earnings || [],
        totalEarnings,
        marketplaceListings: listings || []
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
      const { count: userCount } = await supabaseAdmin.from('jeetmantra_users').select('id', { count: 'exact', head: true });
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
      const { data: enrollments } = await supabaseAdmin.from('enrollments').select('*, courses(title,category)').eq('student_id', userId).limit(10);
      dashboardData = {
        profile: profile || {},
        availableCourses: activeCourses || [],
        payments: payments || [],
        enrollments: enrollments || []
      };

    } else if (role === 'coaching') {
      const { data: profile } = await supabaseAdmin.from('coaching_profiles').select('*').eq('user_id', userId).single();
      const { data: activeCourses } = await supabaseAdmin.from('courses').select('*').eq('is_active', true).limit(12);
      const { data: earnings } = await supabaseAdmin.from('earnings').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10);
      const { data: listings } = await supabaseAdmin.from('marketplace_listings').select('*, courses(title,category)').eq('seller_id', userId);
      const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
      dashboardData = {
        profile: profile || {},
        availableCourses: activeCourses || [],
        earnings: earnings || [],
        totalEarnings,
        marketplaceListings: listings || []
      };
    }

    res.json({ message: 'Dashboard data fetched successfully', role, dashboard: dashboardData });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
