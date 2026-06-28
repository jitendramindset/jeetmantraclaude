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
const jwt = require('jsonwebtoken');
const { cacheGet, cacheSet, del, list, SyncQueue } = require('../config/leveldb');
const { triggerN8n } = require('../config/n8nConfig');
const { logEvent } = require('../routes/activity');

const queue = new SyncQueue();

// Soft-decode the bearer token to a verified identity, WITHOUT enforcing auth
// (public routes still work). Verification matters: a cache HIT returns before
// the route's authenticateToken runs, so keying on an *unverified* id would let
// a forged token read another user's cached data. jwt.verify rejects forgeries.
function softUser(req) {
  if (req.user) return req.user;
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  try { return jwt.verify(m[1], process.env.JWT_SECRET); } catch (e) { return null; }
}
function userTagOf(req) {
  const u = softUser(req);
  return u ? ('u:' + (u.id || u.userId)) : 'anon';
}

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
  if (NO_CACHE_PREFIXES.some(p => path.startsWith(p))) return false;
  // Live, fast-polling sub-resources must stay fresh — caching them (60s) while
  // the client polls every 5–7s just serves stale data and defeats the poll.
  if (/\/(attendees|poll|polls|recordings\/list|cast)(\/|$|\?)/.test(path)) return false;
  return true;
}

function ttlFor(path) {
  const hit = Object.keys(CACHE_TTL).find(p => path.startsWith(p));
  return hit ? CACHE_TTL[hit] : DEFAULT_TTL;
}

// Build a per-user cache key so one user's data never leaks to another. Keyed on
// the VERIFIED user id (stable across token refreshes — previously the raw token
// hash fragmented the cache on every re-login) plus the active institution
// (institution-scoped responses were served stale after switching) plus query.
function cacheKey(req) {
  const userTag = userTagOf(req);
  const inst = req.headers['x-active-institution'] || '';
  const qs = JSON.stringify(req.query || {});
  return `${req.path}|${userTag}|${inst}|${qs}`;
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
  // High-frequency live studio frames must not flood the offline sync queue.
  if (/\/cast(\/|$|\?)/.test(fullPath)) return next();

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const _su = softUser(req);
      const op = {
        method: req.method,
        path: fullPath,
        userId: req.user?.id || req.user?.userId || _su?.id || _su?.userId || null,
        body: sanitize(req.body),
        result: pickId(body),
        status: res.statusCode,
      };
      // Record locally for offline replay (non-blocking).
      queue.enqueue(op).catch(() => {});
      // Invalidate related GET caches BEFORE the response is sent, so a client
      // that immediately refetches after a write can't read the stale cache
      // (the previous fire-and-forget invalidate raced the refetch).
      const evt = eventName(fullPath, req.method);
      invalidate(fullPath, req)
        .catch(() => {})
        .then(() => {
          // Fire the optional n8n addon (non-blocking, after invalidation).
          triggerN8n(evt, op).catch(() => {});
          try { logActivityFromWrite(evt, fullPath, req, body); } catch (e) { console.warn('activity log err:', e.message); }
          originalJson(body);
        });
      return res;
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
// Public families are shared by everyone, so a write clears the whole family.
// Private families are per-user, so a write only clears the WRITER's entries —
// previously every write prefix-scanned and deleted ALL users' cache (global
// churn). Scoping uses the `|u:<id>|` segment embedded in each cache key.
const PUBLIC_FAMILIES = new Set(['/api/marketplace', '/api/courses', '/api/search']);
async function invalidate(path, req) {
  const family = '/' + path.split('/').slice(1, 3).join('/'); // e.g. /api/courses
  const writerTag = req ? userTagOf(req) : null; // 'u:<id>' or 'anon'
  // [family, scopeToWriter?] pairs.
  const targets = [
    [family, !PUBLIC_FAMILIES.has(family)],
    ['/api/dashboard', true], // dashboards are per-user
  ];
  if (family === '/api/marketplace') { targets.push(['/api/enrollments', true]); targets.push(['/api/courses', false]); }
  // A course edit makes its public marketplace listing stale.
  if (family === '/api/courses') targets.push(['/api/marketplace', false]);
  // Test-session submits write test_submissions, which /api/student reads.
  if (family === '/api/course-content' && /\/sessions\//.test(path)) targets.push(['/api/student', true]);
  // Attendance/assignment writes feed student progress reads downstream.
  if (family === '/api/attendance' || family === '/api/assignments') targets.push(['/api/student', true]);
  try {
    const seen = new Set();
    for (const [f, scoped] of targets) {
      const tagKey = f + '|' + (scoped ? '1' : '0');
      if (seen.has(tagKey)) continue; seen.add(tagKey);
      const entries = await list('cache:' + f);
      const toDelete = (scoped && writerTag && writerTag !== 'anon')
        ? entries.filter(e => e.key.includes('|' + writerTag + '|'))
        : entries;
      await Promise.all(toDelete.map(e => del(e.key).catch(() => {})));
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

// Clear ONE user's cached GETs for the given route families. For out-of-band
// producers (e.g. notification writers) that mutate a user's data WITHOUT going
// through that user's request — so syncMiddleware never fires for them and the
// recipient would otherwise read a stale cache until the TTL (e.g. an unread
// notification count that stays at 0 for ~60s). Keys embed `|u:<id>|`, so we
// prefix-scan each family and delete only the target user's entries.
async function invalidateUser(userId, families = ['/api/notifications', '/api/dashboard']) {
  if (!userId) return;
  const tag = 'u:' + userId;
  try {
    for (const f of families) {
      const entries = await list('cache:' + f);
      await Promise.all(
        entries.filter(e => e.key.includes('|' + tag + '|')).map(e => del(e.key).catch(() => {}))
      );
    }
  } catch (_) { /* best-effort: a failed invalidation just means a brief stale read */ }
}

module.exports = { cacheMiddleware, syncMiddleware, invalidateUser };
