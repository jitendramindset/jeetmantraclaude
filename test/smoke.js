/**
 * JeetMantra EduOS — Smoke Test Suite
 * Run against staging: BASE_URL=https://staging.yourdomain.com node test/smoke.js
 * Run against local:   BASE_URL=http://localhost:5000 node test/smoke.js
 *
 * Uses only built-in Node.js (no test framework needed).
 * Set credentials via env vars — do NOT hardcode.
 */

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const STUDENT_EMAIL  = process.env.TEST_STUDENT_EMAIL  || 'student@test.com';
const STUDENT_PASS   = process.env.TEST_STUDENT_PASS   || 'test1234';
const TEACHER_EMAIL  = process.env.TEST_TEACHER_EMAIL  || 'teacher@test.com';
const TEACHER_PASS   = process.env.TEST_TEACHER_PASS   || 'test1234';
const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    || 'admin@test.com';
const ADMIN_PASS     = process.env.TEST_ADMIN_PASS     || 'test1234';
const PARTNER_EMAIL  = process.env.TEST_PARTNER_EMAIL  || 'partner@test.com';
const PARTNER_PASS   = process.env.TEST_PARTNER_PASS   || 'test1234';

const http = BASE.startsWith('https') ? require('https') : require('http');

let passed = 0, failed = 0, skipped = 0;
const results = [];

async function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port || (BASE.startsWith('https') ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
    };
    const r = http.request(opts, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    results.push({ status: '✅', name, detail });
  } else {
    failed++;
    results.push({ status: '❌', name, detail });
  }
}

function skip(name, reason) {
  skipped++;
  results.push({ status: '⏭️ ', name, detail: 'SKIPPED: ' + reason });
}

async function run() {
  console.log('\n🧪 JeetMantra EduOS Smoke Test');
  console.log('   Target: ' + BASE);
  console.log('   ' + new Date().toISOString() + '\n');

  // ── T0: Health ─────────────────────────────────────────
  console.log('── Health Check');
  try {
    const r = await req('GET', '/health');
    check('GET /health → 200', r.status === 200, JSON.stringify(r.body));
    check('/health has status:ok', r.body?.status === 'ok');
  } catch (e) { check('GET /health reachable', false, e.message); }

  // ── T1: Student login + enrollment flow ────────────────
  console.log('\n── T1: Student Role');
  let studentToken;
  try {
    const login = await req('POST', '/api/auth/login', { email: STUDENT_EMAIL, password: STUDENT_PASS });
    check('Student login → 200', login.status === 200, 'status=' + login.status);
    studentToken = login.body?.token;
    check('Student login returns token', !!studentToken);

    if (studentToken) {
      const me = await req('GET', '/api/me', null, studentToken);
      check('GET /api/me → 200', me.status === 200);
      check('GET /api/me returns user', !!me.body?.id || !!me.body?.user_id);

      const dashboard = await req('GET', '/api/dashboard', null, studentToken);
      check('GET /api/dashboard → 200', dashboard.status === 200);

      const courses = await req('GET', '/api/marketplace?limit=5', null, studentToken);
      check('GET /api/marketplace → 200', courses.status === 200);

      const enrollments = await req('GET', '/api/enrollments', null, studentToken);
      check('GET /api/enrollments → 200', enrollments.status === 200);

      // IDOR test — student cannot access admin endpoint
      const adminAttempt = await req('GET', '/api/admin/users', null, studentToken);
      check('Student cannot reach /api/admin/users → 401/403', [401, 403].includes(adminAttempt.status), 'got ' + adminAttempt.status);
    }
  } catch (e) { check('Student flow error-free', false, e.message); }

  // ── T2: Teacher role ───────────────────────────────────
  console.log('\n── T2: Teacher Role');
  let teacherToken;
  try {
    const login = await req('POST', '/api/auth/login', { email: TEACHER_EMAIL, password: TEACHER_PASS });
    check('Teacher login → 200', login.status === 200);
    teacherToken = login.body?.token;
    check('Teacher login returns token', !!teacherToken);

    if (teacherToken) {
      const dashboard = await req('GET', '/api/dashboard', null, teacherToken);
      check('Teacher GET /api/dashboard → 200', dashboard.status === 200);

      const courses = await req('GET', '/api/courses?mine=true', null, teacherToken);
      check('Teacher GET /api/courses?mine=true → 200', courses.status === 200);

      const timetable = await req('GET', '/api/timetable', null, teacherToken);
      check('Teacher GET /api/timetable → 200', timetable.status === 200);

      // Cannot access admin routes
      const adminAttempt = await req('GET', '/api/admin/users', null, teacherToken);
      check('Teacher cannot reach /api/admin/users → 401/403', [401, 403].includes(adminAttempt.status));
    }
  } catch (e) { check('Teacher flow error-free', false, e.message); }

  // ── T3: Admin role ─────────────────────────────────────
  console.log('\n── T3: Admin Role');
  let adminToken;
  try {
    const login = await req('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASS });
    check('Admin login → 200', login.status === 200);
    adminToken = login.body?.token;
    check('Admin login returns token', !!adminToken);

    if (adminToken) {
      const users = await req('GET', '/api/admin/users?limit=5', null, adminToken);
      check('Admin GET /api/admin/users → 200', users.status === 200);

      const payments = await req('GET', '/api/admin/payments?limit=5', null, adminToken);
      check('Admin GET /api/admin/payments → 200', payments.status === 200);

      const syncQueue = await req('GET', '/api/sync/queue', null, adminToken);
      check('Admin GET /api/sync/queue → 200', syncQueue.status === 200);
    }
  } catch (e) { check('Admin flow error-free', false, e.message); }

  // ── T4: Partner role ───────────────────────────────────
  console.log('\n── T4: Partner Role');
  try {
    const login = await req('POST', '/api/auth/login', { email: PARTNER_EMAIL, password: PARTNER_PASS });
    check('Partner login → 200', login.status === 200);
    const partnerToken = login.body?.token;
    check('Partner login returns token', !!partnerToken);

    if (partnerToken) {
      const institutions = await req('GET', '/api/institutions', null, partnerToken);
      check('Partner GET /api/institutions → 200', institutions.status === 200);
    }
  } catch (e) { check('Partner flow error-free', false, e.message); }

  // ── T5: OTP rate limit ─────────────────────────────────
  console.log('\n── T5: Auth Security');
  try {
    // Hit /api/auth/send-otp 9 times rapidly — should hit rate limit
    let rateLimited = false;
    for (let i = 0; i < 9; i++) {
      const r = await req('POST', '/api/auth/send-otp', { phone: '+919999999999' });
      if (r.status === 429) { rateLimited = true; break; }
    }
    check('OTP rate limit fires within 9 attempts', rateLimited, rateLimited ? '429 received' : 'no 429 after 9 attempts');

    // Login with wrong password — should eventually throttle
    let loginThrottled = false;
    for (let i = 0; i < 12; i++) {
      const r = await req('POST', '/api/auth/login', { email: 'nobody@test.com', password: 'wrongpass' });
      if (r.status === 429) { loginThrottled = true; break; }
    }
    check('Login throttle fires within 12 attempts', loginThrottled);
  } catch (e) { check('Auth security tests', false, e.message); }

  // ── T6: Coupon validation ──────────────────────────────
  console.log('\n── T6: Coupon');
  try {
    if (studentToken) {
      const badCoupon = await req('POST', '/api/payments/apply-coupon', { code: 'NONEXISTENT_ZZZZZ' }, studentToken);
      check('Invalid coupon → 400/404', [400, 404].includes(badCoupon.status), 'got ' + badCoupon.status);
    } else {
      skip('Coupon test', 'No student token (login failed)');
    }
  } catch (e) { check('Coupon validation', false, e.message); }

  // ── T7: Content IDOR ───────────────────────────────────
  console.log('\n── T7: Content Access Control');
  try {
    if (studentToken && adminToken) {
      // Try to access a course content as student without enrollment
      // We need a known course ID — use a random one and expect 403/404 not 200 with content
      const r = await req('GET', '/api/course-content/00000000-0000-0000-0000-000000000000/topics', null, studentToken);
      check('Non-enrolled student cannot access content → 403/404', [403, 404].includes(r.status), 'got ' + r.status);
    } else {
      skip('IDOR test', 'Missing tokens');
    }
  } catch (e) { check('Content IDOR check', false, e.message); }

  // ── T8: Unauthenticated access ─────────────────────────
  console.log('\n── T8: Unauthenticated Access');
  try {
    const r1 = await req('GET', '/api/dashboard');
    check('Unauthenticated /api/dashboard → 401', r1.status === 401, 'got ' + r1.status);

    const r2 = await req('GET', '/api/me');
    check('Unauthenticated /api/me → 401', r2.status === 401, 'got ' + r2.status);

    const r3 = await req('GET', '/api/admin/users');
    check('Unauthenticated /api/admin/users → 401', r3.status === 401, 'got ' + r3.status);
  } catch (e) { check('Unauthenticated access check', false, e.message); }

  // ── T9: /api/v1 versioning ─────────────────────────────
  console.log('\n── T9: API Versioning');
  try {
    const r = await req('GET', '/api/v1/marketplace?limit=3');
    check('GET /api/v1/marketplace → 200', r.status === 200, 'got ' + r.status);
  } catch (e) { check('API v1 prefix', false, e.message); }

  // ── T10: Error handler ─────────────────────────────────
  console.log('\n── T10: Error Handling');
  try {
    const r = await req('GET', '/api/nonexistent-route-xyz');
    check('Unknown API route → 404 JSON', r.status === 404 && typeof r.body === 'object', 'got ' + r.status);
    check('404 body has error field', !!r.body?.error);
  } catch (e) { check('Error handler check', false, e.message); }

  // ── T11: Wallet (no double-spend) ─────────────────────
  console.log('\n── T11: Wallet');
  try {
    if (studentToken) {
      const wallet = await req('GET', '/api/wallet', null, studentToken);
      check('GET /api/wallet → 200', wallet.status === 200);

      // Try withdrawing more than balance → expect 400
      const r = await req('POST', '/api/wallet/withdraw', { amount: 999999999 }, studentToken);
      check('Withdraw more than balance → 400', r.status === 400, 'got ' + r.status);
    } else {
      skip('Wallet test', 'No student token');
    }
  } catch (e) { check('Wallet test', false, e.message); }

  // ── T12: Gamification endpoints ────────────────────────
  console.log('\n── T12: Gamification');
  try {
    if (studentToken) {
      const g = await req('GET', '/api/gamification/profile', null, studentToken);
      check('GET /api/gamification/profile → 200', g.status === 200, 'got ' + g.status);
    } else {
      skip('Gamification test', 'No student token');
    }
  } catch (e) { check('Gamification test', false, e.message); }

  // ── Summary ────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  console.log('Results:\n');
  results.forEach(r => console.log(`  ${r.status} ${r.name}${r.detail ? '\n       ' + r.detail : ''}`));

  const total = passed + failed + skipped;
  console.log('\n' + '─'.repeat(60));
  console.log(`  ${passed}/${total} passed  |  ${failed} failed  |  ${skipped} skipped`);

  if (failed > 0) {
    console.log('\n  ❌ FAIL — fix the items above before deploying\n');
    process.exit(1);
  } else {
    console.log('\n  ✅ PASS — all checks green\n');
    process.exit(0);
  }
}

run().catch(e => { console.error('Fatal:', e); process.exit(2); });
