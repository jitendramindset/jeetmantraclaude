# EduOS — Role × Feature Test Matrix

**Status of this document:** Authored from source. The expected-behaviour cells
below are derived directly from `backend/config/roles.js`,
`backend/middleware/requireCapability.js`, the route guards described in the
discovery inventory, and the client-side page guards. Where a cell is marked as
covered by an automated test, that test is **authored** (it exists in the repo)
— it is **not** asserted here to have been executed/passed in CI. Items needing
a live server + seeded data are flagged **Manual-required / Runtime-verified**.

---

## 1. Source of truth (role sets)

From `backend/config/roles.js`:

| Constant | Members |
| --- | --- |
| `CREATOR_ROLES` | `teacher, partner, school, coaching, admin, corporate_trainer, content_creator` |
| `SELLER_ROLES` | `teacher, partner, school, coaching, admin, corporate_trainer, content_creator` (identical set to `CREATOR_ROLES`) |
| `INSTITUTION_ROLES` | `school, coaching, admin, franchise` |
| `STUDENT_ROLES` | `student` |
| `PARENT_ROLES` | `parent` |
| `ALL_ROLES` | `student, teacher, partner, school, coaching, admin, parent, corporate_trainer, content_creator, franchise` (10 distinct roles) |

> Note on the "11 roles" headline: `ALL_ROLES` contains **10 distinct** role
> tokens. The "11" count in product docs counts a duplicate; this matrix lists
> all 10 distinct roles plus a row note where it matters.

### Capability gate (`backend/middleware/requireCapability.js`)

`requireCapability(cap)` resolves as: **admin always passes** (`rolesOf` contains
`admin` → `next()`); otherwise it looks up `role_capabilities` in the DB, and if
that table is missing it falls back to a static map:

- **`CREATOR_ROLES` fallback set** (`teacher, partner, coaching, school, corporate_trainer, content_creator, franchise`) → holds creator caps: `course.create, course.edit, course.delete, live.schedule, live.start, attendance.mark, assignment.grade, assignment.manage, test.create, certificate.issue, student.manage, booking.manage, invoice.manage, payment.read, payout.request, analytics.read`.
- **`INSTITUTION_ROLES` fallback set** (`school, coaching, franchise`) → also holds org caps: `org.member.invite, org.member.manage, org.branding, analytics.read, org.transfer, admissions.manage, billing.manage, payroll.manage, hr.manage`.

> Important divergence to keep in mind: in the **capability fallback map**
> (`requireCapability.js`) `franchise` is treated as a creator/institution role
> and therefore can create/edit courses and run live classes. But in
> `roles.js`, `franchise` is **not** in `CREATOR_ROLES` — so any route gated by
> `authorizeRole(CREATOR_ROLES)` (rather than `requireCapability`) will
> **deny** franchise. Course/live-class routes are `requireCapability`-gated
> (`course.create`, `live.schedule`), so franchise is **Allowed** for those;
> the legacy `authorizeRole(CREATOR_ROLES)`-only routes (e.g.
> `POST /api/courses/:id/duplicate`, `/api/eduos` batch/qr create) **deny**
> franchise. Cells below reflect the gate that actually guards each feature.

---

## 2. Matrix — Roles (rows) × Features (columns)

Legend: **Allowed** = role passes the server-side gate · **Denied** = server
returns 403 (or client guard redirects) · **N/A** = feature not applicable to
this role's product surface.

| Role | Login | Dashboard | Create Course | Enroll | Payments | Marketplace Sell | Live Class Host | Admin OS | Impersonate | Settings | Notifications |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **student** | Allowed | Allowed | Denied | Allowed | Allowed | Denied | Denied | Denied | Denied | Allowed | Allowed |
| **teacher** | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Denied | Denied | Allowed | Allowed |
| **partner** | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Denied | Denied | Allowed | Allowed |
| **school** | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Denied | Denied | Allowed | Allowed |
| **coaching** | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Denied | Denied | Allowed | Allowed |
| **admin** | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed |
| **parent** | Allowed | Allowed | Denied | N/A¹ | Allowed | Denied | Denied | Denied | Denied | Allowed | Allowed |
| **corporate_trainer** | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Denied | Denied | Allowed | Allowed |
| **content_creator** | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Denied | Denied | Allowed | Allowed |
| **franchise** | Allowed | Allowed | Allowed² | Allowed | Allowed | Allowed² | Allowed² | Denied | Denied | Allowed | Allowed |

**Footnotes**

1. **parent / Enroll = N/A** — parents do not self-enroll in courses; they link
   to a child (`POST /api/parent/link`) and view the child's snapshot. The
   enrollment surface is a student/buyer action, so it is not part of the
   parent product surface. (`/api/enrollments` is `authenticateToken`-only, so
   a parent token is *technically* not 403'd by role; it is N/A by product
   design, not by a role gate.)
2. **franchise** is Allowed for Create Course / Marketplace Sell / Live Class
   Host **via the capability gate** (`requireCapability` fallback treats
   franchise as creator/institution). It is **Denied** on the subset of legacy
   routes still gated by `authorizeRole(CREATOR_ROLES)` from `roles.js`
   (franchise is absent there), e.g. `POST /api/courses/:id/duplicate` and
   `/api/eduos` batch/qr creation. This split is called out in §1.

---

## 3. Per-feature gate reference (what each column maps to)

| Feature column | Backing route(s) / gate | Allowing role set |
| --- | --- | --- |
| **Login** | `POST /api/auth/login` (public, throttled) → `storeAuth` + redirect to `/dashboard.html?role=<role>` | All roles (auth itself is public) |
| **Dashboard** | `/dashboard.html?role=<role>` (client guard: needs `jm_token`+`jm_user`) + `GET /api/dashboard` (`authenticateToken`, shaped per role) | All authenticated roles |
| **Create Course** | `POST /api/courses` → `authenticateToken` + `requireCapability('course.create')` | CREATOR_ROLES + franchise (via cap fallback); admin always |
| **Enroll** | `POST /api/enrollments` (`authenticateToken`) | Any authenticated role (student-facing in practice; parent = N/A by design) |
| **Payments** | `POST /api/payments/order` / `/verify` / `GET /api/payments/my` (`authenticateToken`); `GET /api/payments/config` public | Any authenticated role |
| **Marketplace Sell** | `POST /api/marketplace` (create listing) + `GET /api/marketplace/my/listings` (`authenticateToken`); product-gated to seller surfaces | SELLER_ROLES + franchise (cap fallback); buyers see browse only |
| **Live Class Host** | `POST /api/teacher/live-classes/recurring` / studio → `requireCapability('live.schedule' / 'live.start')`; `studio.html` is a creator tool | CREATOR_ROLES + franchise (cap fallback); admin always |
| **Admin OS** | `/admin-os.html` (client guard: `role==='admin'` else redirect `/login.html?next=`) + `/api/admin/*` (`authorizeRole(['admin'])`) | admin only |
| **Impersonate** | `POST /api/admin/impersonate/start` (`authorizeRole(['admin'])`) | admin only |
| **Settings** | `/settings.html` + `GET/PUT /api/me`, `/api/users` (`authenticateToken`, own user) | Any authenticated role |
| **Notifications** | `GET /api/notifications` + mark-read (`authenticateToken`, own data). *Admin broadcast* (`/api/notifications-admin`) is admin-only and separate | Any authenticated role (own); broadcast = admin only |

---

## 4. How verified

| Area | Verification source | Status |
| --- | --- | --- |
| Per-role **Dashboard** loads (all 10 distinct roles) without bouncing to login | `e2e/specs/navigation-roles.spec.js` — SUITE 1 "per-role dashboard loads" iterates every role, seeds a session, asserts `#sidebar`, `#userRoleBadge`, and title render. | **Authored** (Playwright; needs live `E2E_BASE_URL` server, else `beforeAll` skips). **Runtime-verified = no** in this doc. |
| **Admin OS** forbidden matrix (every non-admin role denied; admin allowed) | `e2e/specs/navigation-roles.spec.js` — SUITE 2 asserts each non-admin role is redirected to `/login.html?next=/admin-os.html` and the admin-only nav (`[data-section="tenants"]`, `[data-section="system"]`) is absent; admin reaches the Platform OS shell. | **Authored** (Playwright). |
| **Unauthenticated** access blocked on dashboard + admin-os | `e2e/specs/navigation-roles.spec.js` — SUITE 3 (no session → both surfaces redirect to login). | **Authored** (Playwright). |
| **Admin API** role enforcement (401 no token, 403 for student, 200 for admin) incl. `/admin/migrations/run` path-traversal 400 | `backend/tests/admin.test.js` (Jest + supertest, mocked auth/Supabase). | **Authored** (unit). |
| **Auth** flows (login, signup, OTP, google) status codes | `backend/tests/auth.test.js`. | **Authored** (unit). |
| **Courses** capability gating (create/edit/delete, public browse) | `backend/tests/courses.test.js`. | **Authored** (unit). |
| **Payments** order/verify/webhook signature | `backend/tests/payments.test.js`. | **Authored** (unit). |
| Capability-tier cells (Create Course / Live Host / Marketplace Sell for the 7 creator/seller roles + franchise) at the **HTTP 403/200** level | No dedicated per-role capability E2E exists yet; expectations here are derived from reading `requireCapability.js` + `roles.js`. | **Manual-required** (recommend a data-driven API spec hitting `POST /api/courses` and `POST /api/teacher/live-classes/recurring` per role with seeded tokens). |
| **franchise** legacy-route split (denied on `authorizeRole(CREATOR_ROLES)` routes, allowed on `requireCapability` routes) | Derived from source divergence between `roles.js` (franchise ∉ CREATOR_ROLES) and `requireCapability.js` fallback (franchise ∈ creator set). | **Manual-required** (recommend asserting 403 on `POST /api/courses/:id/duplicate` for franchise vs 200/allowed on `POST /api/courses`). |

---

## 5. Test gaps / recommended additions

1. **API-level capability matrix.** Add `e2e/specs/api.spec.js` (or extend it)
   with a data-driven suite that, per role, hits the gated mutation endpoints
   (`POST /api/courses`, `POST /api/teacher/live-classes/recurring`,
   `POST /api/marketplace`) with a **real seeded/signed token** and asserts
   200/201 vs 403. Current `navigation-roles.spec.js` uses an **unsigned** fake
   JWT (frontend gating only), so it cannot assert server 403s.
2. **Franchise divergence regression.** Explicitly assert the
   `authorizeRole(CREATOR_ROLES)` vs `requireCapability` split for franchise so
   a future refactor that "harmonises" the two lists is caught.
3. **Parent boundary.** Assert `POST /api/parent/link` succeeds for parent and
   403s for non-parent/non-admin, and that parent cannot reach
   `/api/teacher/*` and `/api/institutions/*` (per the forbidden matrix).
4. **`role_capabilities` present vs absent.** All capability expectations above
   were read against the **static fallback** path; add a test that runs with the
   `role_capabilities` table seeded to confirm DB-backed resolution matches the
   fallback.
