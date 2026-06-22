// payments.spec.js — Phase 14 (payments) at the UI layer.
//
// COVERS (UI-only, all network stubbed via page.route — no real DB/Razorpay):
//   1. marketplace.html: a paid listing renders a "Buy Now" control; clicking it
//      opens the purchase modal with the price + a "Confirm Purchase" button.
//   2. marketplace.html: the pay control is GATED on auth — a logged-out visitor
//      clicking "Buy Now" is bounced to /login.html (openPurchase() guards on token).
//   3. marketplace.html: confirming a paid purchase POSTs /api/payments/order; in
//      demo mode the flow continues to /api/payments/verify (both stubbed).
//   4. dashboard.html: the Coupons modal (openCoupons) exposes a coupon CODE input
//      and is gated until a code is entered (cpnCreate() rejects empty code).
//   5. dashboard.html: applying a coupon hits /api/payments/coupons/apply (stubbed).
//
// PRECONDITIONS:
//   - baseURL (E2E_BASE_URL || http://localhost:5000) must be reachable; the suite
//     self-skips via a /health probe in beforeAll so the file is safe to run anywhere.
//   - Sessions are frontend-gated only (seedSession writes an UNSIGNED jm_token). All
//     payment APIs are stubbed, so no valid backend JWT is needed for these UI flows.
//
// HONESTY NOTES (see test.fixme/skip below):
//   - The LIVE Razorpay checkout (window.Razorpay widget from checkout.razorpay.com)
//     cannot be driven in CI -> test.fixme.
//   - The marketplace PURCHASE modal has NO coupon input in the DOM (verified in
//     public/marketplace.html); coupon UI lives only on the dashboard. We therefore
//     assert the coupon flow on dashboard.html, not in the marketplace modal.

const { test, expect } = require('@playwright/test');
const { seedSession, clearSession } = require('../fixtures/session');

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000';

// A single fake PAID marketplace listing shaped like the /api/marketplace payload
// the page consumes (renderCard reads listing.price, listing.id, listing.course_id,
// listing.courses.{title,category,level}, listing.seller.full_name).
const PAID_LISTING = {
  id: 'lst-e2e-paid-1',
  course_id: 'crs-e2e-1',
  price: 1499,
  free_listing: false,
  demo_class: false,
  courses: { title: 'E2E Paid Course', category: 'Programming', level: 'Beginner' },
  seller: { full_name: 'E2E Instructor' },
};

// Stub the marketplace catalog + facets so a deterministic paid card renders without
// a seeded DB. The page calls GET /api/marketplace (list) and GET /api/marketplace/facets.
async function stubMarketplaceCatalog(page, listings = [PAID_LISTING]) {
  await page.route('**/api/marketplace/facets**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ facets: {} }) })
  );
  await page.route('**/api/marketplace/my/purchases**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ purchases: [] }) })
  );
  // The list endpoint: match /api/marketplace and /api/marketplace?... but NOT the
  // sub-paths above (those routes are registered first and win).
  await page.route('**/api/marketplace**', (route) => {
    const url = route.request().url();
    if (/\/api\/marketplace\/(facets|my|[^/?]+\/purchase)/.test(url)) return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ listings, total: listings.length }),
    });
  });
}

async function healthOk() {
  try {
    const res = await fetch(`${BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

test.describe('Phase 14 — payments UI', () => {
  test.beforeAll(async () => {
    test.skip(!(await healthOk()), `baseURL ${BASE} not reachable (/health) — start the server to run payment UI tests`);
  });

  // ---------------------------------------------------------------------------
  // MARKETPLACE: paid course shows a pay/checkout control
  // ---------------------------------------------------------------------------
  test.describe('marketplace checkout control', () => {
    test('a paid listing renders a "Buy Now" pay control', async ({ page }) => {
      await seedSession(page, 'student');
      await stubMarketplaceCatalog(page);
      await page.goto(`${BASE}/marketplace.html`);

      const buy = page.locator('.buy-btn').first();
      await expect(buy).toBeVisible();
      await expect(buy).toHaveText(/Buy Now/i);
      // Price is rendered on the card (₹1,499 via fmt()).
      await expect(page.locator('.course-price').first()).toContainText('1,499');
    });

    test('clicking Buy Now opens the purchase modal with price + Confirm button', async ({ page }) => {
      await seedSession(page, 'student');
      await stubMarketplaceCatalog(page);
      await page.goto(`${BASE}/marketplace.html`);

      await page.locator('.buy-btn').first().click();

      const modal = page.locator('#purchaseModal');
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator('#modalTitle')).toHaveText('E2E Paid Course');
      await expect(page.locator('#modalPrice')).toContainText('1,499');

      // The pay button exists and is enabled once a listing is selected.
      const confirm = page.locator('#confirmBtn');
      await expect(confirm).toBeVisible();
      await expect(confirm).toBeEnabled();
      await expect(confirm).toHaveText(/Confirm Purchase/i);
    });

    test('pay control is gated on auth — logged-out user is bounced to login', async ({ page }) => {
      // openPurchase() guards: if(!token){ location.href='/login.html'; return; }
      await clearSession(page);
      await stubMarketplaceCatalog(page);
      await page.goto(`${BASE}/marketplace.html`);

      await page.locator('.buy-btn').first().click();
      await page.waitForURL(/\/login\.html/, { timeout: 5000 });
      expect(page.url()).toContain('/login.html');
    });
  });

  // ---------------------------------------------------------------------------
  // MARKETPLACE: order creation. /api/payments/order + /api/payments/verify stubbed.
  // ---------------------------------------------------------------------------
  test.describe('marketplace order creation', () => {
    test('Confirm Purchase POSTs /api/payments/order (demo mode → verify, no Razorpay widget)', async ({ page }) => {
      await seedSession(page, 'student');
      await stubMarketplaceCatalog(page);

      // Stub the order endpoint to return DEMO mode so the live Razorpay script is
      // never loaded. confirmPurchase() then window.confirm()s and calls /verify.
      let orderBody = null;
      await page.route('**/api/payments/order', async (route) => {
        orderBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mode: 'demo', orderId: 'order_e2e_demo', paymentRowId: 'pay-row-1' }),
        });
      });
      let verifyHit = false;
      await page.route('**/api/payments/verify', async (route) => {
        verifyHit = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, enrolled: true }),
        });
      });

      // Demo path asks confirm('DEMO mode: simulate ...') — accept it.
      page.on('dialog', (d) => d.accept());

      await page.goto(`${BASE}/marketplace.html`);
      await page.locator('.buy-btn').first().click();
      await expect(page.locator('#purchaseModal')).toHaveClass(/show/);
      await page.locator('#confirmBtn').click();

      // Success banner is shown once verify resolves.
      await expect(page.locator('#purchaseMsg')).toContainText(/Payment successful|enrolled/i, { timeout: 5000 });

      expect(orderBody, 'order request body').toBeTruthy();
      expect(orderBody.amount).toBe(1499);
      expect(verifyHit, '/api/payments/verify should be called in demo mode').toBe(true);
    });

    test('order failure surfaces an error in the modal (no enroll)', async ({ page }) => {
      await seedSession(page, 'student');
      await stubMarketplaceCatalog(page);
      await page.route('**/api/payments/order', (route) =>
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Payment gateway not configured' }),
        })
      );

      await page.goto(`${BASE}/marketplace.html`);
      await page.locator('.buy-btn').first().click();
      await page.locator('#confirmBtn').click();

      await expect(page.locator('#purchaseMsg')).toContainText(/Payment gateway not configured/i, { timeout: 5000 });
      // Button is re-enabled for a retry.
      await expect(page.locator('#confirmBtn')).toBeEnabled();
    });

    // The LIVE checkout opens window.Razorpay from checkout.razorpay.com — a 3rd-party
    // iframe widget that cannot be scripted in CI. Demo mode (above) covers the order/
    // verify wiring without it.
    test.fixme('live Razorpay checkout widget completes payment', async () => {
      // Requires real Razorpay key + the hosted checkout.js widget (cross-origin iframe);
      // not drivable headless in CI.
    });
  });

  // ---------------------------------------------------------------------------
  // DASHBOARD: coupon UI (create + apply). The marketplace modal has NO coupon
  // input, so coupon assertions live here against openCoupons()/applyCoupon().
  // ---------------------------------------------------------------------------
  test.describe('dashboard coupons', () => {
    // Loosely stub the noisy dashboard boot calls so the page settles, then drive the
    // coupon modal directly via its global functions.
    async function gotoTeacherDashboard(page) {
      await seedSession(page, 'teacher');
      // GET /api/payments/coupons backs the modal list; start empty.
      await page.route('**/api/payments/coupons', (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ coupons: [] }) });
        }
        return route.fallback();
      });
      await page.goto(`${BASE}/dashboard.html?role=teacher`);
      // Wait for the dashboard script to define the coupon entrypoint.
      await page.waitForFunction(() => typeof window.openCoupons === 'function', null, { timeout: 15000 });
    }

    test('Coupons modal exposes a coupon CODE input', async ({ page }) => {
      await gotoTeacherDashboard(page);
      await page.evaluate(() => window.openCoupons());

      const code = page.locator('#cpn-code');
      await expect(code).toBeVisible();
      // % and flat discount inputs are present too.
      await expect(page.locator('#cpn-pct')).toBeVisible();
      await expect(page.locator('#cpn-flat')).toBeVisible();
      await expect(page.getByRole('button', { name: /Create coupon/i })).toBeVisible();
    });

    test('create coupon is gated until a code is entered', async ({ page }) => {
      await gotoTeacherDashboard(page);
      await page.evaluate(() => window.openCoupons());
      await expect(page.locator('#cpn-code')).toBeVisible();

      // cpnCreate() with an empty code must NOT POST — it toasts "Enter a coupon code".
      let posted = false;
      await page.route('**/api/payments/coupons', (route) => {
        if (route.request().method() === 'POST') posted = true;
        return route.fallback();
      });

      await page.locator('#cpn-code').fill('');
      await page.getByRole('button', { name: /Create coupon/i }).click();
      // Give any (unexpected) request a moment to fire.
      await expect.poll(() => posted, { timeout: 1500 }).toBe(false);
    });

    test('entering a code + discount POSTs /api/payments/coupons', async ({ page }) => {
      await gotoTeacherDashboard(page);
      await page.evaluate(() => window.openCoupons());
      await expect(page.locator('#cpn-code')).toBeVisible();

      let createBody = null;
      await page.route('**/api/payments/coupons', (route) => {
        const req = route.request();
        if (req.method() === 'POST') {
          createBody = req.postDataJSON();
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ coupon: { id: 'cpn-1', code: 'WELCOME20', discount_percent: 20 } }),
          });
        }
        // GET refresh after create → empty is fine.
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ coupons: [] }) });
      });

      await page.locator('#cpn-code').fill('welcome20');
      await page.locator('#cpn-pct').fill('20');
      await page.getByRole('button', { name: /Create coupon/i }).click();

      await expect.poll(() => createBody, { timeout: 5000 }).not.toBeNull();
      // cpnCreate() upper-cases the code before sending.
      expect(createBody.code).toBe('WELCOME20');
      expect(Number(createBody.discountPercent)).toBe(20);
    });

    test('applyCoupon() hits /api/payments/coupons/apply and returns the discount', async ({ page }) => {
      await gotoTeacherDashboard(page);
      await page.waitForFunction(() => typeof window.applyCoupon === 'function', null, { timeout: 10000 });

      let applyBody = null;
      await page.route('**/api/payments/coupons/apply', (route) => {
        applyBody = route.request().postDataJSON();
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ discounted: 1199, saved: 300 }),
        });
      });

      const result = await page.evaluate(() => window.applyCoupon('WELCOME20', 1499, 'crs-e2e-1'));
      expect(applyBody).toMatchObject({ code: 'WELCOME20', amount: 1499, courseId: 'crs-e2e-1' });
      expect(result).toMatchObject({ discounted: 1199, saved: 300 });
    });
  });
});
