/**
 * resources.js — Unified bookable-resource catalog (Sprint 4 Track A).
 *
 * A "resource" is anything that can be reserved on the platform: a sports
 * ground, a court, a room, a teacher's office hour, a mentor session, a
 * workshop seat, an event ticket, equipment loan, or — eventually — a course
 * seat (legacy `bookings` migrates here as resource_type='course' in a future
 * pass).
 *
 * Routes (mount: /api/resources):
 *   GET    /                  — public list; filters ?type=&city=&q=&page=&limit=
 *   GET    /:id               — public single resource
 *   POST   /                  — CREATOR_ROLES; sets owner_id=self; auto-tags
 *                                institution_id via resolveInstitution (Sprint 0a)
 *   PUT    /:id               — owner or admin
 *   DELETE /:id               — owner or admin (soft: is_active=false)
 *   GET    /mine              — CREATOR_ROLES; the caller's resources
 *   GET    /:id/availability  — public; returns availability_json + booked
 *                                slots in [from, to]
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { resolveInstitution } = require('../middleware/resolveInstitution');
const { requireCapability } = require('../middleware/requireCapability');
const { CREATOR_ROLES } = require('../config/roles');

const router = express.Router();

// Public list. Pagination + simple filters. No auth.
router.get('/', async (req, res) => {
  try {
    const { type, city, q, page = 1, limit = 24 } = req.query;
    const lim = Math.min(100, Math.max(1, Number(limit) || 24));
    const off = (Math.max(1, Number(page) || 1) - 1) * lim;

    let qb = supabaseAdmin.from('resources').select('*', { count: 'exact' }).eq('is_active', true);
    if (type) qb = qb.eq('type', type);
    if (city) qb = qb.ilike('city', `%${city}%`);
    if (q) {
      const term = String(q).replace(/[%,()]/g, '');
      qb = qb.or(`title.ilike.%${term}%,description.ilike.%${term}%,venue_name.ilike.%${term}%`);
    }
    const { data: rows, count, error } = await qb.order('created_at', { ascending: false }).range(off, off + lim - 1);
    if (error) return res.status(500).json({ error: error.message });

    // Hydrate owner names (jeetmantra_users.id is VARCHAR — no FK embed)
    const ownerIds = [...new Set((rows || []).map(r => r.owner_id).filter(Boolean))];
    let owners = {};
    if (ownerIds.length) {
      const { data: u } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name').in('id', ownerIds);
      owners = Object.fromEntries((u || []).map(x => [x.id, x.full_name]));
    }
    const resources = (rows || []).map(r => ({ ...r, owner_name: owners[r.owner_id] || null }));
    res.json({ resources, page: Number(page), limit: lim, total: count || 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Caller's own resources. Must come BEFORE /:id so the literal route wins.
router.get('/mine', authenticateToken, authorizeRole(CREATOR_ROLES), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('resources')
      .select('*').eq('owner_id', req.user.id).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ resources: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('resources').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Resource not found' });
    res.json({ resource: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Availability: declared rules + the bookings that already eat into them.
// Sprint 5 wires this into the unified calendar (routes/calendar.js) as a
// fourth UNION block.
router.get('/:id/availability', async (req, res) => {
  try {
    const { from, to } = req.query;
    const { data: r } = await supabaseAdmin.from('resources').select('*').eq('id', req.params.id).single();
    if (!r) return res.status(404).json({ error: 'Resource not found' });
    let q = supabaseAdmin.from('bookings_v2').select('id, start_at, end_at, party_size, status')
      .eq('resource_id', req.params.id)
      .in('status', ['pending', 'confirmed']);
    if (from) q = q.gte('end_at',   new Date(from).toISOString());
    if (to)   q = q.lte('start_at', new Date(to).toISOString());
    const { data: bookings } = await q.order('start_at');
    res.json({
      resource: { id: r.id, capacity: r.capacity, availability_json: r.availability_json },
      bookings: bookings || []
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authenticateToken, requireCapability('booking.manage'), validate('resourceCreate'), async (req, res) => {
  try {
    const b = req.validatedData;
    // Auto-tag tenant scope when X-Active-Institution is set (Sprint 0a pattern).
    // requireTeacher so a student-only member can't publish a resource under an org.
    const instId = await resolveInstitution(req, { requireTeacher: true });
    const insert = {
      id: uuidv4(),
      type: b.type,
      owner_id: req.user.id,
      institution_id: (instId && instId !== 'all') ? instId : null,
      title: b.title,
      description: b.description || null,
      capacity: b.capacity || 1,
      price: b.price || 0,
      currency: b.currency || 'INR',
      venue_name: b.venueName || null,
      venue_address: b.venueAddress || null,
      city: b.city || null,
      latitude: b.latitude != null ? Number(b.latitude) : null,
      longitude: b.longitude != null ? Number(b.longitude) : null,
      availability_json: b.availability || null,
      cover_image: b.coverImage || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin.from('resources').insert(insert).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ resource: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', authenticateToken, validate('resourceUpdate'), async (req, res) => {
  try {
    const { data: r } = await supabaseAdmin.from('resources').select('owner_id').eq('id', req.params.id).single();
    if (!r) return res.status(404).json({ error: 'Resource not found' });
    if (r.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not your resource' });
    }
    const b = req.validatedData;
    const u = { updated_at: new Date().toISOString() };
    ['title', 'description', 'capacity', 'price', 'currency', 'cover_image', 'is_active'].forEach(k => {
      if (b[k] !== undefined) u[k] = b[k];
    });
    if (b.venueName !== undefined)    u.venue_name = b.venueName;
    if (b.venueAddress !== undefined) u.venue_address = b.venueAddress;
    if (b.city !== undefined)         u.city = b.city;
    if (b.latitude !== undefined)     u.latitude = Number(b.latitude);
    if (b.longitude !== undefined)    u.longitude = Number(b.longitude);
    if (b.availability !== undefined) u.availability_json = b.availability;
    const { data, error } = await supabaseAdmin.from('resources').update(u).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ resource: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: r } = await supabaseAdmin.from('resources').select('owner_id').eq('id', req.params.id).single();
    if (!r) return res.status(404).json({ error: 'Resource not found' });
    if (r.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not your resource' });
    }
    // Soft delete — keeps booking history intact.
    await supabaseAdmin.from('resources').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', req.params.id);
    res.json({ message: 'Resource deactivated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Recurring slots (Phase C §17) — a resource's weekly availability windows
// for Sports/Yoga/Dance/Music booking. Concrete bookings still go through
// /api/bookings; these define the repeatable schedule + per-slot capacity/price.

// GET /api/resources/:id/slots — public (drives the slot picker).
router.get('/:id/slots', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('resource_slots')
      .select('*').eq('resource_id', req.params.id).eq('is_active', true)
      .order('day_of_week').order('start_time');
    if (error) return res.json({ slots: [] });
    res.json({ slots: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/resources/:id/slots — add a recurring slot (booking.manage + owner).
router.post('/:id/slots', authenticateToken, requireCapability('booking.manage'), validate('resourceSlot'), async (req, res) => {
  try {
    const { data: r } = await supabaseAdmin.from('resources').select('owner_id').eq('id', req.params.id).maybeSingle();
    if (!r) return res.status(404).json({ error: 'Resource not found' });
    if (req.user.role !== 'admin' && r.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your resource' });
    }
    const b = req.validatedData;
    const { data, error } = await supabaseAdmin.from('resource_slots').insert({
      id: uuidv4(), resource_id: req.params.id, day_of_week: b.dayOfWeek,
      start_time: b.startTime, end_time: b.endTime, capacity: b.capacity ?? 1,
      price: b.price ?? null, coach_id: b.coachId || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ slot: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/resources/:id/slots/:slotId — soft-remove a slot.
router.delete('/:id/slots/:slotId', authenticateToken, requireCapability('booking.manage'), async (req, res) => {
  try {
    const { data: r } = await supabaseAdmin.from('resources').select('owner_id').eq('id', req.params.id).maybeSingle();
    if (r && req.user.role !== 'admin' && r.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your resource' });
    }
    await supabaseAdmin.from('resource_slots').update({ is_active: false }).eq('id', req.params.slotId);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
