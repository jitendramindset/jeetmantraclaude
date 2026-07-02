/**
 * marketplace.js — course marketplace: browse, list, and purchase courses.
 * Mount: /api/marketplace
 *
 * Endpoints:
 *   GET    /                  🌐 public — browse active listings (category/price/level/mode/city/q filters, sort, pagination)
 *   GET    /facets            🌐 public — distinct filter values (categories, levels, modes, cities, price range)
 *   GET    /trending          🌐 public — most-purchased active listings (cold-start: newest)
 *   GET    /my/listings       🔒 auth — seller's own listings
 *   GET    /my/purchases      🔒 auth — buyer's purchases
 *   GET    /:id               🌐 public — single listing detail (increments view count)
 *   POST   /                  🔒 auth [SELLER_ROLES] — create a listing for an owned course
 *   PUT    /:id               🔒 auth [owner/admin] — update price/status
 *   DELETE /:id               🔒 auth [owner/admin] — soft-remove (status='removed')
 *   POST   /:id/purchase      🔒 auth — buy/enrol; paid listings require a verified payment first
 *
 * Notes: jeetmantra_users.id is VARCHAR while seller_id is UUID, so no PostgREST
 * FK embed for sellers — seller {full_name,email} is attached via a batched
 * lookup (attachSellers). Listing creation gated to SELLER_ROLES (config/roles.js).
 * Free-text q and city filters are sanitized to prevent PostgREST filter injection.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { SELLER_ROLES } = require('../config/roles');
const { v4: uuidv4 } = require('uuid');

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


const PLATFORM_COMMISSION = parseFloat(process.env.PLATFORM_COMMISSION_RATE || '15') / 100;
// SELLER_ROLES is the single source of truth in config/roles.js (includes the
// newer creator roles: content_creator, corporate_trainer). A local copy here
// previously diverged and locked those roles out of listing.

// Attach seller {full_name,email} to listings via a single batched lookup.
// Needed because jeetmantra_users.id is VARCHAR and seller_id is UUID, so no
// PostgREST FK embed is possible.
async function attachSellers(listings) {
  if (!listings || !listings.length) return listings || [];
  const ids = [...new Set(listings.map(l => l.seller_id).filter(Boolean))];
  if (!ids.length) return listings;
  const { data: sellers } = await supabaseAdmin
    .from('jeetmantra_users')
    .select('id, full_name, email')
    .in('id', ids);
  const byId = Object.fromEntries((sellers || []).map(s => [s.id, s]));
  return listings.map(l => ({ ...l, seller: byId[l.seller_id] || null }));
}

// GET /api/marketplace — browse all active listings
router.get('/', async (req, res) => {
  try {
    const { category, priceMin, priceMax, q, level, mode, city, sort, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // NB: jeetmantra_users.id is VARCHAR while seller_id is UUID, so there's no
    // PostgREST FK relationship to embed. We join the course (real FK) here and
    // attach seller names in a second lookup below.
    // Build query — apply all filters BEFORE pagination so pages have
    // consistent item counts regardless of filter combination.
    let query = supabaseAdmin
      .from('marketplace_listings')
      .select('*, courses!inner(id,title,description,category,level,cover_image,teacher_id,city,area,class_mode,batch_timing,timing,institute_name,age_group,free_listing,demo_class)')
      .eq('status', 'active');

    if (priceMin) query = query.gte('price', parseFloat(priceMin));
    if (priceMax) query = query.lte('price', parseFloat(priceMax));
    // Category + facet filters use the inner join so PostgREST filters on the
    // FK (course) side. mode maps to courses.class_mode (online/offline/hybrid).
    if (category) query = query.eq('courses.category', category);
    if (level)    query = query.eq('courses.level', level);
    if (mode)     query = query.eq('courses.class_mode', mode);
    if (city)     query = query.ilike('courses.city', `%${String(city).replace(/[,()*%\\]/g, ' ').trim()}%`);

    // Sort: newest (default) | price_low | price_high.
    if (sort === 'price_low')  query = query.order('price', { ascending: true });
    else if (sort === 'price_high') query = query.order('price', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    // Pagination applied AFTER all filters
    query = query.range(offset, offset + parseInt(limit) - 1);

    let { data: listings, error } = await query;
    if (error) {
      // Fallback: the !inner join fails if courses table is missing — retry without inner
      if (error.message && (error.message.includes('!inner') || error.code === 'PGRST200')) {
        const { data: fallback, error: e2 } = await supabaseAdmin
          .from('marketplace_listings')
          .select('*, courses(id,title,description,category,level,cover_image,teacher_id,city,area,class_mode,batch_timing,timing,institute_name,age_group,free_listing,demo_class)')
          .eq('status', 'active')
          .range(offset, offset + parseInt(limit) - 1);
        if (e2) {
          console.warn('Marketplace table not ready:', e2.message);
          return res.json({ listings: [], page: parseInt(page), limit: parseInt(limit), note: 'Marketplace table not yet created in Supabase' });
        }
        listings = fallback;
        if (category) listings = (listings || []).filter(l => l.courses?.category === category);
      } else {
        console.warn('Marketplace table not ready:', error.message);
        return res.json({ listings: [], page: parseInt(page), limit: parseInt(limit), note: 'Marketplace table not yet created in Supabase' });
      }
    }

    // Attach seller info via a separate lookup (no FK embed possible).
    listings = await attachSellers(listings);

    // If text search, also run search (sanitize q to prevent PostgREST filter
    // injection via commas/parens/wildcards).
    if (q) {
      const safeQ = String(q).replace(/[,()*%\\]/g, ' ').trim();
      const { data: searchResults } = await supabaseAdmin
        .from('courses')
        .select('id')
        .or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%,category.ilike.%${safeQ}%`);
      const courseIds = searchResults?.map(c => c.id) || [];
      const filtered = listings?.filter(l => courseIds.includes(l.course_id)) || [];
      return res.json({ listings: filtered, total: filtered.length, page: parseInt(page) });
    }

    res.json({ listings: listings || [], page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Marketplace list error:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace listings' });
  }
});

// GET /api/marketplace/facets — distinct filter values for the discovery rail
// (categories, levels, modes, cities). Public. Derived from active-listing
// courses so facets reflect what's actually buyable.
router.get('/facets', async (req, res) => {
  try {
    const { data: listings } = await supabaseAdmin
      .from('marketplace_listings')
      .select('price, courses(category,level,class_mode,city)')
      .eq('status', 'active');
    const rows = (listings || []).map(l => l.courses).filter(Boolean);
    const uniq = key => [...new Set(rows.map(r => r[key]).filter(Boolean))].sort();
    const prices = (listings || []).map(l => parseFloat(l.price)).filter(p => !isNaN(p));
    res.json({
      categories: uniq('category'),
      levels: uniq('level'),
      modes: uniq('class_mode'),
      cities: uniq('city'),
      priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 }
    });
  } catch (e) { res.json({ categories: [], levels: [], modes: [], cities: [], priceRange: { min: 0, max: 0 } }); }
});

// GET /api/marketplace/trending — most-purchased active listings (last 30d
// fallback: all-time). Public.
router.get('/trending', async (req, res) => {
  try {
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 8));
    const { data: purchases } = await supabaseAdmin.from('marketplace_purchases').select('listing_id');
    const counts = {};
    (purchases || []).forEach(p => { if (p.listing_id) counts[p.listing_id] = (counts[p.listing_id] || 0) + 1; });
    const topIds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
    let listings = [];
    if (topIds.length) {
      const { data } = await supabaseAdmin.from('marketplace_listings')
        .select('*, courses(id,title,category,level,cover_image,city,class_mode)')
        .in('id', topIds).eq('status', 'active');
      const order = Object.fromEntries(topIds.map((id, i) => [id, i]));
      listings = (data || []).sort((a, b) => order[a.id] - order[b.id]).map(l => ({ ...l, purchases: counts[l.id] }));
    } else {
      // Cold start: newest active listings.
      const { data } = await supabaseAdmin.from('marketplace_listings')
        .select('*, courses(id,title,category,level,cover_image,city,class_mode)')
        .eq('status', 'active').order('created_at', { ascending: false }).limit(limit);
      listings = data || [];
    }
    listings = await attachSellers(listings);
    res.json({ listings });
  } catch (e) { res.json({ listings: [] }); }
});

// GET /api/marketplace/my/listings — seller's own listings
router.get('/my/listings', authenticateToken, async (req, res) => {
  try {
    const { data: listings, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select('*, courses(id,title,category,level,cover_image)')
      .eq('seller_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('marketplace_listings table not ready:', error.message);
      return res.json({ listings: [] });
    }
    res.json({ listings: listings || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// GET /api/marketplace/my/purchases — buyer's purchases
router.get('/my/purchases', authenticateToken, async (req, res) => {
  try {
    const { data: purchases, error } = await supabaseAdmin
      .from('marketplace_purchases')
      .select('*, marketplace_listings(*, courses(id,title,category,cover_image))')
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('marketplace_purchases table not ready:', error.message);
      return res.json({ purchases: [] });
    }
    res.json({ purchases: purchases || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your purchases' });
  }
});

// GET /api/marketplace/:id — single listing detail
router.get('/:id', async (req, res) => {
  try {
    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .select('*, courses(*)')
      .eq('id', req.params.id)
      .single();
    if (error || !listing) return res.status(404).json({ error: 'Listing not found' });

    // Attach seller info (separate lookup — no FK embed).
    const [withSeller] = await attachSellers([listing]);

    // Increment view count
    await supabaseAdmin.from('marketplace_listings').update({ views: (listing.views || 0) + 1 }).eq('id', req.params.id);

    res.json({ listing: withSeller });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// POST /api/marketplace — create a listing (sellers only)
router.post('/', authenticateToken, validate('marketplaceListing'), async (req, res) => {
  try {
    if (!SELLER_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Only teachers, partners, schools, and coaching centers can list courses' });
    }
    const { courseId, price, commissionRate = 15 } = req.validatedData;

    // Verify course exists and seller owns it (or is admin)
    const { data: course } = await supabaseAdmin.from('courses').select('*').eq('id', courseId).single();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.user.role !== 'admin' && course.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only list your own courses' });
    }

    // Check for existing listing
    const { data: existing } = await supabaseAdmin.from('marketplace_listings').select('id').eq('seller_id', req.user.id).eq('course_id', courseId).single();
    if (existing) return res.status(400).json({ error: 'You already have a listing for this course' });

    const { data: listing, error } = await supabaseAdmin
      .from('marketplace_listings')
      .insert({
        id: uuidv4(),
        seller_id: req.user.id,
        course_id: courseId,
        price,
        commission_rate: commissionRate,
        status: 'active',
        views: 0,
        sales_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// PUT /api/marketplace/:id — update listing
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: listing } = await supabaseAdmin.from('marketplace_listings').select('*').eq('id', req.params.id).single();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const updates = {};
    if (req.body.price) updates.price = req.body.price;
    if (req.body.status) updates.status = req.body.status;
    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin.from('marketplace_listings').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ message: 'Listing updated', listing: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /api/marketplace/:id — remove listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: listing } = await supabaseAdmin.from('marketplace_listings').select('*').eq('id', req.params.id).single();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await supabaseAdmin.from('marketplace_listings').update({ status: 'removed', updated_at: new Date().toISOString() }).eq('id', req.params.id);
    res.json({ message: 'Listing removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove listing' });
  }
});

// POST /api/marketplace/:id/purchase — buy a course
router.post('/:id/purchase', authenticateToken, async (req, res) => {
  try {
    const { data: listing } = await supabaseAdmin
      .from('marketplace_listings')
      .select('*, courses(*)')
      .eq('id', req.params.id)
      .eq('status', 'active')
      .single();
    if (!listing) return res.status(404).json({ error: 'Listing not available' });

    const buyerId = req.user.id;
    if (listing.seller_id === buyerId) return res.status(400).json({ error: 'Cannot purchase your own listing' });

    const amount = parseFloat(listing.price);

    // PAID listings must go through the payment flow (/payments/order →
    // /payments/verify), which creates the enrollment on a verified payment.
    // This endpoint only fulfils FREE enrolments; otherwise it was a free-course
    // button for paid listings (no money taken, fake seller earnings credited).
    if (amount > 0) {
      const { data: paid } = await supabaseAdmin.from('payments')
        .select('id').eq('user_id', buyerId).eq('course_id', listing.course_id).eq('status', 'paid').maybeSingle();
      if (!paid) return res.status(402).json({ error: 'This is a paid course — complete payment to enrol.', requiresPayment: true, price: amount });
    }

    // Check if already purchased
    const { data: existing } = await supabaseAdmin.from('marketplace_purchases').select('id').eq('buyer_id', buyerId).eq('listing_id', listing.id).single();
    if (existing) return res.status(400).json({ error: 'You have already purchased this course' });
    const commRate = parseFloat(listing.commission_rate || 15) / 100;
    const platformFee = amount * commRate;
    const sellerEarnings = amount - platformFee;
    const transactionId = 'TXN_' + uuidv4().replace(/-/g, '').toUpperCase().slice(0, 16);

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('marketplace_purchases')
      .insert({
        id: uuidv4(),
        buyer_id: buyerId,
        listing_id: listing.id,
        amount,
        platform_fee: platformFee,
        seller_earnings: sellerEarnings,
        status: 'completed',
        transaction_id: transactionId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (purchaseError) throw purchaseError;

    // Create enrollment for the course
    await supabaseAdmin.from('enrollments').insert({
      id: uuidv4(),
      course_id: listing.course_id,
      student_id: buyerId,
      enrollment_date: new Date().toISOString(),
      status: 'active',
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).select().single();

    // Record seller earnings
    await supabaseAdmin.from('earnings').insert({
      id: uuidv4(),
      user_id: listing.seller_id,
      amount: sellerEarnings,
      source: 'marketplace_sale',
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    // Increment sales count
    await supabaseAdmin.from('marketplace_listings').update({
      sales_count: (listing.sales_count || 0) + 1,
      updated_at: new Date().toISOString()
    }).eq('id', listing.id);

    res.json({
      message: 'Purchase successful! You are now enrolled in the course.',
      purchase,
      transactionId,
      enrollmentCreated: true
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

module.exports = router;
