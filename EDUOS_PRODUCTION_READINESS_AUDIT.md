# EduOS / JeetMantra — Production Readiness Audit

_Grounded in the actual repo (not generic). Audit only — no deployment performed, per instructions._
_Verdict up front: **DO NOT go to production yet.** The app is functionally strong; the deployment, ops, and a few security layers are not built._

---

## Estimated Go-Live Readiness: **~45%**

| Layer | Readiness | Why |
|---|---|---|
| Application / features | ~85% | 380 endpoints, capability-gated, Joi on money, 12 migrations applied, widget UX |
| App-level security | ~65% | auth/RBAC/capabilities solid; **no helmet, no global rate-limit, permissive CORS** |
| Containerization | ~20% | compose has only n8n+postgres; **no app Dockerfile, no prod compose** |
| Deployment / reverse proxy / HTTPS | ~10% | nothing exists (no Traefik/Caddy/nginx, no TLS config) |
| CI/CD | 0% | no pipeline at all |
| Monitoring / observability | ~5% | only `/health`; no Sentry/Prometheus/logs aggregation |
| Backups / DR | ~10% | no documented strategy; Supabase is self-hosted (external) |
| Tests (QA automation) | ~20% | one `scripts/test-e2e.js` smoke script, no framework, low coverage |
| Env management | ~40% | secrets gitignored ✓ but **no `.env.example`/per-env templates** |

---

## 1–10. The required outputs

### 1. Production Readiness Score — **45 / 100** (NOT ready)

### 2. CRITICAL BLOCKERS (must fix before any prod deploy)
- **B1 — Hardcoded secrets committed in `docker-compose.yml`**: `N8N_BASIC_AUTH_PASSWORD=jeetmantra123`, `POSTGRES_PASSWORD=jeetmantra_secure_pwd_123`. These are in git history. **Rotate + move to env/secret store.**
- **B2 — No application container**: `docker-compose.yml` only runs n8n + an optional postgres. There is **no Dockerfile** for the Node backend or the static frontend, and no `docker-compose.prod.yml`. The app cannot be deployed via Docker as-is.
- **B3 — No reverse proxy / HTTPS**: nothing terminates TLS. The app `app.listen(PORT)` on plain HTTP. Production needs Traefik/Caddy/nginx + Let's Encrypt.
- **B4 — No backup / DR plan**: self-hosted Supabase (`api.mantravat.cloud`) holds all data; no documented backup or restore. A single VPS failure = total data loss.
- **B5 — No CI/CD + near-zero automated tests**: deploys would be manual; the only test is a 327-line smoke script (no Jest/Vitest, no role coverage).

### 3. HIGH-PRIORITY ISSUES
- **H1 — No `helmet`**: missing security headers (HSTS, X-Frame-Options, CSP, nosniff). Not installed.
- **H2 — No global rate limiting**: `express-rate-limit` is not installed. Only OTP has app-level throttling. APIs (login, AI, payments) are unthrottled → brute-force / abuse risk.
- **H3 — Permissive CORS**: `cors({ origin: process.env.FRONTEND_URL || '*' })` — the `'*'` fallback allows any origin if the env var is unset.
- **H4 — No `trust proxy`**: behind a reverse proxy, `req.ip` will be the proxy; rate-limit + audit logs will record the wrong IP.
- **H5 — No structured logging / error monitoring**: no winston/pino, no morgan, no Sentry. Production errors are invisible.
- **H6 — No `.env.example` / per-env files**: only `backend/.env` (gitignored). No template → error-prone QA/UAT/prod provisioning.
- **H7 — No resource limits / restart policy on the (missing) app container**; no health-check wired for the app in compose.

### 4. SECURITY ISSUES
| ✅ Present (from this session's work) | ❌ Missing / weak |
|---|---|
| JWT auth (`jsonwebtoken`), bcryptjs password hashing | helmet (security headers) |
| RBAC + capability model (`requireCapability`) | global rate limiting |
| Joi validation on 100% of money flows | CSP / clickjacking protection |
| Webhook signature verification (fail-closed) | CSRF tokens (mitigated by Bearer-token API, but no SameSite cookie story) |
| Search/PostgREST injection sanitized | SSRF guard on n8n/AI webhook URLs (user-supplied URLs are fetched) |
| Impersonation signed with `actor_id` | secrets-in-git (B1), secret rotation policy |
| Audit logging (`auditLog`) on privileged actions | RLS policies on Supabase tables (uses service-role key → app-enforced only) |
| n8n sync fail-closed in prod | AI key encryption at rest (stored plain in localStorage / env) |

> **RLS note:** the backend talks to Supabase with the **service-role key** (bypasses RLS). All tenancy/row-security is enforced **in app code**, not the DB. That's acceptable but means a single missed `.eq(owner)` check = data leak. RLS as defense-in-depth is recommended.

### 5. PERFORMANCE ISSUES
- No `compression` middleware (gzip/brotli) → larger payloads.
- Static SPAs are **single huge files** (`dashboard.html` ~9.7k lines) served unminified, no bundling/code-splitting, no CDN, no cache headers.
- No Redis cache layer in prod (LevelDB local cache only; doesn't scale horizontally).
- No DB connection pooling tuning (PostgREST/Supabase-managed).
- AI/RAG latency unbounded (synchronous webhook calls in request path).
- **Not yet measured** — no load test / APM data exists.

### 6. MISSING DOCKER CONFIGURATION
- `Dockerfile` (backend, multi-stage Node) — **absent**.
- `Dockerfile` (frontend / static — or serve via backend) — **absent**.
- `docker-compose.prod.yml` — **absent**.
- `.dockerignore` — **absent**.
- Services not in compose: **app/backend, reverse proxy (Traefik/Caddy), Redis, monitoring (Prometheus/Grafana/Loki/Uptime-Kuma)**.
- Present but dev-grade: n8n (hardcoded creds), optional postgres (unused — real DB is external Supabase).

### 7. MISSING ENVIRONMENT VARIABLES / FILES
- No `.env.example`, `.env.development`, `.env.qa`, `.env.production`.
- Keys in use (from `backend/.env`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `POSTGRES_PASSWORD`, `SECRET_KEY_BASE`, `VAULT_ENC_KEY`, `PG_META_CRYPTO_KEY`, `LOGFLARE_*`, `DASHBOARD_PASSWORD`. **Not declared:** `FRONTEND_URL`, `N8N_SECRET`, `PUBLIC_BASE_URL`, `RAZORPAY_*`, `PLATFORM_COMMISSION_RATE`, `NODE_ENV` (referenced in code but undocumented).

### 8. MISSING TESTS
- No unit tests, no integration suite, no role-based E2E. Only `scripts/test-e2e.js` (smoke).
- No coverage reporting, no test in CI (no CI exists).
- **Recommended:** Vitest/Jest for services (award, identity, validation), Supertest for routes, Playwright for the role flows in Phase 5.

### 9. MISSING MONITORING
- Uptime: none (add Uptime-Kuma on `/health`).
- Errors: none (add Sentry — backend + frontend).
- Metrics: none (Prometheus + Grafana; export from Node).
- Logs: none aggregated (Loki + promtail, or at minimum pino → file → logrotate).
- Business: payment success/fail, AI spend, signups — no dashboards.

### 10. MISSING BACKUPS
- DB: no automated Supabase/Postgres dump + offsite copy.
- Media/uploads (`/uploads/*`), recordings: no backup.
- Config/secrets: no encrypted backup.
- No restore runbook, no tested recovery.

---

## 11. Deployment Architecture (recommended)

```
                         Internet (443)
                              │
                    ┌─────────▼──────────┐
                    │  Traefik / Caddy   │  TLS (Let's Encrypt), HTTP→HTTPS,
                    │  reverse proxy      │  security headers, rate-limit edge
                    └───┬─────────┬───────┘
              app.* ┌───▼───┐ n8n.*│  studio.*│
                    │ Node  │  ┌───▼───┐  (static via Node/Caddy)
                    │ API + │  │  n8n  │
                    │ static│  └───┬───┘
                    └─┬───┬─┘      │
              cache │   │ jobs     │
            ┌───────▼─┐ │   ┌──────▼─────┐
            │  Redis  │ │   │ background  │
            └─────────┘ │   │  worker     │
                        │   └────────────┘
         ┌──────────────▼───────────────┐
         │  Supabase (self-hosted) —     │  REST /pg/query, service-role key
         │  Postgres + PostgREST + Auth  │  (separate host or same VPS, own compose)
         └───────────────────────────────┘
   Observability sidecar stack: Prometheus + Grafana + Loki + Sentry + Uptime-Kuma
   Backups: nightly pg_dump → encrypted → offsite (S3/Backblaze) + media rsync
```

## 16. Recommended VPS configuration
- **MVP / low traffic:** 4 vCPU · 8 GB RAM · 80 GB NVMe SSD · Ubuntu 22.04 LTS. (Node + Redis + n8n + proxy + monitoring.)
- **If Supabase is co-hosted:** 6–8 vCPU · 16 GB RAM · 160 GB SSD (Postgres is the heavy tenant). Better: put Supabase on its **own** VPS.
- Swap 2–4 GB, UFW firewall (allow 22/80/443 only), fail2ban on SSH, automatic security updates, non-root deploy user, SSH keys only.

## 17. Recommended container architecture
| Container | Image | Notes |
|---|---|---|
| `proxy` | traefik:v3 or caddy:2 | TLS, headers, edge rate-limit, restart=always |
| `api` | node:20-alpine (multi-stage) | the backend; non-root user; healthcheck `/health`; mem-limit 1–2g |
| `redis` | redis:7-alpine | cache/sessions; AOF persistence; mem-limit |
| `n8n` | n8nio/n8n | **creds via secrets**, postgres-backed (not sqlite) |
| `worker` | same as api | background jobs (reminders, AI, award flushes) |
| `prometheus`/`grafana`/`loki`/`uptime-kuma` | official | observability |
| Supabase stack | (its own compose) | ideally separate host |

---

## 12. QA Checklist (Phase 5 — per role × flow)

Roles: Student · Teacher · Coach · Institute/Owner · School · Parent · Admin · Partner · Franchise · Trainer.
For each: **Signup → Login → Profile → Dashboard → Courses → Payments → Assignments → Tests → Attendance → Calendar → AI → Messages → Notifications → Settings → Logout.**

- [ ] Each role logs in and lands on the correct dashboard (widget or classic)
- [ ] Capability gates: a role without a capability gets 403 (not a 500, not silent allow)
- [ ] Money flows reject malformed input (Joi 400) and never double-charge (wallet atomicity)
- [ ] Multi-institute switch re-scopes data (no cross-tenant leakage)
- [ ] Public pages (marketplace, course/:slug, sitemap) load unauthenticated
- [ ] 401 on every gated endpoint when anonymous (already smoke-verified this session)
- [ ] Empty/loading/error states render (no blank screens)

## 13. UAT Checklist (business sign-off)
- [ ] A real teacher creates a course → student discovers it on the marketplace (by category + location) → purchases (live Razorpay) → enrolls → joins a live class → submits an assignment → gets graded → receives a certificate.
- [ ] Parent links a child and sees progress/fees.
- [ ] Admin configures org branding + widgets; changes appear for that org's users.
- [ ] Settings configured once (central) apply to Exam + Bhasha Setu.
- [ ] Refund / payout path works and is admin-gated + audited.
- [ ] Localization: UI renders in Hindi + one more language end-to-end.

## 14. Go-Live Checklist (Phase 17)
- [ ] TLS valid (A+ on SSL Labs), HSTS on · [ ] Domain + DNS (A/AAAA/CNAME) · [ ] Email/SMTP deliverable (SPF/DKIM/DMARC)
- [ ] Razorpay in **live** mode + webhook signature verified · [ ] Storage/uploads persisted on a volume + backed up
- [ ] Nightly backups running + **one restore tested** · [ ] Sentry + Uptime-Kuma alerting to a real channel
- [ ] Logs aggregated + retained · [ ] helmet + rate-limit + CORS locked to real origin · [ ] `NODE_ENV=production`
- [ ] All 12 migrations applied (done) · [ ] sitemap.xml + robots.txt reachable (done) · [ ] secrets rotated post-B1

## 15. Rollback Strategy
- **Image-pinned deploys**: tag every release (`api:<git-sha>`); keep the previous tag live-able.
- **Blue/green or `docker compose` swap**: deploy new tag to a parallel service, smoke-test `/health` + a login, flip the proxy upstream; revert = flip back (seconds).
- **DB**: migrations are idempotent and additive (this session's pattern) — forward-safe; for a bad release, redeploy the previous image (schema stays compatible). Keep a pre-deploy `pg_dump` for true rollback.
- **Kill-switch**: feature flags via `org.settings` / env to disable a broken surface without redeploy.

---

## 13b. DEV → QA → UAT → PROD (Phase 13/14 pipeline)

```
push → CI: lint → unit → integration → docker build → image scan (Trivy) → dep scan (npm audit/Snyk)
     → deploy QA (compose pull+up) → smoke (/health + role login)
     → manual QA signoff → deploy UAT → business validation
     → manual approval → deploy PROD (blue/green) → health check → (auto-rollback on fail)
```
Recommended: GitHub Actions (`.github/workflows/ci.yml`) — none exists today.

---

## 18. Phase-by-phase status (1–18)

| Phase | State | Top gap |
|---|---|---|
| 1 System audit | done (this doc) | — |
| 2 Env audit | ⚠️ | no env templates; secrets in compose |
| 3 Docker | ❌ | no app Dockerfile / prod compose |
| 4 VPS deploy | ❌ | no proxy/TLS/firewall/backup defined |
| 5 QA plan | ✅ (checklist above) | not executed |
| 6 E2E | ❌ | only a smoke script |
| 7 API validation | ✅ | 380 ep inventory done; **no OpenAPI/Swagger** |
| 8 Security | ⚠️ | helmet/rate-limit/RLS/SSRF |
| 9 Performance | ❌ | unmeasured; no compression/CDN |
| 10 Responsive | ✅ (mostly) | smartboard/TV tiers added this session |
| 11 Studio | ⚠️ | client works; backend persistence added but unverified at load |
| 12 Data | ✅ | 12 migrations applied; **RLS absent**, backups absent |
| 13 DEV→PROD | ❌ | environments not created |
| 14 CI/CD | ❌ | none |
| 15 Monitoring | ❌ | none |
| 16 Backup/DR | ❌ | none |
| 17 Prod checklist | ⚠️ | partial (SEO/sitemap done) |
| 18 Go-live plan | ✅ (below) | — |

---

## 18b. Go-Live timeline

- **T-30**: build app Dockerfile + prod compose + reverse proxy; rotate B1 secrets; add helmet/rate-limit/compression/trust-proxy; create env templates. Stand up QA env.
- **T-15**: CI/CD pipeline; Sentry + Uptime-Kuma + Prometheus/Grafana/Loki; nightly backups + **restore drill**.
- **T-7**: execute QA checklist across all 10 roles; load test (k6) key endpoints; OpenAPI spec; SSRF guard on webhook URLs; RLS policies (defense-in-depth).
- **T-3**: UAT business validation + sign-off; Razorpay live + webhook; DNS/TLS/email.
- **T-1**: freeze; final restore drill; runbook + on-call; rollback rehearsal.
- **Go-Live**: deploy prod image (blue/green), health-check, watch dashboards 24–48h.
- **Post**: error triage, perf tuning, schedule weekly/monthly backup verification.

---

## Gate to production (all must be true)
No critical blockers (B1–B5 fixed) · no security blockers (H1–H4 fixed) · no data-loss risk (backups + restore tested) · no broken core flows (QA passed) · monitoring enabled · UAT approved.
**Today: 0 of 6 fully met → hold.** The fastest path to "go" is the T-30 infra work (Docker image + proxy + secrets + helmet/rate-limit), then backups + monitoring, then QA/UAT.
