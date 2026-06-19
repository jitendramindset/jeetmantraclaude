# EduOS — Admin Platform Gap Analysis
*Designing the Platform Operating System*

CTO-level audit of the admin surface. Read-only analysis. Grounded in a full read of `backend/routes/admin.js` (10 endpoints), `public/admin.html` (6 tabs, 1233 lines), the admin section of `dashboard.html`, and every cross-cutting admin-gated endpoint scattered across other route files. **Reuse-first throughout.**

---

## 1. Gap Analysis

### 1A. Existing Admin Features

**Backend — `admin.js` (10 endpoints, all `authenticateToken + authorizeRole(['admin'])`)**
| # | Endpoint | What it does |
|---|---|---|
| 1 | `GET /api/admin/users` (`:21`) | List users, filter by role/status, paginated |
| 2 | `PUT /api/admin/users/:userId/toggle-status` (`:51`) | Block/unblock (flip `is_active`) — **not audit-logged** |
| 3 | `GET /api/admin/stats` (`:95`) | 6 counters: users, courses, enrollments, total revenue |
| 4 | `GET /api/admin/users/:userId` (`:152`) | Deep view: ownedCourses + enrollments + last 20 payments |
| 5 | `PUT /api/admin/users/:userId` (`:167`) | Update fullName/role/status (audit-logged) |
| 6 | `DELETE /api/admin/users/:userId` (`:182`) | Soft delete (`status='deleted'`); self-delete guard (audit-logged) |
| 7 | `GET /api/admin/audit` (`:191`) | Last N audit_log events (default 100, max 200) |
| 8 | `GET /api/admin/settings` (`:201`) | k/v map from `platform_settings` |
| 9 | `PUT /api/admin/settings` (`:208`) | Upsert k/v (audit-logged) |
| 10 | `POST /api/admin/courses/:id/moderate` (`:222`) | Activate / deactivate / delete (audit-logged) |

**Admin powers living OUTSIDE `admin.js`** (already exist; the admin UI must reach for them)
- `POST /api/eduos/notify/send` (`eduos.js:311`) — admin broadcast notify
- `GET/POST /api/eduos/franchise/branches` (`:741, :764`) — `['franchise','admin']`
- `POST /api/payments/:id/refund` (`payments.js:287`) — admin-only refund
- `GET /api/payments/:id/receipt` (`payments.js:394`) — owner-or-admin
- `POST /api/search/index-course` (`search.js:114`) — admin reindex
- `POST /api/n8n/config`, `POST /api/n8n/test` (`n8n.js:25, :39`)
- `GET /api/eduos/ai/proctor-verdict/:sessionId` (`eduos.js:782`)
- `GET /api/parent/child/:studentId/snapshot` (`parentExtras.js:60`) — admin can read any child
- Most `INSTITUTION_ROLES` endpoints (`eduos.js:517–704`, admissions/fees/payroll/leave/tenant) — but `'admin'` is **NOT** in `INSTITUTION_ROLES`, so platform-admin is locked out of tenant ops unless impersonating (latent bug).

**Frontend — two surfaces, both shallow**
1. `public/admin.html` — standalone SuperAdmin SPA, 6 tabs (Dashboard, Users, Courses, Partners, Payments, Settings). Several broken: Payments tab calls `/api/payments/my` (returns admin's own payments only) (`admin.html:915`); Partners tab posts to `localhost:5678/webhook/admin-create-partner` (`:1153`); Settings save is a toast stub (`:1195–1203`); course edit/delete stubbed (`:1170-1171`).
2. `dashboard.html` admin section — `renderAdminDash(d)` (`:2018`), 4 stat tiles, user list, listings, recent payments; "Platform Addons" card links to `/admin.html`, `/control-center.html`, n8n config; **audit-log viewer is a toast stub** (`:7094-7100`).

### 1B. Capability Coverage — 20 Enterprise Categories

| # | Category | Backend | Frontend | Notes |
|---|---|---|---|---|
| 1 | Institution Management | PARTIAL (`institutions.js`, `eduos.js`) but admin locked out (see above) | ABSENT (only a role-filter chip) | Critical for multi-tenant |
| 2 | Teacher Approval | ABSENT | ABSENT | Only block/unblock; no application/approval queue |
| 3 | Course Approval | PARTIAL (`/admin/courses/:id/moderate` on/off) | ABSENT | No pending state, no rejection reason, no resubmission |
| 4 | Live Class Monitoring | ABSENT | ABSENT | No "what's running now" view |
| 5 | Recording Management | ABSENT | ABSENT | Recordings exist per-teacher; no admin moderation |
| 6 | Payment Management | PARTIAL (refund in `payments.js:287`; no list-all) | PARTIAL (broken — wrong endpoint) | No admin list, no export, no reconciliation |
| 7 | Payout Management | ABSENT | ABSENT (only "max withdrawal" stub) | `withdrawals` table referenced but no admin queue |
| 8 | AI Usage Monitoring | PARTIAL (`ai_usage_log` written, not exposed to admin) | ABSENT | No cost/quota/spend dashboard |
| 9 | Translation Management | ABSENT | ABSENT | No missing-string queue, no per-locale view |
| 10 | Booking Management | ABSENT | ABSENT | Booking engine itself doesn't exist (per global audit) |
| 11 | Resource Management | ABSENT | ABSENT | No resources table |
| 12 | Venue Management | ABSENT | ABSENT | — |
| 13 | Sports/Court Booking | ABSENT | ABSENT | — |
| 14 | CRM Management | PARTIAL (per-user CRM config only) | PARTIAL | No platform CRM (leads, pipeline) |
| 15 | Admission Management | PARTIAL (`eduos.js:517–541`, INSTITUTION_ROLES) | PARTIAL (nav tab) | Admin locked out by role-set |
| 16 | Notification Center | PARTIAL (`eduos.js:311`) | ABSENT (toast stub) | No template/segment/scheduling/history |
| 17 | Franchise Management | PARTIAL (`eduos.js:741/:764`) | PARTIAL (franchise-user view) | No admin oversight of all franchises |
| 18 | Support Tickets | ABSENT | ABSENT | No table, no surface |
| 19 | Platform Analytics | PARTIAL (`/admin/stats` — 6 counters) | PARTIAL (4 stat cards) | No trends, cohort, funnel, retention |
| 20 | Global Search | ABSENT (in admin context) | ABSENT (no Cmd-K) | `cmdkRun` exists in dashboard, not admin |

**Score: 0 PRESENT, 11 PARTIAL, 9 ABSENT. Effective enterprise-admin coverage ≈ 10–15%.**

### 1C. Audit / Settings Model

- `audit_log` written for: `user.update`, `user.delete`, `settings.update`, `course.moderate`.
- **Not logged**: `users/:id/toggle-status` (security-relevant!), all reads, refunds, n8n config writes, notify broadcasts, franchise branch creation, search reindex.
- No actor IP, user-agent, request_id, before/after diff. No retention policy, immutability, or export.

### 1D. Structural Problems

1. **Admin powers fragmented** across `admin.js`, `eduos.js`, `payments.js`, `n8n.js`, `search.js`, `parentExtras.js` — no single mount, no consistent IA.
2. **`'admin'` not in `INSTITUTION_ROLES`** → platform-admin can't directly operate tenant features (admissions, fees, payroll, leave). Latent bug.
3. **Two competing admin frontends** (`admin.html` + `section-admin` in `dashboard.html`) drift; both call partly-wrong endpoints.
4. **Settings as opaque k/v** — no schema, no typing, no validation, no audit on read.
5. **No impersonation / "view as user" / read-only mode** — required for support workflows.
6. **No actions queue** — refunds, payouts, KYC, course approvals all need a unified inbox.

---

## 2. Priority Matrix

| Tier | Item | Why now |
|---|---|---|
| **P0 — must fix** | Audit log toggle-status (`admin.js:51`) | Security-relevant action goes unrecorded |
| | Fix broken Payments tab (`/payments/my` → new `/admin/payments`) | Renders the wrong data today |
| | Add `'admin'` to `INSTITUTION_ROLES` (`institutions.js:19`) or split into a `ADMIN_OR_INSTITUTION` set | Locked out of tenant ops |
| | Sign / disable unsigned webhooks (`/api/webhooks`, legacy payment webhook) | Account-creation / payment-spoof vector (already flagged in global audit) |
| **P1 — foundation** | Tenants & Institutes console (CRUD + branding + usage) | Multi-tenant heart |
| | Approval queues (teachers, courses, payouts, KYC) | Operations blocker |
| | Unified Notification Center | Operator broadcast + segmentation |
| | Audit log v2 (IP, UA, request_id, diff; immutable, exportable) | Compliance baseline |
| | Admin Overview rebuilt as a real dashboard (MRR trend, DAU/WAU/MAU, top courses, system status, recent admin actions, Cmd-K) | The "Platform OS" first impression |
| **P2 — depth** | AI cost/quota dashboard | Spend control |
| | Translation queue | Localization velocity |
| | Live class monitor + Recording library moderation | Quality control |
| | Support Tickets (new table) | Customer ops |
| | Platform Analytics (cohort, funnel, retention) | Growth |
| | Bookings/Venues admin (once engine exists) | Activation when global P2 lands |
| | Franchise admin overlay | Network ops |
| **P3 — polish** | Impersonation / "View as" / read-only mode | Support workflow |
| | Webhook delivery health board | Reliability |
| | Storage/bandwidth per-tenant | Billing/abuse |
| | Onboarding funnel | Growth analytics |

---

## 3. Required APIs (extend, don't duplicate)

Group under a single `/api/admin/*` mount where reasonable. Reuse existing tables in **bold**.

**Tenants & Institutes** — reuse **`institution_teachers`/`institution_students`/`school_profiles`/`coaching_profiles`/`franchise_branches`**
- `GET /admin/institutes?search=&plan=&status=` (list + KPIs)
- `GET /admin/institutes/:id` (profile, members, branding, usage, plan)
- `PUT /admin/institutes/:id/plan` | `PUT /admin/institutes/:id/status`
- `GET /admin/institutes/:id/usage` (storage, bandwidth, active users)

**Approvals** — new `approval_requests(id, type, target_id, applicant_id, status, reason, decided_by, decided_at, metadata)`
- `GET /admin/approvals?type=teacher|course|payout|kyc&status=pending`
- `POST /admin/approvals/:id/approve` | `/reject` (reason)

**People** — extend existing `/admin/users`
- `GET /admin/users/teachers/applications` (pending → approval queue)
- `POST /admin/users/:id/impersonate` (issue scoped token; audit-logged)
- `POST /admin/users/:id/reset-password` | `/resend-verification`

**Catalog (courses)** — extend `admin.js:222`
- `GET /admin/courses?status=pending|active|reported&q=`
- `POST /admin/courses/:id/approve` | `/reject` (reason → `approval_requests`)
- `GET /admin/courses/reports` (abuse reports, new table)

**Live & Recordings**
- `GET /admin/live/active` (running now)
- `GET /admin/live/scheduled?from=&to=`
- `GET /admin/recordings?q=&teacher=&course=` (cross-tenant)
- `DELETE /admin/recordings/:id` (with audit + reason)

**Revenue**
- `GET /admin/payments?status=&from=&to=&q=` (list-all; the global audit already flagged this missing)
- `GET /admin/payments/export.csv`
- `GET /admin/payouts?status=pending|approved|paid` + `POST /admin/payouts/:id/approve|reject`
- `GET /admin/refunds?status=` (already partial via `payments.js:287`)
- `GET /admin/revenue/mrr?from=&to=` (time-series)
- `GET /admin/coupons` + `PUT /admin/coupons/:id` (admin override)

**AI & Translation** — reuse **`ai_usage_log`**, the LevelDB translation cache
- `GET /admin/ai/usage?from=&to=&groupBy=provider|tenant|user` (tokens, $)
- `GET /admin/ai/quotas` | `PUT /admin/ai/quotas/:tenantId`
- `GET /admin/translations/queue?lang=&entityType=` (missing strings; needs the new `content_translations` table)
- `POST /admin/translations/regenerate` (bulk)

**Notifications**
- `GET /admin/notifications/templates` + `POST /admin/notifications/templates`
- `POST /admin/notifications/broadcast` (audience selector → uses existing `eduos.js:311`)
- `GET /admin/notifications/history`

**Bookings & Venues** (activates once global-audit booking engine lands; **reuse new `resources` + `bookings`**)
- `GET /admin/bookings?status=&resource_type=&from=`
- `GET /admin/resources?type=` + CRUD
- `GET /admin/venues` (alias for `resources?type=room|ground|court`)

**Support**
- `GET /admin/support/tickets?status=&priority=` + CRUD
- `POST /admin/support/tickets/:id/reply`
- `GET /admin/support/sla` (breaches)

**Platform Analytics**
- `GET /admin/analytics/overview` (DAU/WAU/MAU, signups, churn, MRR, top-courses, AI burn)
- `GET /admin/analytics/funnel?step=` (signup → first class → first payment)
- `GET /admin/analytics/cohorts?cohort=signup-month`

**Operations**
- `GET /admin/system/status` (DB, Supabase, n8n, payment gateway pings)
- `GET /admin/system/webhooks?status=failed|succeeded` (n8n delivery health)
- `GET /admin/audit?actor=&action=&from=&to=&q=` (extend `admin.js:191` with filters)
- `POST /admin/audit/export.csv`
- `GET /admin/search?q=` (global Cmd-K)

**~40 new admin endpoints**, predominantly thin admin views over **existing tables** + a few new tables.

---

## 4. Required Tables

Reuse first. New tables only where genuinely missing.

| Table | Status | Purpose |
|---|---|---|
| `approval_requests(id, type, target_id, applicant_id, status, reason, decided_by, decided_at, metadata, created_at)` | NEW | Single queue for teachers / courses / payouts / KYC |
| `support_tickets(id, requester_id, tenant_id, subject, body, status, priority, assignee_id, sla_due_at, created_at, updated_at)` + `support_ticket_messages` | NEW | Customer ops |
| `content_reports(id, target_type, target_id, reporter_id, reason, status, decided_by, decided_at)` | NEW | Abuse moderation |
| `notification_templates(id, key, channel, locale, subject, body, version)` | NEW | Reusable templates per locale |
| `notification_log(id, recipient_id, template_key, channel, status, sent_at, payload)` | NEW | Delivery history |
| `payouts(id, payee_id, amount, currency, status, requested_at, approved_by, approved_at, paid_at, gateway_ref)` | NEW | Payout queue (rounds out `withdrawals`) |
| `impersonation_sessions(id, actor_id, target_id, scope, started_at, ended_at)` | NEW | Audit support impersonation |
| `audit_log` (extend with `actor_ip`, `user_agent`, `request_id`, `before`, `after`) | EXTEND | Compliance baseline |
| `platform_settings` (add `value_type`, `validation`, `tenant_id NULLABLE`) | EXTEND | Typed, per-tenant settings |
| `webhook_delivery_log` (or just `webhook_logs` extension) | EXTEND | Delivery health |
| **Reuse existing**: `ai_usage_log`, `jeetmantra_notifications`, `franchise_branches`, `institution_teachers/students`, `school_profiles`, `coaching_profiles`, `course_reviews`, `withdrawals`, `coupons`, `payments`, `wallets`, `subscriptions` | — | — |
| **Depends on global audit**: `content_translations`, `calendar_events`, `resources`+unified `bookings`, `institutions` master, `user_roles` | NEW (already in global plan) | Don't double-build here |

---

## 5. Required UI Screens (the Platform OS)

Inspired by Stripe / Shopify / Notion / Linear / Workspace Admin. Single-app under `/admin.html` (replace the current 6-tab page) or as a `section-admin-os` inside `dashboard.html` reachable only when role=admin.

**Top bar** — global Cmd-K search · tenant switcher · system-status pill · notifications · admin avatar (with "view as user").

**Sidebar (14 sections)**
1. **Overview** — KPIs (MRR trend, DAU/WAU/MAU sparklines, signups today, churn), system status, AI burn-rate, recent admin actions, command palette, **action inbox** (approvals + reports + payouts), live-classes-running counter.
2. **Tenants** — institute list + per-tenant page (members, plan, usage, branding, settings, audit log).
3. **People** — Users (search, filter, deep view, impersonate, reset password) · Teachers (with **Approval Queue** tab) · Students · Partners · Staff.
4. **Catalog** — Courses · **Approval Queue** · Categories · Content Reports.
5. **Live & Recordings** — Active now · Scheduled · Recording library · Transcripts.
6. **Revenue** — Payments (list-all, filter, refund) · Refunds queue · **Payouts queue** · Coupons · Commission · **MRR trend / cohort**.
7. **Bookings & Venues** — Resources · Slots · Bookings list (activates once engine lands).
8. **Growth & CRM** — Leads · Admissions · Campaigns.
9. **Support** — Tickets (Kanban + list) · Abuse reports · Feedback · SLA board.
10. **Automations** — n8n webhooks · Delivery health · Scheduled jobs · Templates.
11. **AI & Translations** — Provider keys · Usage/spend by tenant · Quotas · Translation queue · Regenerate.
12. **Analytics** — Trends · Cohorts · Funnel (signup → first class → first payment) · Retention · Top-of-funnel.
13. **Franchise** — Branches · Network revenue · Per-branch KPIs.
14. **System** — Audit log v2 · Settings (typed) · Branding · Roles & permissions · API keys · Status page · Webhook delivery health.

**Overview widgets (the missing list)**
MRR trend · DAU/WAU/MAU sparklines · Top courses / teachers leaderboard · Refund queue · AI cost burn-rate · Translation queue · Abuse reports · System status · Tenant list with KPIs · Cmd-K search · Recent admin actions feed · Pending-approvals tray · Signups today · Churn · Open tickets + SLA breach · Storage/bandwidth per institute · Webhook delivery health · Live classes currently running · Onboarding funnel.

---

## 6. Implementation Order

**Sprint 1 — Harden & unify (P0, ~3–4 days)**
- Audit `toggle-status`; extend `audit_log` with IP/UA/diff.
- Add `'admin'` to `INSTITUTION_ROLES` (or carve `ADMIN_OR_INSTITUTION`); audit/notify/franchise/refund admin-callable end-to-end.
- New `GET /admin/payments` (list-all, filter, export) — fix `admin.html` Payments tab.
- Sign/secure unsigned webhooks (global P0 cross-ref).

**Sprint 2 — The Platform OS shell (P1, ~1 week)**
- Replace `admin.html` with the 14-section sidebar layout, top bar with Cmd-K + tenant switcher + system status.
- Build **Overview** (KPI widgets, MRR trend, system status, recent admin actions, action inbox skeleton).
- Build **Tenants & Institutes** console (CRUD, members, branding, usage).

**Sprint 3 — Operations queues (P1, ~1 week)**
- `approval_requests` table + Approval Queue UI (teachers, courses, payouts, KYC).
- `payouts` table + Payouts queue.
- `support_tickets` + `content_reports` tables + Support / Reports inbox.
- Notification Center with templates, segments, history.

**Sprint 4 — AI/translation/analytics (P2, ~1 week)**
- AI cost/quota dashboard from `ai_usage_log`.
- Translation queue (needs global `content_translations`).
- Platform Analytics: cohorts, funnel, retention.
- Webhook delivery health board.

**Sprint 5 — Bookings & polish (P2/P3, ~3–5 days)**
- Bookings/Venues admin (activates after the global booking engine lands).
- Impersonation / "View as" / read-only mode.
- Storage/bandwidth per tenant. Onboarding funnel.

---

## 7. Estimated Completion %

| Area | % | Note |
|---|---|---|
| Admin backend APIs | **15%** | 10 endpoints; ~40 missing for an enterprise surface |
| Admin frontend | **10%** | Two competing shallow surfaces, broken Payments tab, stubbed audit log/settings |
| Audit & compliance | **20%** | Writes 4 action types; no IP/UA/diff/immutability/export |
| Operations queues (approvals/payouts/tickets/reports) | **5%** | None exist |
| Platform analytics | **15%** | 6 counters; no trends/cohorts/funnel |
| Multi-tenant ops | **25%** | Membership exists; admin locked out of tenant ops |
| AI/translation admin | **0%** | `ai_usage_log` exists but unexposed |
| Notifications/automations admin | **20%** | Broadcast exists; no templates/segments/history/health |
| Bookings/venues admin | **0%** | Engine doesn't exist (global P2) |
| Global search / Cmd-K (admin) | **0%** | Not in admin |

**Overall ≈ 12%** — admin today is *user-CRUD + counters + settings k/v + course on/off + thin audit log*. The remaining 88% is high-leverage because **most data already exists** and most APIs are thin views over existing tables, plus 5–6 new tables.

---

## Key principles

1. **One admin mount**, one IA, one UI — collapse `admin.html` + `section-admin` + the `control-center.html` link into a single Platform OS.
2. **Reuse-first.** Most admin endpoints are *views* over `payments`, `enrollments`, `ai_usage_log`, `chat_*`, `franchise_branches`, `institution_*` — not new business logic.
3. **Operations as queues.** Approvals / payouts / refunds / reports / tickets all use the same primitive (`status` + `decided_by` + `decided_at`).
4. **Compliance baseline.** Every admin write goes through one helper that captures actor, IP, UA, request_id, before/after — *no exceptions*.
5. **Tenant-aware everywhere.** Every admin list should filter by `institution_id`, and the topbar tenant switcher should re-scope the whole UI (same pattern already built in the teacher dashboard this session).
