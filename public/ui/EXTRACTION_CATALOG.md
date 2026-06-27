# UI Extraction Catalog

> Live status of every screen / dashboard renderer / inline panel in the codebase. ✅ extracted to `/ui/screens/`. ⏳ still inline in `dashboard.html`. — = not applicable / planned.

## Surfaces

The dashboard has TWO surface types — the registry now supports both:

| Surface | When | Engine | Atom/Molecule |
|---|---|---|---|
| `surface: 'modal'` (default) | Short contextual screens | `showModal()` → `#jm-generic-modal` | `JM.ModalShell` |
| `surface: 'takeover'` | Full-screen with own breadcrumb | `#bookingsPage.active` | `JM.TakeoverPage` |

## Foundation

| Layer | Files | Status |
|---|---|---|
| Atoms | Button · Card · KPI · Row · Badge · EmptyState · Avatar · SectionHeader · ModalShell · Tabs | ✅ 10/10 |
| Molecules | KPIGrid · ListSection · ActionToolbar · **TakeoverPage** | ✅ 4/4 |
| Registry | `JM.Screens.register({surface, model, render})` — modal + takeover modes | ✅ |
| Loader | `/ui/_boot.js?v=N` injects all layers; cache-buster pinned to `?v=N` per release | ✅ |

## Screens extracted (11 total)

### Wave 1 — modal
| # | Screen | File | Model |
|---|---|---|---|
| 1 | Help & Support | `Help.js` | — (static) |
| 2 | My Certificates | `Certificates.js` | `Certificates.js` |
| 3 | Widget Management (admin) | `WidgetAdmin.js` | `WidgetAdmin.js` |

### Wave 2 — modal
| # | Screen | File | Model |
|---|---|---|---|
| 4 | Analytics | `Analytics.js` | `Analytics.js` |
| 5 | My Students | `MyStudents.js` | `MyStudents.js` |
| 6 | Offline Downloads | `Downloads.js` | `Downloads.js` |

### Wave 3 — takeover-page
| # | Screen | File | Model |
|---|---|---|---|
| 7 | My Wallet | `Wallet.js` (rewritten as takeover) | `Wallet.js` |
| 8 | Class Recordings | `Recordings.js` | `Recordings.js` |
| 9 | Attendance Report | `AttendanceReport.js` | `AttendanceReport.js` |

### Wave 4 — modal (in progress)
| # | Screen | File | Model | Notes |
|---|---|---|---|---|
| 10 | Your Progress (gamification) | `Gamification.js` | `Gamification.js` | Streak / XP / badges; 3 concurrent fetches |
| 11 | (next) Help (existing wave 1) | | | |

## Queued — Wave 4 cont. (modal screens)
- `openMyExternalResults()` (33 lines) — custom modal (own DOM), needs route through showModal or kept custom
- `openAiKey()` (22 lines) — AI key entry form
- `openLangPicker()` (29 lines) — language picker, custom modal styling (skip or rebuild)
- `openCertificate(courseId)` (7 lines) — single-cert view (different from list)
- `openCsvImport()` (8 lines), `openCmdK()` (5 lines) — already thin wrappers, lower value

## Queued — Wave 5 (takeover-page screens)
- `openBookings()` / `openPayments()` — via `_openMoneyPage(kind)` (handles many "kind" types: bookings/payments/payouts/coupons/plans/billing). Needs unified extraction.
- `openCalendar()` — depends on `_renderCalendar` with `_calRef`/`_calView` state — complex.
- `openEssayInbox()`, `openTestAnalytics(id, title)` — takeover-page subsystems
- `openConfigure(courseId)` — heavyweight teacher tool

## Queued — Wave 6 (interactive panels & drawers, custom modals)
- `openMessenger()` — drawer-based
- `openAiTutor()`, `openLessonPlanner()`
- `openCourseHub()`, `openCourseStudents()`, `openEditCourse()`
- `openGradeSubmission()`, `openSubmitAssignment()`
- `openCRMConfig()` (207 lines — significant)
- `openForumThread()`, `openCourseChat()`, `openDmWith()`
- `openLiveRoster()`, `openBookingDetail()`

## Queued — Wave 7 (role dashboard renderers)
- `renderStudentDash`, `renderTeacherDash`, `renderPartnerDash`,
  `renderAdminDash`, `renderSchoolDash`, `renderCoachingDash`,
  `renderParentDash`, `renderCorporateTrainerDash`,
  `renderContentCreatorDash`, `renderFranchiseDash`,
  `renderCreatorBlock`, `renderContinueLearning`,
  `renderNextClassHeader`, `renderGreeting`, `renderProfile`, `renderEduOSTab`

## Progress

| Metric | Wave 1 | Wave 2 | Wave 3 | Wave 4 (now) | Target |
|---|---|---|---|---|---|
| Atoms | 10 | 10 | 10 | 10 | 10 |
| Molecules | 3 | 3 | **4** | 4 | 4-6 |
| Models | 3 | 6 | 8 | **9** | ~25 |
| Controllers | 1 | 1 | 1 | 1 | ~10-15 |
| Screens extracted | 4 | 7 | 10 | **11** | ~60 |
| Inline `open*()` collapsed | 3 | 6 | 9 | **10** | ~50 |
| Coverage | ~7% | ~12% | ~17% | **~18%** | 100% |

## Lessons learned (each wave)

1. **Cache-buster discipline.** Bump _boot.js AND the inject `?v=N` in lockstep — old screen files served from cache produced silent registration mismatch (W3).
2. **Two surface kinds.** Original assumption "everything is modal" was wrong; introduced `TakeoverPage` molecule + `surface:'takeover'` flag (W3).
3. **Atoms own their display.** Don't pre-render HTML inside data passed to `JM.KPI` — atom escapes it. Pass raw values (W3 wallet refcode bug).
4. **Back-compat via delegators.** Keep the old `openXyz()` function name as a one-line shim; every onclick=, hash route, and external caller stays valid.

## Path to "fully completed"

The remaining ~50 screens fall into three groups by effort:

| Group | Count | Effort each | Approach |
|---|---|---|---|
| Simple modals/takeovers | ~20 | ~5-7 min | Same Wave 2/3 pattern; batch 3-5 per turn |
| Complex modals (state-heavy) | ~15 | ~15-25 min | Need a controller layer for interaction state |
| Role dashboards | ~10 | ~30+ min | Re-architecting into widget composition |

The mechanical pattern is now proven and reproducible. Full completion is incremental — each future wave commits independently and back-compat preserves every old call site.
