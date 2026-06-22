/**
 * award.js — the single award pipeline (Sprint 5 / audit's Sprint 4).
 *
 * Every student action that should earn XP / advance the streak / unlock a
 * badge goes through ONE entry point:
 *
 *     await awardForEvent({ userId, eventType, refTable, refId, metadata });
 *
 * The pipeline:
 *   1. Writes an XP row (xp determined by the XP rule map).
 *   2. Updates / bumps the daily streak (idempotent per calendar day).
 *   3. Checks all active badges; awards any whose criteria are met.
 *   4. Writes user-facing notifications for badge unlocks + XP milestones.
 *
 * Idempotent: re-calling with the same (userId, eventType, refId) within the
 * same calendar day will NOT double-award XP for events that imply uniqueness
 * (assignment_submitted, test_completed, course_completed, course_enrolled).
 *
 * Best-effort / non-throwing: producer routes never wait on this for their
 * happy path. Errors are logged and swallowed.
 */
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');

// XP rule map v1. Tuned for a balanced grind feel — cheap actions trickle,
// big completions reward meaningfully.
const XP_RULES = {
  course_enrolled:        { xp: 25,  unique: true,  level: false },
  lecture_progress:       { xp: 5,   unique: false, level: false }, // soft-cap below
  assignment_submitted:   { xp: 40,  unique: true,  level: false },
  test_completed:         { xp: 60,  unique: true,  level: false },
  test_passed:            { xp: 30,  unique: true,  level: false }, // bonus on pass
  course_completed:       { xp: 250, unique: true,  level: true  },
  live_joined:            { xp: 20,  unique: false, level: false },
  payment_completed:      { xp: 15,  unique: true,  level: false },
  message_sent:           { xp: 2,   unique: false, level: false }, // soft-cap below
  ai_question:            { xp: 5,   unique: false, level: false }, // soft-cap below
  marketplace_purchase:   { xp: 15,  unique: true,  level: false },
  language_switched:      { xp: 5,   unique: true,  level: false }, // counted once per language per day
};

// Soft daily cap on chatty events so a spammy day doesn't dwarf the streak math.
const DAILY_CAP_BY_EVENT = {
  lecture_progress: 50,
  message_sent:     20,
  ai_question:      50,
};

function levelFromXp(totalXp) {
  // Standard threshold curve: level N requires N*(N+1)/2 * 100 cumulative XP.
  // Cheap to compute, friendly to display.
  if (totalXp <= 0) return 1;
  let n = 1, need = 100;
  while (totalXp >= need) { n += 1; need += n * 100; }
  return n;
}

// ── 1. XP write -------------------------------------------------------------
async function writeXp(userId, eventType, xp, refTable, refId, metadata) {
  try {
    await supabaseAdmin.from('user_xp_ledger').insert({
      id: uuidv4(),
      user_id: userId,
      event_type: eventType,
      xp,
      ref_table: refTable || null,
      ref_id: refId || null,
      metadata: metadata || null
    });
  } catch (_) { /* table may not exist yet — degrade silently */ }
}

async function dailyXpAlreadyEarned(userId, eventType, refId) {
  // For unique events (assignment_submitted etc.), check if THIS specific (event, ref)
  // is already in the ledger — those should never double-award.
  try {
    const rule = XP_RULES[eventType];
    if (!rule) return false;
    if (rule.unique && refId) {
      const { data } = await supabaseAdmin.from('user_xp_ledger')
        .select('id').eq('user_id', userId).eq('event_type', eventType).eq('ref_id', refId).limit(1);
      return !!(data && data.length);
    }
    // For non-unique events with a daily cap, check today's earned XP count.
    const cap = DAILY_CAP_BY_EVENT[eventType];
    if (cap) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { data } = await supabaseAdmin.from('user_xp_ledger')
        .select('id').eq('user_id', userId).eq('event_type', eventType)
        .gte('created_at', today.toISOString());
      return ((data || []).length) >= cap;
    }
    return false;
  } catch (_) { return false; }
}

async function getTotalXp(userId) {
  try {
    const { data } = await supabaseAdmin.from('user_xp_ledger').select('xp').eq('user_id', userId);
    return (data || []).reduce((s, r) => s + (r.xp || 0), 0);
  } catch (_) { return 0; }
}

// ── 2. Streak update --------------------------------------------------------
async function bumpStreak(userId) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data: row } = await supabaseAdmin.from('study_streaks').select('*').eq('user_id', userId).maybeSingle();
    if (!row) {
      await supabaseAdmin.from('study_streaks').insert({
        user_id: userId, current_streak: 1, longest_streak: 1, last_checkin: today, total_days: 1
      });
      return { current: 1, longest: 1, didIncrement: true };
    }
    if (row.last_checkin === today) {
      return { current: row.current_streak, longest: row.longest_streak, didIncrement: false };
    }
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const isContiguous = row.last_checkin === yesterday.toISOString().slice(0, 10);
    const nextStreak = isContiguous ? row.current_streak + 1 : 1;
    const longest = Math.max(row.longest_streak || 0, nextStreak);
    await supabaseAdmin.from('study_streaks').update({
      current_streak: nextStreak,
      longest_streak: longest,
      last_checkin: today,
      total_days: (row.total_days || 0) + 1,
      updated_at: new Date().toISOString()
    }).eq('user_id', userId);
    return { current: nextStreak, longest, didIncrement: true };
  } catch (_) { return { current: 0, longest: 0, didIncrement: false }; }
}

// ── 3. Badge unlock check ---------------------------------------------------
// Each badge's criteria JSON looks like {"event":"...","count":N} or {"event":"streak","threshold":N}.
async function checkAndAwardBadges(userId, ctx) {
  const awarded = [];
  try {
    const { data: badges } = await supabaseAdmin.from('badges').select('*').eq('active', true);
    if (!badges || !badges.length) return awarded;
    const { data: alreadyEarned } = await supabaseAdmin.from('user_badges').select('badge_id').eq('user_id', userId);
    const earnedSet = new Set((alreadyEarned || []).map(r => r.badge_id));

    for (const b of badges) {
      if (earnedSet.has(b.id)) continue;
      const c = b.criteria || {};
      let qualifies = false;
      if (c.event === 'streak') {
        qualifies = (ctx.streak && ctx.streak.current >= (c.threshold || 1));
      } else if (c.event && (c.count || 0) <= 1) {
        // Single-trigger: this very event matches → award.
        qualifies = (c.event === ctx.eventType);
      } else if (c.event) {
        // Counting: total ledger entries of that event for this user must hit the count.
        try {
          const { count } = await supabaseAdmin.from('user_xp_ledger')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId).eq('event_type', c.event);
          qualifies = (count || 0) >= (c.count || 1);
        } catch (_) { qualifies = false; }
      }
      if (!qualifies) continue;
      try {
        await supabaseAdmin.from('user_badges').insert({
          id: uuidv4(), user_id: userId, badge_id: b.id, metadata: { trigger: ctx.eventType }
        });
        if (b.xp_reward && b.xp_reward > 0) {
          await writeXp(userId, 'badge_bonus', b.xp_reward, 'badges', b.id, { badge_title: b.title });
        }
        await writeNotification(userId, {
          type: 'badge_earned',
          title: 'New badge: ' + b.title,
          body: b.description || '',
          icon: b.icon || '🏆',
          link: '/dashboard.html#badges',
          metadata: { badge_id: b.id }
        });
        awarded.push(b.id);
      } catch (_) { /* unique-violation = race; ignore */ }
    }
  } catch (_) { /* table may not exist — degrade silently */ }
  return awarded;
}

// ── 4. Notification writer --------------------------------------------------
async function writeNotification(userId, n) {
  try {
    // Columns must match the live table (channel/status; read_at NULL = unread).
    // The previous insert used icon/metadata, which don't exist — so every write
    // silently failed in the catch below and the inbox stayed empty.
    await supabaseAdmin.from('notifications').insert({
      id: uuidv4(),
      user_id: userId,
      channel: 'in-app',
      type: n.type,
      title: n.title,
      body: n.body || null,
      link: n.link || null,
      status: 'sent'
    });
  } catch (_) { /* table absent — silent */ }
}

// ── Entry point -------------------------------------------------------------
async function awardForEvent({ userId, eventType, refTable, refId, metadata }) {
  if (!userId || !eventType) return null;
  const rule = XP_RULES[eventType];
  if (!rule) return null;

  // 1. XP — skip if already earned for this unique (eventType, refId) or daily cap hit.
  const skip = await dailyXpAlreadyEarned(userId, eventType, refId);
  if (!skip) await writeXp(userId, eventType, rule.xp, refTable, refId, metadata);

  // 2. Streak — only bump for non-trivial events.
  let streak = null;
  if (eventType !== 'message_sent' && eventType !== 'language_switched') {
    streak = await bumpStreak(userId);
  }

  // 3. Badge check (driven by ledger counts and current streak).
  const awarded = await checkAndAwardBadges(userId, { userId, eventType, streak });

  // 4. XP milestone notification (every 500 XP).
  if (!skip && rule.level) {
    try {
      const total = await getTotalXp(userId);
      const level = levelFromXp(total);
      const milestoneXp = Math.floor(total / 500) * 500;
      if (milestoneXp > 0 && total - rule.xp < milestoneXp && total >= milestoneXp) {
        await writeNotification(userId, {
          type: 'xp_milestone',
          title: 'Level ' + level + '!',
          body: 'You crossed ' + milestoneXp + ' XP — keep going.',
          icon: '⭐',
          link: '/dashboard.html#xp'
        });
      }
    } catch (_) { /* silent */ }
  }

  return { xp: skip ? 0 : rule.xp, streak, awardedBadges: awarded };
}

module.exports = { awardForEvent, levelFromXp, XP_RULES };
