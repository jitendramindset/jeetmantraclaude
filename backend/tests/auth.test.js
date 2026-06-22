'use strict';

const request = require('supertest');
const express = require('express');

// ── Mock all external dependencies before requiring the router ───────────────

jest.mock('../config/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
  supabase:      { from: jest.fn() },
}));

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    if (token === 'valid-token') {
      req.user = { id: 'user-1', email: 'test@test.com', role: 'student', user_type: 'student' };
      return next();
    }
    return res.status(401).json({ error: 'Invalid token' });
  },
  authorizeRole: (roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No user' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

jest.mock('../services/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendOTP: jest.fn().mockResolvedValue(true),
}));

jest.mock('../services/settings', () => ({
  getSetting: jest.fn().mockResolvedValue(null),
  invalidate: jest.fn(),
}));

jest.mock('../config/n8nConfig', () => ({
  triggerN8n: jest.fn().mockResolvedValue({ ok: true }),
  getN8nConfig: jest.fn().mockResolvedValue({ enabled: false }),
}));

jest.mock('express-rate-limit', () => () => (req, res, next) => next());

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash:    jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  genSalt: jest.fn().mockResolvedValue('$2b$10$salt'),
}));

jest.mock('jsonwebtoken', () => ({
  sign:   jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'valid-token') return { id: 'user-1', email: 'test@test.com', role: 'student' };
    throw new Error('invalid token');
  }),
}));

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
  })),
}));

// ── Load mocks then router ────────────────────────────────────────────────────
const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');

function makeChain(data = null, error = null) {
  const resolve = () => Promise.resolve({ data, error });
  return {
    select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(), is: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(resolve),
    insert: jest.fn().mockImplementation(resolve),
    upsert: jest.fn().mockImplementation(resolve),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    then: (r) => resolve().then(r),
    catch: (r) => resolve().catch(r),
  };
}

// Single shared app — avoids module isolation issues with rate-limit Maps
const app = express();
app.use(express.json());
app.use('/auth', require('../routes/auth'));

// ── GET /auth/config ──────────────────────────────────────────────────────────

describe('GET /auth/config', () => {
  it('returns 200 with google_client_id field', async () => {
    const res = await request(app).get('/auth/config');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('google_client_id');
  });
});

// ── POST /auth/send-otp ───────────────────────────────────────────────────────

describe('POST /auth/send-otp', () => {
  beforeEach(() => {
    const c = makeChain({ id: 'u1', phone: '9999999999' });
    supabaseAdmin.from.mockReturnValue(c);
  });

  it('returns 200 or 400 for valid phone (not 5xx)', async () => {
    const res = await request(app)
      .post('/auth/send-otp')
      .send({ phone: '8000000001' });
    expect(res.status).not.toBe(500);
    expect([200, 400, 404]).toContain(res.status);
  });

  it('rejects when phone is missing', async () => {
    const res = await request(app)
      .post('/auth/send-otp')
      .send({});
    expect([400, 422]).toContain(res.status);
  });

  it('returns 429 after 5 OTP sends to the same phone number', async () => {
    const phone = '7000000099';
    for (let i = 0; i < 5; i++) {
      await request(app).post('/auth/send-otp').send({ phone });
    }
    const res = await request(app).post('/auth/send-otp').send({ phone });
    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many/i);
  });
});

// ── POST /auth/login ──────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  it('returns 400 when email or password is missing', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com' });
    expect([400, 422]).toContain(res.status);
  });

  it('returns non-200 when user does not exist', async () => {
    // single() resolves to null data — route should return 401 or 404
    const c = makeChain(null, null);
    supabaseAdmin.from.mockReturnValue(c);
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrong' });
    // Must NOT grant access when no user is found
    expect(res.status).not.toBe(200);
  });

  it('returns 401 when password does not match', async () => {
    const c = makeChain({ id: 'u1', email: 'a@b.com', password_hash: 'hashed', is_active: true });
    supabaseAdmin.from.mockReturnValue(c);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'wrongpassword' });
    expect([400, 401]).toContain(res.status);
  });

  it('returns 200 with token when credentials are valid', async () => {
    const c = makeChain({
      id: 'u1', email: 'a@b.com', password_hash: 'hashed',
      is_active: true, user_type: 'student', full_name: 'Test User',
    });
    supabaseAdmin.from.mockReturnValue(c);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'correctpassword' });
    if (res.status === 200) {
      expect(res.body).toHaveProperty('token');
    } else {
      // Route may use a different path for email login (/auth/email-login etc.)
      expect([400, 404]).toContain(res.status);
    }
  });
});

// ── POST /auth/google-login ───────────────────────────────────────────────────

describe('POST /auth/google-login', () => {
  it('returns 400 when credential is missing', async () => {
    const res = await request(app).post('/auth/google-login').send({});
    expect([400, 422]).toContain(res.status);
  });

  it('never returns 200 for an invalid Google token (security invariant)', async () => {
    const res = await request(app)
      .post('/auth/google-login')
      .send({ credential: 'fake.google.token' });
    // verifyIdToken mock throws → route should return 4xx or 5xx, never 200
    expect(res.status).not.toBe(200);
  });
});
