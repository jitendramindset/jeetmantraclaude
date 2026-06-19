# EduOS — Unified Sprint Roadmap
*Merges the Global Audit sprints with the Admin Gap-Analysis sprints into one ordered plan.*

Two sprint plans existed: one from `TEACHER_COMMAND_CENTER_PLAN.md` + `EDUOS_GLOBAL_AUDIT.md` (the platform), one from `EDUOS_ADMIN_GAP_ANALYSIS.md` (the admin surface). This document **combines them**, eliminates duplicates (both had webhook signing + TR_LANGS in their P0), respects dependencies (admin's Booking screen requires the global Booking engine; admin's Translation queue requires the global `content_translations` table), and reports what's already merged.

---

## 0. Already done this session ✓

These sprints were merged on `teacher-command-center` (PR open):

**Sprint 0a — Multi-institute scoping (P0 destructive bugs)**
- A1–A6: courses tagged `institution_id` on create, `resolveInstitution` middleware, `loadDashboard` via `api()`, All-Institutes view, per-topic content rollup, KPI correctness.

**Sprint 0b — Teacher Command Center experience (P1)**
- P1-1 next-class countdown + AI launcher · P1-2 10-KPI grid · P1-3 DM reachability + unread + topbar badge · P1-4 reschedule modal · P1-5 functional course Analytics.
- Adversarial-review patches: create-course ReferenceError, teacher-only tagging, completion-rate clamp, DM quote escaping, unread race, double-render guard.

**Sprint 0c — Admin Sprint 1 (P0 security/correctness)** *(this turn)*
- S1-1 audit `user.block`/`user.unblock` (with IP/UA/diff) · S1-2 `GET /admin/payments` + admin.html fix · S1-4 signature-verify `/api/webhooks` + legacy payments webhook (`verifyWebhookSecret` middleware) · S1-5 `TR_LANGS` → 12 languages.
- S1-3 (admin tenant ops) **deferred to Sprint 3** — audit misread; real bug is `eduos.js:580` scoping, not the role-set.

---

## The combined plan — 6 sprints, ~6 weeks

### Sprint 1 — Hardening tail + Identity foundation
**P0/P1 · ~1 week · enables everything that follows**

Carry-over P0 from the global audit's Sprint 1:
- Add `corporate_trainer` / `content_creator` / `franchise` to the DB `user_type` CHECK constraint (latent insert failure).
- Align the teacher vs student timetable test-date inconsistency (`scheduled_for` vs `due_date`).
- Commit current ad-hoc `/pg/query` DDL as a real migration (`chat_room_members.last_read_at`, `courses.institution_id` work, etc. — make the schema reproducible).

Identity foundation (global Sprint 2):
- New `user_roles(user_id, role, institution_id?)` table. `user_type` stays as primary/display for back-compat.
- `authorizeRole` checks the **union** of all of a user's roles; JWT carries a role array.
- **Personal-institute auto-provisioning** on teacher signup (kills the `institution_id = null` legacy path that Phase A had to work around).

**Why first?** Schema migration + multi-role + personal-institute must land before the calendar/booking/admin shell, because everything downstream assumes (a) the DB constraint is broadcast-safe, (b) admin can have multiple roles, (c) every teacher's course is institution-scoped.

**Exit criteria** — every new course is institution-scoped (no nulls); a user can hold ≥2 roles in tests; DB has a committed migration file.

---

### Sprint 2 — Unified Calendar + Platform OS shell
**P1 · ~1.5 weeks · two parallel tracks**

**Track A — Calendar unification** (global Sprint 2 finisher)
- `calendar_events(id, owner_id, institution_id, type, ref_table, ref_id, title, start_at, end_at, all_day, recurrence_rule, visibility)` — new canonical table or UNION view.
- One `GET /api/calendar?view=&from=&to=` replacing the 3 merge functions in `teacherExtras.js`, `studentExtras.js`, `dashboard.js`. Closes the teacher/student inconsistency from Sprint 1.
- RRULE-based recurrence supersedes the manual loop in `/live-classes/recurring`.
- Frontend: add **timeline view** to the calendar (today: day/week/month/agenda only).

**Track B — Admin Platform OS shell** (admin Sprint 2)
- Replace `admin.html` with a single-app 14-section sidebar (Overview, Tenants, People, Catalog, Live & Recordings, Revenue, Bookings, Growth/CRM, Support, Automations, AI & Translations, Analytics, Franchise, System).
- Top bar: Cmd-K global search, tenant switcher (reuse the always-on switcher pattern from Sprint 0a), system-status pill, notifications, admin avatar.
- **Overview screen** widgets: MRR trend, DAU/WAU/MAU sparklines, system status, recent admin actions, **action inbox** skeleton (approvals + reports + payouts placeholders), live-classes-running counter.
- **Tenants & Institutes console**: list (+ KPIs), per-tenant page (members, plan, branding, usage, audit log).

**Exit criteria** — one `/calendar` endpoint serves all views consistently; `/admin.html` is the new shell; tenant switcher re-scopes the entire admin UI.

---

### Sprint 3 — Operations queues + Localization depth
**P1 · ~1.5 weeks · two parallel tracks**

**Track A — Operations queues** (admin Sprint 3 + deferred S1-3)
- New `approval_requests(id, type, target_id, applicant_id, status, reason, decided_by, decided_at, metadata)` table → Approval Queue UI for **teachers, courses, payouts, KYC**.
- New `payouts` table → Payouts queue (rounds out the existing `withdrawals` table).
- New `support_tickets` + `support_ticket_messages` + `content_reports` → Support / Reports inbox.
- **Notification Center** (`notification_templates` + `notification_log`): templates per locale, segments, history, delivery health. Reuses `eduos.js:311` broadcast.
- **S1-3 redo**: properly fix `eduos.js:580` and siblings — every INSTITUTION_ROLES endpoint accepts `?institution_id=X` so platform-admin can operate on a specific tenant (today they all assume `req.user.id` IS the institution).

**Track B — Localization depth** (global Sprint 3 part 1)
- `content_translations(entity_type, entity_id, lang, field, source_hash, text)` table — promote the LevelDB string-hash KV cache to a real per-entity table.
- "Translate To ▼ → generate → persist" flow for course/assignment/test/certificate content (reuses `/api/ai/translate`).
- **Server-side localized notifications/emails** by looking up recipient's `jm_lang` (today: English-only at send).

**Exit criteria** — Approval queue clears a teacher application end-to-end; a payout request can be approved with audit trail; a course can be translated to Hindi/Tamil/etc. once and served pre-translated to learners; a notification email arrives in the recipient's chosen language.

---

### Sprint 4 — Unified Booking Engine
**P2 · ~1.5 weeks · the global-audit Phase 6/7 cornerstone**

- New `resources(id, type[ground|court|room|teacher|mentor|workshop|event|course], owner_id, institution_id, capacity, price, availability_json)`.
- Generalized `bookings(resource_id, resource_type, booker_id, start_at, end_at, party_size, amount, payment_id, status)` with per-resource overlap constraint (prevents double-booking).
- Migrate the existing narrow course `bookings` as `resource_type='course'`.
- New `/api/bookings/*` endpoints (search availability, book, cancel, refund); surfaces on the **unified calendar** from Sprint 2.
- **Frontend unified booking screen** (resource → slot → pay) — currently absent entirely.

**Why now?** Activates admin Sprint 5's Bookings/Venues admin and broadens the platform from LMS to multi-vertical (sports, music, dance, workshop, event). Depends on Sprint 2's calendar.

**Exit criteria** — a teacher publishes a 1-hour mentor-session slot; a student reserves it; payment captures; both calendars (teacher + student) show it; admin can list/refund any booking.

---

### Sprint 5 — AI / Translation / Analytics admin
**P2 · ~1 week**

Admin Sprint 4 — finally has the data tables it needs from Sprints 2 & 3:
- **AI cost/quota dashboard** from the existing `ai_usage_log` (today: written, never exposed).
- **Translation queue UI** (now that `content_translations` exists): missing-string count per locale, regenerate-batch action.
- **Platform Analytics**: time-series MRR, cohort, funnel (signup → first class → first payment), retention.
- **Webhook delivery health board** (extend `webhook_logs` or `webhook_delivery_log`).

Global Sprint 4 part 1 — new AI endpoints:
- `POST /api/ai/create-test` (no quiz/test generator today).
- `POST /api/ai/generate-ppt`.
- `POST /api/ai/generate-notes` (only live-class summary exists).
- `POST /api/ai/performance-report`.

Voice generalization:
- Move `VOICE_INTENTS` to a shared module, drive intent labels through i18n so commands work in all 12 languages.
- Add `readerSpeakAll` listen button to tests / assignments / notifications / messages (today: course reader only).

**Exit criteria** — admin sees AI spend by tenant; translation queue shows missing locales; teacher generates a quiz from a topic; voice commands work in Bengali and Tamil.

---

### Sprint 6 — Bookings admin + Completeness
**P2/P3 · ~1 week · the closer**

Admin Sprint 5 — now that the booking engine exists:
- Bookings / Venues / Resources admin tabs.
- **Impersonation / "View as" / read-only mode** with `impersonation_sessions` audit table.
- Storage / bandwidth per tenant.
- Onboarding funnel analytics.

Global Sprint 4 finishers (the CRUD/UX tail):
- Bulk enroll/grade, exports (CSV) across payments/enrollments/marketplace.
- Admin list-all for payments/wallets/enrollments (extends Sprint 0c's `/admin/payments`).
- Chat pagination cursor + real-time (SSE/WS) channel; message edit/DELETE; attachment uploader.
- Assignment **rubrics + late-submission flagging**.
- **Per-student report card UI** (data exists; no render today).
- **Certificate issuance API** + `certificates` table (current cert is HTML-only).

**Exit criteria** — admin impersonates a teacher to debug a support ticket (logged); platform exports a full month's payments to CSV; chat is real-time; teacher grades 30 essays via a rubric in one pass; student receives a signed certificate URL on completion.

---

## Dependency diagram (whats blocks what)

```
Sprint 1 — Hardening + Identity (P0/P1)
   │
   ├──► Sprint 2A Calendar ──────────────► Sprint 4 Booking engine ──┐
   │                                                                 │
   └──► Sprint 2B Admin shell ──┬──► Sprint 3A Operations queues     │
                                │                                    │
                                └──► Sprint 3B Localization depth ─┐ │
                                                                   ▼ ▼
                                                              Sprint 5 (AI + analytics + translation admin)
                                                                   │
                                                                   ▼
                                                              Sprint 6 (Bookings admin + completeness)
```

Critical paths:
- **Sprint 3A `eduos.js:580` fix** depends on Sprint 2B (the tenant switcher provides the `?institution_id=X` UX).
- **Sprint 5 Translation queue** depends on Sprint 3B (`content_translations` table).
- **Sprint 6 Bookings admin** depends on Sprint 4 (`resources` + unified `bookings`).
- **Sprint 6 Per-student report card / certificates** depends on the Sprint 1 identity work being clean.

## Timeline at a glance

| Week | Sprint | Theme |
|---|---|---|
| ✓ | 0a/0b/0c | Multi-institute, Teacher Command Center, Admin P0 (**done**) |
| 1 | **1** | Hardening tail + multi-role identity + personal institute |
| 2–3 | **2** | Unified calendar **+** Platform OS admin shell + Tenants console |
| 4–5 | **3** | Operations queues (admin) **+** Localization depth (global) |
| 6–7 | **4** | Unified Booking Engine + frontend booking screen |
| 8 | **5** | AI dashboards + new AI endpoints + voice across 12 languages |
| 9 | **6** | Bookings admin + impersonation + report cards + certificates + chat real-time |

≈ 9 weeks to a Platform OS plus a unified, multi-vertical LMS — about 4 weeks faster than running the two sprint plans serially, because Sprints 2 & 3 each run **two parallel tracks** that don't conflict (one global, one admin).

## Five principles carried through every sprint

1. **Reuse first** — the backend has ~135 endpoints; most "missing" admin/global features are *views over existing tables* + a handful of new tables.
2. **One admin mount, one IA** — collapse `admin.html` + `section-admin` + `control-center.html` into the Platform OS.
3. **Operations as queues** — approvals / payouts / refunds / reports / tickets share one primitive (`status` + `decided_by` + `decided_at`).
4. **Compliance baseline** — every admin write goes through one helper capturing actor + IP + UA + request_id + before/after diff. No exceptions.
5. **Tenant-aware everywhere** — every list filters by `institution_id`; the topbar tenant switcher re-scopes the entire UI (pattern shipped in Sprint 0a).
