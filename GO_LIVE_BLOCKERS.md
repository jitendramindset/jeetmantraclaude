# JeetMantra — Go-Live Blockers (Honest)

> Things that must be solved before the first public launch on jeetmantra.com.
> Ordered by severity. Each item lists **why it's a blocker**, **what to do**,
> and **how to verify** so it can be closed unambiguously.

Status legend: 🛑 hard blocker · ⚠️ soft blocker (live-able but risky) · ✅ closed

---

## 🛑 1. Backend / Supabase stability
The single most important issue. During this session the self-hosted Supabase
at `api.mantravat.cloud` dropped **3+ times**, each for ~30–60s. The frontend
now tolerates it gracefully (Phase 3 resilience) but a public-facing product
cannot have an unreliable database — login fails entirely for first-time users
during outages.

- **Why a blocker:** users can't sign in / sign up during outages.
- **Fix:** stabilize the VPS (`docker compose ps`/restart policy, healthcheck,
  watchtower or `restart: unless-stopped` on every container), confirm Hostinger
  firewall allows the production port reliably, monitor with uptime check.
- **Verify:** 24h with 0 `fetch failed` in the backend logs and `curl https://api.mantravat.cloud/auth/v1/health` returns 200 sustained.

## 🛑 2. Real domain + HTTPS + DNS
- **Why a blocker:** trust + Google OAuth + payment gateways require HTTPS on the real domain.
- **Fix:** point `jeetmantra.com` A/CNAME to the VPS, install Let's Encrypt cert
  on the NPM/Caddy proxy, force HTTPS, set `Strict-Transport-Security`.
- **Verify:** `https://jeetmantra.com` returns 200 with valid cert, `http://`
  301s to `https://`, `ssllabs.com/ssltest` ≥ A.

## 🛑 3. Production secrets & key rotation
- **Why a blocker:** any `.env` value used during dev that ended up in a commit
  is compromised. Same for shared API keys.
- **Fix:** **rotate** all secrets in `backend/.env` for the prod VPS:
  `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_PASSWORD`,
  `AI_ENC_KEY`, `SMTP_PASS` (Gmail App Password — not Gmail password),
  `WEBHOOK_SECRET`, payment-gateway keys, Google OAuth client secret.
  Never commit a filled `.env`. Mask secrets in logs.
- **Verify:** `grep -rE '(jwt_secret|service_role)' .` only returns
  `.env.example`. Server boots and a fresh login works.

## 🛑 4. Payment gateway — live keys & webhook signature
- **Why a blocker:** real money flows. We already verify webhook HMAC; needs
  live-mode credentials and end-to-end test.
- **Fix:** switch Razorpay (or chosen gateway) to **Live mode**, set live
  `KEY_ID/SECRET`, register the production webhook URL with HMAC, run the
  smoke test from `EDUOS_PRODUCTION_READINESS_AUDIT` (in
  `docs/HISTORICAL_AUDITS.md`).
- **Verify:** create a `₹10` order, complete it, confirm wallet ledger +
  enrollment update + webhook event row in `payment_events`.

## 🛑 5. Database backup & restore drill
- **Why a blocker:** first paying user = real money lost if the DB dies without
  a tested restore path.
- **Fix:** automated daily Postgres dump (already documented in `RESTORE.md`).
  **Test the restore** to a scratch instance and time it.
- **Verify:** scratch instance restored from a fresh backup; teacher login +
  course listing match production.

## 🛑 6. RLS / authorization audit
- **Why a blocker:** the backend uses `SERVICE_ROLE_KEY` so **app-code enforces
  every tenancy/ownership check** (we wrote `migrations/001_rls_policies.sql`
  but app code is the ultimate gate). One missed `if (course.teacher_id !==
  req.user.id)` is an IDOR.
- **Fix:** walk every write endpoint in `API_REFERENCE.md` (389 endpoints, the
  WRITE ones), confirm each enforces ownership/tenancy. Cross-role smoke test
  (teacher A can't see teacher B's roster, etc.).
- **Verify:** scripted matrix (already in `e2e/specs/security.spec.js`) passes.

## 🛑 7. Email deliverability (verification, OTP, receipts)
- **Why a blocker:** signup OTP via SMTP is required. Free Gmail will rate-limit
  or land in spam.
- **Fix:** dedicated transactional provider (Resend / SES / Mailgun), SPF +
  DKIM + DMARC on `jeetmantra.com`, sender warm-up.
- **Verify:** signup OTP arrives within 30s in Gmail/Outlook inbox (not spam).

## ⚠️ 8. Privacy policy, T&C, refund policy
- **Why required:** Razorpay/payment KYC requires a live policy URL. India DPDP
  Act compliance.
- **Fix:** publish `/privacy`, `/terms`, `/refund` pages (the website.html
  framework already exists).
- **Verify:** links in footer resolve; payment-gateway KYC accepted.

## ⚠️ 9. Performance under load
- **Why a soft blocker:** untested at scale. The LevelDB cache helps, but the
  dashboard endpoint aggregates several queries.
- **Fix:** `autocannon` or `k6` smoke at 50/200 concurrent users on
  `/api/dashboard` and `/api/courses`. Add Postgres indexes if pgbench shows
  hot paths (`migrations/002_indexes.sql` already exists).
- **Verify:** p95 < 500ms at 100 RPS on the most-hit endpoints.

## ⚠️ 10. Production monitoring & alerts
- **Why required:** silent failures kill products. Sentry + Prometheus are
  scaffolded in `monitoring/alerts.yml`.
- **Fix:** wire the live DSNs, set the Prometheus alert receiver (email/Slack),
  add a simple uptime monitor (Better Uptime / cron-job.org) on `/health`.
- **Verify:** trigger a fake 500 in staging → alert fires within 2 min.

## ⚠️ 11. Live class infrastructure (Jitsi)
- **Why a soft blocker:** classes currently use the public `meet.jit.si`. Fine
  for <10 students; uncertain for paid course at scale + branding.
- **Fix:** either accept the limit and document it, or stand up self-hosted
  Jitsi.
- **Verify:** 30-person class for 60 min with no Jitsi-side dropouts.

## ⚠️ 12. Production-only safety: dev pages, console.log
- **Fix:** `NODE_ENV=production` on the VPS hides `control-center.html` (already
  gated in `backend/server.js`), strips dev-only console output, disables CORS
  wildcard if any remains.
- **Verify:** `/control-center.html` → 404 in prod; CORS only allows
  `https://jeetmantra.com` + the dashboard subdomain.

---

## What's NOT a blocker (defer post-launch)
- Premium-UI polish across every legacy panel (Phases 1–4 done; the tail is
  cosmetic).
- Multi-page studio whiteboard parity on the live class.
- Server-side persistence of instant-live rooms (rooms work client-side).
- Full hardcoded-px → design-token migration.
- Phase 5 deep teacher-dashboard redesign.

## Quick reference — files to look at
- `API_REFERENCE.md` — 389 endpoints, what they do, who can call them.
- `ARCHITECTURE.md` — system layout, request lifecycle, recipe for changes.
- `RESTORE.md` + `DEPLOYMENT.md` — ops.
- `monitoring/alerts.yml` — alerts (need live wiring).
- `docs/HISTORICAL_AUDITS.md` — index of completed sprint audits.

---

**Bottom line:** the **product is feature-complete and resilient**; the
blockers above are operational/security/legal items that always gate a first
launch. The biggest single risk right now is **#1 (Supabase stability)** —
nothing else matters if users can't log in.
