# EduOS — Production Go-Live Checklist

> **Purpose:** A production-readiness gate for the EduOS platform (static HTML frontend in `public/`,
> Express API at `/api/*`, Supabase via `SERVICE_ROLE_KEY` with app-enforced tenancy).
> Every item below is tagged **[Automated]** (proven by a test/CI artifact) or **[Manual]** (requires a
> human action, drill, or environment configuration that cannot be asserted from the repo).
>
> **Status legend:** `[ ]` not done · `[x]` done · `(Authored)` artifact exists in repo but has not been
> executed in this environment · `(Runtime-verified)` proven by a passing run · `(Manual-required)` needs a human sign-off.
>
> **Sign-off rule:** Do not flip a box to `[x]` until the referenced proving artifact has actually been run/applied
> in the target (staging or production) environment. Authoring a test or migration file is **not** the same as
> running it — keep those items honest.

---

## 0. Release metadata

| Field | Value |
|---|---|
| Release / tag | `________` |
| Target environment | production (GHCR image `ghcr.io/<repo>:latest`, Watchtower auto-deploy) |
| Release manager | `________` |
| Go/No-Go date | `________` |
| E2E base URL | `process.env.E2E_BASE_URL || http://localhost:5000` |

---

## 1. Security

RLS, upload allowlists, webhook signatures, JWT, rate limits, and per-phone OTP throttling.

- [ ] **[Manual] (Manual-required)** RLS migration applied to the production database.
  Run `migrations/001_rls_policies.sql` via **Admin → System → Run migration** (`POST /api/admin/migrations/run`)
  or the Supabase SQL editor. Note: the backend uses `SERVICE_ROLE_KEY` which **bypasses RLS** — RLS is the
  defence-in-depth backstop for any direct/anon access, while the primary enforcement remains app-code tenancy.
  *Proof:* migration row recorded; spot-check a table with `SELECT relrowsecurity FROM pg_class`.
- [ ] **[Automated] (Authored)** MIME upload allowlists enforced on every upload endpoint
  (`course-content` uploads, etc.). *Proof:* server-side MIME validation in upload handlers (commit
  `f312a39` "MIME validation on all upload endpoints"); negative-path coverage in `e2e/specs/security.spec.js`.
- [ ] **[Automated] (Authored)** Payment webhook signature / secret verification.
  `POST /api/payments/webhook` is raw-body + signature-verified (no JWT); `POST /api/payments/webhook/payment`
  uses `verifyWebhookSecret`. *Proof:* `backend/tests/payments.test.js` (10 tests) asserts unsigned/invalid
  webhooks are rejected; raw parser is mounted **before** `express.json` (middleware order).
- [ ] **[Automated] (Authored)** JWT authentication enforced server-side.
  `authenticateToken` → 401 when missing, 403 when invalid/expired; `req.user` carries `{role, roles[]}`.
  *Proof:* `backend/tests/auth.test.js` (10 tests) + `e2e/specs/auth.spec.js`. **Confirm `JWT_SECRET` is set to a
  strong, non-default value in production env.** *(Secret presence = Manual-required.)*
- [ ] **[Automated] (Authored)** Role / capability gating.
  `authorizeRole(list)` (union of `role` + `roles[]`) → 403 "Insufficient permissions";
  `requireCapability(cap)` (DB `role_capabilities` + static fallback, admin always passes) → 403 "Missing capability".
  *Proof:* `backend/tests/admin.test.js` (10 tests), `e2e/specs/navigation-roles.spec.js`, `QA/ROLE_TEST_MATRIX.md`.
- [ ] **[Automated] (Authored)** Rate limits active on auth surfaces.
  login throttle; `signup` ipLimit(10); `send-otp` ipLimit(8); `google-login` ipLimit(20).
  *Proof:* helmet/rate-limit is the first middleware layer; `e2e/specs/security.spec.js`.
- [ ] **[Automated] (Authored)** Per-phone OTP limit.
  `POST /api/auth/send-otp` is gated by **ipLimit(8) + phoneLimit(5)** (commit `96fd630` "per-phone OTP limit").
  *Proof:* throttle middleware on the route; manual burst test against a single phone returns 429.
- [ ] **[Manual] (Manual-required)** No hardcoded secrets / endpoints in shipped code.
  Hardcoded n8n URL removed (commit `f312a39`). *Proof:* secret scan of `public/` + `backend/` for keys/URLs.
- [ ] **[Automated] (Authored)** Trivy image scan reviewed.
  CI runs `aquasecurity/trivy-action` (HIGH,CRITICAL) on the published image — currently **non-blocking**
  (`continue-on-error: true`). *Proof:* `.github/workflows/deploy.yml` → "Trivy image scan"; **review the
  Actions log for HIGH/CRITICAL before promoting.**
- [ ] **[Manual] (Manual-required)** Security headers (helmet) and CORS allowlist confirmed for the production origin.
  *Proof:* `curl -I` against the prod host shows expected headers; CORS rejects unlisted origins.

---

## 2. Data

Indexes, encrypted backups + uploads, and a rehearsed restore.

- [ ] **[Manual] (Manual-required)** Performance index migration applied.
  Run `migrations/002_indexes.sql` (all `CREATE INDEX IF NOT EXISTS` — safe to re-run) via
  **Admin → System → Run migration** or Supabase SQL editor. *Proof:* `\d+` / `pg_indexes` shows the new indexes.
- [ ] **[Manual] (Manual-required)** Automated backups configured and **encrypted at rest**.
  Backup job (`scripts/api-backup.js`) scheduled; trigger via `POST /api/admin/backup/trigger`.
  *Proof:* a recent backup artifact exists and is encrypted; admin backup UI (`public/admin-os.html`) lists it.
- [ ] **[Manual] (Manual-required)** Uploaded objects encrypted at rest (storage bucket encryption on).
  *Proof:* storage provider config screenshot / setting.
- [ ] **[Manual] (Manual-required)** Restore drill completed end-to-end against a scratch target.
  Follow `RESTORE.md` step-by-step and record RTO/RPO and the operator who ran it.
  *Proof:* dated drill log referencing `RESTORE.md`; restored DB passes a smoke read.
- [ ] **[Manual] (Manual-required)** Backup retention + offsite copy verified (a backup that only lives on the
  same host is not a backup). *Proof:* retention policy documented; offsite copy listed.

---

## 3. Observability

Sentry, `/metrics`, and alert rules.

- [ ] **[Manual] (Manual-required)** Sentry DSN set in production env and receiving events.
  Sentry is wired (commit `27fb89d`) with an error handler late in the middleware chain.
  *Proof:* `SENTRY_DSN` present; a deliberate test error appears in the Sentry project.
- [ ] **[Automated] (Authored)** Prometheus scrapes the API `/metrics`.
  `monitoring/prometheus.yml` has `job_name: api → targets: ['api:5000']` (plus `cadvisor`, `prometheus`).
  *Proof:* `GET /metrics` returns Prometheus exposition; target shows **UP** in Prometheus.
- [ ] **[Automated] (Authored)** Alert rules loaded.
  `monitoring/alerts.yml` defines `ApiDown` (up{job="api"}==0 for 2m, critical), `ApiHighHeapUsage`, etc.
  *Proof:* rules visible under Prometheus → Alerts; **wire Alertmanager** — `alerting.alertmanagers.targets`
  in `prometheus.yml` is currently `[]` (no PagerDuty/Slack receiver). *(Receiver wiring = Manual-required.)*
- [ ] **[Manual] (Manual-required)** `GET /health` monitored by an external uptime check.
  *Proof:* uptime monitor configured against the prod health endpoint.
- [ ] **[Manual] (Manual-required)** Log shipping confirmed.
  `monitoring/promtail.yml` present. *Proof:* recent API logs queryable in the log backend.

---

## 4. Auth & Integrations

Google Sign-In and transactional email.

- [ ] **[Manual] (Manual-required)** Google `client_id` configured.
  `GET /api/auth/config` must return a real `google_client_id` matching `#googleBtn` GSI on `login.html`.
  `POST /api/auth/google-login` verifies the Google ID token server-side (never 200 for an invalid token).
  *Proof:* config response in prod; a live Google sign-in completes and lands on `/dashboard.html?role=<role>`.
- [ ] **[Manual] (Manual-required)** SMTP app password set; transactional email deliverable.
  *Proof:* a real **forgot-password** email arrives (`POST /api/auth/forgot-password` →
  `reset-password.html` → `POST /api/auth/reset-password` → redirect to `/login.html`); **verify-email** link works.
- [ ] **[Manual] (Manual-required)** OTP/SMS provider credentials set (if OTP enabled).
  `GET /api/auth/config` `otp_enabled` reflects intended state; a real OTP SMS is received and verifies.
- [ ] **[Automated] (Authored)** Email/password login happy path.
  `POST /api/auth/login {email,password}` → `{token,user}`; `storeAuth` sets `jm_token`/`jm_user`;
  `redirectToDashboard(role)` → `/dashboard.html?role=<role>` after 800ms. *Proof:* `e2e/specs/auth.spec.js`.

---

## 5. Performance

- [ ] **[Manual] (Manual-required)** Production smoke load test passes (key public reads: `GET /api/courses`,
  `/api/marketplace`, `/api/search`) within latency budget. *Proof:* load-test report.
- [ ] **[Manual] (Manual-required)** Index migration (`002`) applied **before** load test so hot-path queries use
  indexes (cross-ref §2). *Proof:* query plans show index scans on high-traffic columns.
- [ ] **[Manual] (Manual-required)** Static asset caching / CDN headers verified for `public/` assets.
  *Proof:* `cache-control` headers on static responses.
- [ ] **[Manual] (Manual-required)** Heap headroom verified against the `ApiHighHeapUsage` (>0.90 for 5m) alert
  threshold under expected load. *Proof:* `nodejs_heap_used_bytes` trend in Prometheus.

---

## 6. Accessibility

- [ ] **[Automated] (Authored)** Accessibility checks authored.
  *Proof:* `e2e/specs/accessibility.spec.js`. **Run against the deployed build and record results — authored ≠ passing.**
- [ ] **[Manual] (Manual-required)** Keyboard-only navigation through `login.html` → `dashboard.html` works
  (focusable `#loginEmail`/`#loginPassword`/`#loginBtn`, visible focus rings, logical tab order).
- [ ] **[Manual] (Manual-required)** Color contrast and form labels meet WCAG AA on the auth + dashboard surfaces.
- [ ] **[Manual] (Manual-required)** Screen-reader smoke pass on the shared `dashboard.html` (sidebar/nav landmarks).

---

## 7. Responsive

- [ ] **[Automated] (Authored)** Responsive checks authored.
  *Proof:* `e2e/specs/responsive.spec.js` + `QA/RESPONSIVE_MATRIX.md`. **Run on the deployed build to confirm.**
- [ ] **[Manual] (Manual-required)** Mobile (≤480px), tablet (~768px), desktop (≥1280px) verified for
  `login.html`, `dashboard.html`, `marketplace.html` per `QA/RESPONSIVE_MATRIX.md`.
- [ ] **[Manual] (Manual-required)** No horizontal scroll / clipped controls; sidebar collapses correctly on mobile.

---

## 8. CI / Release gate

- [ ] **[Automated] (Runtime-verified in CI)** Unit-test job green on the release commit.
  `.github/workflows/deploy.yml` job **test** runs `npm test -- --passWithNoTests` (Jest, Node 20).
  Suite: **36 backend tests** — `auth` (10), `admin` (10), `courses` (6), `payments` (10).
  *Proof:* green check on the merge to `main`. **Note:** the `build`/publish job `needs: test`, so a failing
  test blocks publish. **Caveat:** `--passWithNoTests` means an *empty* match would not fail the job — confirm
  the run actually executed 36 tests, not zero.
- [ ] **[Manual] (Manual-required)** Coverage threshold respected.
  `backend/jest.config.js` enforces `lines ≥ 30%, functions ≥ 30%`. *Proof:* `npm run test:coverage` summary
  (note: the CI `test` job runs `npm test`, **not** `test:coverage`, so the threshold is **not** enforced in the
  pipeline — run coverage manually or add it to CI before sign-off).
- [ ] **[Automated] (Runtime-verified in CI)** Production image built & pushed to GHCR (`build` job).
  *Proof:* image tags `latest` + short-SHA in GHCR.
- [ ] **[Manual] (Manual-required)** Trivy HIGH/CRITICAL findings triaged (scan is non-blocking — see §1).
- [ ] **[Manual] (Manual-required)** Watchtower auto-deploy confirmed on the VPS (new image recreated the `api`
  container). *Proof:* `docker ps` shows the new image SHA; `GET /health` 200 post-deploy.
- [ ] **[Manual] (Manual-required)** Rollback path rehearsed (re-pin to previous GHCR SHA / disable Watchtower).
  *Proof:* documented rollback step + a dry run.

---

## 9. Manual UAT sign-off — per role

The 11 roles all render the **same** `/dashboard.html?role=<role>`; the `?role` param + `jm_user` drive nav/sections.
For each role: log in, confirm the correct dashboard renders, confirm allowed actions work, and confirm at least one
**forbidden** target is blocked **server-side** (not just hidden in the UI). Cross-ref `QA/ROLE_TEST_MATRIX.md` and
the discovery `forbiddenMatrix`.

| Role | Dashboard renders | Allowed actions work | Forbidden access blocked (server 403/redirect) | Tester | Date |
|---|---|---|---|---|---|
| student | [ ] | [ ] | [ ] `/api/admin`, `/api/teacher`, `admin*.html`, `studio.html`, `POST /api/courses` | | |
| teacher | [ ] | [ ] | [ ] `/api/admin`, `/api/parent`, `/api/institutions`, `admin*.html` | | |
| partner | [ ] | [ ] | [ ] `/api/admin`, `/api/parent`, `/api/institutions`, `admin*.html` | | |
| school | [ ] | [ ] | [ ] `/api/admin`, `/api/parent`, `admin*.html`, `control-center.html` | | |
| coaching | [ ] | [ ] | [ ] `/api/admin`, `/api/parent`, `admin*.html`, `control-center.html` | | |
| admin | [ ] | [ ] | [ ] N/A — admin is in INSTITUTION_ROLES and passes every `requireCapability` gate by design | | |
| parent | [ ] | [ ] | [ ] `/api/admin`, `/api/teacher`, `/api/institutions`, `studio.html`, `/api/wallet/subscribe` | | |
| corporate_trainer | [ ] | [ ] | [ ] `/api/admin`, `/api/parent`, `/api/institutions`, `admin*.html` | | |
| content_creator | [ ] | [ ] | [ ] `/api/admin`, `/api/parent`, `/api/institutions`, `admin*.html` | | |
| franchise | [ ] | [ ] | [ ] `/api/admin`, `/api/parent`, `admin*.html`, `/api/admin/migrations/run` | | |

- [ ] **[Manual] (Manual-required)** Logout clears `jm_token` + `jm_user` and redirects to `/login.html` (verified for at least 2 roles).
- [ ] **[Manual] (Manual-required)** Already-logged-in shortcut: revisiting `login.html` with a valid session redirects to the dashboard.
- [ ] **[Manual] (Manual-required)** Multi-institute scoping: `X-Active-Institution` (`jm_active_institution`) correctly scopes course/roster data for an institution-role user.

---

## 10. Final Go / No-Go

- [ ] All **§1 Security** items resolved or explicitly risk-accepted by the release manager.
- [ ] All **§2 Data** items (incl. a dated restore drill per `RESTORE.md`) complete.
- [ ] **§3 Observability** live (Sentry receiving, Prometheus target UP, Alertmanager receiver wired).
- [ ] **§8 CI** test job green on the release commit; image published; rollback rehearsed.
- [ ] **§9 UAT** sign-off complete for all 11 roles.

**Decision:** ☐ GO  ☐ NO-GO  **Approver:** `____________`  **Date:** `__________`

---

### Honesty notes (read before signing)
- Test/spec/migration **files existing in the repo does not mean they passed or were applied.** E2E
  (`e2e/specs/*`), accessibility, and responsive specs are marked **Authored** until run on the deployed build.
- The CI `test` job uses `--passWithNoTests`; confirm the run executed the expected **36** tests.
- `test:coverage` (30% line/function threshold) is **not** in the CI pipeline — enforce it manually for sign-off.
- Trivy and Alertmanager are wired but **not blocking / not pointed at a receiver** yet — treat as Manual-required.
