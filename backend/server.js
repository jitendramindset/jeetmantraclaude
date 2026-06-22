// Sentry must be initialized before any other requires to instrument them.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Sentry = require('@sentry/node');
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

// ── Single App Shell ────────────────────────────────────────────────────────
// /app is the canonical post-login entry. The shell (currently dashboard.html —
// already role-driven dynamic nav + widget engine + in-page section routing) is
// served for /app and any /app/* client route so deep links / refreshes work.
// Standalone module pages (studio/exam-platform/…) still resolve for now and are
// being migrated to render *inside* this shell; public pages stay standalone.
app.get(['/app', '/app/*'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'dashboard.html'));
});

// Dev-only pages — 404 in production so the prod build ships without dev tooling.
const DEV_ONLY_PAGES = new Set(['/control-center.html']);
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && DEV_ONLY_PAGES.has(req.path)) {
    return res.status(404).send('Not found');
  }
  next();
});

app.use(express.static(frontendPath));

// LevelDB wiring for ALL /api routes:
//   cacheMiddleware — cache-aside reads (local LevelDB), Supabase on miss
//   syncMiddleware  — record writes to local SyncQueue + fire optional n8n addon
app.use(cacheMiddleware);
app.use(syncMiddleware);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
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

// LevelDB sync queue endpoint
app.get('/api/sync/queue', async (req, res) => {
  try {
    const { SyncQueue } = require('./config/leveldb');
    const queue = new SyncQueue();
    const items = await queue.dequeue();
    res.json({ queue: items, count: items.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sync/flush', async (req, res) => {
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

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path, method: req.method });
});

if (process.env.SENTRY_DSN) Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

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
