// auth.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 (auth) — UI-layer coverage for public/login.html (and a signup smoke).
//
// What this file covers:
//   • Login form client-side validation (email + password required).
//   • Invalid-credentials path surfaces the backend error (401 stubbed via page.route).
//   • OTP section reveals phone + code inputs.
//   • Google button (#googleBtn) exists; when /api/auth/config has no client id,
//     clicking it shows the "not configured" message.
//   • clearSession() removes jm_token (logged-out state).
//   • Visiting login.html WITH a seeded session auto-redirects to /dashboard.html.
//   • signup.html step-2 client validation (password mismatch / weakness).
//
// Preconditions / honesty:
//   • baseURL (E2E_BASE_URL || http://localhost:5000) must serve public/ statically.
//     A beforeAll guard skips the whole suite if /health is unreachable, so this
//     file is safe to run anywhere — it never asserts vacuously against a dead host.
//   • Every /api/auth/* call is stubbed with page.route, so no live backend/DB is
//     needed for the assertions below. We intentionally do NOT exercise a real
//     login/signup/Google-token round-trip here (those need seeded creds / a real
//     Google ID token) — see the fixme at the bottom for that gap.
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');
const { seedSession, clearSession, TOKEN_KEY } = require('../fixtures/session');

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

// Make Google "not configured" the default for every test: /api/auth/config
// returns an empty google_client_id unless a test overrides this route first.
// (Routes registered later via page.route take precedence over earlier ones.)
async function stubGoogleUnconfigured(page) {
  await page.route('**/api/auth/config', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ google_client_id: '', otp_enabled: true, email_login: true }),
    })
  );
}

test.describe('Login page — form & validation', () => {
  test('renders the core login controls', async ({ page }) => {
    await stubGoogleUnconfigured(page);
    await page.goto(`${BASE_URL}/login.html`);

    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
    await expect(page.locator('#loginBtn')).toBeVisible();
    await expect(page.locator('#googleBtn')).toBeVisible();
  });

  test('requires email + password (client validation, no network call)', async ({ page }) => {
    await stubGoogleUnconfigured(page);

    // Fail the test if doLogin() ever reaches the network with empty fields.
    let loginCalled = false;
    await page.route('**/api/auth/login', (route) => {
      loginCalled = true;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto(`${BASE_URL}/login.html`);
    await page.locator('#loginBtn').click(); // both fields blank

    // doLogin() short-circuits with: showMsg('Please enter email and password','error')
    const msg = page.locator('#msg');
    await expect(msg).toBeVisible();
    await expect(msg).toHaveText(/please enter email and password/i);
    await expect(msg).toHaveClass(/error/);
    expect(loginCalled).toBe(false);
  });

  test('invalid credentials surface the backend error (401 stubbed)', async ({ page }) => {
    await stubGoogleUnconfigured(page);
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email or password' }),
      })
    );

    await page.goto(`${BASE_URL}/login.html`);
    await page.locator('#loginEmail').fill('nobody@e2e.test');
    await page.locator('#loginPassword').fill('wrong-password');
    await page.locator('#loginBtn').click();

    const msg = page.locator('#msg');
    await expect(msg).toBeVisible();
    await expect(msg).toHaveText(/invalid email or password/i);
    await expect(msg).toHaveClass(/error/);
    // Button is re-enabled after a failed attempt (doLogin catch sets btn.disabled=false).
    await expect(page.locator('#loginBtn')).toBeEnabled();
  });
});

test.describe('Login page — OTP section', () => {
  test('Phone OTP reveals phone input, and sending reveals the code input', async ({ page }) => {
    await stubGoogleUnconfigured(page);
    await page.route('**/api/auth/send-otp', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ phone: '99999' }),
      })
    );

    await page.goto(`${BASE_URL}/login.html`);

    // #otpSection starts display:none; the "Phone OTP" button toggles it.
    const phoneInput = page.locator('#otpPhone');
    await expect(phoneInput).toBeHidden();

    await page.getByRole('button', { name: /phone otp/i }).click();
    await expect(phoneInput).toBeVisible();

    // #otpCode lives in #otpVerifyGroup (display:none) until an OTP is sent.
    await expect(page.locator('#otpCode')).toBeHidden();
    await phoneInput.fill('+919999999999');
    await page.locator('#sendOtpBtn').click();
    await expect(page.locator('#otpCode')).toBeVisible();
  });
});

test.describe('Login page — Google sign-in', () => {
  test('#googleBtn exists and shows "not configured" when client id is empty', async ({ page }) => {
    await stubGoogleUnconfigured(page);
    await page.goto(`${BASE_URL}/login.html`);

    const googleBtn = page.locator('#googleBtn');
    await expect(googleBtn).toBeVisible();

    // _gClientId stays '' (config returned empty) → doGoogleLogin() shows the message.
    await googleBtn.click();
    const msg = page.locator('#msg');
    await expect(msg).toBeVisible();
    await expect(msg).toHaveText(/google login is not configured/i);
    await expect(msg).toHaveClass(/error/);
  });
});

test.describe('Session lifecycle', () => {
  test('clearSession removes jm_token (logged-out state)', async ({ page }) => {
    await stubGoogleUnconfigured(page);
    await clearSession(page);
    await page.goto(`${BASE_URL}/login.html`);

    const token = await page.evaluate((k) => localStorage.getItem(k), TOKEN_KEY);
    expect(token).toBeNull();

    // No session → login form stays put (no auto-redirect away from login.html).
    await expect(page).toHaveURL(/\/login\.html/);
    await expect(page.locator('#loginEmail')).toBeVisible();
  });

  test('seeded session auto-redirects login.html → /dashboard.html?role=', async ({ page }) => {
    await stubGoogleUnconfigured(page);
    // seedSession writes jm_token + jm_user BEFORE navigation; login.html's inline
    // script reads them on load and does window.location.href = '/dashboard.html?role='+role.
    const user = await seedSession(page, 'teacher');
    await page.goto(`${BASE_URL}/login.html`);

    await page.waitForURL(/\/dashboard\.html\?role=teacher/, { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(`/dashboard\\.html\\?role=${user.role}`));
  });
});

test.describe('Signup page — step 2 client validation', () => {
  // signup.html is a 4-step wizard; step 1 (AI provider) is optional, so we can
  // advance to step 2 and exercise its account-info validation without any network.
  async function gotoStep2(page) {
    await page.goto(`${BASE_URL}/signup.html`);
    // Step 1 → "Continue →" (AI provider + key are optional).
    await page.locator('#section-1 .btn-primary').click();
    await expect(page.locator('#section-2')).toHaveClass(/active/);
  }

  test('weak password is rejected with a field error', async ({ page }) => {
    await gotoStep2(page);

    await page.locator('#full-name').fill('E2E Tester');
    await page.locator('#email').fill('tester@e2e.test');
    await page.locator('#phone').fill('+919999999999');
    // 8+ chars but no uppercase/number/special → isStrongPassword() fails.
    await page.locator('#password').fill('alllowercase');
    await page.locator('#confirm-password').fill('alllowercase');

    await page.locator('#section-2 .btn-primary').click();

    const err = page.locator('#error-password');
    await expect(err).toHaveClass(/show/);
    await expect(err).toContainText(/uppercase|lowercase|number|special/i);
    // Still on step 2 — validation blocked the advance.
    await expect(page.locator('#section-2')).toHaveClass(/active/);
  });

  test('mismatched passwords are rejected', async ({ page }) => {
    await gotoStep2(page);

    await page.locator('#full-name').fill('E2E Tester');
    await page.locator('#email').fill('tester@e2e.test');
    await page.locator('#phone').fill('+919999999999');
    await page.locator('#password').fill('Str0ng!Pass');
    await page.locator('#confirm-password').fill('Different!1');

    await page.locator('#section-2 .btn-primary').click();

    const err = page.locator('#error-confirm-password');
    await expect(err).toHaveClass(/show/);
    await expect(err).toContainText(/do not match/i);
    await expect(page.locator('#section-2')).toHaveClass(/active/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HONEST GAPS — flows that need a live backend / real secrets, not stubbable
// in a way that proves anything. Marked fixme so they show up but never pass
// vacuously.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Auth — real round-trips (need live backend / secrets)', () => {
  test.fixme(
    'POST /api/auth/login with real seeded creds returns {token,user} and lands on dashboard',
    () => {
      // Needs E2E_REAL_CREDS + a seeded user in the DB. Use loginViaApi() from
      // fixtures/session and gate behind process.env.E2E_REAL_CREDS when wired.
    }
  );

  test.fixme(
    'Google login succeeds with a valid Google ID token',
    () => {
      // The server verifies the Google ID token; it never returns 200 for a fake
      // credential. A genuine sign-in requires a real Google account + a configured
      // google_client_id, which CI lacks. Cannot be faked via page.route honestly.
    }
  );
});
