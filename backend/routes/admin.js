const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    let query = supabaseAdmin.from('jeetmantra_users').select('*');

    if (role) query = query.eq('user_type', role);
    if (status) query = query.eq('is_active', status === 'active');
    
    const offset = (page - 1) * limit;
    const { data: users, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({
      message: 'Users fetched successfully',
      users,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Block/Unblock user (admin only)
router.put('/users/:userId/toggle-status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current status
    const { data: user, error: userError } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('is_active')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (typeof user.is_active === 'undefined') {
      return res.status(400).json({ error: 'Cannot toggle status: is_active column not present in user schema' });
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('jeetmantra_users')
      .update({ 
        is_active: !user.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update user status' });
    }

    res.json({
      message: 'User status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get platform statistics (admin only)
router.get('/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // Get user counts by role
    const { count: studentCount } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'student');

    const { count: teacherCount } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'teacher');

    const { count: partnerCount } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'partner');

    // Get course stats
    const { count: coursesCount } = await supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact' });

    // Get enrollment stats
    const { count: enrollmentsCount } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact' });

    // Get revenue
    const { data: revenues } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = revenues?.reduce((sum, p) => sum + p.amount, 0) || 0;

    res.json({
      message: 'Platform statistics fetched successfully',
      stats: {
        users: {
          students: studentCount,
          teachers: teacherCount,
          partners: partnerCount,
          total: (studentCount || 0) + (teacherCount || 0) + (partnerCount || 0)
        },
        courses: coursesCount,
        enrollments: enrollmentsCount,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ── ADMIN USER DETAIL: deep view of one user.
router.get('/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const [{ data: user }, { data: courses }, { data: enrollments }, { data: payments }] = await Promise.all([
      supabaseAdmin.from('jeetmantra_users').select('*').eq('id', userId).single(),
      supabaseAdmin.from('courses').select('id, title, is_active').eq('teacher_id', userId),
      supabaseAdmin.from('enrollments').select('id, course_id, progress, status, enrolled_at, courses(title)').eq('student_id', userId),
      supabaseAdmin.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
    ]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    delete user.password_hash; delete user.pass_hash; delete user.password;
    res.json({ user, ownedCourses: courses || [], enrollments: enrollments || [], payments: payments || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { fullName, role, status } = req.body || {};
    const updates = { updated_at: new Date().toISOString() };
    if (fullName !== undefined) updates.full_name = fullName;
    if (role !== undefined) updates.user_type = role;
    if (status !== undefined) updates.status = status;
    const { data, error } = await supabaseAdmin.from('jeetmantra_users').update(updates).eq('id', req.params.userId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    await supabaseAdmin.from('audit_log').insert({
      id: require('uuid').v4(), actor_id: req.user.id, action: 'user.update',
      target_id: req.params.userId, metadata: updates, occurred_at: new Date().toISOString()
    }).catch(() => {});
    delete data.password_hash;
    res.json({ user: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    if (req.params.userId === req.user.id) return res.status(400).json({ error: "Can't delete your own admin account" });
    await supabaseAdmin.from('jeetmantra_users').update({ status: 'deleted', updated_at: new Date().toISOString() }).eq('id', req.params.userId);
    await supabaseAdmin.from('audit_log').insert({
      id: require('uuid').v4(), actor_id: req.user.id, action: 'user.delete',
      target_id: req.params.userId, occurred_at: new Date().toISOString()
    }).catch(() => {});
    res.json({ message: 'User soft-deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/audit', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const { data } = await supabaseAdmin.from('audit_log').select('*').order('occurred_at', { ascending: false }).limit(limit);
    res.json({ events: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
