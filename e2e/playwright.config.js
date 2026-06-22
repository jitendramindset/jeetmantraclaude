// @ts-check
// EduOS shared E2E Playwright config (CommonJS — matches the CommonJS backend).
//
// The Express server serves public/ statically and mounts the API under /api/*.
// Tests target a running server at E2E_BASE_URL (default http://localhost:5000).
//
// We DELIBERATELY do not configure a `webServer` that boots the real backend:
// CI may not have Supabase SERVICE_ROLE_KEY / OTP / Google secrets. Start the
// backend yourself for local runs (see the commented block below).

const { devices } = require('@playwright/test');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5000';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './specs',
  // Fail the build on CI if test.only is left in the source.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Reasonable defaults; specs can override per-test.
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: '../e2e-report', open: 'never' }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Most static pages don't need a slow networkidle; specs can opt in.
    actionTimeout: 0,
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        // Pixel 5 sets isMobile, hasTouch, deviceScaleFactor and a mobile UA.
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'chromium-tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
  ],

  // ---------------------------------------------------------------------------
  // LOCAL-ONLY: boot the real backend before tests. Uncomment to use.
  // CI leaves this off because the backend needs secrets (Supabase service-role
  // key, OTP/Google config) that may be absent.
  //
  // webServer: {
  //   command: 'cd backend && npm start',
  //   url: BASE_URL,
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  // },
  // ---------------------------------------------------------------------------
};

module.exports = config;
