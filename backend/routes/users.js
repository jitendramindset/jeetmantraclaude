const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      // Return basic user info from token if DB lookup fails
      return res.json({ message: 'Profile fetched from token', user: { id: req.user.id, email: req.user.email, role: req.user.role } });
    }

    // Remove password hash
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Profile fetched successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile.
// Only columns that actually exist on jeetmantra_users are accepted —
// extra fields from the dashboard form (institution, academicLevel, skills,
// qualifications, profileImage) are silently ignored rather than 400-ing the
// whole update.
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, email, bio, dateOfBirth, profileImage,
            street, city, state, postalCode, country,
            education, experience, altPhone, linkedinUrl, youtubeUrl, twitterUrl, instagramUrl, websiteUrl } = req.body;

    // Server-side enforcement: phone + email are mandatory on profile.
    // If the request explicitly sets either to empty, reject it.
    if (phone !== undefined && !String(phone).trim()) {
      return res.status(400).json({ error: 'Phone is required' });
    }
    if (email !== undefined && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const updates = {
      ...(fullName && { full_name: fullName }),
      ...(phone && { phone }),
      ...(email && { email }),
      ...(bio !== undefined && { bio }),
      ...(dateOfBirth && { date_of_birth: dateOfBirth }),
      ...(profileImage && { profile_image: profileImage }),
      ...(street !== undefined && { street }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state_region: state }),
      ...(postalCode !== undefined && { postal_code: postalCode }),
      ...(country !== undefined && { country }),
      ...(education !== undefined && { education }),
      ...(experience !== undefined && { experience }),
      ...(altPhone !== undefined && { alt_phone: altPhone }),
      ...(linkedinUrl !== undefined && { linkedin_url: linkedinUrl }),
      ...(youtubeUrl !== undefined && { youtube_url: youtubeUrl }),
      ...(twitterUrl !== undefined && { twitter_url: twitterUrl }),
      ...(instagramUrl !== undefined && { instagram_url: instagramUrl }),
      ...(websiteUrl !== undefined && { website_url: websiteUrl }),
      updated_at: new Date().toISOString()
    };

    const { data: updatedUser, error } = await supabaseAdmin
      .from('jeetmantra_users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(400).json({ error: 'Failed to update profile: ' + error.message });
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let stats = {};

    if (role === 'student') {
      // Get enrolled courses
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('*')
        .eq('student_id', userId);

      // Get attendance
      const { data: attendance } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('student_id', userId);

      // Get earnings
      const { data: earnings } = await supabaseAdmin
        .from('earnings')
        .select('amount')
        .eq('user_id', userId);

      stats = {
        enrolledCourses: enrollments?.length || 0,
        attendancePercentage: attendance ? 
          (attendance.filter(a => a.status === 'present').length / attendance.length * 100).toFixed(2) : 0,
        totalEarnings: earnings?.reduce((sum, e) => sum + e.amount, 0) || 0,
        upcomingClasses: enrollments?.length || 0
      };
    } else if (role === 'teacher') {
      // Get created courses
      const { data: courses } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('teacher_id', userId);

      // Get total students
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('*')
        .in('course_id', courses?.map(c => c.id) || []);

      // Get earnings
      const { data: earnings } = await supabaseAdmin
        .from('earnings')
        .select('amount')
        .eq('user_id', userId);

      stats = {
        coursesCreated: courses?.length || 0,
        totalStudents: enrollments?.length || 0,
        activeClasses: courses?.filter(c => c.is_active)?.length || 0,
        totalEarnings: earnings?.reduce((sum, e) => sum + e.amount, 0) || 0
      };
    } else if (role === 'partner') {
      // Get total bookings
      const { data: bookings } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('partner_id', userId);

      // Get earnings
      const { data: earnings } = await supabaseAdmin
        .from('earnings')
        .select('amount')
        .eq('user_id', userId);

      stats = {
        totalBookings: bookings?.length || 0,
        completedBookings: bookings?.filter(b => b.status === 'completed')?.length || 0,
        totalEarnings: earnings?.reduce((sum, e) => sum + e.amount, 0) || 0,
        rating: 4.5 // TODO: Calculate from reviews
      };
    }

    res.json({
      message: 'Stats fetched successfully',
      stats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
