# EduOS E2E (Playwright)

Shared end-to-end test scaffold for the EduOS app. The frontend is static HTML
in `public/`, served by the Express backend, which also mounts the API under
`/api/*`. These tests drive a **running server**.

## Install

```bash
# from repo root
npm i -D @playwright/test axe-core
npx playwright install chromium
```

> Only Chromium is used (config defines chromium-desktop / -mobile / -tablet
> projects). `npx playwright install chromium` is sufficient.

## Start the backend (the thing under test)

CI does **not** auto-start the backend — it needs secrets (Supabase
SERVICE_ROLE_KEY, OTP/Google config). Start it yourself for local runs:

```bash
cd backend && npm start
# server serves public/ statically and the API at /api/*, default port 5000
```

## Point the tests at it

```bash
# default is http://localhost:5000
export E2E_BASE_URL="http://localhost:5000"   # PowerShell: $env:E2E_BASE_URL="http://localhost:5000"
```

Copy `.env.example` to `.env` and fill in values as needed. (`.env` is read by
your shell / runner, not auto-loaded by Playwright unless you wire dotenv.)

## Run

Add this to the repo `package.json` scripts (one time):

```json
"scripts": {
  "test:e2e": "playwright test -c e2e/playwright.config.js"
}
```

Then:

```bash
npm run test:e2e
# or directly:
npx playwright test -c e2e/playwright.config.js
# single project:
npx playwright test -c e2e/playwright.config.js --project=chromium-desktop
```

## Report

- Live console output: the `list` reporter.
- HTML report is written to **`e2e-report/`** at the repo root.
  Open it with:

  ```bash
  npx playwright show-report e2e-report
  ```

- On failure, traces (`on-first-retry`), screenshots (`only-on-failure`), and
  videos (`retain-on-failure`) are attached to the report.

## Two auth paths — `seedSession` vs `loginViaApi`

This scaffold gives you two ways to be "logged in", and they test different
things:

| Helper | What it does | When to use |
| --- | --- | --- |
| `seedSession(page, role)` | Plants a **fake, unsigned** JWT + user in `localStorage` (`jm_token` / `jm_user`) before first load, via `addInitScript`. | **Frontend role-gating only.** Verify which dashboard widgets / menus / pages a role sees. The backend rejects this token, so do not assert on authenticated `/api/*` responses. |
| `loginViaApi(request, baseURL, email, password)` | POSTs `/api/auth/login`, returns a **real** `{token, user}`. | **Real end-to-end auth.** Requires a seeded DB. Gate these specs behind `E2E_REAL_CREDS` so they skip where no credentials exist. |

All 11 role dashboards are the same page parameterised by query string:
`/dashboard.html?role=<role>`. With `seedSession`, navigate there to test gating.

Example skeleton (spec authors):

```js
const { test, expect } = require('@playwright/test');
const { seedSession } = require('../fixtures/session');
const { assertNoSeriousA11y } = require('../fixtures/a11y');

test('teacher dashboard renders for teacher role', async ({ page }) => {
  await seedSession(page, 'teacher');         // before navigation
  await page.goto('/dashboard.html?role=teacher');
  await expect(page).toHaveURL(/role=teacher/);
  await assertNoSeriousA11y(page);            // fails only on serious/critical
});
```

Real-credential example (gated):

```js
const { test } = require('@playwright/test');
const { loginViaApi } = require('../fixtures/session');

test.skip(!process.env.E2E_REAL_CREDS, 'real creds not configured');

test('login via API returns a token', async ({ request, baseURL }) => {
  const { token } = await loginViaApi(
    request, baseURL,
    process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASS
  );
  expect(token).toBeTruthy();
});
```
