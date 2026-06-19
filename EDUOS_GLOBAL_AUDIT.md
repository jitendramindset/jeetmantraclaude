# EduOS / JeetMantra — Global API + Route + Workflow Audit

CTO-level product & architecture review. Read-only analysis; **no code generated**. Grounded in a full codebase scan (24 backend route files, ~135 endpoints, 3 DB schema generations, the dashboard/studio SPAs, the i18n + voice systems). Guiding principle throughout: **extend & reuse, don't duplicate** — the backend is already broad; most "missing" items are wiring, unification, and a handful of new tables, not green-field rebuilds.

---

## 1. Existing Features

**Auth & identity** — email/password, Google OAuth, phone OTP, email verification, password reset, JWT + refresh (`auth.js`, 11 endpoints).
**Courses & content** — full course CRUD + slug + geo "nearby" search + duplicate + reviews + certificate HTML; topics/lectures/materials/tests/questions/sections CRUD; question bank; test sessions + proctoring; image/file upload (`courses.js`, `courseContent.js`).
**Enrollments & commerce** — enroll (payment-gated), roster, cancel; Razorpay orders/verify/webhook/refund/receipts; coupons (C/R/D) + redemptions; wallet (balance, topup, atomic spend, referrals, subscriptions); marketplace (browse/search, listings CRUD, purchase) (`enrollments.js`, `payments.js`, `wallet.js`, `marketplace.js`).
**Live & attendance** — schedule/start/end/join/reschedule, recurring series, recordings library, AI post-class summary; attendance mark + bulk + role-scoped log; QR check-in (`liveClasses.js`, `attendance.js`, `eduos.js`).
**Teaching ops** — timetable, calendar, invoices (+PDF), essays grading queue, CSV export, announcements, bookings management (`teacherExtras.js`).
**Student ops** — notes, study-time tracking, progress, test/submission history, wishlist, compare, calendar, attendance report (`studentExtras.js`).
**Institutions / EduOS** — teacher/student membership + CSV import; batches CRUD + enroll + roster; forums; polls; report card; admissions/fees/payroll/leave; tenant branding; franchise branches (`institutions.js`, `eduos.js`).
**Chat** — course rooms, DMs, unread tracking, messages (`chat.js`).
**AI** — generate (course/lesson-plan/assignment/practice-questions), course-from-URL, suggest-topics, RAG tutor, translate, transcribe-summary, grade-essay, OCR, proctor verdict, voice-search (`ai.js`, `rag.js`, `eduos.js`).
**Frontend** — role dashboards (student/teacher/partner/school/coaching/admin/parent/+3), course workspace (8 tabs), WhatsApp-style messenger, day/week/month/agenda calendar, marketplace, **Smart Studio** (scenes/layout/camera/whiteboard/recording), certificate viewer, settings/profile, **institute switcher**, command-K + voice intents, runtime auto-translation, **Bhasha Setu** language module.

## 2. Existing APIs (inventory summary)

24 mounted routers, ~135 endpoints. Mounts: `/api/auth, /users, /courses, /course-content, /enrollments, /payments, /wallet, /marketplace, /search, /live-classes, /attendance, /assignments, /chat, /ai, /rag, /dashboard, /teacher, /student, /parent, /institutions, /eduos, /activity, /n8n, /webhooks`. Auth via `authenticateToken` + `authorizeRole(role-set)` with per-row ownership checks. Full per-endpoint table in the agent appendix (route inventory) — see §11 for the structural read.

## 3. Missing APIs

**CRUD gaps**
- **Enrollments**: no `PUT /enrollments/:id` (status/progress only mutated via side flows); no **bulk enroll** (import a class); no admin list-all.
- **Payments**: no admin **list-all/reconciliation**, no **export** (CSV), no void; **coupons no UPDATE**.
- **Wallet**: no admin adjust/list-all, no **transaction export**; subscriptions have no **cancel/UPDATE**.
- **Marketplace**: no **bulk** ops, no **sales/earnings export**, no standalone search endpoint (folded into `GET /`).
- **Courses**: no **bulk** create/update/delete, no roster/analytics **export**.
- **Live classes**: no DELETE (cancel folded into PUT), no recording DELETE, recurring lives in `teacherExtras` not here.
- **Attendance**: no single-record UPDATE/DELETE (corrections only via bulk upsert); export has no date-range filter.
- **Assignments**: **no bulk-grade**, **no rubrics**, **no late-submission flagging** (`due_date` stored, never enforced), no completion analytics.
- **Chat**: **no real-time** (poll only, 50-msg cap, no pagination cursor), no edit/DELETE, no search, no presence/typing, no attachment uploader.
- **Institutions**: no member-link UPDATE (subject/class edits are insert+delete), no student unlink, no roster search.

**Cross-cutting absent everywhere**: BULK, EXPORT, global SEARCH/pagination, admin-scoped LIST-ALL, **TRANSLATION-of-content**, **unified booking**, **unified calendar/events**, **certificates** issuance API.

**Recommended new/extended APIs**
- `POST /enrollments/bulk`, `PUT /enrollments/:id`; `GET /payments/admin?…` + `GET /payments/export.csv`; `PUT /payments/coupons/:id`; `POST /subscriptions/:id/cancel`.
- `PUT/DELETE /attendance/:id`; `PUT /assignments/:id/grade-bulk`; assignment rubric + late fields on `PUT /assignments/:id`.
- `GET /chat/rooms/:id/messages?before=` (cursor) + SSE/WS channel; `DELETE /chat/messages/:id`.
- `POST /ai/create-test`, `POST /ai/generate-ppt`, `POST /ai/generate-notes`, `POST /ai/translate-content` (entity-scoped, persisted).
- `GET /calendar?view=&from=&to=` (unified, replaces the 3 merge functions); `*/bookings` on a unified resource engine; `POST /courses/:id/certificate/issue`.

## 4. Missing Database Tables

| Table | Status | Need |
|---|---|---|
| `content_translations(entity_type, entity_id, lang, field, source_hash, text)` | **Missing** | Persisted, per-entity, searchable translations (today: only a LevelDB string-hash KV cache) |
| `certificates(id, course_id, student_id, serial, issued_at, template, url)` | **Missing** | Completion flows exist but nothing is issued/stored |
| `calendar_events(id, owner_id, institution_id, type, ref_table, ref_id, title, start_at, end_at, all_day, recurrence_rule, visibility)` | **Missing** | Canonical timetable (today computed by merging 3 queries in 3 files) |
| `resources` + unified `bookings(resource_id, resource_type, booker_id, start_at, end_at, party_size, amount, payment_id, status)` | **Missing** | One engine for ground/court/room/teacher/mentor/workshop/event (today: narrow course/service `bookings`) |
| `institutions` master table | **Missing** | Institution is a **VARCHAR column** on users/courses, not an entity; membership is modeled but the org itself isn't |
| `user_roles(user_id, role, institution_id NULL)` | **Missing** | Multi-role per user (today: single `user_type` column) |
| Present already: `course_batches`, `batch_enrollments`, `jeetmantra_notifications`, `rag_chunks`, `course_embeddings`, `activity_feed`, `ai_usage_log`, `chat_room_members.last_read_at` (added this session) |

**Schema schism (critical):** three generations coexist — `schema.sql` (UUID `users`), `migration-v2.sql`, and the live `jeetmantra_*` tables where **`jeetmantra_users.id` is VARCHAR**. Legacy tables (e.g. `bookings`) declare UUID FKs to the *old* `users` table — a different identity space than runtime users. Many live tables exist only as ad-hoc `/pg/query` DDL with no in-repo migration.

## 5. Missing Workflows

- **Unified booking** (reserve any resource → pay → calendar entry → reminder → check-in) — fragmented across `enrollments`/`live_classes`/`bookings`.
- **On-demand content translation** ("Translate To ▼ → generate → persist → serve") for course/assignment/test/certificate/notification.
- **Certificate issuance** (complete → generate serial → store → verify URL).
- **Personal-institute auto-provisioning** on teacher signup (PHASE 9) — does not exist; courses sit `institution_id = null`.
- **Recurring/holiday-aware scheduling** (RRULE) — today a manual loop in `live-classes/recurring`.
- **Bulk grading + late-penalty** assignment workflow.
- **Real-time chat / notification push** (currently poll-only).
- **Server-side localized notifications/emails** (today English-only at send).

## 6. Missing Screens

- **Unified booking screen** (resource → slot → pay) — **absent**.
- **Per-student report card UI** — **absent** (data exists server-side; no render).
- **Institute management console** — only a switcher (`openMyInstitutions`); no member roster / branding / per-institute billing screen.
- **Timeline calendar view** — calendar has day/week/month/agenda only.
- **In-app translation/language-management screen** — i18n is implicit + Bhasha Setu is a separate page.
- **Full timetable grid editor** — timetable is modal-only.
- Present: certificate viewer, settings, profile, course workspace, messenger, studio.

## 7. Missing Permissions

- **No multi-role model** — one `user_type` column; a user can't be teacher+owner+student+parent simultaneously (membership tables exist for institutes but not roles).
- **`CREATOR_ROLES` ≡ `SELLER_ROLES`** (byte-identical) — the split is aspirational, so "seller without course ownership" can't be expressed.
- **`franchise`/`corporate_trainer`/`content_creator` not in the DB `user_type` CHECK constraint** (`migration-v2.sql`) despite being in `roles.js` — latent insert-failure / dead role.
- **`franchise` role never gated** anywhere.
- **No per-institute role scoping** — gates are global role-sets; a teacher at School A vs B has identical capability everywhere (only data is scoped).
- **Security**: `POST /api/webhooks` (unsigned) can create accounts (`email_verified:true`, fake hash); `POST /api/payments/webhook/payment` (legacy) unsigned; n8n sync endpoints open when `N8N_SECRET` unset; several `live-classes` GETs fully public.

## 8. Missing Translation Support

- **Backend gates 3 languages**: `TR_LANGS` (`ai.js:23`) lists 9; **Malayalam, Odia, Urdu** are offered in the picker + seeded but return HTTP 400 on-demand — **one-line fix**.
- **No content-translation layer**: course content, assignments, tests, certificates, **chat messages**, notifications, emails are translated only as transient per-viewer DOM text (or not at all server-side). No `content_translations` table; persistence is a LevelDB KV cache of UI string hashes.
- **No author/learner "Translate To ▼ → generate" flow** for stored content.
- **Notifications/emails are English-only** at send (no recipient-language lookup).
- Strong base to reuse: `/api/ai/translate` (batch, AI-backed, permanently cached) + `i18n-lite.js` DOM walker + `i18n-seed.js` baked dictionary already cover all 12 target languages on the **frontend**.

## 9. Missing AI Features

- **No `/ai/create-test`** (quiz/test generation) — tests are built manually.
- **No PPT/slide generation**, **no standalone notes generation** (only live-class summary).
- **No performance-analysis / attendance-report generator** as an AI endpoint (data exists; not AI-summarized).
- **No content-translation AI flow** (see §8).
- Voice: assistant/commands **dashboard-only** and **Hindi+English-only**; no listen on tests/assignments/notifications/messages.
- Present: course/lesson/assignment/practice-question generation, RAG tutor, essay grading, OCR, proctoring, voice search.

## 10. Duplicate Features

- **`CREATOR_ROLES` == `SELLER_ROLES`** — identical sets.
- **Three DB schema generations** (`schema.sql`, `migration-v2.sql`, `jeetmantra_*`) — overlapping `users`/`courses`/`bookings` definitions across identity spaces.
- **Timetable computed twice** — teacher (`teacherExtras.js`) and student (`studentExtras.js`) re-implement the same 3-query merge, and **disagree** (tests keyed on `scheduled_for` vs `due_date`).
- **Recordings shapes forked** — `/teacher/recordings` vs `/live-classes/recordings/list` return different field names.
- **AI tutor / messenger / voice** entry points overlap (cmd-K, messenger thread, voice intents all reach the same RAG tutor).
- **Two webhook ingestion paths** (`/api/webhooks`, `/api/n8n/webhook`, plus legacy `/api/payments/webhook/payment`).
- **Role dashboards** (`renderPartnerDash`/`renderSchoolDash`/`renderCoachingDash`) are near-clones built on the same creator data.

## 11. Recommended Refactoring (extend, don't duplicate)

1. **Identity unification** — collapse to the `jeetmantra_*` schema; retire `schema.sql`/`migration-v2` legacy `users`/`bookings`; commit the ad-hoc `/pg/query` DDL as real migrations so the schema is reproducible.
2. **Multi-role model** — add `user_roles(user_id, role, institution_id?)`, make `authorizeRole` check the union, carry a role array in the JWT; keep `user_type` as display/primary for back-compat. Auto-provision a **personal institute** on teacher signup (kills the `institution_id = null` legacy path — ties into the work already done this session).
3. **Unified calendar** — one `calendar_events` table (or a UNION view) + one `GET /calendar?view=&from=&to=` replacing the 3 merge functions; RRULE recurrence supersedes the manual recurring loop; fixes the test-date inconsistency.
4. **Unified booking engine** — polymorphic `resources` + generalized `bookings` with time-range + capacity + overlap constraint; migrate course bookings as `resource_type='course'`; surface bookings on the unified calendar.
5. **Content-translation layer** — promote the LevelDB cache to `content_translations`; add the "Translate To ▼ → generate → persist" flow reusing `/api/ai/translate`; localize notifications/emails server-side; **fix `TR_LANGS` to 12 first**.
6. **Course-type & staffing model** — add a first-class `program_type` (online/offline/hybrid/live/recorded/workshop/sports/activity/reading/coaching-batch/school-subject/certification) and alternate/assistant teacher columns; issue real `certificates`.
7. **Consolidate forks** — unify recording response shape; single `SELLER_ROLES` or a real distinction; single webhook ingest with signature verification.
8. **Platform hardening** — sign/secure all public webhooks; close the unauthenticated account-creation vector; add pagination/search to list endpoints.

## 12. Priority Order

**P0 — correctness & security (do first)**
- Sign/secure `POST /api/webhooks` + legacy payment webhook (unauthenticated account creation / payment spoofing).
- Fix `TR_LANGS` → 12 languages (1-line; unblocks Malayalam/Odia/Urdu).
- Add `corporate_trainer/content_creator/franchise` to the DB `user_type` CHECK (latent insert failure).
- Fix the teacher/student timetable test-date inconsistency.

**P1 — unification foundations (highest leverage)**
- `user_roles` multi-role + personal-institute auto-provisioning.
- `calendar_events` unified timetable + single `/calendar` endpoint.
- `content_translations` table + on-demand content translation flow + localized notifications.
- Commit ad-hoc DDL as migrations; pick one identity schema.

**P2 — feature completeness**
- Unified booking engine (resources + bookings) + booking screen + report-card UI + timeline view + institute-management console.
- AI: `/ai/create-test`, PPT, notes, performance-report; generalize voice to all surfaces/languages.
- CRUD finishers: bulk enroll/grade, exports, admin list-all, chat real-time + pagination, assignment rubrics/late-handling.

## 13. Estimated Completion %

| Area | % | Note |
|---|---|---|
| Backend APIs (breadth) | **80%** | ~135 endpoints; gaps in bulk/export/admin-list/real-time |
| Database | **70%** | Rich but 3-schema schism; missing translations/certificates/events/resources/institutions/user_roles |
| Roles & permissions | **55%** | Works, but single-role, CREATOR≡SELLER, no personal institute, role-set (not per-institute) gating |
| Localization | **65%** | Strong UI auto-translate (12-lang frontend); 3 blocked server-side; no content layer |
| Voice/speech | **60%** | Rich but dashboard-only, commands Hindi/English-only, listen = reader-only |
| Booking | **30%** | Narrow course/service table; no unified resource engine |
| Timetable/scheduling | **45%** | Computed merge, no events table, partial views, inconsistency |
| Frontend screens | **70%** | Most exist; missing booking/report-card/timeline/institute-console |
| AI capabilities | **75%** | Broad; missing test/PPT/notes-standalone/perf-report generation |
| Unified program types | **40%** | online/offline/hybrid yes; sports/music/activity/workshop not first-class |

**Overall ≈ 60%** — breadth is high (APIs ~80%, AI ~75%), dragged down by the unification gaps (booking 30%, timetable 45%, roles 55%) and the schema schism. The remaining work is **mostly unification + a handful of tables**, not new feature construction — high leverage.

## 14. Next Sprint Plan

**Sprint 1 — Harden & unblock (P0, ~3–4 days)**
1. Signature-verify / disable the unsigned webhook account-creation + legacy payment webhook.
2. `TR_LANGS` → 12; verify Malayalam/Odia/Urdu round-trip.
3. DB `user_type` CHECK fix; align teacher/student timetable test-date field.
4. Commit current ad-hoc DDL (incl. `chat_room_members.last_read_at`, `courses.institution_id`) as a real migration.

**Sprint 2 — Identity & calendar foundation (P1, ~1 week)**
5. `user_roles` table + `authorizeRole` union + JWT role array (back-compat with `user_type`).
6. Personal-institute auto-provisioning on teacher signup.
7. `calendar_events` table/view + unified `GET /calendar?view=&from=&to=`; migrate the 3 merge functions; add timeline view in the UI.

**Sprint 3 — Localization depth & booking (P1→P2, ~1.5 weeks)**
8. `content_translations` table + "Translate To ▼ → generate → persist" for course/assignment/test/certificate; server-side localized notifications.
9. Unified `resources` + `bookings` engine + booking screen; surface on the unified calendar.

**Sprint 4 — Completeness (P2, ~1.5 weeks)**
10. AI: `/ai/create-test`, PPT, notes, performance-report; generalize voice to tests/assignments/notifications/messages across all 12 languages.
11. CRUD finishers: bulk enroll/grade, exports, admin list-all, chat pagination + real-time; assignment rubrics/late; report-card UI; institute-management console; `certificates` issuance.

---

*Reuse-first throughout: the AI translate engine, RAG tutor, `resolveInstitution` middleware, membership tables, and the existing 135 endpoints are the substrate — this plan unifies and extends them rather than rebuilding.*
