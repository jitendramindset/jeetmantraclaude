// accessibility.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 17 (accessibility) — axe-core audits of the key public pages.
//
// What this file covers:
//   Runs assertNoSeriousA11y (fixtures/a11y.js) against each page and FAILS only
//   on impact 'serious' or 'critical'. Moderate/minor violations are surfaced via
//   console.warn (by the helper) and do NOT fail the run.
//
//     • /login.html            (logged-out — clearSession first)
//     • /signup.html           (logged-out — clearSession first)
//     • /forgot-password.html  (logged-out — clearSession first)
//     • /marketplace.html      (renders without auth; top-level page paints, the
//                               jm_token check only guards specific actions)
//     • /dashboard.html?role=student (seedSession('student') FIRST — dashboard.html
//                               redirects to /login.html when jm_token/jm_user are
//                               absent, so we must plant a fake session before goto)
//
// Preconditions / honesty:
//   • baseURL (E2E_BASE_URL || http://localhost:5000) must serve public/ statically.
//   • The a11y helper injects axe-core from node_modules; the package must be
//     installed (`npm i -D axe-core`). A beforeAll guard skips the WHOLE suite if
//     either (a) /health is unreachable, or (b) axe-core cannot be resolved — so
//     this file is safe to run anywhere and never asserts vacuously against a dead
//     host or a missing dependency.
//   • seedSession plants only a FRONTEND-gating (unsigned) token. The dashboard's
//     first paint / client-side gating is what we audit; any /api/* call it fires
//     will 401, but that does not block the DOM that axe scans.
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');
const { seedSession, clearSession } = require('../fixtures/session');
const { assertNoSeriousA11y } = require('../fixtures/a11y');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5000';

// Skip the whole suite if the static host/API is down, OR if axe-core is not
// installed — either way the audits cannot run meaningfully, so don't pretend.
test.beforeAll(async ({ request }) => {
  // (a) server reachable?
  try {
    const res = await request.get(`${BASE_URL}/health`, { timeout: 4000 });
    test.skip(!res.ok(), `baseURL ${BASE_URL} /health not OK — server not running`);
  } catch (e) {
    test.skip(true, `baseURL ${BASE_URL} unreachable (${e.message}) — server not running`);
  }
  // (b) axe-core resolvable? The helper require.resolve()s it at scan time and
  // would otherwise throw mid-test. Fail-skip cleanly instead.
  try {
    require.resolve('axe-core');
  } catch (e) {
    test.skip(true, 'axe-core not installed — run `npm i -D axe-core` to enable a11y audits');
  }
});

test.describe('Phase 17 — accessibility (axe-core, serious/critical only)', () => {
  test.describe('logged-out pages', () => {
    for (const route of ['/login.html', '/signup.html', '/forgot-password.html']) {
      test(`${route} has no serious/critical a11y violations`, async ({ page }) => {
        await clearSession(page); // ensure logged-out state on every nav
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        // Let any deferred DOM (config fetch, conditional sections) settle.
        await page.waitForLoadState('networkidle').catch(() => {});
        await assertNoSeriousA11y(page);
      });
    }
  });

  test('/marketplace.html has no serious/critical a11y violations', async ({ page }) => {
    // marketplace.html paints its shell without auth; the token check only gates
    // specific actions, not first render. Clear session to audit the public view.
    await clearSession(page);
    await page.goto(`${BASE_URL}/marketplace.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await assertNoSeriousA11y(page);
  });

  test('/dashboard.html?role=student has no serious/critical a11y violations', async ({ page }) => {
    // dashboard.html redirects to /login.html unless jm_token + jm_user exist, so
    // seed a (frontend-only) student session BEFORE navigating.
    await seedSession(page, 'student');
    await page.goto(`${BASE_URL}/dashboard.html?role=student`, { waitUntil: 'domcontentloaded' });

    // Guard: confirm we actually landed on the dashboard and were NOT bounced to
    // login (which would make the audit scan the wrong page and pass vacuously).
    await expect(page).toHaveURL(/dashboard\.html/);

    await page.waitForLoadState('networkidle').catch(() => {});
    await assertNoSeriousA11y(page);
  });
});
