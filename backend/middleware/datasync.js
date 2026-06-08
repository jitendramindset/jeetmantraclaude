/**
 * datasync.js — wires LevelDB (local) into EVERY API route at once.
 *
 * Two Express middlewares:
 *   1. cacheMiddleware  — cache-aside for safe GET reads. Serves from LevelDB
 *                         when warm, otherwise lets the route hit Supabase and
 *                         stores the JSON response for next time. Per-user keyed.
 *   2. syncMiddleware   — for every successful write (POST/PUT/PATCH/DELETE),
 *                         records the operation in the LevelDB SyncQueue (so it
 *                         can be replayed/flushed to the server when offline) and
 *                         fires the optional n8n webhook addon.
 *
 * This gives the architecture the user asked for: local LevelDB on every
 * endpoint + Supabase/Postgres as the source of truth + n8n as an opt-in addon.
 */
const crypto = require('crypto');
const { cacheGet, cacheSet, del, list, SyncQueue } = require('../config/leveldb');
const { triggerN8n } = require('../config/n8nConfig');
const { logEvent } = require('../routes/activity');

const queue = new SyncQueue();

// Per-route cache TTLs (seconds). Anything not listed uses the default.
const CACHE_TTL = {
  '/api/dashboard': 60,
  '/api/courses': 120,
  '/api/search': 120,
  '/api/marketplace': 90,
  '/api/users/profile': 120,
};
const DEFAULT_TTL = 60;

// Routes that must NEVER be cached (auth, OTP, feeds, chat — anything that
// must be fresh on every read).
const NO_CACHE_PREFIXES = ['/api/auth', '/api/sync', '/api/n8n', '/api/webhooks', '/api/activity', '/api/chat'];

function shouldCache(path) {
  return !NO_CACHE_PREFIXES.some(p => path.startsWith(p));
}

function ttlFor(path) {
  const hit = Object.keys(CACHE_TTL).find(p => path.startsWith(p));
  return hit ? CACHE_TTL[hit] : DEFAULT_TTL;
}

// Build a per-user cache key so one user's data never leaks to another.
function cacheKey(req) {
  const auth = req.headers.authorization || 'anon';
  const userTag = crypto.createHash('sha1').update(auth).digest('hex').slice(0, 12);
  const qs = JSON.stringify(req.query || {});
  return `${req.path}|${userTag}|${qs}`;
}

/**
 * cacheMiddleware — only acts on GET requests to cacheable routes.
 */
async function cacheMiddleware(req, res, next) {
  if (!req.path.startsWith('/api')) return next();
  if (req.method !== 'GET' || !shouldCache(req.path)) return next();

  const key = cacheKey(req);
  try {
    const cached = await cacheGet(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Data-Source', 'leveldb');
      return res.json(cached);
    }
  } catch (_) { /* cache miss is non-fatal */ }

  // Cache miss — capture the route's JSON response and store it.
  // NB: capture the full path NOW — Express rewrites req.path during sub-router
  // routing, so by the time res.json runs it may read e.g. "/" instead of
  // "/api/courses". Use originalUrl (minus query) which stays stable.
  const fullPath = (req.originalUrl || req.path).split('?')[0];
  res.setHeader('X-Cache', 'MISS');
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cacheSet(key, body, ttlFor(fullPath)).catch(() => {});
      res.setHeader('X-Data-Source', 'supabase');
    }
    return originalJson(body);
  };
  next();
}

/**
 * syncMiddleware — on every successful write, enqueue a sync record + fire n8n.
 * The write still goes straight to Supabase inside the route; this layer records
 * it locally so an offline client can replay, and notifies n8n if configured.
 */
function syncMiddleware(req, res, next) {
  const fullPath = (req.originalUrl || req.path).split('?')[0];
  if (!fullPath.startsWith('/api')) return next();
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!writeMethods.includes(req.method)) return next();
  // Don't record these: sync queue itself (feedback loop), auth (sensitive,
  // not a replayable data mutation), or the n8n addon config endpoints.
  const SKIP = ['/api/sync', '/api/auth', '/api/n8n'];
  if (SKIP.some(p => fullPath.startsWith(p))) return next();

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const op = {
        method: req.method,
        path: fullPath,
        userId: req.user?.id || req.user?.userId || null,
        body: sanitize(req.body),
        result: pickId(body),
        status: res.statusCode,
      };
      // Record locally for offline replay (non-blocking).
      queue.enqueue(op).catch(() => {});
      // Invalidate related GET caches so stale reads don't linger.
      invalidate(fullPath).catch(() => {});
      // Fire the optional n8n addon (non-blocking).
      const evt = eventName(fullPath, req.method);
      triggerN8n(evt, op).catch(() => {});
      // Drop an activity_feed row for events worth surfacing on a wall.
      try { logActivityFromWrite(evt, fullPath, req, body); } catch (_) {}
    }
    return originalJson(body);
  };
  next();
}

// Drop password/token fields before they ever touch the local queue.
function sanitize(body) {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...body };
  for (const k of ['password', 'token', 'otp', 'password_hash']) delete clone[k];
  return clone;
}

function pickId(body) {
  if (!body || typeof body !== 'object') return null;
  const obj = body.user || body.course || body.listing || body.data || body;
  return obj && obj.id ? { id: obj.id } : null;
}

// Cache invalidation: clear every cached GET that belongs to the route family
// of the write. Cache keys look like  cache:/api/courses|<userhash>|<query>  so
// we prefix-scan `cache:/api/<family>` and delete all matches (all users/queries).
//
// The dashboard endpoint aggregates from ~10 source tables — so ANY write to a
// data route must also clear the dashboard cache, or stale snapshots persist.
async function invalidate(path) {
  const family = '/' + path.split('/').slice(1, 3).join('/'); // e.g. /api/courses
  const families = new Set([family, '/api/dashboard']);
  // Writes to marketplace/enrollments touch buyer dashboards too — already
  // covered by always clearing dashboard, plus clear the enrollments family.
  if (family === '/api/marketplace') families.add('/api/enrollments');
  try {
    for (const f of families) {
      const entries = await list('cache:' + f);
      await Promise.all(entries.map(e => del(e.key).catch(() => {})));
    }
  } catch (_) { /* invalidation is best-effort */ }
}

function eventName(fullPath, method) {
  const seg = fullPath.replace(/^\/api\//, '').split('/')[0];
  const verb = { POST: 'created', PUT: 'updated', PATCH: 'updated', DELETE: 'deleted' }[method] || 'changed';
  return `${seg}.${verb}`;
}

// Map an event to an activity_feed row with a human-readable message.
// Only certain "wall-worthy" events are recorded — random profile edits etc.
// aren't useful on a feed.
function logActivityFromWrite(evt, fullPath, req, body) {
  const actor = req.user?.id || req.user?.userId || null;
  const map = {
    'courses.created':           () => ({ msg: '📚 Created a new course', courseId: body?.course?.id }),
    'live-classes.created':      () => ({ msg: '📡 Scheduled a live class', courseId: body?.liveClass?.course_id }),
    'enrollments.created':       () => ({ msg: '🎓 Enrolled in a course', courseId: body?.enrollment?.course_id }),
    'attendance.created':        () => ({ msg: '✅ Marked attendance', courseId: body?.attendance?.course_id, targetUser: body?.attendance?.student_id }),
    'assignments.created':       () => ({ msg: '📝 Posted a new assignment', courseId: body?.assignment?.course_id }),
    'marketplace.created':       () => ({ msg: '🛒 Listed a course on the marketplace' }),
  };
  const m = map[evt];
  if (!m) return;
  const { msg, courseId, targetUser } = m();
  logEvent({
    eventType: evt,
    actorId: actor,
    targetUserId: targetUser || null,
    courseId: courseId || null,
    message: msg
  }).catch(() => {});
}

module.exports = { cacheMiddleware, syncMiddleware };
