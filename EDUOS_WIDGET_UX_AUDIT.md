# EduOS Master UI/UX Validation + Dynamic Widget Architecture

_Grounded in the live frontend (`dashboard.html` ~9,600 lines, `admin-os.html`, `studio.html`, `exam-platform.html`, `marketplace.html`) and the 380-endpoint API in `API_INVENTORY_VERIFIED.md`. Analysis + architecture — staged build, not a single edit._

---

## 0. Architectural verdict (the one finding everything hangs on)

`dashboard.html:2060` is the whole problem in one place:

```js
if(role==='student'){renderStudentDash(d); loadNotes(); loadStudentHistory(); loadWall(); ...}
else if(role==='teacher'){renderTeacherDash(d); loadTeacherWall();}
else if(role==='partner')renderPartnerDash(d);
else if(role==='school'){renderSchoolDash(d); ...}
... 9 branches, 9 monolithic render functions
```

This is **role-branched monolithic rendering**, not widgets. Consequences:
- A new role = a new 200-line `renderXDash` (the 11th role has nowhere to go).
- A widget (e.g. "Revenue") is re-implemented inside every dash that shows it → drift.
- No admin config, no personalization, no AI-driven composition are possible — there's no unit to show/hide/reorder.
- Multi-role users can't see a blended dashboard (the `if/else` picks exactly one).

**The fix is a Widget Registry + a composition engine** that replaces all 9 `renderXDash` functions with one `renderDashboard(context)` that resolves a widget list from role + permissions + org + AI, then renders each widget from a shared library. Everything in this prompt (admin config, personalization, AI rendering, command palette) becomes trivial once the unit of composition is a widget.

**Backend is ready for this** — `GET /api/me/contexts` already returns `{ roles, capabilities, activeOrgId, locale }` in one call (Phase A). That payload is exactly the widget-resolution input.

---

## 1. The Widget Contract (manifest-driven)

Every widget is a manifest + a render function. No widget reads `role` directly — the engine decides visibility; the widget just renders its data.

```js
// widget manifest (the §"WIDGET SPECIFICATION" fields, made concrete)
{
  id: 'revenue',
  title: 'Revenue',
  description: 'Earnings this period with trend',
  roles: ['teacher','coaching','school','institute_owner','franchise','admin'],
  capability: 'payment.read',          // engine hides if caps lacks this
  category: 'finance',                  // finance|teaching|learning|ops|ai|social
  size: 'medium',                       // small|medium|large|full
  priority: 40,                         // default sort weight
  defaultPosition: { col: 2, row: 1 },
  types: ['chart','card'],
  dataSource: '/api/teacher/payments',  // real endpoint
  refresh: 300,                         // seconds; 0 = on-demand
  aiTriggers: ['show revenue','earnings','income'],
  responsive: { mobile:'card', tablet:'chart', desktop:'chart' },
  actions: [{ label:'View payouts', href:'#payouts' }],
  render: (el, data, ctx) => { /* pure render */ }
}
```

**Resolution order (the engine):**
1. Start with all widgets whose `roles` intersect `ctx.roles`.
2. Drop any whose `capability` is not in `ctx.capabilities`.
3. Drop any disabled by **admin config** for the active org (`org.settings.widgets`).
4. Merge **user personalization** (added/removed/pinned/reordered/resized).
5. Apply **AI/context boosts** (time-of-day, upcoming schedule, weak topics) to `priority`.
6. Sort by priority, lay out by `size` into the responsive grid.

---

## 2. Universal Widget Library (21 widgets → real endpoints)

Each maps to APIs that **already exist** — this is composition, not new backend.

| Widget | Roles | Capability | Data source (live) | Size |
|---|---|---|---|---|
| Continue Learning | student | — | `/api/student/continue-learning` | medium |
| Upcoming Classes | all | — | `/api/calendar?view=upcoming` | medium |
| Today's Schedule | teacher,coach,student | — | `/api/calendar?from=today` | large |
| Assignments Due | student | — | `/api/assignments/my` | small |
| Pending Evaluation | teacher,coach | assignment.grade | `/api/teacher/essays/pending` | small |
| Learning Streak | student | — | `/api/gamification/streak` | small |
| Leaderboard | student,teacher | — | `/api/gamification/summary` | medium |
| AI Tutor / Copilot | all | — | `/api/ai/tutor` | interactive |
| AI Lesson Planner | teacher,coach | — | `/api/ai/lesson-plan` | medium |
| Recommended Courses | student,guest | — | `/api/marketplace/trending` | carousel |
| Revenue | teacher,school,owner,franchise | payment.read | `/api/teacher/payments` · `/api/admin/payments` | chart |
| Attendance Pending | teacher,coach | attendance.mark | `/api/teacher/attendance/roster/:id` | small |
| Weak Students | teacher,coach,school | analytics.read | `/api/courses/:id/analytics` | table |
| Course Analytics | teacher,school | analytics.read | `/api/courses/:id/analytics` | chart |
| Live Class | teacher,student | — | `/api/live-classes/upcoming` | medium |
| Booking (court/slot) | coach,owner,sports | booking.manage | `/api/resources/:id/slots` | calendar |
| Certificates | student,teacher | certificate.issue | `/api/certificates/my` | list |
| Notifications | all | — | `/api/notifications/unread` | feed |
| Messages | all | — | `/api/chat/unread` | feed |
| Timetable | school,coaching | live.schedule | `/api/timetable/templates` | table |
| Quick Actions | all | (context) | n/a (client) | small |

**The library is role-agnostic** — "Revenue" is defined once and appears in teacher / school / owner / franchise / admin dashboards by manifest, killing the drift across the 9 current `renderXDash` copies.

---

## 3. Per-screen scorecard

Scores /10. The 14 output dimensions per screen, condensed. Files: all in `public/`.

### Student Dashboard (`renderStudentDash`)
- **UX 7 · UI 7 · Nav 6 · Responsive 7 · A11y 5**
- Missing actions: one-tap "resume" is present; missing "ask AI about this course" inline.
- Missing widgets: Leaderboard, Certificates, Recommended (trending) as cards.
- Duplicate menus: streak/XP shown in topbar AND dash — consolidate to one widget.
- Recommended widgets: Continue Learning, Today's Schedule, Assignments Due, Streak, AI Tutor, Recommended (matches the prompt's target list).
- Workflow: enrolled→learn→certificate journey not surfaced as a path (see Gap Analysis §6).
- **Priority: P1** (highest-traffic role).

### Teacher Dashboard (`renderTeacherDash`)
- **UX 7 · UI 7 · Nav 6 · Responsive 6 · A11y 5**
- Missing widgets: Pending Evaluation, AI Lesson Planner, Attendance Pending as first-class cards (data exists, not surfaced).
- Missing actions: "start next class" CTA from the schedule widget.
- **Priority: P1**.

### Coach / Trainer / Guest Faculty
- **No dedicated dash** — they fall through to teacher or a generic branch. The 11-role target needs them, but they are teacher-tier-by-category (per role audit), so they should get the **teacher widget set filtered by org category** + a Booking widget. **Priority: P1** (blocked on the widget engine).

### Institute Owner / School Admin / Coaching (`renderSchoolDash`,`renderCoachingDash`)
- **UX 6 · UI 7 · Nav 5 · Responsive 6 · A11y 5**
- Duplicate: school & coaching dashes are near-identical code — collapse to one org-admin widget set.
- Missing widgets: Timetable, Admissions, Fees, Revenue rollup, Attendance org-wide.
- **Priority: P1**.

### Parent (`renderParentDash`)
- **UX 5 · UI 6 · Nav 5 · Responsive 6 · A11y 5**
- Thinnest dash. Missing: multi-child switcher, fee status, attendance alerts, report card (endpoints exist: `/api/parent/*`, `/api/eduos/report-card`).
- **Priority: P1** (P0 for Schools).

### Partner / Franchise (`renderPartnerDash`,`renderFranchiseDash`)
- **UX 6 · UI 6 · Nav 5 · Responsive 6 · A11y 4**
- Missing widgets: network revenue, per-branch KPIs (franchise endpoints exist).
- **Priority: P2**.

### Admin Platform OS (`admin-os.html`)
- **UX 8 · UI 8 · Nav 7 · Responsive 7 · A11y 6** — best-structured surface (10 live sections).
- Missing: 4 coming-soon sections (Growth, Automations, AI&Translations, Franchise); admin **widget-config UI** (to drive §"ADMIN CONFIGURABLE DASHBOARD").
- **Priority: P2** for sections; **P1** for the config UI (it unlocks the whole prompt).

### Studio (`studio.html`)
- **UX 7 · UI 8 · Nav 6 · Responsive 6 · A11y 5**
- Now has backend persistence (Phase D) — wire save/load/publish UI to `/api/studio/scenes`.
- **Priority: P2**.

### Marketplace (`marketplace.html`)
- **UX 6 · UI 7 · Nav 6 · Responsive 7 · A11y 5**
- Missing: faceted filter rail (backend `/api/marketplace/facets` shipped, UI not wired), trending row, map view for offline, SEO meta injection.
- **Priority: P0** (revenue pillar).

### Exam Platform (`exam-platform.html`)
- **UX 7 · UI 7 · Nav 6 · Responsive 6 · A11y 5** — solid; add proctor-status widget + resume.
- **Priority: P2**.

---

## 4. Navigation validation

| Issue | Where | Action |
|---|---|---|
| **Duplicate** streak/XP (topbar + dash) | dashboard.html | one Streak widget |
| **Duplicate** school vs coaching nav | renderSchool/Coaching | one org-admin nav |
| **Dead** placeholder sections | admin-os (4 left) | wire or hide |
| **Missing** org switcher | all | wire `/api/me/contexts` to a top-bar switcher |
| **Missing** Coach/Trainer/Guest menus | dashboard.html | widget engine + category labels |
| **Too deep** course→topic→lecture→content | reader | breadcrumb + journey map |
| Command palette (Ctrl+K) exists | dashboard (139 markers) | extend to widgets + entities (`/api/search/all`) |
| Voice nav exists | dashboard | route to AI intent→widget map (§6) |

---

## 5. Responsive validation matrix

Current: 14 `@media` breakpoints (420–2200px) — good phone/tablet/desktop coverage, but **no true smartboard/TV tier** and ultrawide only widens, doesn't re-layout.

| Form factor | State | Fix |
|---|---|---|
| Mobile portrait (≤420) | ✅ covered | — |
| Mobile landscape | ⚠️ partial | test 640×360 |
| Tablet portrait/landscape | ✅ 768/900 | — |
| Desktop | ✅ | — |
| Ultrawide (≥2000) | ⚠️ scales, no re-flow | widget grid → more columns, not wider cards |
| **Smartboard (large touch)** | ❌ | ≥1600 + coarse-pointer: bigger touch targets, 2-col widgets |
| **TV (10-ft UI)** | ❌ | focus-nav, oversized type, no hover-only controls |

The **widget grid solves most of this for free**: widgets declare `responsive` per breakpoint and the engine re-lays-out by column count instead of every screen hand-coding media queries.

---

## 6. AI Copilot + Command Palette: intent → widget

The voice/cmdk plumbing exists; it needs an **intent→widget map** (the manifest `aiTriggers` field is the registry):

| User says | Intent | Engine action |
|---|---|---|
| "show revenue" | render-widget | inject Revenue widget (cap-checked) |
| "show weak students" | render-widget | Weak Students table |
| "today's classes" | render-widget | Today's Schedule |
| "create course" | execute | open course-create (POST `/api/courses`) |
| "schedule class" | execute | live-class modal |
| "generate test" | execute | `/api/ai/practice-questions` → test builder |
| "open calendar" | navigate | Calendar view |

Resolution: match phrase against every manifest's `aiTriggers`; if a widget matches → inject it transiently (and offer "pin"); if an action verb → run the bound handler. One map, fed by the same registry.

---

## 7. Personalization & Admin config (both fall out of the registry)

- **User**: add/remove/pin/reorder/resize/favorite/workspace → persist a per-user `widget_prefs` (small table; mirrors `last_active_org_id` pattern). Engine merges in step 4.
- **Admin**: per-role widget visibility/order/size/availability → store under `organizations.settings.widgets[role]` (the `settings` jsonb column **already shipped in s9**). Engine applies in step 3. Admin config UI lives in admin-os System/Settings.

No new infrastructure — both read/write columns that exist.

---

## 8. Accessibility & Motion (cross-cutting, P1)

- **A11y gaps** (scores 4–6 across the board): inconsistent `aria-label`s on icon buttons, focus traps in modals not always present, no high-contrast or RTL toggle (RTL matters for the Hindi/Urdu i18n already shipped). Per-widget a11y is enforceable once widgets are a contract (require `aria` in the manifest).
- **Motion**: skeletons exist in places; standardize one skeleton component per widget `size`, 150–200ms card transitions, respect `prefers-reduced-motion` (already in some CSS). Avoid layout-shift on widget load (reserve height from `size`).

---

## 9. Roadmap (recursive — re-audit after each)

| Wave | Build | Unlocks |
|---|---|---|
| **W1 — Widget engine** (P0) | `widget-registry.js` (manifest + resolver), `renderDashboard(ctx)` consuming `/api/me/contexts`; port Student + Teacher dashes to widgets as the proof | Kills the 9-way switch; everything below |
| **W2 — Library** (P0) | Implement the 21 widgets against existing endpoints; one skeleton per size | Reuse, no drift |
| **W3 — Config + personalize** (P1) | Admin widget-config UI (→`org.settings.widgets`); user add/remove/pin (→`widget_prefs`) | The prompt's config/personalization pillars |
| **W4 — AI + palette** (P1) | intent→widget map; extend Ctrl+K to widgets + `/api/search/all` | AI-driven rendering |
| **W5 — Responsive + a11y + motion** (P1) | smartboard/TV tiers via grid; a11y contract; standardized motion; marketplace facet rail + SEO meta | Polish + the revenue pillar |

**Coach/Trainer/Guest Faculty + Parent + multi-role blended dashboards all appear for free once W1 lands** — they're just different widget resolutions of the same engine, no new `renderXDash`.

---

## 10. Output summary (the 14 dimensions, rolled up)

| Screen | UX | UI | Nav | Resp | A11y | Top missing widget | Priority |
|---|---|---|---|---|---|---|---|
| Student | 7 | 7 | 6 | 7 | 5 | Leaderboard, Certificates | P1 |
| Teacher | 7 | 7 | 6 | 6 | 5 | Pending Eval, AI Planner | P1 |
| Coach/Trainer/Guest | — | — | — | — | — | (no dash — needs engine) | P1 |
| Org Admin (school/coaching) | 6 | 7 | 5 | 6 | 5 | Timetable, Fees, Revenue | P1 |
| Parent | 5 | 6 | 5 | 6 | 5 | Multi-child, Fees, Report card | P1 |
| Partner/Franchise | 6 | 6 | 5 | 6 | 4 | Network revenue | P2 |
| Admin OS | 8 | 8 | 7 | 7 | 6 | Widget-config UI | P1/P2 |
| Studio | 7 | 8 | 6 | 6 | 5 | Save/Publish UI | P2 |
| Marketplace | 6 | 7 | 6 | 7 | 5 | Facet rail, trending | P0 |
| Exam | 7 | 7 | 6 | 6 | 5 | Proctor status | P2 |

**Single highest-leverage move:** build W1 (the widget engine) and port the Student + Teacher dashboards to it. That one change makes admin-config, personalization, AI-rendering, the 3 missing roles, and responsive re-layout all reachable — none are reachable today.
