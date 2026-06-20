# EduOS / JeetMantra — Role + Organization Unification

**Author:** Platform CTO office
**Date:** 2026-06-20
**Status:** Architecture decision record + execution plan
**Branch baseline:** `teacher-command-center` (Sprint 1 multi-role identity + Sprint 2 Platform-OS shell shipped)

---

## 1. Current Role Analysis

### 1.1 Role inventory (as shipped)

| Role | CREATOR | SELLER | INSTITUTION | DB CHECK | Auto personal-institute |
|---|---|---|---|---|---|
| `student` | – | – | – | yes | no |
| `teacher` | yes | yes | – | yes | yes |
| `partner` | yes | yes | – | yes | yes |
| `school` | yes | yes | yes | yes | yes |
| `coaching` | yes | yes | yes | yes | yes |
| `admin` | yes | yes | yes | yes | no (skipped in `identity.js:21-24`) |
| `parent` | – | – | – | yes | no |
| `corporate_trainer` | yes | yes | – | yes | yes |
| `content_creator` | yes | yes | – | yes | yes |
| `franchise` | – | – | yes | yes | **no — bug** (INSTITUTION role excluded from `identity.js:21-24`) |

Source of truth: `backend/config/roles.js:16-23`, `backend/services/identity.js:21-24`, `backend/database/migration-s2-identity.sql:17-20`, `backend/middleware/validation.js:10-11`.

### 1.2 Functional collapse

Authorization is role-name string compare (`backend/middleware/auth.js authorizeRole:36-56`). When we group roles by the **permission set they actually unlock**, ten labels collapse to four:

- **Creator-Seller (no institution):** `teacher` ≡ `partner` ≡ `corporate_trainer` ≡ `content_creator` — four labels, one permission surface.
- **Creator-Seller-Institution:** `school` ≡ `coaching` — distinguished only by signup-profile field names (`schoolName` vs `centerName`, `validation.js:18-29`).
- **Institution-only:** `franchise`, `admin` (admin overloaded as platform admin).
- **Consumer:** `student`, `parent`.

### 1.3 Roles requested but not modeled

`coach`, `trainer` (generic, non-corporate), `yoga_instructor`, `sports_coach`, `music_teacher`, `dance_teacher`, `home_tutor`, `school_teacher`, `institute_faculty`, `course_creator`, `organization_owner`, `org_admin`, `assistant_teacher`, `viewer`/`observer`, `accountant`/`finance`. None of these need a new `user_type` row — they are all (role × category × org-scope) tuples on top of the four base permission sets above.

### 1.4 What already works (do not rebuild)

- Multi-role union in JWT — Sprint 1.
- Personal-institute auto-provision for 6 of 7 creator roles — `services/identity.js:21-75` + signup hooks `routes/auth.js:225, 387, 506`. Backfill at `migration-s2-identity.sql:86-97`.
- `resolveInstitution` middleware + `X-Active-Institution` header with `'all'` short-circuit — `middleware/resolveInstitution.js:14-27`.
- Multi-org switcher UI — `public/dashboard.html:6980-7028, 8141`.
- `GET /api/institutions/mine` unions teacher + student links — `routes/institutions.js:218-241`.

---

## 2. Duplicate Features Analysis

### 2.1 Role-level duplication

| Pair | Overlap | Real difference |
|---|---|---|
| `teacher` vs `partner` vs `corporate_trainer` vs `content_creator` | ~100% backend | Profile field names only |
| `school` vs `coaching` | ~100% backend | Signup labels |
| `renderPartnerDash` / `renderSchoolDash` / `renderCoachingDash` (dashboard.html:1979-2017) | ~70% UI | Each just adds a profile card on top of `renderCreatorBlock('xx-', d)` (1844-1895) |
| `renderCorporateTrainerDash` / `renderContentCreatorDash` (8417-8439) | ~85% UI | Two KPI ids + an emoji ("📚 program" vs "🎬 content") |

### 2.2 HTML section duplication

`section-teacher` (577-689), `section-partner` (692-731), `section-school` (734-799), `section-coaching` (802-866), `section-corporate_trainer` (939-958), `section-content_creator` (961-978) re-declare the same `My Courses + Live + Earnings + Linked Teachers/Students + Profile` grid with only the id prefix changed (`t-` / `pm-` / `sm-` / `cm-` / `ct-` / `cc-`). ~1,200 lines of HTML+JS collapse to ~400 lines templated.

### 2.3 Concept duplication ("Course")

Same `courses` row is rendered as Course / Program / Class / Training / Session / Batch across roles. All flow through one `openWizard()` (dashboard.html lines 633, 704, 752, 814, 948, 970). One backend table; six labels. The diff is a dictionary, not a workflow.

### 2.4 Migration duplication

`migration-s3-i18n.sql` and `migration-s3-ops.sql` (both untracked) sit alongside `migration-s2-identity.sql` — confirm they are net-new before unification SQL is added (Section 11).

### 2.5 NAV duplication

`NAV[role]` (dashboard.html:1110-1259) ships ~150 lines where Dashboard / Messages / Calendar / EduOS / Wallet / Marketplace / Settings / Profile repeat for every creator role. A `BASE_NAV` + per-role extension cuts this to ~50 lines.

---

## 3. Recommended Unified Architecture

### 3.1 The five-axis model

> One **person** holds many **roles**, each scoped to many **organizations**, each tagged with one **category** (and many subcategories), offering many **program types** in many **delivery modes**.

```
person (jeetmantra_users, no user_type churn)
   └── role_assignment (person × org × role × scope)            ← NEW capability layer
            └── org (organization, decoupled from user row)     ← NEW
                  ├── category + subcategories                  ← NEW taxonomy
                  └── programs (courses, extended)              ← extend existing
                           ├── program_type                     ← NEW enum
                           ├── delivery_mode (orthogonal)       ← NEW enum
                           └── batches.mode                     ← NEW per-batch override
```

### 3.2 The four primitives

1. **Identity** — `jeetmantra_users` stays the auth/profile row. Keep `user_type` for legacy compatibility but stop branching on it for new code. Source of truth becomes `user_roles` (already exists; Sprint 1).
2. **Organization** — promote orgs out of the user row into `organizations`. The current "the org is a user row whose `id` equals `institution_id`" rule is a foreign-key everywhere; we keep that string id stable by seeding `organizations.id = jeetmantra_users.id` for legacy rows so no downstream SQL breaks.
3. **Role assignment** — `(person_id, org_id, role, scope, granted_by, granted_at, revoked_at)`. Replaces today's three sources (`jeetmantra_users.user_type`, `user_roles`, `institution_teachers.subject`). Authorization becomes `hasCapability(person, capability, org_id)`.
4. **Capability** — string permissions (`course.create`, `payout.approve`, `org.member.invite`, `certificate.issue`, `analytics.read`) granted by role. Replaces `authorizeRole(...roleNames)` calls site-by-site.

### 3.3 Role catalog (12 requested roles, 0 new `user_type`s)

Every role below is `(base_permission_set, category, org_scope)`. None require a new `jeetmantra_users.user_type` value.

| Requested role | Base permission set | Category | Org scope |
|---|---|---|---|
| Teacher | Creator-Seller | education | personal or institute |
| Coach | Creator-Seller | sports OR skills | personal or coaching |
| Trainer | Creator-Seller | fitness | personal or institute |
| Yoga Instructor | Creator-Seller | fitness/yoga | personal |
| Sports Coach | Creator-Seller | sports | personal or academy |
| Music Teacher | Creator-Seller | arts/music | personal or institute |
| Dance Teacher | Creator-Seller | arts/dance | personal or institute |
| Home Tutor | Creator-Seller | education | personal (single-student UI) |
| School Teacher | Creator (no Seller) | education | school (membership only) |
| Institute Faculty | Creator (no Seller) | any | institute |
| Course Creator | Creator-Seller | any | personal |
| Organization Owner | Owner | any | the org they created |

### 3.4 The 9 permission levels

`Org Owner > Org Admin > Teacher > Assistant Teacher > Coach > Trainer > Student > Parent > Viewer`. These map 1:1 to nine `org_roles` rows. Each role grants a capability set (Section 7).

### 3.5 Categories (replace free-text `courses.category`)

Five top-level: **Education / Sports / Fitness / Arts / Skills**. Two-level taxonomy in tables `org_categories` and `org_subcategories` (also reused by `courses.category_id` / `courses.subcategory_id`).

### 3.6 Program types (10 first-class)

Course / Workshop / Bootcamp / Sports / Tuition Batch / Coaching Batch / Certification / Mentorship / Reading / Activity — `courses.program_type` enum.

### 3.7 Delivery modes (two orthogonal axes)

- `class_mode`: `online | offline | hybrid` (existing — keep).
- New `session_type`: `live | recorded | self_paced | mentorship | group | one_to_one` — orthogonal.
- New `course_batches.mode` override so a batch can declare its own delivery shape.

### 3.8 Personal Academy (already shipped — extend)

Confirmed in `services/identity.js:56-75`. Two extensions:
1. Include `franchise` in `INSTITUTION_ROLES` provisioning list (one-char fix at `identity.js:21-24`).
2. Surface Personal Academy in UI: distinct tile + "Promote to Public Academy" CTA in `openMyInstitutions()` (dashboard.html:6980-7028).

---

## 4. Missing APIs

Reuse existing routes wherever possible. The list below is net-new only.

| Method + Path | Purpose | Notes |
|---|---|---|
| `POST /api/orgs` | Create a non-personal org under an existing person | Replaces "sign up as school" overload |
| `GET /api/orgs/:id` | Org profile (replaces fetching a user row) | |
| `PATCH /api/orgs/:id` | Update org metadata, category, subcategories | |
| `POST /api/orgs/:id/transfer` | Transfer org ownership | New capability `org.transfer` |
| `POST /api/orgs/:id/members` | Invite a person with `(role, capabilities[])` | Replaces today's implicit `institution_teachers` insert |
| `PATCH /api/orgs/:id/members/:personId` | Change role/scope | |
| `DELETE /api/orgs/:id/members/:personId` | Revoke (soft) | |
| `GET /api/orgs/:id/members` | Roster with role per member | |
| `POST /api/orgs/:id/promote-personal` | Promote a personal academy to public | Sets `is_personal=false`, exposes to marketplace |
| `GET /api/capabilities/me?org=:id` | Resolved capability list for active org | Used by frontend to gate UI |
| `GET /api/categories` | Category + subcategory tree | Replaces `SELECT DISTINCT category FROM courses` at `search.js:142-143` |
| `GET /api/program-types` | Enum + i18n labels | |
| `POST /api/courses/:id/seo/regenerate` | Re-run auto-SEO pipeline | |
| `GET /sitemap.xml` | Marketplace SEO sitemap | Public route |
| `GET /robots.txt` | | |
| `GET /api/courses/:slug.jsonld` | JSON-LD `Course` schema fetch | Or inline render on `slug` page |
| `POST /api/certificates/issue` | Persist certificate row + return verify token | Replaces ephemeral cert at `courses.js:567-615` |
| `GET /api/certificates/verify/:token` | Public verification | |
| `GET /api/certificate-templates` | Template list per type | |

Extensions to existing routes:

- `GET /api/institutions/mine` — also join `franchise_branches` (`eduos.js:751,774`); add `org_type` + `category` to response.
- `GET /api/marketplace` — add `program_type`, `delivery_mode`, `subcategory`, `radius_km` filters (current shape: `marketplace.js:33-49`).
- `GET /api/search` — same filter additions (`search.js:16-29`).
- `POST /api/courses` (validation.js:40-66) — accept `program_type`, `subcategory_id`, `session_type`, `og_image`, `canonical_url`.

---

## 5. Missing Tables

> **Critical five are marked ★** — these unblock the entire unification.

| Table | Why | Reuse note |
|---|---|---|
| ★ `organizations` | Decouple org from user row; enables many-orgs-per-owner, transfer, metadata | Seed `id` from existing `jeetmantra_users.id` where `user_type IN ('school','coaching','franchise')` to preserve every existing `institution_id` FK |
| ★ `role_assignments` | Person × Org × Role × Scope; replaces three implicit sources | Backfill from `jeetmantra_users.user_type`, `user_roles`, `institution_teachers` |
| ★ `capabilities` + `role_capabilities` | Move from string-role compare to capability check | Used by new `requireCapability()` middleware (Section 7) |
| ★ `course_categories` + `course_subcategories` | Replace free-text `courses.category` | Seed from `SELECT DISTINCT category FROM courses` |
| ★ `certificates` + `certificate_templates` | Persist + verify certs; multiple template types | Replaces ephemeral cert at `courses.js:567-615` |
| `org_invites` | Email/phone invitation tokens with role pre-assigned | |
| `org_categories_map` | Multi-category orgs (e.g., school that also runs sports) | |
| `seo_metadata` (optional) | Per-entity OG/Twitter/JSON-LD overrides if not inlining on `courses` | Alternative: add columns to `courses` |
| `course_program_types` (lookup) | i18n labels for enum | Or hard-code in code with i18n keys |
| `parent_student_links` (if not present) | Many-to-many parent ↔ student across orgs | Check first; `parent` role exists |

Column additions to existing tables:

- `courses`: `program_type ENUM`, `subcategory_id`, `session_type ENUM`, `og_image`, `og_title`, `canonical_url`, `json_ld JSONB`.
- `course_batches`: `class_mode ENUM` (override parent), `session_type ENUM`.
- `jeetmantra_users`: no new role values needed — stop branching on `user_type` for new code.

---

## 6. Missing Workflows

1. **Org creation (non-personal)** — Person picks category → org row inserted → owner role auto-assigned → optional invite teammates. Today the only path is sign-up-as-school, which forces a new auth account.
2. **Role invitation** — `POST /api/orgs/:id/members` with role + email → magic link → on accept, `role_assignment` row created. Today: manual `institution_teachers` insert.
3. **Ownership transfer** — current owner nominates → new owner accepts → owner role moves.
4. **Promote Personal Academy → Public Academy** — flips `is_personal=false`, exposes to marketplace + sitemap, triggers SEO regeneration.
5. **Capability resolution at request time** — `requireCapability('course.create')` middleware reads active `X-Active-Institution`, joins `role_assignments` × `role_capabilities`, caches per-request.
6. **SEO auto-generation on course create** — pipeline: slugify → meta_description (160 chars) → keywords (extract from title + category + subcategory + city) → og_image (fallback to category default) → canonical_url → JSON-LD (`Course` schema). Runs in `routes/courses.js` post-insert; re-runnable via `POST /api/courses/:id/seo/regenerate`.
7. **Certificate issuance** — on `≥80%` completion (existing gate at `courses.js:567-615`) **or** explicit teacher action → insert `certificates` row → emit verify token → render from template.
8. **Marketplace dual-listing** — a coach offering yoga (fitness) AND meditation (skills) — handled by `org_categories_map` + `course.category_id`.
9. **Parent-of-many** — single parent account viewing N children across M orgs. Read-only aggregation similar to `setActiveInstitution('all')` (`resolveInstitution.js:27`).
10. **Org switcher v2** — filter chips by category + org type in `openMyInstitutions()` (dashboard.html:6980-7028).

---

## 7. Missing Permissions

Today: role-name string compare via `authorizeRole(...names)` (`auth.js:36-56`). `user_roles.institution_id` exists (`migration-s2-identity.sql:51`) but is **not read** during authorization — a user cannot be admin of Org A and teacher of Org B.

### 7.1 Capability catalog (minimum viable)

| Capability | Default roles |
|---|---|
| `org.read` | every role in org |
| `org.update` | Org Owner, Org Admin |
| `org.transfer` | Org Owner |
| `org.member.invite` | Org Owner, Org Admin |
| `org.member.revoke` | Org Owner, Org Admin |
| `course.create` | Teacher, Coach, Trainer |
| `course.update` | author + Org Admin + Org Owner |
| `course.delete` | author + Org Owner |
| `course.publish` | Org Admin, Org Owner |
| `batch.create` | Teacher, Coach, Trainer, Assistant Teacher |
| `batch.roster.read` | Teacher, Coach, Assistant Teacher |
| `attendance.mark` | Teacher, Coach, Trainer, Assistant Teacher |
| `test.create` | Teacher (not Yoga/Dance/Music — hidden by category) |
| `certificate.issue` | Teacher, Coach, Org Admin |
| `payout.read` | self + Org Owner |
| `payout.approve` | Org Owner |
| `analytics.read` | Org Owner, Org Admin |
| `marketplace.list` | role grants `Seller` |
| `student.enroll` | Student, Org Admin (on behalf of) |
| `viewer.read` | Viewer (read-only access to selected entities) |

### 7.2 Middleware

- New `requireCapability(cap)` middleware. Internals: read `req.user.id` + active org from `resolveInstitution`, join `role_assignments × role_capabilities`, return 403 with capability name.
- Keep `authorizeRole(...)` for transition; mark deprecated.
- The 9-level role map at `Org Owner / Org Admin / Teacher / Assistant Teacher / Coach / Trainer / Student / Parent / Viewer` is implemented as 9 seeded rows in `org_roles`, each with a capability bundle.

### 7.3 Gaps closed

- Assistant Teacher: missing today; added as role + capability bundle (no `course.delete`, no `payout.read`).
- Coach / Trainer (generic): missing; added as bundles.
- Viewer / Observer: missing; new bundle with only `*.read` capabilities.
- Per-org admin (distinct from platform admin): missing; `Org Admin` role on `role_assignments`.

---

## 8. Missing SEO Features

Current state:
- `slug` auto-gen with 6-char id suffix (`courses.js:11, 165-167`).
- `meta_description` defaults to first 160 chars of description (`courses.js:179`).
- `keywords` free text, no auto-extraction (`courses.js:180`).
- Public lookup `GET /api/courses/slug/:slug` (`courses.js:83`).
- `city/area/latitude/longitude` columns (`courses.js:162`).

Gaps:

1. **No Open Graph tags** — add `og_title`, `og_description`, `og_image`, `og_url`, `og_type=course.program`. Image fallback chain: course cover → org logo → category default.
2. **No Twitter Card** — `twitter:card=summary_large_image` + reuse OG fields.
3. **No JSON-LD** — emit `@type: Course` with `provider`, `hasCourseInstance` (batch), `coursePrerequisites`, `educationalLevel`, `aggregateRating` when present.
4. **No canonical URL** — `canonical_url` column + default to `https://<host>/c/<slug>`.
5. **No `sitemap.xml`** — generate from `courses` where `is_published=true`, segmented by category.
6. **No `robots.txt`** — static route.
7. **No meta keyword auto-extraction** — derive from `title + category + subcategory + city + tags`.
8. **No location/category tag system** — `course_tags` join table (location tags, skill tags) for long-tail SEO landing pages.
9. **No category landing pages** — `/c/<category>/<subcategory>` route emitting indexed list pages.
10. **No image alt-text generation** — pipe through existing `routes/ai.js` for auto-alt on course covers.
11. **No structured breadcrumbs** — emit `BreadcrumbList` JSON-LD on detail pages.
12. **createCourse modal** (`dashboard.html:2400-2407`) exposes none of the SEO fields — server defaults everything and user cannot edit. Add an "SEO" accordion to the wizard.
13. **No re-generation endpoint** — `POST /api/courses/:id/seo/regenerate` so category/title edits refresh metadata.

---

## 9. UI Redesign Recommendations

### 9.1 Collapse six renderers → one

Replace `renderTeacherDash` / `renderPartnerDash` / `renderSchoolDash` / `renderCoachingDash` / `renderCorporateTrainerDash` / `renderContentCreatorDash` (dashboard.html 1897-2017, 8417-8439) with a single:

```js
renderCreatorDash(activeRole, category, data)
```

driven by `renderCreatorBlock('xx-', d)` (already proven at 1844-1895) + a new `renderCommandCenter(prefix, d, labels)` extracted from the Teacher Command Center (1897-1949). Keep `renderFranchiseDash` (8440-8452) and `renderParentDash` separate — genuine workflow forks.

### 9.2 Collapse six sections → one

Merge `section-teacher` (577-689), `section-partner` (692-731), `section-school` (734-799), `section-coaching` (802-866), `section-corporate_trainer` (939-958), `section-content_creator` (961-978) into `section-creator` with prefix tokens. Estimated reduction: **~1,200 → ~400 lines**.

### 9.3 Category label dictionary

```js
const CATEGORY_LABELS = {
  education: { course: 'Course', learner: 'Student', session: 'Class' },
  sports:    { course: 'Program', learner: 'Athlete', session: 'Training' },
  fitness:   { course: 'Program', learner: 'Practitioner', session: 'Session' },
  arts:      { course: 'Course', learner: 'Student', session: 'Class' },
  skills:    { course: 'Bootcamp', learner: 'Learner', session: 'Workshop' },
};
```

Hook at `dashboard.html:1278-1282` (i18n translation site) and inside `renderCreatorBlock`. Driven by `crm.instituteCategory` (already read at 1356).

### 9.4 NAV collapse

Factor `BASE_NAV` (Dashboard / Messages / Calendar / EduOS / Wallet / Marketplace / Settings / Profile) + per-role extensions. Cuts `NAV[role]` (1110-1259) from ~150 → ~50 lines.

### 9.5 Bottom nav

`buildBottomNav` (8295-8322) currently only models `student`, `teacher`, `parent`. One-line `PRESETS[role] || PRESETS.teacher` lets coach/yoga/music/dance/tutor inherit teacher's bottom nav with category icons substituted.

### 9.6 Surface Personal Academy

In `openMyInstitutions()` (6980-7028):
- Distinct "Personal Academy" badge on the self-row.
- "Promote to Public" CTA → `POST /api/orgs/:id/promote-personal`.
- Empty-state nudge for new creators: "Your Personal Academy is ready — list your first program."

### 9.7 Org switcher v2

- Filter chips: category, org type.
- Group: Personal / Owned Orgs / Member Of.
- Include franchise branches (currently missing — `eduos.js:751,774` not joined).

### 9.8 Create-course wizard

Add 3 fields to `MODAL_DEFS.createCourse` (2388-2410):
- Program type (10 options).
- Subcategory (cascaded from category).
- Session type (live/recorded/etc.).

Plus an "SEO" accordion: og_image, canonical, keyword override.

### 9.9 Marketplace filter bar

Replace hard-coded pills (`marketplace.html:131-148`) with category-tree-driven chips + program_type + delivery_mode + radius filters wired to extended `/api/marketplace`.

---

## 10. Implementation Plan

### Sprint 3 — Foundations (1 week, no user-visible change)
- Create tables: `organizations`, `role_assignments`, `capabilities`, `role_capabilities`, `course_categories`, `course_subcategories`.
- Seed `organizations` from `jeetmantra_users WHERE user_type IN ('school','coaching','franchise','teacher',...)` with `id` preserved.
- Seed `role_assignments` from `user_roles` + `institution_teachers`.
- Seed `capabilities` + 9 default `role_capabilities` bundles.
- Add `requireCapability()` middleware (parallel to `authorizeRole`).
- Fix: include `franchise` in `INSTITUTION_ROLES` (`identity.js:21-24`).
- Replace `validation.js:10-11` hard-coded role list with import from `roles.js`.

### Sprint 4 — Programs + Categories (1 week)
- Add `courses.program_type`, `courses.subcategory_id`, `courses.session_type`, `course_batches.class_mode`, `course_batches.session_type` columns.
- Backfill `category_id` from `SELECT DISTINCT category`.
- `GET /api/categories`, `GET /api/program-types`.
- Extend `validation.js` courseCreate Joi schema.
- Extend `/api/marketplace` + `/api/search` filters.

### Sprint 5 — SEO automation (1 week)
- Add SEO columns to `courses`.
- Auto-generate pipeline on insert + `POST /api/courses/:id/seo/regenerate`.
- `GET /sitemap.xml`, `GET /robots.txt`.
- JSON-LD injection on `/c/<slug>` render.
- Category/subcategory landing pages.

### Sprint 6 — Org APIs + Capabilities migration (1 week)
- Ship full `/api/orgs/*` surface (Section 4).
- Migrate top 10 callsites from `authorizeRole` → `requireCapability`.
- Org invites + transfer + promote-personal.
- Extend `/api/institutions/mine` to join `franchise_branches`.

### Sprint 7 — Certificates (1 week)
- `certificates` + `certificate_templates` tables.
- `POST /api/certificates/issue`, `GET /api/certificates/verify/:token`.
- Seed 5 templates: Completion / Workshop / Sports / Attendance / Participation.
- Replace ephemeral cert at `courses.js:567-615`.

### Sprint 8 — UI unification (1 week)
- Collapse 6 dashboard renderers → 1 (`renderCreatorDash`).
- Collapse 6 HTML sections → 1.
- `CATEGORY_LABELS` dictionary applied.
- Personal Academy badge + promote CTA.
- Org switcher v2.
- Create-course wizard SEO accordion.

### Sprint 9 — Cleanup (3 days)
- Deprecate `authorizeRole` (warning logs).
- Drop unused redundancy after callsite migration.
- Documentation: capability reference, role map.

**Total: 6 weeks** end-to-end.

---

## 11. Migration Plan (legacy → unified)

### Phase 0 — Pre-flight (audit)
- Confirm `migration-s3-i18n.sql` + `migration-s3-ops.sql` are net-new (currently untracked in git status).
- Inventory all FK references to `jeetmantra_users.id` that act as `institution_id` to confirm string-id stability.
- Snapshot row counts: `jeetmantra_users` per `user_type`, `institution_teachers`, `user_roles`.

### Phase 1 — Additive (zero downtime)
1. Apply `migration-s4-unified.sql`:
   - Create `organizations`, `role_assignments`, `capabilities`, `role_capabilities`, `course_categories`, `course_subcategories`, `certificates`, `certificate_templates`, `org_invites`.
   - Add columns: `courses.program_type/subcategory_id/session_type/og_image/og_title/canonical_url/json_ld`, `course_batches.class_mode/session_type`.
2. Backfill:
   - `INSERT INTO organizations(id, name, type, category, owner_id, is_personal) SELECT id, full_name, user_type, COALESCE(category,'general'), id, (user_type IN ('teacher','partner','corporate_trainer','content_creator')) FROM jeetmantra_users WHERE user_type IN (institution_roles);`
   - `INSERT INTO role_assignments(person_id, org_id, role, granted_at) SELECT teacher_id, institution_id, 'teacher', created_at FROM institution_teachers;`
   - Self-rows for personal academies already exist (Sprint 1) — no extra work.
   - Seed `course_categories` from `SELECT DISTINCT category FROM courses` then map each course's `category_id`.
3. Verify counts: `role_assignments` ≥ `institution_teachers` + `user_roles` (deduped).

### Phase 2 — Dual-read (1 sprint window)
- New code uses `role_assignments` + `requireCapability`.
- Legacy code keeps reading `user_type` + `institution_teachers`.
- Triggers keep both sides in sync on writes (or write to both from application code).

### Phase 3 — Cutover
- Switch `authorizeRole` callsites to `requireCapability` (mechanical, 10/week).
- Switch UI to read `GET /api/capabilities/me` instead of `req.user.user_type`.
- Switch `renderXxxDash` family → `renderCreatorDash`.

### Phase 4 — Deprecation
- Stop writing to `institution_teachers` (keep table; reads now from `role_assignments`).
- Log warnings on `authorizeRole` calls.
- After 2 sprints clean, remove `authorizeRole` and drop `institution_teachers.subject` (data lives in `role_assignments.scope`).

### Rollback
- Each phase is independently revertable: Phase 1 is additive (drop new tables/columns), Phase 2 dual-write is idempotent, Phase 3 callsite migration is per-route (revert PR-by-PR).

### Risk register
- **String-id stability** — `organizations.id = jeetmantra_users.id` preserves every existing FK; do NOT regenerate.
- **Franchise gap** — fixing `identity.js:21-24` triggers backfill for existing franchise users; idempotent insert handles re-runs.
- **Category free-text drift** — long tail of `SELECT DISTINCT category` may contain typos; manual review of top 50 before seeding.

---

## 12. Completion Percentage

Per area (existing implementation vs. unified target):

| Area | % done | Evidence |
|---|---|---|
| Identity (multi-role union) | **85%** | Sprint 1 shipped; `authorizeRole` still string-compare |
| Personal Academy backend | **90%** | Works for 6/7 creator roles; franchise excluded (`identity.js:21-24`) |
| Personal Academy UI | **10%** | No badge, no promote CTA, no nudge in `openMyInstitutions` |
| Org model (`organizations` table) | **15%** | Org = user row; no transfer, no metadata, no multi-org-per-owner |
| Role assignments + scoping | **20%** | `user_roles.institution_id` column exists but unread at authz |
| Capability system | **0%** | Pure role-name compare |
| 9-level org roles (Owner/Admin/.../Viewer) | **30%** | 5 of 9 roles modeled; Assistant Teacher / Coach / Trainer / Viewer absent |
| Org switcher | **70%** | Works; lacks franchise-branch join + category filters |
| Categories (taxonomy) | **5%** | Free-text VARCHAR; no subcategories; no table |
| Program types | **5%** | Only `category` + `level`; no `program_type` |
| Delivery modes | **35%** | `class_mode` enum covers online/offline/hybrid; missing live/recorded/self-paced/mentorship/group/1:1 |
| Batches | **75%** | `course_batches` solid; missing per-batch `mode` |
| SEO automation | **25%** | slug + meta_description + keywords default; no OG / JSON-LD / sitemap / canonical / robots / wizard fields |
| Certificates | **15%** | Single hard-coded template, ephemeral, no verify, no types |
| Marketplace filters | **30%** | category + level only; no program_type/delivery_mode/radius |
| Dashboard UI deduplication | **20%** | `renderCreatorBlock` proves the pattern; 6 sections still duplicated |
| NAV unification | **30%** | Data-driven but per-role tables are ~80% identical |
| Permissions middleware | **40%** | `authorizeRole` exists; no `requireCapability` |
| Migrations baseline | **80%** | s2 identity shipped; s3 i18n + s3 ops staged but untracked |

### Headline

- **Backend identity + multi-role:** 75%
- **Org + capability model:** 18%
- **Programs + categories + SEO:** 17%
- **UI unification:** 22%

**Overall completion against the unified vision: ~32%.**

The good news: the highest-leverage primitive (multi-role identity + personal-institute auto-provision + `X-Active-Institution`) is already in production. The remaining 68% is mostly additive tables, a capability layer, and one big UI consolidation pass — all sequenced as 6 sprints in Section 10 with no breaking changes.
