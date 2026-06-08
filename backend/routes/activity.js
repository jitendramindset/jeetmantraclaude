/**
 * activity.js — activity feed (a wall of things that happened).
 *
 *   GET    /api/activity/me               — feed for the calling user (events
 *                                            where target_user_id = me OR they
 *                                            happened in courses I'm in)
 *   GET    /api/activity/course/:courseId — feed for one course
 *
 * The helper logEvent() is exported so other routes can drop activity rows
 * from inside their handlers (e.g. enrollment created -> log it).
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

async function logEvent({ eventType, actorId, targetUserId, courseId, institutionId, payload, message }) {
  try {
    await supabaseAdmin.from('activity_feed').insert({
      id: uuidv4(),
      event_type: eventType,
      actor_id: actorId || null,
      target_user_id: targetUserId || null,
      course_id: courseId || null,
      institution_id: institutionId || null,
      payload: payload || null,
      message: message || null
    });
  } catch (_) { /* best-effort */ }
}

router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Events directly targeting me + events in courses I'm enrolled in / own
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('course_id').eq('student_id', req.user.id);
    const { data: ownedCourses } = await supabaseAdmin.from('courses').select('id').eq('teacher_id', req.user.id);
    const courseIds = [
      ...(enrollments || []).map(e => e.course_id),
      ...(ownedCourses || []).map(c => c.id)
    ];
    // Build the OR filter dynamically
    const orParts = [`target_user_id.eq.${req.user.id}`];
    if (courseIds.length) orParts.push(`course_id.in.(${courseIds.join(',')})`);
    const { data: rows } = await supabaseAdmin.from('activity_feed')
      .select('*').or(orParts.join(',')).order('created_at', { ascending: false }).limit(30);
    // Hydrate actor names
    const aIds = [...new Set((rows || []).map(r => r.actor_id).filter(Boolean))];
    let actors = {};
    if (aIds.length) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', aIds);
      actors = Object.fromEntries((data || []).map(u => [u.id, u.full_name || u.email]));
    }
    res.json({ feed: (rows || []).map(r => ({ ...r, actor_name: actors[r.actor_id] || null })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { data: rows } = await supabaseAdmin.from('activity_feed')
      .select('*').eq('course_id', req.params.courseId).order('created_at', { ascending: false }).limit(30);
    const aIds = [...new Set((rows || []).map(r => r.actor_id).filter(Boolean))];
    let actors = {};
    if (aIds.length) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', aIds);
      actors = Object.fromEntries((data || []).map(u => [u.id, u.full_name || u.email]));
    }
    res.json({ feed: (rows || []).map(r => ({ ...r, actor_name: actors[r.actor_id] || null })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
module.exports.logEvent = logEvent;
