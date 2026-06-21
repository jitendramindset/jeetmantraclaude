# EduOS Gap Analysis v2 — 20-Area Audit toward a complete Education Operating System

_Grounded in `API_INVENTORY_VERIFIED.md` (356 endpoints / 40 routers). Analysis only — no code._
_Target verticals: Schools · Coaching · Sports · Yoga · Music · Dance · Corporate Training · Home Tuition, across Online / Offline / Hybrid, multilingual, SEO-optimized marketplace._

Priority key: **P0** = blocks the multi-vertical OS / security · **P1** = needed for parity & polish · **P2** = differentiation.

---

## 0. The three structural duplications to resolve FIRST (cross-cutting)

Everything below inherits from these. Resolve them before building more.

| # | Overlapping systems | Reality | Resolution |
|---|---|---|---|
| **D1 — Org identity** | `organizations` (s7) **vs** `institution_teachers/students` (legacy) **vs** `jeetmantra_users.user_type` **vs** `courses.institution_id` | Three different "who owns what" models. `resolveInstitution` keys on the legacy one; `/api/orgs` keys on the new one. | Make `organizations` the single tenant root. Backfill `institution_id → org_id` (s7 already seeds id parity). `role_assignments` becomes the only membership table; deprecate `institution_teachers/students` reads. |
| **D2 — Notifications** | `/api/notifications` (user) **vs** `/api/notifications-admin` (broadcast) **vs** `/api/eduos/notify` (in-app) | Three writers, one inbox concept. | One `notifications` table + one delivery service (already `services/notifyLocalized.js`). `eduos/notify` and `notifications-admin/broadcast` should both call it, not own tables. |
| **D3 — Scheduling** | `/api/calendar` (unified read) **vs** `/api/teacher/timetable` **vs** `/api/student/calendar` **vs** `bookings_v2`/`resources` **vs** `eduos batches` **vs** `live_classes` | `/api/calendar` already unifies the READ; the WRITES are still fragmented across 5 tables. | Keep `/api/calendar` as the read projection. Define a single "schedulable event" contract that live-classes, bookings, and batch-sessions all emit into. |

---

## 1. Organization Management — **P0**
- **Existing:** `/api/orgs` (mine, :id, POST, PATCH, members GET/POST/PATCH/DELETE, transfer), `/api/capabilities/me`, `/api/categories`, `/api/institutions/*` (teachers/students/dashboard/import-csv/my-institutions).
- **Missing:** org settings & billing plan; org-level branding beyond `tenant/branding`; org subdomain/custom-domain + SEO profile; org-wide analytics rollup; org billing/subscription tie-in; soft-delete/suspend org.
- **Duplicate:** `institutions.*` overlaps `orgs.*` (D1). `eduos/tenant/branding` overlaps `orgs PATCH branding`.
- **Routes:** `GET/PUT /api/orgs/:id/settings`, `GET /api/orgs/:id/analytics`, `GET/PUT /api/orgs/:id/domain`, `POST /api/orgs/:id/suspend`. Fold `institutions/*` into `orgs/:id/*`.
- **Tables:** extend `organizations` (plan, status, domain, locale_default, seo jsonb). New `org_settings` only if jsonb gets unwieldy.
- **UI:** Org switcher (top bar) → Org Home (KPIs) → Settings (branding/domain/locale/billing) → Members (reuse member endpoints).
- **Priority:** **P0** (the OS spine).

## 2. Multi-Institute Switching — **P0**
- **Existing:** `X-Active-Institution` header + `resolveInstitution` middleware; `/api/institutions/my-institutions`; `/api/orgs/mine` (orgs + my_roles per org).
- **Missing:** a single "switch context" call returning the scoped session (active org + capabilities + default locale); `GET /api/me/contexts` (all orgs+roles in one shot for the switcher); persistence of last-active org.
- **Duplicate:** `my-institutions` vs `orgs/mine` (D1) — collapse to `orgs/mine`.
- **Routes:** `GET /api/me/contexts`, `POST /api/me/active-context` (sets last-active, returns caps + locale).
- **Tables:** `users.last_active_org_id` (or in a `user_prefs`).
- **UI:** top-bar org switcher already exists in admin-os; wire it to `/me/contexts`; re-scope dashboard on switch (this was the original "courses vanish" bug — keep the run-token guard).
- **Priority:** **P0**.

## 3. Teacher / Coach Unification — **P1**
- **Existing:** roles + capabilities (teacher/assistant_teacher + creator caps), `/api/teacher/*` (timetable, attendance, invoices, essays, recordings, export).
- **Missing:** persona materialization — Coach / Yoga Instructor / Music Teacher / Dance Teacher / Home Tutor are all `teacher` + org `category`; need a `GET /api/me/persona` that returns the category-driven label + the right default workspace; instructor public profile.
- **Duplicate:** none structurally — this is intentionally one base role × category (don't create new user_types).
- **Routes:** `GET /api/creators/:id/profile` (public, SEO), `GET /api/me/persona`.
- **Tables:** reuse `organizations.category` + `course_categories`; optional `creator_profiles` (bio, specialties, public_slug).
- **UI:** workspace chrome adapts label/iconography by category; public instructor page for marketplace/SEO.
- **Priority:** **P1**.

## 4. SEO APIs — **P0** (marketplace is a core goal, currently almost unserved)
- **Existing:** `GET /api/courses/slug/:slug`, `GET /api/courses/:id/reviews` (public), `GET /api/search/categories`, `GET /api/marketplace` (public).
- **Missing (large gap):** `sitemap.xml`, `robots.txt`, JSON-LD/structured-data per course & org, OpenGraph/meta endpoint, category & city landing pages, hreflang for multilingual, server-rendered (or prerendered) public course/org pages, canonical URLs, review schema.
- **Duplicate:** none.
- **Routes:** `GET /sitemap.xml`, `GET /robots.txt`, `GET /api/seo/course/:slug` (meta+JSON-LD), `GET /api/seo/org/:slug`, `GET /api/seo/category/:cat/:city?`.
- **Tables:** `courses.slug` (exists implicitly via slug route), add `slug`, `meta_description`, `og_image`; `organizations.slug`; `seo_redirects` for slug history.
- **UI:** course-create SEO panel (already partly built — title/slug/meta); marketplace category/city landing templates.
- **Priority:** **P0** for the marketplace pillar.

## 5. Translation / Content i18n APIs — **P1**
- **Existing:** `/api/translations/content` (POST/GET), `/api/translations/missing`, `DELETE /content/:id`; `/api/ai/translate`; `content_translations` table; reader Translate button.
- **Missing:** UI-string bundle endpoint `GET /api/i18n/:lang` (the Bhasha-Setu-style app-shell strings, distinct from content); translation-memory reuse; auto-translate queue/worker; per-org default + allowed languages; fallback chain.
- **Duplicate:** `content_translations` (storage) vs `ai/translate` (engine) — NOT a duplicate, keep both layered.
- **Routes:** `GET /api/i18n/:lang`, `POST /api/translations/auto/:entity/:id`, `GET /api/orgs/:id/locales`.
- **Tables:** `ui_strings(key, lang, value)`; reuse `content_translations`.
- **UI:** language picker (org default → user override); inline "translate this" already in reader; admin translation queue (admin-os AI&Translations section, still a placeholder).
- **Priority:** **P1** (P0 for non-English-first orgs).

## 6. Course Journey APIs — **P1**
- **Existing:** `/api/enrollments`, `/api/course-content/*` (topics/lectures/materials/tests/sections/question-bank), `/api/student/progress*`, `continue-learning`, `today`, `/api/certificates`.
- **Missing:** structured learning path / prerequisites; milestones & drip-release scheduling; module completion gates; journey state machine (enrolled→in-progress→completed→certified); next-best-action.
- **Duplicate:** none.
- **Routes:** `GET /api/courses/:id/journey`, `GET /api/student/journey/:courseId`, `POST /api/courses/:id/prerequisites`, `POST /api/course-content/topics/:id/drip`.
- **Tables:** `course_prerequisites`, `topic_release_rules`, reuse `lecture_progress`/`enrollments`.
- **UI:** journey map in reader sidebar; locked/unlocked states; "resume" already wired.
- **Priority:** **P1**.

## 7. Recording APIs — **P1**
- **Existing:** `POST /api/live-classes/:classId/recording`, `GET /recordings/list`, `POST /:id/summary` (AI summary), `transcribe-summary`.
- **Missing:** recording library with searchable transcripts; chapters/timestamps; per-recording view analytics; processing status; access control by enrollment; download/export.
- **Duplicate:** none.
- **Routes:** `GET /api/recordings` (library, filters), `GET /api/recordings/:id`, `GET /api/recordings/:id/transcript`, `POST /api/recordings/:id/chapters`.
- **Tables:** `recordings`(exists via live_classes recording_url) → promote to `recordings` table (transcript, chapters, duration, views); `recording_views`.
- **UI:** Recordings library (admin-os Live section now lists live classes — extend to recordings tab); student "watch recording".
- **Priority:** **P1**.

## 8. Smart Studio APIs — **P1** (frontend exists, backend gap)
- **Existing:** `studio.html` (whiteboard, multi-element layout, recording) — **client-only**; no studio routes in the inventory.
- **Missing:** studio session persistence; scene/asset save & reload; studio→course-content publish; recorded-output upload pipeline; templates.
- **Duplicate:** recording overlaps area 7 — unify the output path.
- **Routes:** `POST/GET /api/studio/scenes`, `POST /api/studio/scenes/:id/publish` (→ creates lecture/recording), `POST /api/studio/upload`.
- **Tables:** `studio_scenes(owner_id, json, thumbnail)`, reuse `recordings`/`materials` for outputs.
- **UI:** Studio save/load; "Publish to course" → picks course/topic; output lands in recordings.
- **Priority:** **P1**.

## 9. Timetable APIs — **P1**
- **Existing:** `/api/teacher/timetable`, `/api/calendar` (unified), `live-classes`, `eduos batches`, `bookings_v2`.
- **Missing:** recurring timetable templates (school bell schedule / weekly slots); room/resource conflict detection across teachers (partly in `bookings_v2`); period definitions; substitution; timetable publish to students.
- **Duplicate:** D3 — timetable vs calendar vs batches.
- **Routes:** `GET/POST /api/orgs/:id/timetable`, `POST /api/timetable/generate` (from templates), conflict check reuses booking overlap logic.
- **Tables:** `timetable_templates`, `timetable_slots`; reuse `live_classes`/`bookings_v2` as instances.
- **UI:** weekly grid editor (school) vs slot calendar (coaching/sports); publish → appears in `/api/calendar`.
- **Priority:** **P1** (P0 for Schools vertical).

## 10. Student Analytics — **P2** (already strong)
- **Existing:** `/api/student/time-summary`, `activity-daily`, `progress`, `test-history`, `submission-history`, `attendance-report`, `compare`; `gamification/summary`.
- **Missing:** at-risk/early-warning scoring; cohort percentile; engagement trend; predictive completion.
- **Duplicate:** none.
- **Routes:** `GET /api/student/risk`, `GET /api/student/cohort/:courseId`.
- **Tables:** reuse existing event tables (`study_sessions`, `lecture_progress`, `user_xp_ledger`); add `risk_scores` (computed).
- **UI:** student dashboard insights card; teacher roster risk flags.
- **Priority:** **P2**.

## 11. Teacher Analytics — **P1**
- **Existing:** `GET /api/courses/:id/analytics`, `/api/teacher/tests/:testId/analytics`, `/api/teacher/export`, `/api/teacher/payments`.
- **Missing:** cross-course teacher dashboard (aggregate engagement, revenue, ratings); per-student drilldown trends; live-class attendance analytics; comparison across batches.
- **Duplicate:** overlaps Course Analytics (area 11 is the aggregate of area's per-course).
- **Routes:** `GET /api/teacher/analytics/overview`, `GET /api/teacher/analytics/revenue`, `GET /api/teacher/analytics/engagement`.
- **Tables:** reuse; add materialized rollups if needed.
- **UI:** teacher command-center analytics tab (per-course exists; add aggregate).
- **Priority:** **P1**.

## 12. Batch Management — **P1**
- **Existing:** `/api/eduos/courses/:courseId/batches` (GET/POST), `PUT /batches/:batchId`, `enroll`, `roster`, QR `generate`/`check-in`.
- **Missing:** batch timetable link; capacity & waitlist; batch transfer/merge; batch-level fees & schedule; batch lifecycle (upcoming/running/completed); batch chat room.
- **Duplicate:** batch enroll vs `/api/enrollments` (course-level) — clarify batch vs course enrollment.
- **Routes:** `POST /api/batches/:id/transfer`, `GET /api/batches/:id/timetable`, `POST /api/batches/:id/waitlist`.
- **Tables:** extend `batches`(capacity, status, fee_plan_id); `batch_waitlist`.
- **UI:** batch board (kanban by status); roster + QR attendance (exists); batch timetable.
- **Priority:** **P1** (P0 for Coaching/Sports cohorts).

## 13. Marketplace Discovery — **P0**
- **Existing:** `GET /api/marketplace`, `/api/search` (+ `semantic`, `suggestions`, `categories`), `courses/search/nearby`.
- **Missing:** faceted filters (category, vertical, format online/offline/hybrid, level, price, language, rating, city); recommendations / "students also bought"; trending; sort options; map view for offline; filter persistence in URL (SEO).
- **Duplicate:** `marketplace` vs `courses GET /` vs `search` — three discovery surfaces; unify behind one query API.
- **Routes:** `GET /api/marketplace?facets=...`, `GET /api/marketplace/recommendations`, `GET /api/marketplace/trending`.
- **Tables:** reuse `courses` (+ `category_id`, `format`, `language`, `mode`); `course_stats` for trending.
- **UI:** marketplace with left-rail facets, map toggle, SEO-friendly filter URLs.
- **Priority:** **P0** (core pillar).

## 14. Parent Analytics — **P1**
- **Existing:** `/api/parent/link`, `children`, `child/:studentId/snapshot`.
- **Missing:** multi-child dashboard; fee status & pay-for-child; attendance/late alerts; progress & report-card access; parent notifications; teacher-parent messaging.
- **Duplicate:** none.
- **Routes:** `GET /api/parent/dashboard`, `GET /api/parent/child/:id/fees`, `GET /api/parent/child/:id/report-card` (reuse `eduos/report-card`).
- **Tables:** reuse `parent_links`, `fee_invoices`, `attendance`.
- **UI:** parent home with child cards; fee pay; alerts.
- **Priority:** **P1** (P0 for Schools).

## 15. Notification Center — **P1**
- **Existing:** `/api/notifications` (CRUD), `/api/notifications-admin` (templates/broadcast/log), `/api/eduos/notify`, `services/notifyLocalized.js`.
- **Missing:** per-user preferences & channels (in-app/email/SMS/WhatsApp/push); digest/quiet hours; delivery status; localization of every notification (service exists — wire it everywhere).
- **Duplicate:** **D2** — three notification writers. Consolidate to one table + one service.
- **Routes:** `GET/PUT /api/notifications/preferences`, `GET /api/notifications/channels`.
- **Tables:** one `notifications`; `notification_prefs`; `notification_deliveries`.
- **UI:** bell + center (exists in dashboard); preferences screen; admin broadcast (exists).
- **Priority:** **P1**.

## 16. Certificate Management — **P2** (strong)
- **Existing:** `/api/certificates` (issue w/ 80% gate, my, `verify/:token` public, templates GET/POST, revoke).
- **Missing:** bulk issue (per batch); certificate designer/preview; LinkedIn/share; expiry & renewal; verification QR.
- **Duplicate:** none.
- **Routes:** `POST /api/certificates/bulk`, `GET /api/certificates/:id/share`, `POST /api/certificate-templates/:id/preview`.
- **Tables:** reuse `certificates`, `certificate_templates`.
- **UI:** template designer; bulk-issue from roster; public verify page (exists).
- **Priority:** **P2**.

## 17. Sports / Court Booking — **P1**
- **Existing:** `/api/resources` (+ `availability`), `/api/bookings` (mine/received/cancel/confirm), `bookings_v2`, `/api/admin/bookings`.
- **Missing:** recurring slots & memberships; pricing packages/passes; multi-court venue model; waitlist; check-in; coach assignment to slot; dynamic availability (peak pricing).
- **Duplicate:** booking overlaps batches/live-classes for "session" concept (D3).
- **Routes:** `POST /api/resources/:id/slots` (recurring), `POST /api/bookings/:id/checkin`, `GET /api/venues/:id/courts`, `POST /api/memberships`.
- **Tables:** `resources`(exists), `resource_slots`, `memberships`, `venues`/`courts` (or resource hierarchy).
- **UI:** venue → court → slot picker; membership purchase; coach roster.
- **Priority:** **P1** (P0 for Sports/Yoga/Dance verticals).

## 18. AI Workflow APIs — **P2** (rich already)
- **Existing:** `/api/ai/*` (12: generate, translate, create-course, create-assignment, transcribe-summary, course-from-url, suggest-topics, tutor, suggest, lesson-plan, practice-questions, grade-essay), `/api/rag/*`, `/api/eduos/ai/*` (proctor, ocr, voice-search), `/api/n8n/*`.
- **Missing:** exposed n8n workflow triggers per org; per-tenant AI quota/spend; agent orchestration; AI usage analytics (admin-os AI section is a placeholder).
- **Duplicate:** `ai/translate` vs `translations/*` — layered, fine.
- **Routes:** `GET /api/ai/usage` (exists) → add `/api/orgs/:id/ai/quota`, `POST /api/workflows/:key/trigger`.
- **Tables:** `ai_usage`(exists implicitly), `ai_quotas`.
- **UI:** admin AI&Translations section (placeholder → wire usage + quota).
- **Priority:** **P2**.

## 19. Global Search — **P1**
- **Existing:** `/api/search` (+ `suggestions`, `semantic`, `categories`, `index-course`).
- **Missing:** unified entity search (courses + orgs + teachers + content + recordings); in-app admin Cmd-K backend (currently a frontend placeholder); scoped search per org; filters.
- **Duplicate:** `search` vs `marketplace` (area 13) — search is the engine, marketplace the storefront; keep but share index.
- **Routes:** `GET /api/search/all?types=course,org,teacher`, `GET /api/admin/search` (Cmd-K).
- **Tables:** `search_index`(if not vector-only); reuse semantic index.
- **UI:** global search bar; admin Cmd-K (wire the existing placeholder).
- **Priority:** **P1**.

## 20. Platform Localization — **P1**
- **Existing:** `content_translations`, `ai/translate`, TR_LANGS (12 languages), reader translate.
- **Missing:** UI-string bundles (area 5); RTL; locale-aware date/number/currency; per-org default + allowed locales; hreflang for SEO (area 4); language-aware marketplace.
- **Duplicate:** overlaps areas 4 & 5 — treat as one "i18n & locale" workstream.
- **Routes:** `GET /api/i18n/:lang`, `GET /api/orgs/:id/locales`, hreflang in SEO endpoints.
- **Tables:** `ui_strings`, `organizations.locale_default`, `locale_settings`.
- **UI:** language picker everywhere; RTL stylesheet; localized marketplace.
- **Priority:** **P1**.

---

## Priority rollup

| P0 (OS spine & marketplace) | P1 (parity & verticals) | P2 (differentiation) |
|---|---|---|
| 1 Org Mgmt · 2 Multi-Institute Switch · 4 SEO · 13 Marketplace Discovery · **D1/D2/D3 dedup** | 3 Teacher/Coach · 5 Translation · 6 Journey · 7 Recording · 8 Studio · 9 Timetable · 11 Teacher Analytics · 12 Batch · 14 Parent · 15 Notifications · 17 Sports Booking · 19 Search · 20 Localization | 10 Student Analytics · 16 Certificates · 18 AI Workflow |

---

## Roadmap to a complete Education Operating System

### Phase A — Unify the spine (P0, ~2 sprints)
Resolve **D1/D2/D3**. Make `organizations` the tenant root; collapse `institutions/*` into `orgs/*`; one notifications table+service; one schedulable-event contract feeding `/api/calendar`. Ship `GET /api/me/contexts` + active-context switch. **Outcome:** one coherent multi-tenant model under every vertical.

### Phase B — Marketplace & SEO (P0, ~2 sprints)
Faceted discovery (`category/vertical/format/level/price/language/city`), recommendations, trending; SEO endpoints (`sitemap`, JSON-LD, OG, hreflang, slug pages), category/city landing pages. **Outcome:** the public, multilingual, SEO storefront.

### Phase C — Vertical enablers (P1, ~3 sprints)
- **Schools:** timetable templates (9) + parent analytics (14) + batch (12).
- **Coaching:** batch lifecycle + teacher analytics (11) + journey (6).
- **Sports/Yoga/Dance:** court booking (17) — recurring slots, memberships, venues/courts.
- **Corporate:** cohorts via batch + certificates (16) + reporting.
- **Home Tuition/Online/Offline/Hybrid:** `courses.mode/format` everywhere + booking for offline + live-classes for online.
**Outcome:** every named vertical has its workflow.

### Phase D — i18n, recordings, studio, AI (P1/P2, ~2 sprints)
UI string bundles + RTL + per-org locales (5/20); recordings library + transcripts (7); studio persistence & publish (8); AI quotas + n8n triggers + admin AI section (18); global entity search + Cmd-K (19); student risk scoring (10).
**Outcome:** the polished, intelligent, fully-localized OS.

### Cross-cutting (every phase)
Continue the `authorizeRole → requireCapability` cutover (~7 routes left); wire the 4 remaining admin-os placeholders (Growth, Automations, AI&Translations, Franchise); keep `services/notifyLocalized` as the single notification path; apply the 9 staged migrations.

### Vertical × capability matrix (what each turns on)
| Vertical | Org type | Primary modules |
|---|---|---|
| School | `school` | timetable(9), batch(12), parent(14), fees(eduos), report-card |
| Coaching | `coaching` | batch(12), journey(6), teacher analytics(11), tests |
| Sports | `sports_academy` | booking(17), memberships, attendance, coach roster |
| Yoga | `yoga_center` | booking(17), recurring slots, packages |
| Music/Dance | `music_academy`/`dance_academy` | booking(17), 1:1 + batch, recordings(7) |
| Corporate | `corporate_training` | cohorts(12), certificates(16), reporting(11) |
| Home Tuition | `home_tuition` | 1:1 booking(17), live-classes, invoices |
| Online/Offline/Hybrid | any | `courses.mode` flag → live-classes (online) + booking (offline) + both (hybrid) |
