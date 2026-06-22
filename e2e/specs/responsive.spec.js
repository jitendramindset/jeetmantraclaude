// responsive.spec.js
// -----------------------------------------------------------------------------
// Phases 6 & 7 — UI / responsive layout integrity across a viewport matrix.
//
// Pages under test (served statically by the Express server from public/):
//   - login.html
//   - signup.html
//   - marketplace.html
//   - dashboard.html?role=student   (requires a seeded session — see note below)
//   - settings.html
//
// For each (page, viewport) combination we assert three layout invariants:
//   1. NO horizontal overflow:
//        document.documentElement.scrollWidth <= clientWidth + 2   (2px tolerance
//        for sub-pixel rounding / scrollbar fuzz)
//   2. <body> is visible.
//   3. <body> has non-empty rendered text (innerText.trim().length > 0).
// On failure Playwright captures a screenshot (configure screenshot:'only-on-failure'
// in playwright.config.js). We also take an explicit screenshot of every
// (page,viewport) into test-results/responsive/ for the visual report.
//
// PRECONDITIONS / HONESTY NOTES:
//   * baseURL must be reachable. A beforeAll guard fetches /health and SKIPS the
//     whole suite if the server is down, so this file is safe to run anywhere.
//   * dashboard.html redirects to /login.html when jm_token / jm_user are absent
//     (verified: public/dashboard.html lines ~2083-2084). We therefore call
//     seedSession(page,'student') BEFORE navigating so the static dashboard shell
//     renders. This is FRONTEND ROLE-GATING ONLY — the fake JWT is rejected by the
//     backend, so dashboard data calls (api()) may 401. That does not affect the
//     layout invariants here, which are measured on the static shell. We still
//     assert we stayed on dashboard.html (did not bounce to login) before checking.
// -----------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');
const { seedSession, clearSession } = require('../fixtures/session');

const BASE_URL = (process.env.E2E_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Viewport matrix: small phones -> tablets (portrait+landscape) -> laptops -> desktops -> 2K.
const VIEWPORTS = [
  { name: '360x640-phone-sm', width: 360, height: 640 },
  { name: '390x844-phone',    width: 390, height: 844 },
  { name: '768x1024-tablet',  width: 768, height: 1024 },
  { name: '1024x768-tablet-l', width: 1024, height: 768 },
  { name: '1366x768-laptop',  width: 1366, height: 768 },
  { name: '1920x1080-desktop', width: 1920, height: 1080 },
  { name: '2560x1440-2k',     width: 2560, height: 1440 },
];

// Pages. `seedRole` set => seed a fake session before goto (dashboard gating).
// `expectPath` => after load, URL must still contain this (guards redirect bounce).
const PAGES = [
  { name: 'login',       path: '/login.html' },
  { name: 'signup',      path: '/signup.html' },
  { name: 'marketplace', path: '/marketplace.html' },
  { name: 'dashboard-student', path: '/dashboard.html?role=student', seedRole: 'student', expectPath: '/dashboard.html' },
  { name: 'settings',    path: '/settings.html' },
];

const OVERFLOW_TOLERANCE_PX = 2;

// ----- suite-level reachability guard -------------------------------------------------
let serverUp = false;

test.beforeAll(async ({ request }) => {
  try {
    const res = await request.get(BASE_URL + '/health', { timeout: 5000 });
    serverUp = res.ok();
  } catch (e) {
    serverUp = false;
  }
});

test.beforeEach(() => {
  test.skip(!serverUp, `baseURL ${BASE_URL} not reachable (GET /health failed) — start the server to run responsive checks`);
});

// Measures the worst-case horizontal overflow on the document element.
async function measureOverflow(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflow: el.scrollWidth - el.clientWidth,
    };
  });
}

for (const pg of PAGES) {
  test.describe(`responsive: ${pg.name} (${pg.path})`, () => {
    for (const vp of VIEWPORTS) {
      test(`${pg.name} @ ${vp.name} — no horizontal overflow, body visible & has text`, async ({ page }) => {
        // Seed or clear session BEFORE navigation (init scripts run pre-page-script).
        if (pg.seedRole) {
          await seedSession(page, pg.seedRole);
        } else {
          await clearSession(page);
        }

        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(BASE_URL + pg.path, { waitUntil: 'load' });

        // Guard: a seeded/gated page must not have bounced to login.
        if (pg.expectPath) {
          // Give any client-side redirect a brief window to fire, then assert.
          await page.waitForLoadState('load');
          expect(
            page.url(),
            `${pg.name} should stay on ${pg.expectPath} (a redirect to login means the seeded session was not honored)`
          ).toContain(pg.expectPath);
        }

        // Let layout settle (fonts, late CSS) without depending on network-idle,
        // which dashboard's failed auth XHRs would never reach.
        await page.waitForTimeout(250);

        // --- Invariant 1: no horizontal overflow ---
        const m = await measureOverflow(page);
        expect(
          m.overflow,
          `${pg.name} @ ${vp.name}: horizontal overflow ${m.overflow}px ` +
            `(scrollWidth=${m.scrollWidth} > clientWidth=${m.clientWidth}); ` +
            `tolerance ${OVERFLOW_TOLERANCE_PX}px`
        ).toBeLessThanOrEqual(OVERFLOW_TOLERANCE_PX);

        // --- Invariant 2: body is visible ---
        const body = page.locator('body');
        await expect(body, `${pg.name} @ ${vp.name}: <body> should be visible`).toBeVisible();

        // --- Invariant 3: body has non-empty rendered text ---
        const text = (await body.innerText()).trim();
        expect(
          text.length,
          `${pg.name} @ ${vp.name}: <body> rendered text is empty (page likely failed to render)`
        ).toBeGreaterThan(0);

        // Capture a screenshot for the visual report (always; failures are also
        // captured by config screenshot:'only-on-failure').
        await page.screenshot({
          path: `test-results/responsive/${pg.name}__${vp.name}.png`,
          fullPage: false,
        });
      });
    }
  });
}
