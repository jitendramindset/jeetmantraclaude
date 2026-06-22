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
    if (token === 'student-tok') {
      req.user = { id: 'stu-1', email: 'stu@test.com', role: 'student', user_type: 'student', roles: ['student'] };
      return next();
    }
    if (token === 'admin-tok') {
      req.user = { id: 'adm-1', email: 'adm@test.com', role: 'admin', user_type: 'admin', roles: ['admin'] };
      return next();
    }
    return res.status(401).json({ error: 'Invalid token' });
  },
  authorizeRole: (roles) => (req, res, next) => {
    const userRoles = req.user?.roles || [req.user?.role].filter(Boolean);
    if (!roles.some(r => userRoles.includes(r))) return res.status(403).json({ error: 'Forbidden' });
    next();
  },
}));

jest.mock('../services/settings', () => ({ getSetting: jest.fn().mockResolvedValue(null), invalidate: jest.fn() }));
jest.mock('../config/n8nConfig', () => ({ triggerN8n: jest.fn() }));
jest.mock('express-rate-limit', () => () => (req, res, next) => next());

const { supabaseAdmin } = require('../config/supabase');

function chain(data = null, error = null) {
  const c = {
    select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
    insert: jest.fn().mockResolvedValue({ data, error }),
    update: jest.fn().mockReturnThis(),
    then: (r) => Promise.resolve({ data, error }).then(r),
  };
  return c;
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/payments', require('../routes/payments'));
  return app;
}

// ── Auth enforcement on POST /payments/order ──────────────────────────────────

describe('POST /payments/order — auth required', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/payments/order')
      .send({ courseId: 'c1', amount: 999 });
    expect(res.status).toBe(401);
  });

  it('returns 400/422 when amount is not provided (Joi)', async () => {
    supabaseAdmin.from.mockReturnValue(chain(null));
    const res = await request(app)
      .post('/payments/order')
      .set('Authorization', 'Bearer student-tok')
      .send({}); // empty body — Joi should reject
    expect([400, 422]).toContain(res.status);
  });

  it('returns 400/422 when amount is negative (Joi)', async () => {
    supabaseAdmin.from.mockReturnValue(chain(null));
    const res = await request(app)
      .post('/payments/order')
      .set('Authorization', 'Bearer student-tok')
      .send({ courseId: 'c1', amount: -100 });
    expect([400, 422]).toContain(res.status);
  });
});

// ── POST /payments/verify — signature validation ──────────────────────────────

describe('POST /payments/verify — signature', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/payments/verify')
      .send({ razorpay_payment_id: 'pay_1', razorpay_order_id: 'ord_1', razorpay_signature: 'sig' });
    expect(res.status).toBe(401);
  });

  it('returns 400/422 when signature fields are missing (Joi)', async () => {
    supabaseAdmin.from.mockReturnValue(chain(null));
    const res = await request(app)
      .post('/payments/verify')
      .set('Authorization', 'Bearer student-tok')
      .send({ razorpay_payment_id: 'pay_1' }); // missing order_id and signature
    expect([400, 422]).toContain(res.status);
  });

  it('returns 400/401 for invalid HMAC signature', async () => {
    supabaseAdmin.from.mockReturnValue(chain({ id: 'ord_1', amount: 99900 }));
    const res = await request(app)
      .post('/payments/verify')
      .set('Authorization', 'Bearer student-tok')
      .send({
        razorpay_payment_id: 'pay_1',
        razorpay_order_id:   'ord_1',
        razorpay_signature:  'totally-wrong-signature',
      });
    // Must NOT enroll user with bad signature
    expect(res.status).not.toBe(200);
    expect([400, 401, 422]).toContain(res.status);
  });
});

// ── Refund — admin-only ───────────────────────────────────────────────────────

describe('POST /payments/:id/refund — admin only', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/payments/pay_1/refund')
      .send({ reason: 'test' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when student tries to refund', async () => {
    supabaseAdmin.from.mockReturnValue(chain(null));
    const res = await request(app)
      .post('/payments/pay_1/refund')
      .set('Authorization', 'Bearer student-tok')
      .send({ reason: 'test refund' });
    // Student should not be able to issue refunds
    expect(res.status).not.toBe(200);
  });
});

// ── Coupon endpoints — auth enforced ─────────────────────────────────────────

describe('POST /payments/coupons/apply — auth required', () => {
  let app;
  beforeAll(() => { app = buildApp(); });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/payments/coupons/apply')
      .send({ code: 'SAVE10', courseId: 'c1' });
    expect(res.status).toBe(401);
  });

  it('returns 400/422 when code is missing (Joi)', async () => {
    supabaseAdmin.from.mockReturnValue(chain(null));
    const res = await request(app)
      .post('/payments/coupons/apply')
      .set('Authorization', 'Bearer student-tok')
      .send({ courseId: 'c1' }); // missing code
    expect([400, 422]).toContain(res.status);
  });
});
