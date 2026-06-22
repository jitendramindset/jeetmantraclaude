// security.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// Phases 3, 4, 19 — security / access control at the boundary.
//
// What this file covers:
//   1) Direct URL access (frontend gate): a logged-out visitor that navigates
//      straight to /admin-os.html is bounced to /login.html and never sees admin
//      data/actions (KPI grid, People/Revenue tables, Run-migration / backup
//      buttons). Verified against public/admin-os.html's inline gate(), which does
//      window.location.href='/login.html?next=/admin-os.html' when there is no
//      jm_token or user_type/role !== 'admin'.
//   2) Tampered token (backend gate): GET /api/admin/users with a syntactically
//      bogus 'Bearer not.a.real.token' is rejected. backend/middleware/auth.js
//      authenticateToken → jwt.verify fails → 403 (we accept 401/403).
//   3) Unauthorized API (backend gate): GET /api/admin/users with NO Authorization
//      header → 401 ('Access token required').
//   4) Public endpoints stay open: GET /health → 200 and GET /api/auth/config → 200.
//
// Preconditions / honesty:
//   • baseURL (E2E_BASE_URL || http://localhost:5000) must serve public/ statically
//     AND expose the live Express API. A beforeAll guard skips the WHOLE suite if
//     /health is unreachable, so cases (2)/(3)/(4) — which hit the real backend —
//     never assert vacuously against a dead host.
//   • Case (1) is a pure frontend-gate check: it relies only on the static page +
//     localStorage, so it is meaningful even though it shares the health guard.
//   • We do NOT seed an admin session and assert the dashboard renders here — that
//     positive path needs a real admin token + seeded DB (see fixme at the bottom).
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');
const { clearSession, TOKEN_KEY } = require('../fixtures/session');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5000';

// Skip the whole suite if the static host / API is down, so the file is portable.
test.beforeAll(async ({ request }) => {
  try {
    const res = await request.get(`${BASE_URL}/health`, { timeout: 4000 });
    test.skip(!res.ok(), `baseURL ${BASE_URL} /health not OK — server not running`);
  } catch (e) {
    test.skip(true, `baseURL ${BASE_URL} unreachable (${e.message}) — server not running`);
  }
});

test.describe('Access control — direct URL access to admin-os.html (frontend gate)', () => {
  test('logged-out visitor is redirected to /login.html and sees no admin data', async ({ page }) => {
    // clearSession wipes localStorage on every navigation → no jm_token / jm_user.
    await clearSession(page);
    await page.goto(`${BASE_URL}/admin-os.html`);

    // gate() runs on load: no token → window.location.href = '/login.html?next=/admin-os.html'.
    await page.waitForURL(/\/login\.html/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login\.html/);
    // The redirect preserves the intended destination as ?next=.
    await expect(page).toHaveURL(/next=%2Fadmin-os\.html|next=\/admin-os\.html/);

    // Token must be absent (gate never authenticated us).
    const token = await page.evaluate((k) => localStorage.getItem(k), TOKEN_KEY);
    expect(token).toBeNull();

    // Admin surfaces from admin-os.html must NOT be present on the login page:
    //  • the KPI overview grid (#kpiGrid), the People/Revenue tables,
    //  • the privileged actions (Run-migration button #migBtn, backup #backupBtn).
    await expect(page.locator('#kpiGrid')).toHaveCount(0);
    await expect(page.locator('#peopleTable')).toHaveCount(0);
    await expect(page.locator('#revenueTable')).toHaveCount(0);
    await expect(page.locator('#migBtn')).toHaveCount(0);
    await expect(page.locator('#backupBtn')).toHaveCount(0);
    // And the login form IS present — confirming we really landed on login.html.
    await expect(page.locator('#loginEmail')).toBeVisible();
  });
});

test.describe('Access control — admin API rejects bad / missing auth (backend gate)', () => {
  // GET /api/admin/users is guarded by authenticateToken + authorizeRole(['admin'])
  // (backend/routes/admin.js). We use a raw request context (no page) so the
  // browser's auto-redirect-to-login behavior can't mask the HTTP status.
  const ADMIN_USERS = `${BASE_URL}/api/admin/users`;

  test('tampered token → 401/403 (signature/verify fails)', async ({ request }) => {
    const res = await request.get(ADMIN_USERS, {
      headers: { Authorization: 'Bearer not.a.real.token' },
    });
    // authenticateToken: jwt.verify() throws on a bogus token → 403 'Invalid or
    // expired token'. Accept 401 too in case the deployment maps verify-failure to
    // 401; either way the request MUST be rejected and MUST NOT 200.
    expect(
      [401, 403].includes(res.status()),
      `expected 401/403 for tampered token, got ${res.status()}`,
    ).toBe(true);
    expect(res.status()).not.toBe(200);
  });

  test('no Authorization header → 401 (token required)', async ({ request }) => {
    const res = await request.get(ADMIN_USERS);
    // authenticateToken with no header → res.status(401) 'Access token required'.
    expect(res.status()).toBe(401);
  });
});

test.describe('Public endpoints stay reachable without auth', () => {
  test('GET /health → 200', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/health`);
    expect(res.status()).toBe(200);
  });

  test('GET /api/auth/config → 200 (login bootstrap is public)', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/auth/config`);
    expect(res.status()).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HONEST GAP — the positive admin path needs a real admin JWT + seeded DB, which
// CI lacks. makeFakeJwt() is UNSIGNED, so it would clear the frontend gate but the
// backend (jwt.verify against JWT_SECRET) rejects it — meaning we cannot honestly
// assert the admin dashboard renders real data here. Marked fixme so the gap is
// visible and never passes vacuously.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Access control — admin happy path (needs live backend + seeded admin)', () => {
  test.fixme(
    'real admin session loads admin-os.html with KPIs + People table',
    () => {
      // Needs E2E_REAL_CREDS for a seeded admin user. Obtain a real signed token via
      // loginViaApi(request, BASE_URL, adminEmail, adminPassword) from fixtures/session,
      // inject it as jm_token/jm_user before page.goto, then assert #kpiGrid and
      // #peopleTable populate from /api/admin/* — gated behind process.env.E2E_REAL_CREDS.
    },
  );
});
