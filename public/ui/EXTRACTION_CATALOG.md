# UI Extraction Catalog

> Live status of every screen / dashboard renderer / inline panel in the codebase. ✅ extracted to `/ui/screens/`. ⏳ still inline in `dashboard.html`. — = not applicable / planned.

## Surface types (architecture finding)

After Wave 1+2, we discovered the dashboard has **two surface types**:

1. **Modal** — `showModal(title, html)` — short, contextual; `JM.ModalShell` fits perfectly.
2. **Takeover-page** — `document.getElementById('bookingsPage').classList.add('active')` — full-screen with own breadcrumb; reuses the `bookingsPage` (or `calendarPage`, `configurePage`) DOM element.

The MVC layered system supports modals today. The takeover-page molecule
(`JM.TakeoverPage`) is queued for Wave 3 so screens like Wallet, Bookings,
Calendar, Recordings can extract without changing UX.

## Foundation

| Layer | Files | Status |
|---|---|---|
| Atoms | Button · Card · KPI · Row · Badge · EmptyState · Avatar · SectionHeader · ModalShell · Tabs | ✅ 10 / 10 |
| Molecules | KPIGrid · ListSection · ActionToolbar | ✅ 3 / 3 (TakeoverPage queued) |
| Registry | `JM.Screens` (register, open, action, handle) | ✅ |
| Loader | `/ui/_boot.js` injects atoms → molecules → models → controllers → screens | ✅ |

## Screens extracted

### Wave 1 — modal screens
| # | Screen | File | Model | Notes |
|---|---|---|---|---|
| 1 | Help & Support | `/ui/screens/Help.js` | — (static) | FAQ accordion + Ask-AI + Email CTAs |
| 2 | My Wallet | `/ui/screens/Wallet.js` | `Wallet.js` | ⚠️ Modal version. Live `openWallet` is a takeover-page; alternative modal view via `JM.Screens.open('wallet')`. |
| 3 | My Certificates | `/ui/screens/Certificates.js` | `Certificates.js` | Rows with verify links |
| 4 | Widget Management (admin) | `/ui/screens/WidgetAdmin.js` | `WidgetAdmin.js` | Widget × role matrix |

### Wave 2 — modal screens (this turn)
| # | Screen | File | Model | Inline replaced? |
|---|---|---|---|---|
| 5 | Analytics | `/ui/screens/Analytics.js` | `Analytics.js` | ✅ `openAnalyticsPage` → delegator |
| 6 | My Students | `/ui/screens/MyStudents.js` | `MyStudents.js` | ✅ `openMyStudentsPage` → delegator |
| 7 | Offline Downloads | `/ui/screens/Downloads.js` | `Downloads.js` | ✅ `openDownloads` → delegator |

## Queued — Wave 3 (takeover-page screens; need `JM.TakeoverPage` molecule)
- `openWallet()` — replaces `bookingsPage` DOM with wallet view
- `openBookings()` / `openPayments()` (use `_openMoneyPage`)
- `openRecordings()` — bookings-page based
- `openAttendanceReport()` — bookings-page based
- `openCalendar()` — uses `calendarPage`

## Queued — Wave 4 (interactive panels, custom modals)
- `openMyExternalResults()` — custom DOM (own modal)
- `openMessenger()` — drawer-based
- `openAiTutor()`, `openLessonPlanner()`, `openEssayInbox()`
- `openCourseHub()`, `openCourseStudents()`, `openEditCourse()`
- `openGradeSubmission()`, `openSubmitAssignment()`
- `openGamificationPanel()`, `openLangPicker()`, `openCmdK()`
- `openCsvImport()`, `openCRMConfig()`, `openAiKey()`
- `openForumThread()`, `openCourseChat()`, `openDmWith()`
- `openLiveRoster()`, `openBookingDetail()`, `openConfigure()`
- `openCertificate(courseId)` — single-cert view (different from list)

## Queued — Wave 5 (role dashboard renderers)
- `renderStudentDash`, `renderTeacherDash`, `renderPartnerDash`,
  `renderAdminDash`, `renderSchoolDash`, `renderCoachingDash`,
  `renderParentDash`, `renderCorporateTrainerDash`,
  `renderContentCreatorDash`, `renderFranchiseDash`
- `renderCreatorBlock` (shared partial)
- `renderContinueLearning`, `renderNextClassHeader`, `renderGreeting`,
  `renderProfile`, `renderEduOSTab`

## Progress

| Metric | Wave 1 | Wave 2 | Target |
|---|---|---|---|
| Atoms | 10 | 10 | 10 |
| Molecules | 3 | 3 (+TakeoverPage queued) | 4+ |
| Models | 3 | **6** | ~25 |
| Controllers | 1 | 1 | ~15 |
| Screens extracted | 4 | **7** | ~60 |
| Inline open* replaced with delegators | 3 | **6** | ~50 |
| Coverage | ~7% | **~12%** | 100% |

## The mechanical pattern (proven 2 waves)

```js
// /ui/models/<Name>.js
JM.Models.<Name> = { fetch: async ctx => { ... } };

// /ui/screens/<Name>.js  ← view is pure composition
JM.Screens.register({
  id: '<id>', title, model: JM.Models.<Name>,
  render: data => JM.ModalShell({ body: JM.KPIGrid(...) + JM.ListSection(...) })
});

// /ui/_boot.js  → add to MODELS + SCREENS arrays
// dashboard.html → inline body becomes one-line delegator to JM.Screens.open('<id>')
```

Each extraction is **~30 lines new** + **30-50 lines removed** from `dashboard.html`. Net: smaller, layered, testable.
