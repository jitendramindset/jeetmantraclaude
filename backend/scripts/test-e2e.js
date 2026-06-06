/**
 * JeetMantra E2E Test Suite
 * Run: node scripts/test-e2e.js
 * Requires backend running on localhost:5000
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');

const BASE = `http://localhost:${process.env.PORT || 5000}`;
const results = { pass: 0, fail: 0, tests: [] };
const tokens = {};
const ids = {};

function pass(name) {
  results.pass++;
  results.tests.push({ name, status: 'PASS' });
  console.log('  ✅', name);
}

function fail(name, reason) {
  results.fail++;
  results.tests.push({ name, status: 'FAIL', reason });
  console.log('  ❌', name, '-', String(reason).slice(0, 120));
}

async function test(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (e) {
    fail(name, e.response?.data?.error || e.response?.data?.message || e.message);
  }
}

function authHeader(role) {
  return { Authorization: 'Bearer ' + tokens[role] };
}

// ============================================================
// TEST USERS
// ============================================================
const TEST_USERS = [
  { email: 'student_test@jm.test', password: 'Test1234!', fullName: 'Test Student', role: 'student' },
  { email: 'teacher_test@jm.test', password: 'Test1234!', fullName: 'Test Teacher', role: 'teacher' },
  { email: 'partner_test@jm.test', password: 'Test1234!', fullName: 'Test Partner', role: 'partner' },
  { email: 'school_test@jm.test',  password: 'Test1234!', fullName: 'Test School',  role: 'school'  },
  { email: 'coaching_test@jm.test',password: 'Test1234!', fullName: 'Test Coaching',role: 'coaching'},
];

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   JeetMantra Platform E2E Test Suite     ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log(`🔗 Backend: ${BASE}\n`);

  // ── HEALTH CHECK ──────────────────────────────────────────
  console.log('🏥 Health Check');
  await test('GET /health returns ok', async () => {
    const { data } = await axios.get(`${BASE}/health`);
    if (data.status !== 'ok') throw new Error('Status not ok');
    console.log('     Features:', JSON.stringify(data.features));
    console.log('     Roles:', data.roles?.join(', '));
  });

  // ── AUTH: SIGNUP ──────────────────────────────────────────
  console.log('\n🔐 Authentication — Signup');
  for (const u of TEST_USERS) {
    await test(`Signup as ${u.role} (${u.email})`, async () => {
      try {
        const { data } = await axios.post(`${BASE}/api/auth/signup`, u);
        tokens[u.role] = data.token;
        ids[u.role] = data.user?.id;
      } catch (e) {
        if (e.response?.status === 400 && e.response?.data?.error?.includes('already')) {
          // Already exists — login instead
          const { data } = await axios.post(`${BASE}/api/auth/login`, { email: u.email, password: u.password });
          tokens[u.role] = data.token;
          ids[u.role] = data.user?.id;
        } else throw e;
      }
    });
  }

  // ── AUTH: LOGIN ───────────────────────────────────────────
  console.log('\n🔑 Authentication — Login');
  for (const u of TEST_USERS) {
    await test(`Login as ${u.role}`, async () => {
      const { data } = await axios.post(`${BASE}/api/auth/login`, { email: u.email, password: u.password });
      if (!data.token) throw new Error('No token returned');
      tokens[u.role] = data.token;
      ids[u.role] = data.user?.id;
    });
  }

  await test('Login with wrong password returns 401', async () => {
    try {
      await axios.post(`${BASE}/api/auth/login`, { email: TEST_USERS[0].email, password: 'wrongpass' });
      throw new Error('Should have failed');
    } catch (e) {
      if (e.response?.status !== 401) throw new Error('Expected 401, got ' + e.response?.status);
    }
  });

  await test('Token verification', async () => {
    const { data } = await axios.get(`${BASE}/api/auth/verify`, { headers: authHeader('student') });
    if (!data.user) throw new Error('No user in verify response');
  });

  // ── DASHBOARD: ALL ROLES ─────────────────────────────────
  console.log('\n📊 Dashboards — All 6 Roles');
  const dashRoles = ['student', 'teacher', 'partner', 'school', 'coaching'];
  for (const role of dashRoles) {
    await test(`Dashboard for ${role}`, async () => {
      const { data } = await axios.get(`${BASE}/api/dashboard`, { headers: authHeader(role) });
      if (!data.dashboard) throw new Error('No dashboard data');
      if (data.role !== role) throw new Error(`Expected role=${role}, got ${data.role}`);
    });
  }

  await test('Dashboard requires auth (401 without token)', async () => {
    try {
      await axios.get(`${BASE}/api/dashboard`);
      throw new Error('Should have failed');
    } catch (e) {
      if (e.response?.status !== 401) throw new Error('Expected 401');
    }
  });

  // ── COURSES ───────────────────────────────────────────────
  console.log('\n📚 Courses');
  await test('GET /api/courses (public)', async () => {
    const { data } = await axios.get(`${BASE}/api/courses`);
    if (!Array.isArray(data.courses) && !Array.isArray(data.data)) throw new Error('No courses array');
  });

  await test('GET /api/courses with category filter', async () => {
    const { data } = await axios.get(`${BASE}/api/courses?category=Mathematics`);
    if (!data) throw new Error('No response');
  });

  // ── SEARCH ────────────────────────────────────────────────
  console.log('\n🔍 Search');
  await test('GET /api/search?q=math', async () => {
    const { data } = await axios.get(`${BASE}/api/search?q=math`);
    if (!Array.isArray(data.results)) throw new Error('No results array');
  });

  await test('GET /api/search/suggestions?q=sci', async () => {
    const { data } = await axios.get(`${BASE}/api/search/suggestions?q=sci`);
    if (!Array.isArray(data.suggestions)) throw new Error('No suggestions array');
  });

  await test('GET /api/search/categories', async () => {
    const { data } = await axios.get(`${BASE}/api/search/categories`);
    if (!Array.isArray(data.categories)) throw new Error('No categories array');
  });

  await test('GET /api/search/semantic?q=programming', async () => {
    const { data } = await axios.get(`${BASE}/api/search/semantic?q=programming`);
    if (!Array.isArray(data.results)) throw new Error('No results array');
  });

  // ── MARKETPLACE ───────────────────────────────────────────
  console.log('\n🛒 Marketplace');
  await test('GET /api/marketplace (public)', async () => {
    const { data } = await axios.get(`${BASE}/api/marketplace`);
    if (!Array.isArray(data.listings)) throw new Error('No listings array');
  });

  await test('GET /api/marketplace/my/listings (teacher)', async () => {
    const { data } = await axios.get(`${BASE}/api/marketplace/my/listings`, { headers: authHeader('teacher') });
    if (!Array.isArray(data.listings)) throw new Error('No listings array');
  });

  await test('GET /api/marketplace/my/purchases (student)', async () => {
    const { data } = await axios.get(`${BASE}/api/marketplace/my/purchases`, { headers: authHeader('student') });
    if (!Array.isArray(data.purchases)) throw new Error('No purchases array');
  });

  await test('Student cannot create marketplace listing', async () => {
    try {
      await axios.post(`${BASE}/api/marketplace`,
        { courseId: '00000000-0000-0000-0000-000000000000', price: 999 },
        { headers: authHeader('student') }
      );
      throw new Error('Should have been forbidden');
    } catch (e) {
      if (e.response?.status !== 403) throw new Error('Expected 403, got ' + e.response?.status);
    }
  });

  // ── n8n INTEGRATION ───────────────────────────────────────
  console.log('\n🤖 n8n Integration');
  await test('GET /api/n8n/status', async () => {
    const { data } = await axios.get(`${BASE}/api/n8n/status`);
    if (typeof data.connected !== 'boolean') throw new Error('No connected field');
    console.log('     n8n connected:', data.connected, '| URL:', data.n8nUrl);
  });

  await test('POST /api/n8n/webhook (user.created event)', async () => {
    const { data } = await axios.post(`${BASE}/api/n8n/webhook`, {
      event: 'user.created',
      data: { email: 'test@example.com', role: 'student' },
      timestamp: new Date().toISOString()
    });
    if (!data.received) throw new Error('Webhook not acknowledged');
  });

  await test('POST /api/n8n/sync-users', async () => {
    const { data } = await axios.post(`${BASE}/api/n8n/sync-users`, {});
    if (!Array.isArray(data.users)) throw new Error('No users array');
  });

  await test('POST /api/n8n/sync-courses', async () => {
    const { data } = await axios.post(`${BASE}/api/n8n/sync-courses`, {});
    if (!Array.isArray(data.courses)) throw new Error('No courses array');
  });

  // ── LOCAL SYNC ────────────────────────────────────────────
  console.log('\n📦 Local Sync (LevelDB)');
  await test('GET /api/sync/queue', async () => {
    const { data } = await axios.get(`${BASE}/api/sync/queue`);
    if (!Array.isArray(data.queue)) throw new Error('No queue array');
  });

  await test('POST /api/sync/flush', async () => {
    const { data } = await axios.post(`${BASE}/api/sync/flush`);
    if (typeof data.flushed !== 'number') throw new Error('No flushed count');
  });

  // ── USER PROFILE ──────────────────────────────────────────
  console.log('\n👤 User Profile');
  await test('GET /api/users/profile', async () => {
    const { data } = await axios.get(`${BASE}/api/users/profile`, { headers: authHeader('student') });
    if (!data.user && !data.id && !data.email) throw new Error('No user data');
  });

  // ── OTP ───────────────────────────────────────────────────
  console.log('\n📱 Phone OTP');
  await test('POST /api/auth/send-otp', async () => {
    const { data } = await axios.post(`${BASE}/api/auth/send-otp`, { phone: '+919876543210' });
    if (!data.message) throw new Error('No message');
  });

  // ── VALIDATION ────────────────────────────────────────────
  console.log('\n🛡️  Validation');
  await test('Signup with invalid role returns 400', async () => {
    try {
      await axios.post(`${BASE}/api/auth/signup`, {
        email: 'bad@test.com', password: 'Test1234!', fullName: 'Bad', role: 'superadmin'
      });
      throw new Error('Should have failed');
    } catch (e) {
      if (e.response?.status !== 400) throw new Error('Expected 400');
    }
  });

  await test('Signup with short password returns 400', async () => {
    try {
      await axios.post(`${BASE}/api/auth/signup`, {
        email: 'x@test.com', password: '123', fullName: 'X', role: 'student'
      });
      throw new Error('Should have failed');
    } catch (e) {
      if (e.response?.status !== 400) throw new Error('Expected 400');
    }
  });

  await test('school role is valid in signup', async () => {
    // We just need to verify no 400 on role validation (may get 400 for other reasons)
    try {
      await axios.post(`${BASE}/api/auth/signup`, {
        email: `school_val_${Date.now()}@jm.test`,
        password: 'Test1234!', fullName: 'School Val', role: 'school'
      });
    } catch (e) {
      if (e.response?.data?.details?.some(d => d.field === 'role')) {
        throw new Error('school role rejected by validation');
      }
    }
  });

  await test('coaching role is valid in signup', async () => {
    try {
      await axios.post(`${BASE}/api/auth/signup`, {
        email: `coaching_val_${Date.now()}@jm.test`,
        password: 'Test1234!', fullName: 'Coaching Val', role: 'coaching'
      });
    } catch (e) {
      if (e.response?.data?.details?.some(d => d.field === 'role')) {
        throw new Error('coaching role rejected by validation');
      }
    }
  });

  // ── SUMMARY ───────────────────────────────────────────────
  const total = results.pass + results.fail;
  const pct = Math.round((results.pass / total) * 100);
  console.log('\n╔══════════════════════════════════════════╗');
  console.log(`║  📊 Results: ${results.pass}/${total} passed (${pct}%)`.padEnd(43) + '║');
  console.log('╚══════════════════════════════════════════╝\n');

  if (results.fail > 0) {
    console.log('❌ Failed tests:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`   • ${t.name}`);
      if (t.reason) console.log(`     → ${t.reason}`);
    });
    console.log('');
  }

  if (pct === 100) console.log('🎉 All tests passed! Platform is ready.\n');
  else if (pct >= 80) console.log('✅ Most tests passed. Check failed tests above.\n');
  else console.log('⚠️  Multiple failures. Make sure backend is running and DB is configured.\n');

  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch(e => {
  if (e.code === 'ECONNREFUSED') {
    console.error('\n❌ Cannot connect to backend at', BASE);
    console.error('   Start it with: cd backend && npm start\n');
  } else {
    console.error('\n❌ Unexpected error:', e.message);
  }
  process.exit(1);
});
