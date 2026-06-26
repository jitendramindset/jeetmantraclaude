/**
 * gamification.js — streak / XP / badges for the student dashboard.
 *
 * Mount: /api/gamification
 *
 *   GET  /streak           — current + longest streak for the caller
 *   POST /streak/checkin   — explicit daily check-in (most events bump streak
 *                              automatically via award.js; this is for "I'm
 *                              here" moments like opening the dashboard)
 *   GET  /xp               — total XP + computed level + last 20 ledger rows
 *   GET  /badges           — earned badges + all available badges (for the
 *                              grid UI showing what's locked)
 *   GET  /summary          — one shot for the topbar StreakChip + XPRing:
 *                              { streak: {current, longest}, xp: {total, level}, badgesEarned: N }
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { awardForEvent, levelFromXp } = require('../services/award');

const router = express.Router();

// GET /streak — current + longest streak for the caller (defaults if none).
router.get('/streak', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('study_streaks').select('*').eq('user_id', req.user.id).maybeSingle();
    res.json({ streak: data || { user_id: req.user.id, current_streak: 0, longest_streak: 0, total_days: 0, last_checkin: null } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /streak/checkin — explicit daily check-in (soft streak bump via award pipeline).
router.post('/streak/checkin', authenticateToken, async (req, res) => {
  try {
    const result = await awardForEvent({
      userId: req.user.id, eventType: 'lecture_progress',  // soft bump — counts toward daily cap
      refTable: 'study_streaks', refId: new Date().toISOString().slice(0, 10),
      metadata: { source: 'manual_checkin' }
    });
    const { data } = await supabaseAdmin.from('study_streaks').select('*').eq('user_id', req.user.id).maybeSingle();
    res.json({ streak: data, award: result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /xp — total XP + computed level + last 20 ledger rows.
router.get('/xp', authenticateToken, async (req, res) => {
  try {
    const [{ data: rows }, { data: recent }] = await Promise.all([
      supabaseAdmin.from('user_xp_ledger').select('xp').eq('user_id', req.user.id),
      supabaseAdmin.from('user_xp_ledger').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(20)
    ]);
    const total = (rows || []).reduce((s, r) => s + (r.xp || 0), 0);
    res.json({ total, level: levelFromXp(total), recent: recent || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /badges — all active badges flagged earned/locked for the caller.
router.get('/badges', authenticateToken, async (req, res) => {
  try {
    const [{ data: all }, { data: earned }] = await Promise.all([
      supabaseAdmin.from('badges').select('*').eq('active', true).order('xp_reward', { ascending: true }),
      supabaseAdmin.from('user_badges').select('*').eq('user_id', req.user.id)
    ]);
    const earnedSet = new Set((earned || []).map(b => b.badge_id));
    const badges = (all || []).map(b => ({
      ...b,
      earned: earnedSet.has(b.id),
      earned_at: (earned || []).find(e => e.badge_id === b.id)?.earned_at || null
    }));
    res.json({ badges, earnedCount: earnedSet.size, totalCount: badges.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Single round-trip for the topbar chips.
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const [streakRow, xpRows, badgesEarned] = await Promise.all([
      supabaseAdmin.from('study_streaks').select('*').eq('user_id', req.user.id).maybeSingle().then(r => r.data).catch(() => null),
      supabaseAdmin.from('user_xp_ledger').select('xp').eq('user_id', req.user.id).then(r => r.data || []).catch(() => []),
      supabaseAdmin.from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', req.user.id).then(r => r.count || 0).catch(() => 0)
    ]);
    const totalXp = xpRows.reduce((s, r) => s + (r.xp || 0), 0);
    const level = levelFromXp(totalXp);
    res.json({
      streak: { current: streakRow?.current_streak || 0, longest: streakRow?.longest_streak || 0 },
      xp: { total: totalXp, level, nextLevelAt: (level * (level + 1) / 2) * 100 },
      badgesEarned
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
