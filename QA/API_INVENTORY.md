# API Inventory — EduOS Backend

> **Status:** Authored from source. Mounts read from `backend/server.js`; auth/role
> facts for the eight starred routers are **source-verified** (line-level spot-check).
> The remaining groups are documented from the discovery inventory and representative
> route reads and are marked **inventory** until each router is individually verified.
>
> **Base path:** all groups mount under `/api/*`. **Auth scheme:** JWT bearer —
> `Authorization: Bearer <jm_token>`. Middleware `authenticateToken` returns **401** when
> the token is missing and **403** when it is invalid/expired; `authorizeRole(list)`
> returns **403 "Insufficient permissions"** (checks the union of `req.user.role` +
> `req.user.roles[]`); `requireCapability(cap)` returns **403 "Missing capability"**
> (DB `role_capabilities` with a static fallback map — **admin always passes**).
> **`admin` is a member of `INSTITUTION_ROLES` and passes every `requireCapability`
> gate by design.**
>
> **Server middleware order:** security (helmet / rate-limit) → CORS → raw parser for
> `/api/payments/webhook` → `express.json` → `express.static(public)` → `cacheMiddleware`
> → `syncMiddleware` → routes → 404 JSON → Sentry error handler → error handler.

## Legend

| Symbol | Meaning |
| --- | --- |
| ★ | Router **source-verified** in this pass (line-level read of method + path + middleware). |
| Auth? | Does at least one route in the group require `authenticateToken`? (`mixed` = some public, some gated.) |
| Role-gated? | Does the group use `authorizeRole(...)` and/or `requireCapability(...)` on any route? |
| Verified | Facts confirmed against the router file. |
| Inventory | Facts from the discovery inventory / representative reads; per-route verification pending. |

---

## API groups

| # | Mount | Router file | Auth? | Role-gated? | Key methods / paths | Tested by | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ★ `/api/auth` | `backend/routes/auth.js` | mixed | no | `POST /login` (loginThrottle), `POST /signup` (ipLimit 10), `GET /config`, `POST /send-otp` (ipLimit 8 + phoneLimit 5), `POST /verify-otp`, `POST /google-login` (ipLimit 20), `POST /forgot-password` (ipLimit 10), `POST /reset-password`, `POST /send-verify-email`, `GET /verify-email`, `GET /verify` (auth), `POST /refresh` (auth) | `backend/tests/auth.test.js` | Verified |
| 2 | `/api/users` | `backend/routes/users.js` | yes | no | user CRUD — all require `authenticateToken` | — | Inventory |
| 3 | ★ `/api/courses` | `backend/routes/courses.js` | mixed | yes | `GET /` (public), `GET /slug/:slug` (public), `GET /search/nearby` (public), `GET /:id` (public), `GET /:id/reviews` (public), `POST /` (`course.create`), `PUT /:id` (`course.edit`), `DELETE /:id` (`course.delete`), `POST /:id/duplicate` (authorizeRole CREATOR_ROLES), `GET /:id/students` (auth), `GET /:id/analytics` (auth) | `backend/tests/courses.test.js`; `e2e/specs/courses.spec.js` | Verified |
| 4 | `/api/enrollments` | `backend/routes/enrollments.js` | yes | no | enrollment create/list require `authenticateToken` | `backend/tests/courses.test.js` (enrollment gate) | Inventory |
| 5 | `/api/dashboard` | `backend/routes/dashboard.js` | yes | no | `GET /` (auth; payload shaped per role) | `e2e/specs/navigation-roles.spec.js` | Inventory |
| 6 | ★ `/api/payments` | `backend/routes/payments.js` | mixed | no* | `GET /config` (public), `POST /webhook` (`express.raw`, signature-verified, no JWT), `POST /webhook/payment` (`verifyWebhookSecret`), `POST /order` (auth), `POST /verify` (auth), `POST /:id/refund` (auth; ownership/admin enforced in handler), `GET /my` (auth), `POST /coupons` / `GET /coupons` / `DELETE /coupons/:id` (auth), `POST /coupons/apply` (auth), `GET /:id/receipt` (auth) | `backend/tests/payments.test.js`; `e2e/specs/payments.spec.js` | Verified |
| 7 | `/api/attendance` | `backend/routes/attendance.js` | yes | yes | attendance marking gated to creator roles / `attendance.mark` capability | — | Inventory |
| 8 | ★ `/api/live-classes` | `backend/routes/liveClasses.js` | mixed | yes | `POST /` (`live.schedule`), `GET /course/:courseId` (public), `GET /upcoming` (auth), `GET /:classId` (public), `POST /:classId/join` (auth; enrollment), `PUT /:classId` (authorizeRole CREATOR_ROLES), `POST /:classId/start` + `/end` (`live.start`), `POST /:classId/recording` (authorizeRole CREATOR_ROLES) | — | Verified |
| 9 | `/api/webhooks` | `backend/routes/webhooks.js` | no | no | inbound webhook receivers; secret/signature-verified rather than JWT | — | Inventory |
| 10 | ★ `/api/admin` | `backend/routes/admin.js` | yes | yes | **every route** `authenticateToken` + `authorizeRole(['admin'])` — `GET /users`, `GET /stats`, `GET /payments`, `PUT /users/:userId/toggle-status`, `POST /impersonate/start`, `POST /impersonate/stop` (auth only), `POST /migrations/run`, `POST /backup/trigger`, `GET /audit`, `GET /settings`, `GET /bookings`, `GET /live-classes` | `backend/tests/admin.test.js` | Verified |
| 11 | ★ `/api/marketplace` | `backend/routes/marketplace.js` | mixed | no | `GET /` (public), `GET /facets` (public), `GET /trending` (public), `GET /:id` (public), `GET /my/listings` (auth), `GET /my/purchases` (auth), `POST /` (auth), `PUT /:id` (auth), `DELETE /:id` (auth), `POST /:id/purchase` (auth) | `e2e/specs/courses.spec.js` (marketplace browse) | Verified |
| 12 | `/api/search` | `backend/routes/search.js` | mixed | no | `GET /` (public), `GET /suggestions` (public), `GET /semantic` (public), `GET /categories` (public), `POST /index-course` (auth) | — | Inventory |
| 13 | `/api/n8n` | `backend/routes/n8n.js` | mixed | no | n8n integration/status + webhook addon endpoints | — | Inventory |
| 14 | `/api/course-content` ★ | `backend/routes/courseContent.js` | yes | yes | `GET /:courseId/preview` (public), `GET /:courseId/topics|lectures|materials|tests` (auth; enrollment-gated reads), `POST /:courseId/tests` (`test.create`), `PUT /tests/:id` (`test.create`), `POST /tests/:testId/questions` (`test.create`), uploads `POST /:courseId/cover|lectures|materials` (auth, MIME-validated) | `backend/tests/courses.test.js` (lecture enrollment gate) | Verified |
| 15 | `/api/student` | `backend/routes/studentExtras.js` | yes | no | `GET/POST /notes`, `POST /sessions/start`, `GET /progress`, `GET /wishlist` (all auth) | — | Inventory |
| 16 | `/api/institutions` | `backend/routes/institutions.js` | yes | yes | `GET/POST /teachers` + `/students` (authorizeRole INSTITUTION_ROLES), `GET /dashboard` (INSTITUTION_ROLES), `GET /my-institutions` (auth only) | — | Inventory |
| 17 | `/api/assignments` | `backend/routes/assignments.js` | yes | yes | student submission; grade/manage gated to creator capability | — | Inventory |
| 18 | `/api/ai` | `backend/routes/ai.js` | yes | no | AI tutor/chat endpoints require `authenticateToken` | — | Inventory |
| 19 | `/api/chat` | `backend/routes/chat.js` | yes | no | DMs/threads require `authenticateToken` | — | Inventory |
| 20 | `/api/activity` | `backend/routes/activity.js` | yes | no | activity/event logging require `authenticateToken` | — | Inventory |
| 21 | `/api/teacher` | `backend/routes/teacherExtras.js` | yes | yes | `GET /timetable` (authorizeRole CREATOR_ROLES), `POST /live-classes/recurring` (`live.schedule`), `POST /attendance/bulk` (`attendance.mark`), `POST /essays/grade` (`assignment.grade`), `POST /invoices` (`invoice.manage`) | — | Inventory |
| 22 | `/api/parent` | `backend/routes/parentExtras.js` | yes | yes | `POST /link` (authorizeRole parent,admin), `GET /children` (parent,admin), `GET /child/:studentId/snapshot` (parent,admin) | — | Inventory |
| 23 | ★ `/api/wallet` | `backend/routes/wallet.js` | mixed | yes | `GET /plans` (public), `GET /` (auth), `POST /topup/order` + `/topup/verify` (auth), `POST /spend` (auth), `GET /referrals/my-code` (auth), `POST /referrals/apply` (auth), `GET /subscription` (auth), `POST /subscribe` (authorizeRole INSTITUTION_ROLES + teacher/partner/content_creator/corporate_trainer) | `backend/tests/payments.test.js` (adjacent money flows) | Verified |
| 24 | `/api/eduos` | `backend/routes/eduos.js` | yes | yes | `GET/POST /courses/:courseId/batches` (create → CREATOR_ROLES), `GET /batches/:batchId/roster` (CREATOR_ROLES + admin), `POST /qr/generate` (CREATOR_ROLES), `POST /notify/send` (admin), `DELETE /forum/...` (CREATOR_ROLES) | — | Inventory |
| 25 | `/api/calendar` | `backend/routes/calendar.js` | yes | no | `GET /` (auth; unified events for the caller) | — | Inventory |
| 26 | `/api/approvals` | `backend/routes/approvals.js` | yes | yes | `POST /` (auth; submit), `GET /` (authorizeRole admin), `GET /:id` (admin), `POST /:id/decide` (admin) | — | Inventory |
| 27 | `/api/payouts` | `backend/routes/payouts.js` | yes | yes | `GET /` (auth), `GET /my` (auth), `POST /` (auth; request), `POST /:id/decide` (authorizeRole admin) | — | Inventory |
| 28 | `/api/support` | `backend/routes/support.js` | yes | yes | create ticket (auth); admin queue/decision gated to admin | — | Inventory |
| 29 | `/api/reports` | `backend/routes/reports.js` | yes | yes | `POST /` (auth; content report), `GET /` (authorizeRole admin), `POST /:id/decide` (admin) | — | Inventory |
| 30 | `/api/notifications-admin` | `backend/routes/notificationsAdmin.js` | yes | yes | admin broadcast / notification management (authorizeRole admin) | — | Inventory |
| 31 | `/api/translations` | `backend/routes/translations.js` | yes | yes | translation read; write/manage gated to admin | — | Inventory |
| 32 | `/api/resources` | `backend/routes/resources.js` | yes | yes | bookable-resource CRUD; manage gated to creator/institution | — | Inventory |
| 33 | `/api/bookings` | `backend/routes/bookings.js` | yes | no | booking create/list require `authenticateToken` (`booking.manage` for mutate) | — | Inventory |
| 34 | `/api/gamification` | `backend/routes/gamification.js` | yes | no | streak / XP / badges require `authenticateToken` (own data) | — | Inventory |
| 35 | `/api/notifications` | `backend/routes/notifications.js` | yes | no | list / mark-read own notifications require `authenticateToken` | — | Inventory |
| 36 | `/api/certificates` | `backend/routes/certificates.js` | mixed | yes | `GET` verify by id (public verify); issue gated by `certificate.issue` capability | — | Inventory |
| 37 | `/api/orgs` | `backend/routes/orgs.js` | yes | yes | org read/manage gated via `requireCapability` (`org.member.*`, `org.branding`) | — | Inventory |
| 38 | `/api/capabilities` | `backend/routes/orgs.js` (`capRouter`) | yes | yes | capability listing / management (admin / org-admin) | — | Inventory |
| 39 | `/api/categories` | `backend/routes/orgs.js` (`catRouter`) | mixed | yes | category list (public read); write gated | — | Inventory |
| 40 | `/api/me` | `backend/routes/me.js` | yes | no | `GET /contexts` (auth; role/widget contexts for the caller) | — | Inventory |
| 41 | `/api/seo` | `backend/routes/seo.js` | no | no | SEO metadata endpoints; `/sitemap.xml` + `/robots.txt` via `rootRouter` (public) | — | Inventory |
| 42 | `/api/timetable` | `backend/routes/timetable.js` | yes | yes | timetable read (auth); manage gated to creator/institution roles | — | Inventory |
| 43 | `/api/i18n` | `backend/routes/i18n.js` | no | no | `GET` locale strings/bundles (public read) | — | Inventory |
| 44 | `/api/studio` | `backend/routes/studio.js` | yes | yes | studio session/recording endpoints gated to creator roles | — | Inventory |
| 45 | `/api/rag` | `backend/routes/rag.js` | yes | no | document RAG query/index require `authenticateToken` | — | Inventory |

\* **`/api/payments`** is not `authorizeRole`-gated, but `POST /:id/refund` enforces
**ownership/admin** inside the handler (an IDOR fix), and the two webhook routes are
secret/signature-verified rather than JWT-gated.

---

## Non-`/api` operational endpoints (server.js)

| Method + path | Auth? | Notes | Source |
| --- | --- | --- | --- |
| `GET /health` | no | Liveness JSON: `status`, feature flags, role list, route list. | Verified |
| `GET /metrics` | no | Prometheus text exposition (`process_heap_bytes`, `process_uptime_seconds`). | Verified |
| `GET /api/sync/queue` | no | LevelDB SyncQueue dump (`{queue, count}`). | Verified |
| `POST /api/sync/flush` | no | Flushes the LevelDB SyncQueue. | Verified |
| `GET /sitemap.xml`, `GET /robots.txt` | no | Served by `seoRoutes.rootRouter`. | Verified |
| `*` (unmatched) | n/a | 404 JSON `{error, path, method}`. | Verified |

---

## Public (no-session) API reads

These return data without a token: `GET /api/courses` (+ `slug`, `nearby`, `:id`,
`:id/reviews`), `GET /api/marketplace` (list / facets / trending / `:id`),
`GET /api/search` (+ suggestions / semantic / categories), `GET /api/auth/config`,
`GET /api/payments/config`, `GET /api/wallet/plans`, `GET /api/i18n`, `GET /api/seo` +
`/sitemap.xml` + `/robots.txt`, `GET /api/categories` (read), certificate verify,
`GET /health`, `GET /metrics`.

**Signature/secret-verified (no JWT):** `POST /api/payments/webhook`,
`POST /api/payments/webhook/payment`, `POST /api/webhooks`.

---

## "Tested by" coverage map

| Test file | Kind | Asserts against |
| --- | --- | --- |
| `backend/tests/auth.test.js` | Jest (authored) | `GET /auth/config` (200 + `google_client_id`); `POST /auth/send-otp` (missing-phone reject, 429 after 5 sends); `POST /auth/login` (400 missing field, non-200 unknown user, 401 bad password, 200 + token on valid); `POST /auth/google-login` (400 missing credential, never 200 for invalid token). |
| `backend/tests/admin.test.js` | Jest (authored) | Unauthenticated → 401 (`/admin/users`, `/admin/audit`, `/admin/payments`); student → 403; admin → 200 (`/admin/users`, `/admin/audit`); `POST /admin/migrations/run` (401 no token, 403 student, 400 path-traversal). |
| `backend/tests/courses.test.js` | Jest (authored) | `GET /courses` public 200; `GET /courses/:id` 200; `POST /courses` 401 no auth + 400/422 Joi; `GET /course-content/:id/lectures` 401 unauth + paid-lecture hidden from unenrolled. |
| `backend/tests/payments.test.js` | Jest (authored) | `POST /payments/order` (401, Joi on missing/negative amount); `POST /payments/verify` (401, Joi, 400/401 bad HMAC); `POST /payments/:id/refund` (401, 403 student); `POST /payments/coupons/apply` (401, Joi missing code). |
| `e2e/specs/auth.spec.js` | Playwright (authored) | login.html flows / storeAuth / redirect. |
| `e2e/specs/courses.spec.js` | Playwright (authored) | course + marketplace browse surfaces. |
| `e2e/specs/payments.spec.js` | Playwright (authored) | payment UI surfaces. |
| `e2e/specs/security.spec.js` | Playwright (authored) | forbidden-matrix / page-guard checks. |
| `e2e/specs/navigation-roles.spec.js` | Playwright (authored) | per-role dashboard nav. |
| `e2e/specs/responsive.spec.js`, `accessibility.spec.js` | Playwright (authored) | layout / a11y. |

> **Backend Jest:** `backend/tests/` — auth, admin, courses, payments (≈36 cases,
> **authored**; not asserted as executed in this pass). Mocks under `backend/__mocks__/`,
> config `backend/jest.config.js`.
>
> **Note — no `e2e/specs/api.spec.js`:** the task brief references this file, but it is
> **not present** in `e2e/specs/`. The directory contains `auth`, `courses`, `payments`,
> `security`, `navigation-roles`, `responsive`, and `accessibility` specs only. The
> API-contract assertions live in the **backend Jest suite** (`supertest`-style), not in
> a Playwright `api.spec.js`. Treat the API-contract "Tested by" references above as the
> Jest files; an `e2e/specs/api.spec.js` would need to be authored to cover live-server
> contract checks against `process.env.E2E_BASE_URL || 'http://localhost:5000'`.

---

## Verification status summary

- **Source-verified routers (8):** `auth`, `courses`, `payments`, `admin`,
  `marketplace`, `wallet`, `live-classes`, `course-content` — method, path, and
  middleware confirmed by line-level read.
- **Inventory routers (37):** mounts confirmed in `backend/server.js`; per-route
  auth/role facts carried from the discovery inventory and representative reads.
  Each should get the same line-level pass before being marked Verified.
- **Runtime-verified:** none in this pass. No router was exercised against a running
  server; the Jest/Playwright suites above are **authored**, not asserted as executed.

---

## Generating full OpenAPI docs later

This inventory is hand-authored. To produce a complete, machine-checked
**OpenAPI 3.1** spec, pick one of these paths (lowest effort first):

1. **Annotate + scrape (recommended, incremental):** add JSDoc `@openapi` blocks above
   each `router.<verb>(...)` handler and run **`swagger-jsdoc`** to emit
   `openapi.json`, then serve it with **`swagger-ui-express`** at `/api/docs`.
   - `npm i -D swagger-jsdoc swagger-ui-express`
   - Point the glob at `backend/routes/*.js`; document params, request bodies
     (mirror the existing **Joi** `validate('<schema>')` schemas), responses, and the
     `bearerAuth` security scheme. Tag operations by mount (one tag per group above).

2. **Derive from Joi automatically:** the codebase already validates with Joi
   (`validate('login')`, `validate('paymentOrder')`, …). Convert those schemas to JSON
   Schema with **`joi-to-json`** / **`joi-to-swagger`** and inject them as
   `requestBody`/`components.schemas`, so request contracts stay in lockstep with
   validation. This removes most hand-written body docs.

3. **Reflect the Express router tree:** walk `app._router.stack` (or use
   **`express-list-endpoints`**) at boot to auto-enumerate every mounted method+path —
   use this to **diff against this table in CI** and fail the build when a route is added
   without a doc entry. Pair with the security middleware map (`authenticateToken`,
   `authorizeRole`, `requireCapability`) to auto-populate the `security` + `x-roles`
   fields per operation.

4. **Contract-test the spec:** once `openapi.json` exists, add **`jest-openapi`** (or
   Schemathesis/Dredd) so the backend Jest suite asserts each response matches the
   documented schema — turning this inventory's "Tested by" column into enforced
   contract coverage and giving the missing `e2e/specs/api.spec.js` a generated source
   of truth.

> Until one of the above lands, **this file is the canonical API map** and should be
> updated in the same PR whenever a route or its auth posture changes.
