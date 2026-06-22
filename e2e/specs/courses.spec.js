// courses.spec.js
// ---------------------------------------------------------------------------
// Covers Phase 8 (course workflow) at the UI layer — the public course
// MARKETPLACE in public/marketplace.html.
//
// WHAT THIS FILE EXERCISES (offline-safe — all API calls are page.route stubs):
//   1. The catalog lists courses: marketplace.html calls
//      GET /api/marketplace?<qs> and renders each listing into #coursesGrid as a
//      .course-card. We stub that endpoint with TWO fake listings so the grid
//      renders deterministically without a DB or network.
//   2. A course card renders title + price: verified against renderCard() in
//      marketplace.html (.course-title = c.title; .course-price = fmt(price) =>
//      "₹<localized>"; free_listing => "Free").
//   3. CTA visibility/behaviour differs for a SEEDED USER vs a GUEST:
//        - GUEST  (no jm_token): #authLink shows the "Login" link, #sellerBanner
//          stays hidden, and clicking "Buy Now" -> openPurchase() bounces to
//          /login.html (token-gated; marketplace.html ~line 485).
//        - SEEDED seller role: initUI() swaps #authLink to a "Dashboard" link and
//          reveals #sellerBanner (SELLER_ROLES in marketplace.html).
//   4. The full enroll/purchase backend path is left as test.fixme — confirming
//      enrollment requires a real authenticated backend + payments/enrollment DB
//      writes that CI lacks (see reason on the fixme).
//
// HOW WE STUB (so it runs anywhere, fully offline):
//   marketplace.html fires up to FOUR GETs on load:
//     /api/marketplace?...           (the catalog — REQUIRED)
//     /api/marketplace/facets        (left rail)
//     /api/marketplace/trending      (trending row)
//     /api/marketplace/my/purchases  (only when a token exists)
//   We page.route ALL of them. NOTE ordering: the catalog path
//   "/api/marketplace?..." and the sub-resource paths all start with
//   "/api/marketplace", so we register the MORE-SPECIFIC routes
//   (/facets, /trending, /my/purchases) and a catch-all that branches on the
//   pathname — Playwright matches the LAST registered route first, but to avoid
//   surprises we use a single glob ('**/api/marketplace**') and dispatch inside.
//
// PRECONDITIONS:
//   - baseURL (E2E_BASE_URL || http://localhost:5000) serves public/ statically.
//     A beforeAll guard skips the whole file if /health is unreachable, so the
//     file is safe to run anywhere. Because every /api/marketplace* call is
//     stubbed, NO seeded DB or real creds are needed for the non-fixme cases.
//   - seedSession plants an UNSIGNED fake JWT for FRONTEND gating only; it never
//     reaches the (stubbed) backend, so that is fine here.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');
const { seedSession, clearSession } = require('../fixtures/session');

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000';

// Two deterministic listings mirroring the real /api/marketplace payload shape
// consumed by renderCard() in marketplace.html: top-level {id, course_id, price}
// plus an embedded `courses` object and a seller under `jeetmantra_users`.
const FAKE_LISTINGS = [
  {
    id: 'listing-paid-1',
    course_id: 'course-1',
    price: 2999,
    courses: {
      title: 'Algebra Mastery — Class 10',
      category: 'Mathematics',
      level: 'Intermediate',
      class_mode: 'online',
      city: 'Mumbai',
    },
    jeetmantra_users: { full_name: 'Asha Verma' },
  },
  {
    id: 'listing-free-2',
    course_id: 'course-2',
    price: 0,
    courses: {
      title: 'Intro to Python',
      category: 'Programming',
      level: 'Beginner',
      class_mode: 'online',
      free_listing: true,
    },
    jeetmantra_users: { full_name: 'Ravi Kumar' },
  },
];

// Single dispatcher for every /api/marketplace* GET the page makes on load.
// Keeps the suite fully offline: nothing hits the real backend.
async function stubMarketplace(page, { listings = FAKE_LISTINGS, purchases = [] } = {}) {
  await page.route('**/api/marketplace**', async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname;
    const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

    if (p.endsWith('/api/marketplace/facets')) {
      return json({ modes: ['online'], levels: ['beginner', 'intermediate'], cities: ['Mumbai'], priceRange: { min: 0, max: 5000 } });
    }
    if (p.includes('/api/marketplace/trending')) {
      return json({ listings: [] }); // keep the trending row hidden — focus on the main grid
    }
    if (p.includes('/api/marketplace/my/purchases')) {
      return json({ purchases });
    }
    // The catalog itself: GET /api/marketplace?<qs>
    if (p.endsWith('/api/marketplace') || p === '/api/marketplace') {
      return json({ listings });
    }
    // Any other marketplace sub-call (e.g. POST purchase) — not expected in the
    // non-fixme tests; fail loudly rather than silently passing.
    return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'unstubbed: ' + p }) });
  });
}

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
  test.skip(!baseUp, `baseURL ${BASE} /health unreachable — start the server to run courses specs`);
});

// ---------------------------------------------------------------------------
// SUITE 1 — catalog renders from a stubbed /api/marketplace (offline)
// ---------------------------------------------------------------------------
test.describe('Phase 8 — marketplace catalog (stubbed, offline)', () => {
  test('lists the stubbed courses in #coursesGrid', async ({ page }) => {
    await clearSession(page); // guest view
    await stubMarketplace(page);
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    const grid = page.locator('#coursesGrid');
    // renderGrid() replaces the skeletons with one .course-card per listing.
    await expect(grid.locator('.course-card')).toHaveCount(FAKE_LISTINGS.length, { timeout: 8000 });

    // The results count text is "<n> courses" (renderGrid -> #resultsCount).
    await expect(page.locator('#resultsCount')).toHaveText(/2\s+courses/i);

    // The empty / unavailable state must NOT be showing when listings came back.
    await expect(page.locator('#emptyState')).toBeHidden();
  });

  test('a course card renders its title and price', async ({ page }) => {
    await clearSession(page);
    await stubMarketplace(page);
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    const grid = page.locator('#coursesGrid');
    await expect(grid.locator('.course-card').first()).toBeVisible({ timeout: 8000 });

    // PAID listing: title + localized rupee price (fmt() => "₹2,999").
    const paidCard = grid.locator('.course-card', { hasText: 'Algebra Mastery' });
    await expect(paidCard).toHaveCount(1);
    await expect(paidCard.locator('.course-title')).toHaveText('Algebra Mastery — Class 10');
    await expect(paidCard.locator('.course-price')).toHaveText('₹2,999');

    // FREE listing: price slot shows "Free" (renderCard free_listing branch).
    const freeCard = grid.locator('.course-card', { hasText: 'Intro to Python' });
    await expect(freeCard).toHaveCount(1);
    await expect(freeCard.locator('.course-title')).toHaveText('Intro to Python');
    await expect(freeCard.locator('.course-price')).toHaveText('Free');
  });

  test('empty catalog shows the "No courses found" empty state', async ({ page }) => {
    await clearSession(page);
    await stubMarketplace(page, { listings: [] });
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    const empty = page.locator('#emptyState');
    await expect(empty).toBeVisible({ timeout: 8000 });
    await expect(empty).toContainText(/No courses found/i);
    await expect(page.locator('#coursesGrid .course-card')).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// SUITE 2 — CTA / chrome differs for guest vs seeded user
// ---------------------------------------------------------------------------
test.describe('Phase 8 — guest vs seeded CTA & chrome', () => {
  test('GUEST: header shows Login, seller banner hidden, every card has a Buy Now CTA', async ({ page }) => {
    await clearSession(page);
    await stubMarketplace(page);
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    // initUI() leaves #authLink as the default "Login" link for guests.
    await expect(page.locator('#authLink')).toContainText(/Login/i);
    await expect(page.locator('#authLink a[href="/login.html"]')).toBeVisible();

    // Seller banner only renders for SELLER_ROLES with a session -> hidden here.
    await expect(page.locator('#sellerBanner')).toBeHidden();

    // Each card exposes a purchase CTA labelled "Buy Now" (not yet "Enrolled",
    // since with no token /my/purchases is never called -> nothing owned).
    const buyButtons = page.locator('#coursesGrid .buy-btn');
    await expect(buyButtons).toHaveCount(FAKE_LISTINGS.length, { timeout: 8000 });
    await expect(buyButtons.first()).toHaveText(/Buy Now/i);
    await expect(page.locator('#coursesGrid .buy-btn.owned')).toHaveCount(0);
  });

  test('GUEST: clicking Buy Now redirects to /login.html (token-gated openPurchase)', async ({ page }) => {
    await clearSession(page);
    await stubMarketplace(page);
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    const paidCard = page.locator('#coursesGrid .course-card', { hasText: 'Algebra Mastery' });
    await expect(paidCard.locator('.buy-btn')).toBeVisible({ timeout: 8000 });

    // openPurchase() short-circuits to /login.html when no jm_token is present.
    await paidCard.locator('.buy-btn').click();
    await expect.poll(() => page.url(), { timeout: 6000 }).toContain('/login.html');
  });

  test('SEEDED seller (teacher): header shows Dashboard link and the seller banner is revealed', async ({ page }) => {
    await seedSession(page, 'teacher'); // teacher ∈ SELLER_ROLES in marketplace.html
    await stubMarketplace(page, { purchases: [] });
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    // initUI() rewrites #authLink to a Dashboard link when a user is present.
    await expect(page.locator('#authLink')).toContainText(/Dashboard/i);
    await expect(page.locator('#authLink a[href="/dashboard.html"]')).toBeVisible();

    // Seller banner is shown for seller roles, with the "List a Course" CTA.
    const banner = page.locator('#sellerBanner');
    await expect(banner).toBeVisible({ timeout: 8000 });
    await expect(banner.getByRole('button', { name: /List a Course/i })).toBeVisible();
  });

  test('SEEDED student is NOT offered the seller banner', async ({ page }) => {
    await seedSession(page, 'student'); // student ∉ SELLER_ROLES
    await stubMarketplace(page, { purchases: [] });
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    // Still authenticated chrome (Dashboard link), but no seller affordances.
    await expect(page.locator('#authLink')).toContainText(/Dashboard/i);
    await expect(page.locator('#sellerBanner')).toBeHidden();
  });

  test('SEEDED student: an already-purchased listing shows "Enrolled" instead of Buy Now', async ({ page }) => {
    await seedSession(page, 'student');
    // Mark the paid listing as already owned via the stubbed /my/purchases.
    await stubMarketplace(page, { purchases: [{ listing_id: 'listing-paid-1', amount: 2999, created_at: '2026-01-01', marketplace_listings: { courses: { title: 'Algebra Mastery — Class 10', category: 'Mathematics' } } }] });
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    const paidCard = page.locator('#coursesGrid .course-card', { hasText: 'Algebra Mastery' });
    // renderCard(owned=true): button gets .owned and reads "✅ Enrolled".
    await expect(paidCard.locator('.buy-btn.owned')).toBeVisible({ timeout: 8000 });
    await expect(paidCard.locator('.buy-btn')).toContainText(/Enrolled/i);

    // The still-unowned free listing keeps its Buy Now CTA.
    const freeCard = page.locator('#coursesGrid .course-card', { hasText: 'Intro to Python' });
    await expect(freeCard.locator('.buy-btn')).toHaveText(/Buy Now/i);
  });

  test('SEEDED student: Buy Now opens the purchase modal (does NOT bounce to login)', async ({ page }) => {
    await seedSession(page, 'student');
    await stubMarketplace(page, { purchases: [] });
    await page.goto(`${BASE}/marketplace.html`, { waitUntil: 'domcontentloaded' });

    const paidCard = page.locator('#coursesGrid .course-card', { hasText: 'Algebra Mastery' });
    await expect(paidCard.locator('.buy-btn')).toBeVisible({ timeout: 8000 });

    // With a token present openPurchase() shows #purchaseModal instead of
    // redirecting. We assert the modal opens and is populated from the listing.
    await paidCard.locator('.buy-btn').click();
    const modal = page.locator('#purchaseModal');
    await expect(modal).toHaveClass(/show/, { timeout: 4000 });
    await expect(page.locator('#modalTitle')).toHaveText('Algebra Mastery — Class 10');
    await expect(page.locator('#modalPrice')).toHaveText('₹2,999');
    // We did NOT leave the marketplace page.
    expect(page.url()).toContain('/marketplace.html');
  });
});

// ---------------------------------------------------------------------------
// SUITE 3 — full enroll path (needs a real backend; left as fixme)
// ---------------------------------------------------------------------------
test.describe('Phase 8 — enroll click-through (real backend)', () => {
  // The happy-path enroll/purchase flow (confirmPurchase) drives real money +
  // enrollment endpoints — for a FREE listing it POSTs /api/marketplace/:id/
  // purchase with a Bearer token and expects a 200 that writes an enrollment
  // row; for paid it goes through /api/payments/order + /verify (Razorpay).
  // Verifying the *successful* "✅ Enrolled" outcome therefore requires a
  // seeded user, a valid (signed) token the backend accepts, and writable
  // payments/enrollments tables — none of which CI has. seedSession only plants
  // an UNSIGNED token (the backend returns 401), so any assertion that the enroll
  // succeeds would be dishonest. Enable once a seeded backend + real creds exist.
  test.fixme('free-course "Buy Now" -> Confirm Purchase -> "✅ Enrolled" against a real backend', async () => {
    // Intentionally empty: requires E2E_REAL_CREDS + seeded payments/enrollments DB.
  });
});
