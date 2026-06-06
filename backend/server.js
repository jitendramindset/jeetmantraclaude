const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
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

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 JeetMantra Backend running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Supabase: ${process.env.SUPABASE_URL ? 'Connected' : 'Not configured'}`);
});

module.exports = app;
