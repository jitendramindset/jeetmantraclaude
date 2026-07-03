// Sentry must be initialized before any other requires to instrument them.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Sentry = require('@sentry/node');
// ── Structured logger ─────────────────────────────────────────────────────────
// In production outputs JSON lines for log aggregators (LogFlare, Datadog, etc.)
// In development outputs human-readable messages.
const isProd = process.env.NODE_ENV === 'production';

// ── LogFlare HTTP shipping ────────────────────────────────────────────────────
// Batches log events and ships them to LogFlare every 5 seconds when the token
// is present. Falls back gracefully when the env var is absent (dev / test).
let _logBatch = [];
let _logFlushTimer = null;

function _shipToLogFlare(events) {
  if (!process.env.LOGFLARE_PRIVATE_ACCESS_TOKEN || !events.length) return;
  const body = JSON.stringify({ batch: events });
  const url = new URL('https://api.logflare.app/logs?source=jeetmantra-app');
  const mod = require('https');
  const req = mod.request({
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.LOGFLARE_PRIVATE_ACCESS_TOKEN,
      'Content-Length': Buffer.byteLength(body),
    },
  }, () => {});
  req.on('error', () => {}); // swallow shipping errors — never crash the app
  req.write(body);
  req.end();
}

function _scheduleFlush() {
  if (_logFlushTimer) return;
  _logFlushTimer = setTimeout(() => {
    _logFlushTimer = null;
    const batch = _logBatch.splice(0);
    if (batch.length) _shipToLogFlare(batch);
  }, 5000);
}

function _log(level, args) {
  const msg = args.join(' ');
  const entry = { level, t: new Date().toISOString(), msg };
  if (isProd) {
    (level === 'error' ? process.stderr : process.stdout).write(JSON.stringify(entry) + '\n');
    _logBatch.push({ message: msg, metadata: { level, timestamp: entry.t } });
    _scheduleFlush();
  } else {
    ({ info: console.log, warn: console.warn, error: console.error }[level])('[' + level.toUpperCase() + ']', ...args);
  }
}

const logger = {
  info:  (...a) => _log('info',  a),
  warn:  (...a) => _log('warn',  a),
  error: (...a) => _log('error', a),
};
global.logger = logger;


if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.05,
  });
}

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payments');
const attendanceRoutes = require('./routes/attendance');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');
const liveClassesRoutes = require('./routes/liveClasses');
const marketplaceRoutes = require('./routes/marketplace');
const searchRoutes = require('./routes/search');
const n8nRoutes = require('./routes/n8n');
const courseContentRoutes = require('./routes/courseContent');
const studentExtrasRoutes = require('./routes/studentExtras');
const institutionsRoutes = require('./routes/institutions');
const assignmentsRoutes = require('./routes/assignments');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');
const activityRoutes = require('./routes/activity');
const teacherExtrasRoutes = require('./routes/teacherExtras');
const parentExtrasRoutes  = require('./routes/parentExtras');
const walletRoutes        = require('./routes/wallet');
const eduosRoutes         = require('./routes/eduos');
const calendarRoutes      = require('./routes/calendar');
// Sprint 3 — operations queues + localization depth
const approvalsRoutes     = require('./routes/approvals');
const payoutsRoutes       = require('./routes/payouts');
const supportRoutes       = require('./routes/support');
const reportsRoutes       = require('./routes/reports');
const notifAdminRoutes    = require('./routes/notificationsAdmin');
const translationsRoutes  = require('./routes/translations');
// Sprint 4 — unified booking engine
const resourcesRoutes     = require('./routes/resources');
const bookingsRoutes      = require('./routes/bookings');
// Sprint 5 — student success: streak / XP / badges + dedicated notifications
const gamificationRoutes  = require('./routes/gamification');
const notificationsRoutes = require('./routes/notifications');
// Sprint 6 — certificates + impersonation
const certificatesRoutes  = require('./routes/certificates');
// Sprint 7 — role-org unification foundation
const orgsRoutes          = require('./routes/orgs');
const meRoutes            = require('./routes/me');
const seoRoutes           = require('./routes/seo');
const timetableRoutes     = require('./routes/timetable');
const i18nRoutes          = require('./routes/i18n');
const studioRoutes        = require('./routes/studio');
const ragRoutes           = require('./routes/rag');
const { cacheMiddleware, syncMiddleware } = require('./middleware/datasync');
const { authenticateToken, authorizeRole } = require('./middleware/auth');

const app = express();

// Production hardening: trust proxy + helmet + compression + rate limiting.
require('./middleware/security').applySecurity(app);

// CORS: lock to FRONTEND_URL in production (comma-separated list allowed); only
// the dev convenience falls back to permissive '*'.
const _cors = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : (process.env.NODE_ENV === 'production' ? false : '*');
app.use(cors({ origin: _cors, credentials: true }));
// The Razorpay webhook signature is computed over the RAW request bytes, so it
// must be parsed as a Buffer BEFORE the global JSON parser consumes the stream.
// Path-specific raw parser first; everything else gets JSON.
app.use('/api/payments/webhook', express.raw({ type: '*/*', limit: '1mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend files
const frontendPath = path.join(__dirname, '..', 'public');

// ── App shell (post-login) ───────────────────────────────────────────────────
// /app and /app/* serve the dashboard shell. All other navigation happens inside
// the SPA (index.html) via history.pushState — the shell itself is never linked
// to directly by end users; they always arrive via the JS router.
app.get(['/app', '/app/*'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── HTML gating — single entry point ────────────────────────────────────────
// Standalone pages served directly; all other .html goes through the JS router.
const STANDALONE_HTML = new Set(['/index.html', '/blog.html', '/admin-os.html']);
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const p = req.path;
  if (!p.endsWith('.html')) return next();
  if (STANDALONE_HTML.has(p)) return next();
  return res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Static assets (JS, CSS, images, fonts, etc.) ────────────────────────────
app.use(express.static(frontendPath));

// ── SPA catch-all ────────────────────────────────────────────────────────────
// Any GET that fell through (unknown path, client-side route refresh, etc.)
// returns index.html so the JS router can handle it.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// LevelDB wiring for ALL /api routes:
//   cacheMiddleware — cache-aside reads (local LevelDB), Supabase on miss
//   syncMiddleware  — record writes to local SyncQueue + fire optional n8n addon
app.use(cacheMiddleware);
app.use(syncMiddleware);

app.get('/health', (req, res) => {
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;
  const isAdmin = adminToken && authHeader === `Bearer ${adminToken}`;

  if (!isAdmin) {
    return res.json({ status: 'ok', version: process.env.npm_package_version || '1.0.0' });
  }

  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: {
      supabase: !!process.env.SUPABASE_URL,
      n8n: !!process.env.N8N_WEBHOOK_URL,
      leveldb: true,
      marketplace: true,
      vectorSearch: !!process.env.OPENAI_API_KEY
    },
    roles: ['student', 'teacher', 'partner', 'admin', 'school', 'coaching'],
    apiRoutes: ['/api/auth', '/api/users', '/api/courses', '/api/enrollments', '/api/dashboard', '/api/payments', '/api/attendance', '/api/live-classes', '/api/webhooks', '/api/admin', '/api/marketplace', '/api/search', '/api/n8n', '/api/sync']
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/live-classes', liveClassesRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/n8n', n8nRoutes);
app.use('/api/course-content', courseContentRoutes);
app.use('/api/student', studentExtrasRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/teacher', teacherExtrasRoutes);
app.use('/api/parent', parentExtrasRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/eduos', eduosRoutes);
app.use('/api/calendar', calendarRoutes);
// Sprint 3 mounts
app.use('/api/approvals', approvalsRoutes);
app.use('/api/payouts', payoutsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications-admin', notifAdminRoutes);
app.use('/api/translations', translationsRoutes);
// Sprint 4 mounts
app.use('/api/resources', resourcesRoutes);
app.use('/api/bookings', bookingsRoutes);
// Sprint 5 mounts
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/certificates', certificatesRoutes);
// Sprint 7 mounts
app.use('/api/orgs', orgsRoutes);
app.use('/api/capabilities', orgsRoutes.capRouter);
app.use('/api/categories', orgsRoutes.catRouter);
app.use('/api/me', meRoutes);
app.use('/api/seo', seoRoutes);
app.use('/', seoRoutes.rootRouter); // /sitemap.xml + /robots.txt
app.use('/api/timetable', timetableRoutes);
app.use('/api/i18n', i18nRoutes);
app.use('/api/studio', studioRoutes);
app.use('/api/rag', ragRoutes);
const permissionsRoutes = require('./routes/permissions');
app.use('/api/permissions', permissionsRoutes);
const cmsRoutes = require('./routes/cms');
app.use('/api/cms', cmsRoutes);

// ── API v1 versioned prefix (same routers, future-proof path) ───────────────
// All existing /api/* routes are mirrored under /api/v1/* so clients can
// pin a version while the unversioned paths remain for backwards compatibility.
const v1 = express.Router();
v1.use('/auth',               authRoutes);
v1.use('/users',              userRoutes);
v1.use('/courses',            courseRoutes);
v1.use('/enrollments',        enrollmentRoutes);
v1.use('/dashboard',          dashboardRoutes);
v1.use('/payments',           paymentRoutes);
v1.use('/attendance',         attendanceRoutes);
v1.use('/live-classes',       liveClassesRoutes);
v1.use('/webhooks',           webhookRoutes);
v1.use('/admin',              adminRoutes);
v1.use('/marketplace',        marketplaceRoutes);
v1.use('/search',             searchRoutes);
v1.use('/n8n',                n8nRoutes);
v1.use('/course-content',     courseContentRoutes);
v1.use('/student',            studentExtrasRoutes);
v1.use('/institutions',       institutionsRoutes);
v1.use('/assignments',        assignmentsRoutes);
v1.use('/ai',                 aiRoutes);
v1.use('/chat',               chatRoutes);
v1.use('/activity',           activityRoutes);
v1.use('/teacher',            teacherExtrasRoutes);
v1.use('/parent',             parentExtrasRoutes);
v1.use('/wallet',             walletRoutes);
v1.use('/eduos',              eduosRoutes);
v1.use('/calendar',           calendarRoutes);
v1.use('/approvals',          approvalsRoutes);
v1.use('/payouts',            payoutsRoutes);
v1.use('/support',            supportRoutes);
v1.use('/reports',            reportsRoutes);
v1.use('/notifications-admin',notifAdminRoutes);
v1.use('/translations',       translationsRoutes);
v1.use('/resources',          resourcesRoutes);
v1.use('/bookings',           bookingsRoutes);
v1.use('/gamification',       gamificationRoutes);
v1.use('/notifications',      notificationsRoutes);
v1.use('/certificates',       certificatesRoutes);
v1.use('/orgs',               orgsRoutes);
v1.use('/me',                 meRoutes);
v1.use('/timetable',          timetableRoutes);
v1.use('/i18n',               i18nRoutes);
v1.use('/studio',             studioRoutes);
v1.use('/rag',                ragRoutes);
v1.use('/permissions',        permissionsRoutes);
v1.use('/cms',                cmsRoutes);
app.use('/api/v1', v1);

// LevelDB sync queue endpoint
app.get('/api/sync/queue', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { SyncQueue } = require('./config/leveldb');
    const queue = new SyncQueue();
    const items = await queue.dequeue();
    res.json({ queue: items, count: items.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sync/flush', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { SyncQueue } = require('./config/leveldb');
    const queue = new SyncQueue();
    const items = await queue.dequeue();
    const flushed = [];
    for (const item of items) {
      await queue.complete(item.id);
      flushed.push(item.id);
    }
    res.json({ flushed: flushed.length, ids: flushed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/metrics', (req, res) => {
  const metricsSecret = process.env.METRICS_SECRET;
  if (metricsSecret && req.headers['x-metrics-token'] !== metricsSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const mem = process.memoryUsage();
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send([
    '# HELP process_heap_bytes Node.js heap used in bytes',
    '# TYPE process_heap_bytes gauge',
    `process_heap_bytes ${mem.heapUsed}`,
    '# HELP process_uptime_seconds Process uptime',
    '# TYPE process_uptime_seconds counter',
    `process_uptime_seconds ${Math.floor(process.uptime())}`,
  ].join('\n') + '\n');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

if (process.env.SENTRY_DSN) Sentry.setupExpressErrorHandler(app);

// Global error handler — must be last middleware, 4 params
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Log full error server-side
  if (statusCode >= 500) {
    console.error('[ERROR]', req.method, req.path, err.message, err.stack);
  }

  // In production, don't leak internal error details
  const isDev = process.env.NODE_ENV !== 'production';
  const message = statusCode >= 500 && !isDev
    ? 'Internal server error'
    : (err.message || 'Internal server error');

  res.status(statusCode).json({
    error: message,
    ...(isDev && statusCode >= 500 ? { stack: err.stack } : {}),
  });
});

// Security gate: hardcoded dev credentials are only active when this flag is
// explicitly set. Warn loudly at startup so it is never silently left on.
if (process.env.ALLOW_DEV_USERS === 'true') {
  console.warn('[SECURITY WARNING] ALLOW_DEV_USERS=true — hardcoded dev credentials are active. Do NOT use in production.');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 JeetMantra Backend v2.0 running on port ' + PORT);
  console.log('📚 Environment: ' + process.env.NODE_ENV);
  console.log('🔗 Supabase: ' + (process.env.SUPABASE_URL ? 'Connected' : 'Not configured'));
  console.log('🤖 n8n: ' + (process.env.N8N_WEBHOOK_URL ? 'Configured' : 'Not configured'));
  console.log('🛒 Marketplace: Enabled');
  console.log('👥 Roles: student, teacher, partner, admin, school, coaching');
  console.log('\n📖 API Routes:');
  console.log('   http://localhost:' + PORT + '/health');
  console.log('   http://localhost:' + PORT + '/api/auth/login');
  console.log('   http://localhost:' + PORT + '/api/dashboard');
  console.log('   http://localhost:' + PORT + '/api/marketplace');
  console.log('   http://localhost:' + PORT + '/api/search');
  console.log('   http://localhost:' + PORT + '/api/n8n/status\n');
});

module.exports = app;
