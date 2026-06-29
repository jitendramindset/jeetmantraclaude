/**
 * bookings.js — Unified booking engine (Sprint 4 Track B).
 *
 * Books any `resources` row across the full vertical list — sports / mentor /
 * room / workshop / event / course / equipment. Reuses /api/payments for the
 * actual money move when amount > 0.
 *
 * Routes (mount: /api/bookings):
 *   POST   /              — authenticated; create a booking, enforcing
 *                            (a) the resource is active,
 *                            (b) no overlap with another active booking,
 *                            (c) party_size respects capacity.
 *   GET    /mine          — authenticated; bookings I MADE (booker_id=self)
 *   GET    /received      — authenticated; bookings ON resources I OWN
 *   GET    /:id           — booker, owner, or admin
 *   POST   /:id/cancel    — booker or owner
 *   POST   /:id/confirm   — owner or admin
 *
 * Calendar wiring (future Sprint 5): the unified calendar at routes/calendar.js
 * surfaces these bookings as a 4th UNION block (live + assignment + test +
 * booking). The event shape there is the same normalized form; just point
 * resource_type → type, title from the resource.title, start_at/end_at as-is.
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Two bookings on the same resource conflict when their time windows overlap
// AND both are pending/confirmed. Cancelled/no-show rows don't count.
async function overlapsExist(resourceId, startAt, endAt, excludeId) {
  let q = supabaseAdmin.from('bookings_v2')
    .select('id, start_at, end_at, party_size, status')
    .eq('resource_id', resourceId)
    .in('status', ['pending', 'confirmed'])
    .lt('start_at', endAt)
    .gt('end_at', startAt);
  if (excludeId) q = q.neq('id', excludeId);
  const { data } = await q;
  return data || [];
}

// Capacity check: if multiple overlapping bookings already exist, sum their
// party_size and verify adding the new booking still ≤ resource.capacity.
function exceedsCapacity(existing, newPartySize, capacity) {
  const total = (existing || []).reduce((s, b) => s + (b.party_size || 1), 0) + (newPartySize || 1);
  return total > (capacity || 1);
}

// GET / — merged view: both bookings I made (mine) and bookings on my resources (received).
router.get('/', authenticateToken, async (req, res) => {
  try {
    // mine
    const { data: mineData } = await supabaseAdmin.from('bookings_v2')
      .select('*').eq('booker_id', req.user.id).order('start_at', { ascending: false });
    const resourceIds = [...new Set((mineData || []).map(r => r.resource_id))];
    let resourceTitles = {};
    if (resourceIds.length) {
      const { data: r } = await supabaseAdmin.from('resources').select('id, title, type, cover_image').in('id', resourceIds);
      resourceTitles = Object.fromEntries((r || []).map(x => [x.id, x]));
    }
    const mine = (mineData || []).map(b => ({ ...b, resource: resourceTitles[b.resource_id] || null }));

    // received
    const { data: myResources } = await supabaseAdmin.from('resources').select('id').eq('owner_id', req.user.id);
    const myResourceIds = (myResources || []).map(r => r.id);
    let received = [];
    if (myResourceIds.length) {
      const { data: receivedData } = await supabaseAdmin.from('bookings_v2')
        .select('*').in('resource_id', myResourceIds).order('start_at', { ascending: false });
      const bookerIds = [...new Set((receivedData || []).map(b => b.booker_id))];
      let bookers = {};
      if (bookerIds.length) {
        const { data: u } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', bookerIds);
        bookers = Object.fromEntries((u || []).map(x => [x.id, x]));
      }
      received = (receivedData || []).map(b => ({ ...b, booker: bookers[b.booker_id] || null }));
    }

    res.json({ mine, received });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authenticateToken, validate('bookingCreate'), async (req, res) => {
  try {
    const b = req.validatedData;
    const start = new Date(b.startAt);
    const end   = new Date(b.endAt);
    if (isNaN(start) || isNaN(end) || end <= start) return res.status(400).json({ error: 'Invalid time window' });

    const { data: resource } = await supabaseAdmin.from('resources').select('*').eq('id', b.resourceId).single();
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    if (!resource.is_active) return res.status(400).json({ error: 'Resource is not bookable' });

    const existing = await overlapsExist(b.resourceId, start.toISOString(), end.toISOString(), null);
    if (existing.length && exceedsCapacity(existing, b.partySize || 1, resource.capacity)) {
      return res.status(409).json({ error: 'Time slot is fully booked', conflicts: existing.length });
    }

    const insert = {
      id: uuidv4(),
      resource_id: resource.id,
      resource_type: resource.type,
      booker_id: req.user.id,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      party_size: b.partySize || 1,
      amount: resource.price || 0,
      currency: resource.currency || 'INR',
      status: (resource.price || 0) === 0 ? 'confirmed' : 'pending',
      notes: b.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin.from('bookings_v2').insert(insert).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ booking: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const { status, from, to } = req.query;
    let q = supabaseAdmin.from('bookings_v2').select('*').eq('booker_id', req.user.id);
    if (status) q = q.eq('status', status);
    if (from)   q = q.gte('start_at', new Date(from).toISOString());
    if (to)     q = q.lte('end_at',   new Date(to).toISOString());
    const { data, error } = await q.order('start_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    // Hydrate resource title for the list UI
    const ids = [...new Set((data || []).map(r => r.resource_id))];
    let titles = {};
    if (ids.length) {
      const { data: r } = await supabaseAdmin.from('resources').select('id, title, type, cover_image').in('id', ids);
      titles = Object.fromEntries((r || []).map(x => [x.id, x]));
    }
    const bookings = (data || []).map(b => ({
      ...b,
      resource: titles[b.resource_id] || null
    }));
    res.json({ bookings });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/received', authenticateToken, async (req, res) => {
  try {
    const { status, from, to } = req.query;
    // Find the caller's resource ids first, then bookings on them.
    const { data: myResources } = await supabaseAdmin.from('resources').select('id').eq('owner_id', req.user.id);
    const ids = (myResources || []).map(r => r.id);
    if (!ids.length) return res.json({ bookings: [] });
    let q = supabaseAdmin.from('bookings_v2').select('*').in('resource_id', ids);
    if (status) q = q.eq('status', status);
    if (from)   q = q.gte('start_at', new Date(from).toISOString());
    if (to)     q = q.lte('end_at',   new Date(to).toISOString());
    const { data, error } = await q.order('start_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    // Hydrate booker names
    const bookerIds = [...new Set((data || []).map(b => b.booker_id))];
    let bookers = {};
    if (bookerIds.length) {
      const { data: u } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', bookerIds);
      bookers = Object.fromEntries((u || []).map(x => [x.id, x]));
    }
    const bookings = (data || []).map(b => ({ ...b, booker: bookers[b.booker_id] || null }));
    res.json({ bookings });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: booking } = await supabaseAdmin.from('bookings_v2').select('*').eq('id', req.params.id).single();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const { data: resource } = await supabaseAdmin.from('resources').select('id, title, owner_id, cover_image, venue_name, venue_address').eq('id', booking.resource_id).single();
    const isOwner  = resource && resource.owner_id === req.user.id;
    const isBooker = booking.booker_id === req.user.id;
    if (!isOwner && !isBooker && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }
    res.json({ booking, resource });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { data: booking } = await supabaseAdmin.from('bookings_v2').select('*').eq('id', req.params.id).single();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const { data: resource } = await supabaseAdmin.from('resources').select('owner_id').eq('id', booking.resource_id).single();
    const isOwner  = resource && resource.owner_id === req.user.id;
    const isBooker = booking.booker_id === req.user.id;
    if (!isOwner && !isBooker && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }
    if (booking.status === 'cancelled') return res.json({ booking, message: 'Already cancelled' });
    const { data } = await supabaseAdmin.from('bookings_v2')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    res.json({ booking: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const { data: booking } = await supabaseAdmin.from('bookings_v2').select('*').eq('id', req.params.id).single();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const { data: resource } = await supabaseAdmin.from('resources').select('owner_id').eq('id', booking.resource_id).single();
    const isOwner = resource && resource.owner_id === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the resource owner can confirm' });
    }
    const { data } = await supabaseAdmin.from('bookings_v2')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    res.json({ booking: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
