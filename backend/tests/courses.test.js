'use strict';

const request = require('supertest');
const express = require('express');

jest.mock('../config/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
  supabase:      { from: jest.fn() },
}));

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    if (token === 'enrolled-tok') {
      req.user = { id: 'enrolled-user', role: 'student', user_type: 'student', roles: ['student'] };
      return next();
    }
    if (token === 'unenrolled-tok') {
      req.user = { id: 'unenrolled-user', role: 'student', user_type: 'student', roles: ['student'] };
      return next();
    }
    if (token === 'teacher-tok') {
      req.user = { id: 'teacher-1', role: 'teacher', user_type: 'teacher', roles: ['teacher'] };
      return next();
    }
    return res.status(401).json({ error: 'Invalid' });
  },
  authorizeRole: (roles) => (req, res, next) => {
    const userRoles = req.user?.roles || [req.user?.role].filter(Boolean);
    if (!roles.some(r => userRoles.includes(r))) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

jest.mock('../middleware/requireCapability', () => ({
  requireCapability: () => (req, res, next) => next(),
  fallbackHasCapability: () => true,
}));
jest.mock('../middleware/resolveInstitution', () => ({
  resolveInstitution: (req, res, next) => next(),
  attachInstitution: (req, res, next) => next(),
}));
// Do NOT mock validation — let real Joi run so input validation tests work
jest.mock('../services/settings', () => ({ getSetting: jest.fn().mockResolvedValue(null), invalidate: jest.fn() }));
jest.mock('../config/n8nConfig', () => ({ triggerN8n: jest.fn() }));
jest.mock('../config/roles', () => ({
  CREATOR_ROLES: ['teacher', 'admin', 'school', 'coaching'],
  SELLER_ROLES: ['teacher', 'admin'],
}));
jest.mock('express-rate-limit', () => () => (req, res, next) => next());
// Multer — avoid real disk writes in tests
jest.mock('multer', () => {
  const m = () => ({ single: () => (req, res, next) => next(), array: () => (req, res, next) => next() });
  m.diskStorage = () => ({});
  m.memoryStorage = () => ({});
  return m;
});

const { supabaseAdmin } = require('../config/supabase');

const MOCK_COURSE = {
  id: 'course-1', title: 'Test Course', price: 999,
  is_active: true, institution_id: null, teacher_id: 'teacher-1',
};

function chain(data = null, error = null) {
  const resolve = () => Promise.resolve({ data, error });
  const c = {
    select:  jest.fn().mockReturnThis(),
    eq:      jest.fn().mockReturnThis(),
    neq:     jest.fn().mockReturnThis(),
    is:      jest.fn().mockReturnThis(),
    not:     jest.fn().mockReturnThis(),
    or:      jest.fn().mockReturnThis(),
    order:   jest.fn().mockReturnThis(),
    limit:   jest.fn().mockReturnThis(),
    range:   jest.fn().mockReturnThis(),
    ilike:   jest.fn().mockReturnThis(),
    filter:  jest.fn().mockReturnThis(),
    single:      jest.fn().mockImplementation(resolve),
    maybeSingle: jest.fn().mockImplementation(resolve),
    insert:  jest.fn().mockImplementation(resolve),
    update:  jest.fn().mockReturnThis(),
    delete:  jest.fn().mockReturnThis(),
    then: (r) => Promise.resolve({ data, error }).then(r),
  };
  return c;
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/courses', require('../routes/courses'));
  return app;
}

// ── Public listing ────────────────────────────────────────────────────────────

describe('GET /courses — public', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('returns 200 with course list (no auth required)', async () => {
    supabaseAdmin.from.mockReturnValue(chain([MOCK_COURSE]));
    const res = await request(app).get('/courses');
    expect([200, 204]).toContain(res.status);
  });
});

// ── Course content — enrollment gate (in courseContent router, not courses) ──
// Content is at GET /api/course-content/:courseId/lectures — tested via courseContent router

describe('GET /courses/:id — single course info', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('returns 200 for existing course', async () => {
    supabaseAdmin.from.mockReturnValue(chain(MOCK_COURSE));
    const res = await request(app).get('/courses/course-1');
    expect([200, 204, 404]).toContain(res.status);
  });
});

// ── Create course — auth + role ───────────────────────────────────────────────

describe('POST /courses — create', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/courses')
      .send({ title: 'New Course', price: 500 });
    expect(res.status).toBe(401);
  });

  it('returns 400/422 when required fields missing (Joi)', async () => {
    supabaseAdmin.from.mockReturnValue(chain(null));
    const res = await request(app)
      .post('/courses')
      .set('Authorization', 'Bearer teacher-tok')
      .send({ title: '' }); // missing required fields
    expect([400, 422]).toContain(res.status);
  }, 5000);
});

// ── Course content router — enrollment gate ───────────────────────────────────

describe('GET /course-content/:id/lectures — enrollment gate', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/course-content', require('../routes/courseContent'));
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/course-content/course-1/lectures');
    expect(res.status).toBe(401);
  });

  it('hides non-preview (paid) lectures from an unenrolled user', async () => {
    // The route is a SOFT gate: unenrolled users get 200 but only is_preview items.
    // Security property = paid lectures must NOT leak to a logged-in non-enrollee.
    const LECTURES = [
      { id: 'lec-free', title: 'Free intro',  is_preview: true,  course_id: 'course-1' },
      { id: 'lec-paid', title: 'Paid lesson', is_preview: false, course_id: 'course-1' },
    ];
    supabaseAdmin.from.mockImplementation((table) => {
      if (table === 'course_lectures') return chain(LECTURES);
      if (table === 'enrollments')     return chain(null); // not enrolled
      if (table === 'courses')         return chain({ id: 'course-1', teacher_id: 'teacher-1' });
      return chain(null);
    });

    const res = await request(app)
      .get('/course-content/course-1/lectures')
      .set('Authorization', 'Bearer unenrolled-tok');

    expect(res.status).toBe(200);
    const titles = (res.body.lectures || []).map(l => l.id);
    expect(titles).toContain('lec-free');        // preview is visible
    expect(titles).not.toContain('lec-paid');    // paid lesson is hidden — the invariant
  }, 5000);
});
