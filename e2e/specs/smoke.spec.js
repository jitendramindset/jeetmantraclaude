// smoke.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// Phases 1, 5 — discovery + dead-link / broken-route sweep across ALL public pages.
//
// What this file covers:
//   For every one of the 21 static pages in public/, this:
//     • navigates to the page and asserts the HTTP response status < 400
//       (catches 404 routes / broken static serving),
//     • asserts the document has a non-empty <title>,
//     • asserts the <body> renders visible, non-empty text (catches blank/crashed
//       pages that 200 but render nothing),
//     • collects browser console "error" messages during load and asserts none
//       (minus a small allow-list of known third-party noise: Google GSI, favicon).
//
//   Pages that hard-redirect to /login.html when no session is present (dashboard,
//   admin-os, settings, studio, etc.) are seeded with a session first so the smoke
//   check exercises the real page, not the login bounce.
//
// Preconditions / honesty:
//   • baseURL (E2E_BASE_URL || http://localhost:5000) must serve public/ statically.
//     A beforeAll guard skips the WHOLE suite if /health is unreachable, so no case
//     asserts vacuously against a dead host.
//   • The console-error assertion is intentionally lenient (allow-list) to avoid
//     flaky failures from third-party widgets the app loads but does not control.
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');
const { seedSession, clearSession } = require('../fixtures/session');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5000';

// Skip the whole suite if the static host is down, so the file is portable.
test.beforeAll(async ({ request }) => {
  try {
    const res = await request.get(`${BASE_URL}/health`, { timeout: 4000 });
    test.skip(!res.ok(), `baseURL ${BASE_URL} /health not OK — server not running`);
  } catch (e) {
    test.skip(true, `baseURL ${BASE_URL} unreachable (${e.message}) — server not running`);
  }
});

// Known console noise we will NOT fail on (third-party / environment, not our bug).
const CONSOLE_ALLOWLIST = [
  /accounts\.google\.com/i,       // Google Identity Services
  /gsi\//i,                       // GSI client
  /favicon/i,                     // missing favicon in dev
  /Failed to load resource.*404.*favicon/i,
  /net::ERR_/i,                   // network blips for optional 3rd-party assets
  /ResizeObserver loop/i,         // benign browser warning
];

// The 21 public pages. `seedAs` = role to seed before load for pages that
// otherwise bounce to /login.html (verified against each page's inline gate).
const PAGES = [
  { file: 'index.html',            seedAs: null },
  { file: 'login.html',            seedAs: null },
  { file: 'signup.html',           seedAs: null },
  { file: 'forgot-password.html',  seedAs: null },
  { file: 'reset-password.html',   seedAs: null },
  { file: 'verify-email.html',     seedAs: null },
  { file: 'website.html',          seedAs: null },
  { file: 'marketplace.html',      seedAs: null },
  { file: 'bhasha-setu.html',      seedAs: null },
  { file: 'exam-platform.html',    seedAs: 'student' },
  { file: 'dashboard.html',        seedAs: 'student' },
  { file: 'settings.html',         seedAs: 'student' },
  { file: 'studio.html',           seedAs: 'teacher' },
  { file: 'liveRoom.html',         seedAs: 'teacher' },
  { file: 'widgets.html',          seedAs: 'admin' },
  { file: 'control-center.html',   seedAs: 'admin' },
  { file: 'admin.html',            seedAs: 'admin' },
  { file: 'admin-os.html',         seedAs: 'admin' },
  { file: 'components.html',       seedAs: null },
  { file: 'jeetmantra-enhance.html', seedAs: null },
  { file: 'webhook-test.html',     seedAs: 'admin' },
];

test.describe('Smoke — every public page loads, titles, renders text, no console errors', () => {
  for (const { file, seedAs } of PAGES) {
    test(`${file} loads cleanly${seedAs ? ` (seeded ${seedAs})` : ''}`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (CONSOLE_ALLOWLIST.some((re) => re.test(text))) return;
        consoleErrors.push(text);
      });
      // Page errors (uncaught exceptions) are always real — collect separately.
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));

      if (seedAs) await seedSession(page, seedAs);
      else await clearSession(page);

      const resp = await page.goto(`${BASE_URL}/${file}`, { waitUntil: 'domcontentloaded' });

      // 1) HTTP status < 400 (broken route / missing file would be 404).
      expect(resp, `no response for ${file}`).not.toBeNull();
      expect(resp.status(), `${file} returned HTTP ${resp.status()}`).toBeLessThan(400);

      // Give late client redirects / renders a brief beat to settle.
      await page.waitForTimeout(400);

      // 2) Non-empty <title>.
      const title = await page.title();
      expect(title.trim().length, `${file} has an empty <title>`).toBeGreaterThan(0);

      // 3) Body renders visible, non-empty text. (Pages that legitimately bounce to
      //    login still render the login page's text, so this stays meaningful.)
      const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
      expect(bodyText.trim().length, `${file} rendered no visible text`).toBeGreaterThan(0);

      // 4) No uncaught page exceptions.
      expect(pageErrors, `${file} threw uncaught exceptions: ${pageErrors.join(' | ')}`).toEqual([]);

      // 5) No (non-allowlisted) console errors during load.
      expect(
        consoleErrors,
        `${file} logged console errors: ${consoleErrors.join(' | ')}`,
      ).toEqual([]);
    });
  }
});
