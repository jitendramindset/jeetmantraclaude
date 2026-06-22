// navigation-roles.spec.js
// ---------------------------------------------------------------------------
// Covers Phases 2, 4, 5 of the EduOS E2E plan: ROLES, PERMISSIONS, NAVIGATION.
//
// Two data-driven suites, one case per role (11 roles):
//   1. DASHBOARD LOADS — for every role, seedSession(role) then
//      goto /dashboard.html?role=<role> and assert the app shell renders for
//      that role WITHOUT a redirect to /login.html. This is verified against
//      the *client-side* gate + synchronous render in public/dashboard.html
//      (loadDashboard, lines ~2080-2093): the gate only redirects when
//      jm_token / jm_user are absent, then synchronously paints the role badge
//      (#userRoleBadge) and page title BEFORE the awaited /api/dashboard call.
//      We therefore do NOT depend on a seeded backend for these asserts.
//
//   2. ADMIN-OS FORBIDDEN MATRIX — for every NON-admin role, seedSession(role)
//      then goto /admin-os.html and assert the admin UI is NOT usable. The gate
//      in public/admin-os.html (lines ~169-180) redirects to
//      /login.html?next=/admin-os.html unless user_type/role === 'admin'.
//      We assert (a) we landed on login (guard fired) and (b) the admin-only
//      nav (e.g. [data-section="tenants"]) is not present/usable. The admin
//      role is asserted positively: it reaches the Platform OS shell.
//
// PRECONDITIONS:
//   - baseURL (E2E_BASE_URL || http://localhost:5000) serves public/ + /api.
//     A beforeAll guard skips the whole file if /health is unreachable, so the
//     file is safe to run anywhere.
//   - Pure frontend role-gating is exercised here. No DB seeding or real creds
//     are required; seedSession writes an UNSIGNED fake JWT (frontend gating
//     only) — the backend would reject it, which is fine because the asserts
//     below never need a 200 from a protected API.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');
const { seedSession, clearSession } = require('../fixtures/session');

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000';

// Canonical platform roles — verified against backend/config/roles.js ALL_ROLES
// (10 distinct roles; the "11 roles" headline counts a duplicate). Every role
// is covered by a test below.
const ROLES = [
  'student',
  'teacher',
  'partner',
  'school',
  'coaching',
  'admin',
  'parent',
  'corporate_trainer',
  'content_creator',
  'franchise',
];
const NON_ADMIN_ROLES = ROLES.filter((r) => r !== 'admin');

// Human labels rendered into #userRoleBadge by dashboard.html ROLE_LABELS
// (line ~1291). Emoji stripped. 'parent' has no entry -> falls back to the raw
// role token. We assert the TEXT (sans emoji) for determinism.
const ROLE_LABEL_TEXT = {
  student: 'Student',
  teacher: 'Teacher',
  partner: 'Partner',
  admin: 'Admin',
  school: 'School',
  coaching: 'Coaching',
  corporate_trainer: 'Corporate Trainer',
  content_creator: 'Content Creator',
  franchise: 'Franchise',
  parent: 'parent', // no ROLE_LABELS entry -> raw role string
};

let baseUp = false;

test.beforeAll(async ({ request }) => {
  try {
    const r = await request.get(BASE + '/health', { timeout: 4000 });
    baseUp = r.ok();
  } catch (_) {
    baseUp = false;
  }
});

test.beforeEach(() => {
  test.skip(!baseUp, `baseURL ${BASE} /health unreachable — start the server to run navigation-roles specs`);
});

// ---------------------------------------------------------------------------
// SUITE 1 — every role's dashboard loads (client-side render, no backend dep)
// ---------------------------------------------------------------------------
test.describe('Phase 2/5 — per-role dashboard loads', () => {
  for (const role of ROLES) {
    test(`dashboard.html?role=${role} renders the shell for ${role}`, async ({ page }) => {
      const user = await seedSession(page, role);
      expect(user.user_type).toBe(role);

      const resp = await page.goto(`${BASE}/dashboard.html?role=${role}`, { waitUntil: 'domcontentloaded' });
      // The static page itself must be served (not a 404).
      expect(resp, 'dashboard.html should respond').toBeTruthy();

      // The gate must NOT have bounced us to login (token + user are seeded).
      // Give any synchronous redirect a tick to settle, then assert URL.
      await page.waitForLoadState('domcontentloaded');
      await expect.poll(() => page.url(), { timeout: 5000 }).not.toContain('/login.html');
      expect(page.url()).toContain('/dashboard.html');

      // App shell present (rendered statically in the HTML, independent of API).
      await expect(page.locator('#sidebar')).toBeAttached();

      // loadDashboard() paints the role badge synchronously BEFORE awaiting
      // /api/dashboard, so this is backend-independent. Assert it shows the
      // role we seeded.
      const badge = page.locator('#userRoleBadge');
      await expect(badge).toBeVisible();
      await expect(badge).toHaveText(new RegExp(ROLE_LABEL_TEXT[role], 'i'), { timeout: 5000 });

      // No hard crash: document.title is set to "...<Role> Dashboard".
      await expect.poll(() => page.title(), { timeout: 5000 }).toMatch(/Dashboard/i);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 2 — FORBIDDEN MATRIX: only admin may use admin-os.html
// ---------------------------------------------------------------------------
test.describe('Phase 4 — admin-os.html permission gate (forbiddenMatrix)', () => {
  // Positive control: admin DOES reach the Platform OS shell.
  test('admin role reaches admin-os.html Platform OS shell', async ({ page }) => {
    await seedSession(page, 'admin');
    await page.goto(`${BASE}/admin-os.html`, { waitUntil: 'domcontentloaded' });

    // Gate allows admin through — must NOT be on login.
    await expect.poll(() => page.url(), { timeout: 5000 }).not.toContain('/login.html');
    expect(page.url()).toContain('/admin-os.html');

    // Admin-only chrome is present and usable.
    await expect(page.locator('.brand', { hasText: 'EduOS' })).toBeVisible();
    await expect(page.locator('.nav-item[data-section="tenants"]')).toBeVisible();
    await expect(page.locator('.nav-item[data-section="system"]')).toBeVisible();
  });

  // Negative: every NON-admin role is bounced and cannot use the admin UI.
  for (const role of NON_ADMIN_ROLES) {
    test(`${role} is DENIED admin-os.html (redirected to login, admin UI not usable)`, async ({ page }) => {
      await seedSession(page, role);
      await page.goto(`${BASE}/admin-os.html`, { waitUntil: 'domcontentloaded' });

      // The client-side gate (admin-os.html ~line 174) redirects non-admins to
      // /login.html?next=/admin-os.html. Assert the guard fired.
      await expect
        .poll(() => page.url(), { timeout: 6000 })
        .toContain('/login.html');
      // Preserves the intended destination so login can resume it.
      expect(page.url()).toContain('next=');

      // And the admin-only content must NOT be usable on the resulting page.
      // (We are now on login.html — the Platform OS nav must be absent.)
      await expect(page.locator('.nav-item[data-section="tenants"]')).toHaveCount(0);
      await expect(page.locator('.nav-item[data-section="system"]')).toHaveCount(0);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 3 — logged-out users cannot reach EITHER surface
// ---------------------------------------------------------------------------
test.describe('Phase 4 — unauthenticated access is blocked', () => {
  test('no session -> dashboard.html bounces to /login.html', async ({ page }) => {
    await clearSession(page);
    await page.goto(`${BASE}/dashboard.html?role=student`, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.url(), { timeout: 6000 }).toContain('/login.html');
  });

  test('no session -> admin-os.html bounces to /login.html', async ({ page }) => {
    await clearSession(page);
    await page.goto(`${BASE}/admin-os.html`, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.url(), { timeout: 6000 }).toContain('/login.html');
    expect(page.url()).toContain('next=');
  });
});
