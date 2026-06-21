/**
 * chatUnread.js — unread-message counting shared by chat.js (live badge) and
 * dashboard.js (KPI). "Unread" = messages in a room I'm a member of, created
 * after my `last_read_at` for that room, NOT sent by me.
 */
const { supabaseAdmin } = require('../config/supabase');

// { roomId: unreadCount } for every room the user belongs to (only rooms with ≥1 unread).
async function unreadByRoom(userId) {
  const { data: members } = await supabaseAdmin
    .from('chat_room_members').select('room_id, last_read_at').eq('user_id', userId);
  if (!members || !members.length) return {};
  const out = {};
  // Per-room count. Few rooms per user in practice; head-count queries are cheap.
  await Promise.all(members.map(async m => {
    let q = supabaseAdmin.from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', m.room_id).neq('sender_id', userId);
    if (m.last_read_at) q = q.gt('created_at', m.last_read_at);
    const { count } = await q.then(r => r).catch(() => ({ count: 0 }));
    if (count) out[m.room_id] = count;
  }));
  return out;
}

async function countUnread(userId) {
  const byRoom = await unreadByRoom(userId);
  return Object.values(byRoom).reduce((s, n) => s + n, 0);
}

module.exports = { unreadByRoom, countUnread };
