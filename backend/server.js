const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend files
const frontendPath = path.join(__dirname, '..', 'jeetmantraclaude-main');
app.use(express.static(frontendPath));

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

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path, method: req.method });
});

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
