const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data based on role
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let dashboardData = {};

    if (role === 'student') {
      // Get enrolled courses with progress
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            category,
            teacher_id,
            batch_timing,
            price
          )
        `)
        .eq('student_id', userId)
        .limit(6);

      // Get live classes
      const { data: liveClasses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_live', true)
        .limit(3);

      // Get recorded lectures
      const { data: recordedLectures } = await supabase
        .from('lectures')
        .select('*')
        .eq('is_recorded', true)
        .limit(5);

      // Get homework
      const { data: homework } = await supabase
        .from('assignments')
        .select('*')
        .eq('student_id', userId)
        .order('due_date', { ascending: true })
        .limit(5);

      // Get skills this week
      const { data: skills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(3);

      // Get class feedback
      const { data: feedback } = await supabase
        .from('feedback')
        .select('*')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      dashboardData = {
        enrolledCourses: enrollments || [],
        liveClasses: liveClasses || [],
        recordedLectures: recordedLectures || [],
        homework: homework || [],
        skillsThisWeek: skills || [],
        classReviews: feedback || []
      };
    } else if (role === 'teacher') {
      // Get created courses
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', userId);

      // Get bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .in('course_id', courses?.map(c => c.id) || [])
        .limit(10);

      // Get attendance records
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .in('course_id', courses?.map(c => c.id) || [])
        .order('date', { ascending: false })
        .limit(20);

      // Get live classes
      const { data: liveClasses } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', userId)
        .eq('is_live', true);

      dashboardData = {
        courses: courses || [],
        bookings: bookings || [],
        attendance: attendance || [],
        liveClasses: liveClasses || []
      };
    } else if (role === 'partner') {
      // Get bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('partner_id', userId)
        .order('booking_date', { ascending: false });

      // Get ratings/feedback
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('partner_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get earnings
      const { data: earnings } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(10);

      dashboardData = {
        bookings: bookings || [],
        reviews: reviews || [],
        earnings: earnings || []
      };
    }

    res.json({
      message: 'Dashboard data fetched successfully',
      dashboard: dashboardData
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
