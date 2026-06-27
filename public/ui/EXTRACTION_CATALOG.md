# UI Extraction Catalog

> Live status of every screen / dashboard renderer / inline panel in the codebase. ✅ extracted to `/ui/screens/`. ⏳ still inline in `dashboard.html`. — = not applicable / planned.

## Foundation (this turn)

| Layer | Files | Status |
|---|---|---|
| Atoms | Button · Card · KPI · Row · Badge · EmptyState · Avatar · SectionHeader · ModalShell · Tabs | ✅ 10 / 10 |
| Molecules | KPIGrid · ListSection · ActionToolbar | ✅ 3 / 3 |
| Registry | `JM.Screens` (register, open, action, handle) | ✅ |
| Loader | `/ui/_boot.js` injects atoms → molecules → screens in order | ✅ |
| MVC | Models / Controllers folders + first wirings | ✅ |

## Screens extracted (Wave 1)

| # | Screen | File | Model | Notes |
|---|---|---|---|---|
| 1 | Help & Support | `/ui/screens/Help.js` | — (static) | FAQ accordion + Ask-AI + Email CTAs |
| 2 | My Wallet | `/ui/screens/Wallet.js` | `Wallet.js` | KPIs + add-money toolbar + tx list |
| 3 | My Certificates | `/ui/screens/Certificates.js` | `Certificates.js` | Rows with verify links |
| 4 | Widget Management (admin) | `/ui/screens/WidgetAdmin.js` | `WidgetAdmin.js` | Widget × role matrix |

## Screens to extract next (priority order)

### Wave 2 — read-only data screens
- [ ] Analytics — `openAnalyticsPage()` → `/ui/screens/Analytics.js` + model
- [ ] My Students — `openMyStudentsPage()` → `/ui/screens/MyStudents.js` + model
- [ ] Bookings — `openBookings()` → `/ui/screens/Bookings.js` + model
- [ ] Recordings — `openRecordings()` → `/ui/screens/Recordings.js`
- [ ] Attendance Report — `openAttendanceReport()` → `/ui/screens/AttendanceReport.js`
- [ ] Calendar — `openCalendar()` → `/ui/screens/Calendar.js`
- [ ] My Results — `openMyExternalResults()` → `/ui/screens/MyResults.js`
- [ ] Notes — `openNotes()` → `/ui/screens/Notes.js`
- [ ] Downloads — `openDownloads()` → `/ui/screens/Downloads.js`

### Wave 3 — money & admin screens (need controllers)
- [ ] Billing — `openBilling()` + invoice CRUD controller
- [ ] Coupons — `openCoupons()` + coupon create/delete controller
- [ ] Plans — `openPlans()`
- [ ] Payments — `openPayments()`
- [ ] Payouts — `openPayouts()`
- [ ] EduOS Admin — `openEduOS()`
- [ ] My Institutions — `openMyInstitutions()`
- [ ] Profile — `openProfilePage()`
- [ ] Settings (in-shell) — already in /app#/m/settings (no extraction needed)

### Wave 4 — interactive panels
- [ ] Course Hub — `openCourseHub()` (largest screen; needs tab molecule)
- [ ] Course Students — `openCourseStudents()`
- [ ] Edit Course — `openEditCourse()`
- [ ] Course Chat — `openCourseChat()`
- [ ] Messenger — `openMessenger()` (already drawer-based; convert later)
- [ ] AI Tutor — `openAiTutor()`
- [ ] Lesson Planner — `openLessonPlanner()`
- [ ] Essay Inbox — `openEssayInbox()`
- [ ] Grade Submission — `openGradeSubmission()`
- [ ] Live Roster — `openLiveRoster()`
- [ ] Forum Thread — `openForumThread()`
- [ ] Gamification Panel — `openGamificationPanel()`
- [ ] CSV Import — `openCsvImport()`
- [ ] CRM Config — `openCRMConfig()`
- [ ] AI Key — `openAiKey()`
- [ ] Lang Picker — `openLangPicker()`
- [ ] Cmd-K — `openCmdK()`
- [ ] Submit Assignment — `openSubmitAssignment()`
- [ ] Take Exam — `openTakeExam()` (currently iframe to exam-platform.html)
- [ ] Bookings (open*) — `openBookingDetail()`, `openConfigure()`
- [ ] Tests — `openTests()`
- [ ] CertificateView — `openCertificate(courseId)` (single-cert view; separate from Certificates list)
- [ ] DM — `openDmWith()`
- [ ] Wallet variant — `openWalletPanel()` (deprecated; replaced by Wave 1 Wallet)

### Wave 5 — dashboard role-renderers (need bigger refactor)
- [ ] renderStudentDash → /ui/screens/StudentDash.js (composes widgets)
- [ ] renderTeacherDash → /ui/screens/TeacherDash.js
- [ ] renderPartnerDash → /ui/screens/PartnerDash.js
- [ ] renderAdminDash → /ui/screens/AdminDash.js
- [ ] renderSchoolDash → /ui/screens/SchoolDash.js
- [ ] renderCoachingDash → /ui/screens/CoachingDash.js
- [ ] renderParentDash → /ui/screens/ParentDash.js
- [ ] renderCorporateTrainerDash → /ui/screens/CorporateTrainerDash.js
- [ ] renderContentCreatorDash → /ui/screens/ContentCreatorDash.js
- [ ] renderFranchiseDash → /ui/screens/FranchiseDash.js
- [ ] renderCreatorBlock → /ui/screens/CreatorBlock.js (shared partial)
- [ ] renderContinueLearning → can be a widget already
- [ ] renderNextClassHeader → atom/molecule for the hero strip
- [ ] renderGreeting → atom (already simple)
- [ ] renderProfile → /ui/screens/Profile.js
- [ ] renderEduOSTab → folded into EduOS screen
- [ ] renderChat → folded into Messenger
- [ ] renderCmdK → folded into CmdK
- [ ] renderAttGrid → folded into AttendanceReport

## Progress

| Metric | Now | Target |
|---|---|---|
| Atoms | 10 / 10 | 10 |
| Molecules | 3 / 3 | 3+ |
| Screens extracted | **4** | ~60 |
| Coverage | **~7%** | 100% |

## Pattern (so the next session is mechanical)

```js
// /ui/models/<Name>.js
JM.Models.<Name> = { fetch: async ctx => api(...) };

// /ui/controllers/<Name>.js (optional)
JM.Controllers.<Name> = { someAction: () => {...} };
JM.Screens.handle('<screen>.<action>', JM.Controllers.<Name>.someAction);

// /ui/screens/<Name>.js
JM.Screens.register({
  id: '<screen>',
  title: '...',
  model: JM.Models.<Name>,
  render: (data, ctx) => JM.ModalShell({
    body: JM.KPIGrid([...])
        + JM.ListSection({ items, empty: { cta: {...} } }),
    footer: JM.ActionToolbar({ max: 3, actions: [...] })
  })
});

// Then in /ui/_boot.js add '<Name>' to SCREENS = [...].
```

Each extracted screen = ~30 lines of view + 5 lines of model + 0–10 lines of controller. The bulk of the time is the inline screen audit (read 50 lines of `dashboard.html`, identify the data + atoms, write the manifest, verify).
