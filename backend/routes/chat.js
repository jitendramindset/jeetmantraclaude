/**
 * chat.js — course/group/direct chat.
 *
 *   GET    /api/chat/rooms                  — my rooms (courses I'm in + DMs)
 *   GET    /api/chat/rooms/course/:courseId — get/create the course room
 *   GET    /api/chat/rooms/dm/:userId       — get/create a DM with another user
 *   GET    /api/chat/rooms/:id/messages     — last 50 messages
 *   POST   /api/chat/rooms/:id/messages     — send (content + optional voice_url)
 *
 * Membership is auto-granted: any enrolled student or the teacher gets the
 * course room. DMs auto-create members on first lookup.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { unreadByRoom, countUnread } = require('../services/chatUnread');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

async function ensureMembership(roomId, userId) {
  await supabaseAdmin.from('chat_room_members').insert({ id: uuidv4(), room_id: roomId, user_id: userId })
    .then(() => {}).catch(() => {});
}

// GET /api/chat/rooms — every room I'm in
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const { data: memberships } = await supabaseAdmin.from('chat_room_members')
      .select('room_id').eq('user_id', req.user.id);
    const ids = (memberships || []).map(m => m.room_id);
    if (!ids.length) return res.json({ rooms: [] });
    const { data: rooms } = await supabaseAdmin.from('chat_rooms')
      .select('*, courses(title)').in('id', ids).order('created_at', { ascending: false });
    res.json({ rooms: rooms || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/chat/rooms/course/:courseId — find or create the course room.
// Auto-adds the caller as a member if they're the teacher or an enrolled student.
router.get('/rooms/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { data: course } = await supabaseAdmin.from('courses').select('id, teacher_id, title').eq('id', courseId).single();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    // Authorize: teacher of the course OR student enrolled OR admin
    const isTeacher = course.teacher_id === req.user.id;
    let isEnrolled = false;
    if (!isTeacher && req.user.role !== 'admin') {
      const { data: enr } = await supabaseAdmin.from('enrollments').select('id').eq('course_id', courseId).eq('student_id', req.user.id).maybeSingle();
      isEnrolled = !!enr;
    }
    if (!isTeacher && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }
    // Find existing room
    let { data: room } = await supabaseAdmin.from('chat_rooms').select('*').eq('course_id', courseId).eq('type', 'course').maybeSingle();
    if (!room) {
      const r = await supabaseAdmin.from('chat_rooms').insert({
        id: uuidv4(), type: 'course', course_id: courseId, name: course.title
      }).select().single();
      room = r.data;
    }
    await ensureMembership(room.id, req.user.id);
    res.json({ room });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/chat/rooms/dm/:userId — find or create a DM with another user
router.get('/rooms/dm/:userId', authenticateToken, async (req, res) => {
  try {
    const otherId = req.params.userId;
    if (otherId === req.user.id) return res.status(400).json({ error: 'Cannot DM yourself' });
    const { data: otherUser } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').eq('id', otherId).single();
    if (!otherUser) return res.status(404).json({ error: 'User not found' });
    // Look up an existing DM room shared by both
    const { data: myRooms } = await supabaseAdmin.from('chat_room_members').select('room_id, chat_rooms!inner(type)').eq('user_id', req.user.id);
    const myDmRoomIds = (myRooms || []).filter(r => r.chat_rooms?.type === 'direct').map(r => r.room_id);
    let room = null;
    if (myDmRoomIds.length) {
      const { data: shared } = await supabaseAdmin.from('chat_room_members').select('room_id').eq('user_id', otherId).in('room_id', myDmRoomIds);
      if (shared?.length) {
        const { data: existingRoom } = await supabaseAdmin.from('chat_rooms').select('*').eq('id', shared[0].room_id).single();
        room = existingRoom;
      }
    }
    if (!room) {
      const r = await supabaseAdmin.from('chat_rooms').insert({
        id: uuidv4(), type: 'direct', name: otherUser.full_name || otherUser.email
      }).select().single();
      room = r.data;
      await ensureMembership(room.id, req.user.id);
      await ensureMembership(room.id, otherId);
    }
    res.json({ room, peer: otherUser });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/chat/unread — total unread + per-room map (for the badge/KPI)
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const byRoom = await unreadByRoom(req.user.id);
    const total = Object.values(byRoom).reduce((s, n) => s + n, 0);
    res.json({ total, byRoom });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/chat/rooms/:id/read — mark the room read up to now for the caller
router.post('/rooms/:id/read', authenticateToken, async (req, res) => {
  try {
    await supabaseAdmin.from('chat_room_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', req.params.id).eq('user_id', req.user.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/chat/rooms/:id/messages
router.get('/rooms/:id/messages', authenticateToken, async (req, res) => {
  try {
    // Authorize: must be a member
    const { data: member } = await supabaseAdmin.from('chat_room_members').select('id').eq('room_id', req.params.id).eq('user_id', req.user.id).maybeSingle();
    if (!member && req.user.role !== 'admin') return res.status(403).json({ error: 'Not a room member' });
    // Opening the thread marks it read. Awaited so a follow-up /chat/unread
    // (the frontend refreshes the badge right after) sees the updated timestamp
    // instead of a stale count. Guarded so a write failure never breaks the fetch.
    try {
      await supabaseAdmin.from('chat_room_members').update({ last_read_at: new Date().toISOString() })
        .eq('room_id', req.params.id).eq('user_id', req.user.id);
    } catch (_) { /* non-fatal */ }
    const { data: msgs } = await supabaseAdmin.from('chat_messages').select('*').eq('room_id', req.params.id).order('created_at', { ascending: true }).limit(50);
    // Hydrate sender names
    const ids = [...new Set((msgs || []).map(m => m.sender_id))];
    let names = {};
    if (ids.length) {
      const { data: users } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', ids);
      names = Object.fromEntries((users || []).map(u => [u.id, u.full_name || u.email]));
    }
    res.json({ messages: (msgs || []).map(m => ({ ...m, sender_name: names[m.sender_id] || 'User' })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/chat/rooms/:id/messages
router.post('/rooms/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { data: member } = await supabaseAdmin.from('chat_room_members').select('id').eq('room_id', req.params.id).eq('user_id', req.user.id).maybeSingle();
    if (!member && req.user.role !== 'admin') return res.status(403).json({ error: 'Not a room member' });
    const { content, voiceUrl } = req.body;
    if (!content && !voiceUrl) return res.status(400).json({ error: 'content or voiceUrl required' });
    const { data, error } = await supabaseAdmin.from('chat_messages').insert({
      id: uuidv4(),
      room_id: req.params.id,
      sender_id: req.user.id,
      content: content || null,
      voice_url: voiceUrl || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
