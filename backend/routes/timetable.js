/**
 * timetable.js — Phase C (Sprint 10) weekly timetable for Schools/Coaching.
 *
 * EDUOS_GAP_ANALYSIS_V2 §9. A template is a weekly grid (per class/batch); its
 * slots are recurring (day_of_week + start/end). Concrete sessions still flow
 * through live-classes/bookings — this is the planning layer that publishes
 * into /api/calendar.
 *
 * Mount: /api/timetable. Authoring gated by live.schedule (a creator capability).
 *
 * Endpoints (all 🔒 JWT):
 *   GET    /templates                — list templates, optionally ?orgId=
 *   POST   /templates                [live.schedule] — create a weekly template
 *   GET    /templates/:id/slots      — the weekly grid (ordered by day + start)
 *   POST   /templates/:id/slots      [live.schedule] — add a slot
 *   DELETE /slots/:slotId            [live.schedule] — remove a slot
 *
 * Notes: reads are JWT-only; authoring needs the live.schedule capability.
 * Writes are Joi-validated ('timetableTemplate' / 'timetableSlot'). When the
 * tables aren't migrated yet, GETs degrade to an empty list rather than erroring.
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { requireCapability } = require('../middleware/requireCapability');
const { validate } = require('../middleware/validation');

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


// GET /api/timetable/ — upcoming timetable slots for the current user (as teacher).
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('timetable_slots')
      .select('*, timetable_templates(name)')
      .eq('teacher_id', req.user.id)
      .order('slot_date')
      .limit(20);
    if (error) return res.json({ slots: [] });
    res.json({ slots: data || [] });
  } catch (e) { res.json({ slots: [] }); }
});

// GET /api/timetable/templates?orgId= — list templates for an org.
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    let q = supabaseAdmin.from('timetable_templates').select('*').order('created_at', { ascending: false });
    if (req.query.orgId) q = q.eq('org_id', req.query.orgId);
    const { data, error } = await q;
    if (error) return res.json({ templates: [], note: 'timetable not migrated' });
    res.json({ templates: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/timetable/templates — create a weekly template.
router.post('/templates', authenticateToken, requireCapability('live.schedule'), validate('timetableTemplate'), async (req, res) => {
  try {
    const b = req.validatedData;
    const { data, error } = await supabaseAdmin.from('timetable_templates').insert({
      id: uuidv4(), org_id: b.orgId, name: b.name, course_id: b.courseId || null,
      batch_id: b.batchId || null, created_by: req.user.id
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ template: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/timetable/templates/:id/slots — the weekly grid.
router.get('/templates/:id/slots', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('timetable_slots')
      .select('*').eq('template_id', req.params.id).order('day_of_week').order('start_time');
    if (error) return res.json({ slots: [] });
    res.json({ slots: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/timetable/templates/:id/slots — add a slot to the grid.
router.post('/templates/:id/slots', authenticateToken, requireCapability('live.schedule'), validate('timetableSlot'), async (req, res) => {
  try {
    const b = req.validatedData;
    const { data, error } = await supabaseAdmin.from('timetable_slots').insert({
      id: uuidv4(), template_id: req.params.id, day_of_week: b.dayOfWeek,
      start_time: b.startTime, end_time: b.endTime, subject: b.subject || null,
      teacher_id: b.teacherId || null, room: b.room || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ slot: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/timetable/slots/:slotId — remove a slot.
router.delete('/slots/:slotId', authenticateToken, requireCapability('live.schedule'), async (req, res) => {
  try {
    await supabaseAdmin.from('timetable_slots').delete().eq('id', req.params.slotId);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
