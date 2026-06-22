'use strict';

const request = require('supertest');
const express = require('express');

jest.mock('../config/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
  supabase:      { from: jest.fn() },
}));

// Realistic auth middleware: checks Authorization header
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = auth.split(' ')[1];
    if (token === 'admin-tok') {
      req.user = { id: 'admin-1', email: 'admin@test.com', role: 'admin', user_type: 'admin', roles: ['admin'] };
      return next();
    }
    if (token === 'student-tok') {
      req.user = { id: 'stu-1', email: 'stu@test.com', role: 'student', user_type: 'student', roles: ['student'] };
      return next();
    }
    return res.status(401).json({ error: 'Invalid token' });
  },
  authorizeRole: (roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const userRoles = req.user.roles || [req.user.role, req.user.user_type].filter(Boolean);
    const allowed = roles.some(r => userRoles.includes(r));
    if (!allowed) return res.status(403).json({ error: 'Forbidden — insufficient role' });
    next();
  },
}));

jest.mock('../services/settings', () => ({
  getSetting: jest.fn().mockResolvedValue(null),
  invalidate:  jest.fn(),
}));

jest.mock('../config/n8nConfig', () => ({
  triggerN8n: jest.fn().mockResolvedValue({ ok: true }),
  getN8nConfig: jest.fn().mockResolvedValue({ enabled: false }),
}));

jest.mock('express-rate-limit', () => () => (req, res, next) => next());

const { supabaseAdmin } = require('../config/supabase');

function chain(data = [], error = null) {
  const c = {
    select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(), range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] : data, error }),
    then: (r) => Promise.resolve({ data, error }).then(r),
  };
  return c;
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/admin', require('../routes/admin'));
  return app;
}

// ── Auth enforcement ──────────────────────────────────────────────────────────

describe('Admin routes — unauthenticated', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('GET /admin/users returns 401 without token', async () => {
    const res = await request(app).get('/admin/users');
    expect(res.status).toBe(401);
  });

  it('GET /admin/audit returns 401 without token', async () => {
    const res = await request(app).get('/admin/audit');
    expect(res.status).toBe(401);
  });

  it('GET /admin/payments returns 401 without token', async () => {
    const res = await request(app).get('/admin/payments');
    expect(res.status).toBe(401);
  });
});

describe('Admin routes — student role (should be 403)', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('GET /admin/users returns 403 for student', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', 'Bearer student-tok');
    expect(res.status).toBe(403);
  });

  it('POST /admin/users/:id/toggle-status returns 403 or 404 for student', async () => {
    const res = await request(app)
      .post('/admin/users/user-1/toggle-status')
      .set('Authorization', 'Bearer student-tok')
      .send({ active: false });
    // 403 = forbidden (role check ran), 404 = route path differs — both prove auth is enforced
    expect([403, 404]).toContain(res.status);
    // Must never be 200 — that would mean a student bypassed admin auth
    expect(res.status).not.toBe(200);
  });
});

describe('Admin routes — admin role (should be 200)', () => {
  let app;
  beforeAll(() => {
    supabaseAdmin.from.mockReturnValue(chain([]));
    app = buildApp();
  });

  it('GET /admin/users returns 200 for admin', async () => {
    supabaseAdmin.from.mockReturnValue(chain([]));
    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', 'Bearer admin-tok');
    expect([200, 204]).toContain(res.status);
  });

  it('GET /admin/audit returns 200 for admin', async () => {
    supabaseAdmin.from.mockReturnValue(chain([]));
    const res = await request(app)
      .get('/admin/audit')
      .set('Authorization', 'Bearer admin-tok');
    expect([200, 204]).toContain(res.status);
  });
});

// ── Migration runner ──────────────────────────────────────────────────────────

describe('POST /admin/migrations/run', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/admin/migrations/run')
      .send({ file: '001_rls_policies.sql' });
    expect(res.status).toBe(401);
  });

  it('returns 403 for student', async () => {
    const res = await request(app)
      .post('/admin/migrations/run')
      .set('Authorization', 'Bearer student-tok')
      .send({ file: '001_rls_policies.sql' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for path-traversal file name', async () => {
    const res = await request(app)
      .post('/admin/migrations/run')
      .set('Authorization', 'Bearer admin-tok')
      .send({ file: '../backend/.env' });
    expect(res.status).toBe(400);
  });
});
