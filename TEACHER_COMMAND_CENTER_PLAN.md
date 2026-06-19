# Teacher Command Center — Redesign Deliverable

A complete redesign of the JeetMantra teacher dashboard into a **Teacher Command Center** — a workspace that feels like Notion meets Linear meets Google Classroom meets Zoom meets ClickUp meets Canva, built almost entirely by re-scoping, re-wiring, and consolidating the **existing** ~135-endpoint backend and the existing `dashboard.html` / `studio.html` / `liveRoom.html` / `theme.css` front-ends. The guiding principle throughout: **reuse before rebuild** — nearly every workflow already has a working endpoint; the work is mostly wiring, grouping, and design-system unification, not green-field construction.

---

## 1. Current Issues Found

Issues are grouped by subsystem and tagged with severity from the audit maps. Every item cites a real `file:line` / endpoint.

### 1.1 Command-Center Shell (`#section-teacher`, `renderTeacherDash`)
| # | Issue | Severity | Reference |
|---|-------|----------|-----------|
| 1 | **"Pending" KPI is permanently 0** — `renderTeacherDash` reads `d.pendingAssignments \|\| (d.assignments\|\|[]).filter(a=>!a.graded).length`, but the teacher branch returns neither field, so the chained `\|\|0` always wins. | High | `public/dashboard.html:1897` vs `backend/routes/dashboard.js:111-120` |
| 2 | **"Students" KPI mislabels bookings as enrolled students** — value = `d.bookings.length`, capped at `.limit(10)`; real `d.enrollments` (limit 50) is stashed at `:1879` but never counted into a KPI. | High | `public/dashboard.html:598,1882`; `backend/routes/dashboard.js:83-85` |
| 3 | **Notification unread dot never illuminates** — only code touching `#notifDot` sets `display='none'`; no path reads `r.unread`. | Medium | `public/dashboard.html:489,8220` |
| 4 | **"Earnings" KPI conflates lifetime total with monthly** — `fmt(d.totalEarnings)` is a lifetime sum (`dashboard.js:110`); sub-label says "Total revenue"; no month-scoped figure exists. | Low | `public/dashboard.html:597,1883` |
| 5 | **Recordings overflow CTA renders literal `${recs.length}`** — built with `el.innerHTML+='...View all ${recs.length} recordings...'` inside a **single-quoted** string, so the template placeholder is never interpolated. | Low | `public/dashboard.html:4968` |
| 6 | **No "next class" header element, no AI quick-assistant in the shell** — only an "AI Lesson Plan" quick-action (`:589`); conversational AI is buried in the messenger overlay (`openMessenger 'ai'`, `:5019`). | Medium | `public/dashboard.html:589,5019` |

### 1.2 Course Management
| # | Issue | Severity | Reference |
|---|-------|----------|-----------|
| 7 | **Workspace "Topics" tab badges always empty** — reads nested `t.lectures/t.materials/t.tests`, but `/full` returns flat sibling arrays `{course,topics,lectures,materials,tests}`. Every topic shows "No content yet". | High | `public/dashboard.html:1545-1547` vs `backend/routes/courseContent.js:618` |
| 8 | **Grid "Explore" tree (`_cgTree`) reads keys that don't exist** — `tp.videos/tp.images/tp.quizzes/tp.materials`; every chapter renders "0 items". | High | `public/dashboard.html:1689-1712` |
| 9 | **Duplicate `MODAL_DEFS.addTopic`** — first (`:2400`, richer: cache-invalidation + topics-tab refresh) silently overwritten by the second (`:2504`), which never invalidates `_cgTreeCache` nor refreshes the tab, so new topics may not appear until reload. | Medium | `public/dashboard.html:2400, 2504` |
| 10 | **Flat data model, no Module→Chapter→Topic hierarchy** — single `course_topics` (chapters) plus flat `course_lectures/materials/tests` linked by nullable `topic_id`; no Module/Section grouping table; topics labeled interchangeably "Topic"/"Chapter". | High (structural) | `backend/routes/courseContent.js:618` |
| 11 | **Recordings leak across courses** — Recordings tab filter `rec.course_id===cid \|\| !rec.course_id` shows uncategorized recordings in every course. | Low | `public/dashboard.html:1594` |
| 12 | **Analytics tab is a stub** — Completion / Avg Attendance / Revenue render `—`; only Students count is fetched. | Medium | `public/dashboard.html:1612-1621` |
| 13 | **No audio / whiteboard-recording / AI-summary content type** — material enum is file/image/link/note/pdf only; no save path for these. | Low | `public/dashboard.html:2557`; `backend/routes/courseContent.js:215-224` |

### 1.3 Live Class + Calendar + Recordings
| # | Issue | Severity | Reference |
|---|-------|----------|-----------|
| 14 | **Reschedule uses raw `prompt()`** asking "YYYY-MM-DD HH:MM", parsed with `new Date(when.replace(' ','T'))`; fragile, no picker, duplicated in `_mccReopen`. | Medium | `public/dashboard.html:4018-4025, 4061-4066` |
| 15 | **Two recording endpoints return inconsistent field names** — `/teacher/recordings` (`url/created_at/duration`) vs `/live-classes/recordings/list` (`recording_url/recording_uploaded_at/topic_title`); consumers defensively coalesce, silent `—`/`#` drift. | Medium | `teacherExtras.js:720-744` vs `liveClasses.js:496-527`; consumers `dashboard.html:4961-4966, 5827-5832` |
| 16 | **No "move recording to topic"** — backend accepts `topicId` on upload (`liveClasses.js:484`) but `liveRoom.html:412` FormData never sends it; no-topic recordings stay under "General" forever. | Low | `liveRoom.html:412`; `liveClasses.js:484` |
| 17 | **Recurring series has no group id** — each occurrence is an independent `live_classes` row; no cancel-whole-series / edit-this-and-future; no conflict detection. | Low | `teacherExtras.js:83-112` |
| 18 | **Local calendar items vanish on view switch** — `_calLocal*` meeting/note/reminder appear only in Day + Agenda, not Month/Week. | Low | `public/dashboard.html:8883-8903` |
| 19 | **Create-from-slot only in Day view** — Month/Week cells `onclick=_calOpenDay` (navigate) instead of offering create; Agenda has none. | Low | `public/dashboard.html:8888, 8900` |
| 20 | **`POST /live-classes/:classId/documents` never persists** — returns metadata, no DB insert, no role gate beyond `authenticateToken`; uploads are fire-and-forget. | Low | `liveClasses.js:268-294` |

### 1.4 Smart Studio
| # | Issue | Severity | Reference |
|---|-------|----------|-----------|
| 21 | **Screen-share "ended" leaves dangling references** — handler does `delete sources[id]` but never removes referencing scenes/layers, never calls `renderScenes()`/repaint; affected scenes fall back to "Pick a source". | High | `studio.html:871` |
| 22 | **PDF "Save to course" only saves page 0** — `saveAs==='pdf'` branch encodes `pages[0]` only; `pageCount` is sent but pages 2..N are dropped. | High | `studio.html:2180-2184` |
| 23 | **`wbExportPdf` is not a real PDF export** — opens a window of `<img>` + `window.print()`; silent no-op if popup blocked (`if(!w) return;`), no file if print cancelled. | Medium | `studio.html:2101-2123` |
| 24 | **Recording captures no source/system audio** — `addScreen` uses `audio:false`; recording only adds mic tracks, so screen-shared videos are silent. | Medium | `studio.html:2340-2342, 871` |
| 25 | **`layerUp()` doesn't call `drawLayout()`** — stale z-order/handles in arrange mode until next redraw (`delLayer` does it right). | Low | `studio.html:1002` |
| 26 | **VBG rotation inconsistent** — camera inset ignores rotation/zoom in the non-GL/adjust path (`:2273`) but not the GL path (`:2304`). | Low | `studio.html:2269-2273` vs `2300-2304` |

### 1.5 Students / Tests / Assignments / Analytics
| # | Issue | Severity | Reference |
|---|-------|----------|-----------|
| 27 | **Pending-assignments tile always 0** (same root as #1). | Medium | `dashboard.html:1897`; `dashboard.js:111` |
| 28 | **Per-course Analytics placeholder** (same as #12) — only Students count live. | Medium | `dashboard.html:1612` |
| 29 | **Grading/detail flows use window globals + onclick string interpolation** — brittle, unthemeable. | Low | `dashboard.html:3796` |

### 1.6 Messages / AI / Voice
| # | Issue | Severity | Reference |
|---|-------|----------|-----------|
| 30 | **No way to START a direct message** — `GET /chat/rooms/dm/:userId` works but has zero frontend callers; 1:1 teacher↔student chat is unreachable. | High | `chat.js:73` (no caller in `dashboard.html`) |
| 31 | **No unread-message tracking** — no `last_read` column, no `/chat/unread` endpoint, no badge/preview in `msgrLoadConvos`. | High | `chat.js`; `dashboard.html:5039-5055` |
| 32 | **No real-time messages** — `msgrRenderRoom`/`renderChat` fetch only on open or own-send; no polling/SSE/WS. | Medium | `dashboard.html:5113, 4087` |
| 33 | **DM room name frozen to other user's name at creation** — both participants see the same stored `name: otherUser.full_name`. | Low | `chat.js:92` |
| 34 | **Voice "command execution" is keyword-only** — `VOICE_INTENTS` matches single keywords; "create class tomorrow 10am" only opens the schedule modal, no entity/NLU parsing. | Medium | `dashboard.html:6100-6120` |

### 1.7 Multi-Institute (the most broken subsystem)
| # | Issue | Severity | Reference |
|---|-------|----------|-----------|
| 35 | **Switching institute hides all courses** — `courses` is never tagged with `institution_id` on create, so `dashboard.js:80 .eq('institution_id', instId)` matches ZERO rows after a switch. | **Critical** | `courses.js:169-197` vs `dashboard.js:80` |
| 36 | **`loadDashboard()` never sends `X-Active-Institution`** — raw `fetch` with only Authorization, bypassing `api()`; the one scoping endpoint never gets the chosen institute on the refresh `setActiveInstitution()` triggers. | **Critical** | `dashboard.html:2018` vs `setActiveInstitution` `:6955` |
| 37 | **No other teacher endpoint honors the header** — timetable (`teacherExtras.js:22`), students, reports, earnings all ignore it; `institution_id` never on courses/earnings/enrollments queries. | **Critical** | `teacherExtras.js:22`; `courses.js` (no `institution_id`) |
| 38 | **No "All Institutes" combined view for teachers** — switcher is single-select (`openMyInstitutions` `:6934-6952`); only `franchise/branches` rollup exists (franchise-owner scoped). | High | `dashboard.html:6934-6952`; `eduos.js:740-762` |
| 39 | **"Batch" is not a scoped entity** — free-text `courses.batch_timing` string only; no batches table keyed by institution. | Medium | `courses.js:186` |
| 40 | **Switcher hidden when `links.length===1`** — single-institute teacher cannot see scoping state. | Low | `dashboard.html:8076` |

### 1.8 Design System / Responsive
| # | Issue | Severity | Reference |
|---|-------|----------|-----------|
| 41 | **TWO disconnected design systems** — `theme.css` defines canonical `.jm-*` + `--jm-*` tokens, but `dashboard.html` re-implements `.btn-sm/.card/.badge-green` and `studio.html` uses a private `--bg/--panel` token set (loads `theme.css` at `:7` but ignores it). Brand/theme changes don't reach Studio. | Medium | `theme.css:10-117`; `studio.html:7,9`; `dashboard.html:263-269` |
| 42 | **Badge system forked 3 ways** with hardcoded hex (`#f0fdf4` etc.). | Low | `theme.css:108-117` vs `dashboard.html:107-111` vs `studio.html:34` |
| 43 | **No JMTable / JMCalendar / JMAvatar / JMModal in `theme.css`** — all built ad-hoc inline. | Medium | (absent; calendar `:8855-8910`, avatars `:22,244`, modal `:287-317`) |
| 44 | **Active-tab state via inline JS style mutation** — `.cw-active` class is toggled but has no CSS rule. | Low | `dashboard.html:1465, 1481-1487` |
| 45 | **No spacing/type scale tokens** — input padding 8 vs 10 vs 11px; button padding 7 vs 10px across files. | Low | `theme.css:101`/`dashboard.html:303`/`studio.html:21` |

---

## 2. UX Improvements

The redesign reorganizes flows around **the teacher's day**, not around data tables.

1. **Command-center "what now?" header.** Replace the static greeting strip (`:580-581`) with a live header: greeting + **active-institute pill** + full date + a **Next-Class countdown card** (reuse the `todayClasses` filter `:1894` — extend with `> today` for upcoming — and the schedule-row template `:1902-1915`) with one-tap Join (`startLive` → `liveRoom.html`, `:5418`). An always-present **AI Assistant launcher** opens the messenger AI thread directly (`ensureMessengerAI` `:6213`, `msgrAskAI` `:5130`) instead of forcing teachers to dig into the messenger.

2. **One-click institute context.** Make the switcher always visible (drop the `links.length>1` gate at `:8076`) and add an **"All Institutes"** entry to `openMyInstitutions` (`:6919`). Selecting it sets `jm_active_institution='all'`; loaders then aggregate instead of scoping (see §4).

3. **Click-slot-to-create everywhere.** Extend the working Day-view `_calAddAt` chooser (`:8974`, offering Schedule-class / Meeting / Note / Reminder) to Month and Week cells — closing #19.

4. **Single course workspace as the hub.** `openCourseHub` (`:1438`) becomes the canonical course surface with all 10 tabs. The legacy `openConfigure` tree (`:2913`, `_renderConfigurePage` `:2965`, `cfgSubmit` `:3385`) — the *real* working CRUD surface — is embedded as the **"Structure"** editor, so teachers never bounce between two parallel surfaces (#7/#8 root cause).

5. **Inline reschedule with a real picker.** Replace the `prompt()` reschedule (`:4018`) with a `showModal` (`:2830`) datetime form posting `PUT /live-classes/:classId` (`liveClasses.js:297`) — closing #14.

6. **Quick actions on every student.** Add per-row **Message / Assign homework / View report** to the roster (`openStudentDetail` `:3839`), wiring the unreachable DM backend (`chat.js:73`), `POST /assignments` (`assignments.js:85`), and `GET /eduos/report-card/:studentId` (`eduos.js:470`) — closing #30.

7. **Unread signals.** Surface `r.unread` from `/activity/me` onto `#notifDot` (`:489`, `toggleNotifs` `:8190`) and a Messages KPI; add a 15s poll in `msgrRenderRoom` (`:5113`) for near-real-time chat — closing #3, #31, #32.

8. **AI as a verb, not a place.** Add a unified **"AI Generate" menu** (lesson plan / notes / quiz / homework / report) routed through existing or new endpoints and surfaced via `msgrPostAILine` (`:5160`).

---

## 3. UI Improvements

1. **Adopt the canonical design system.** Alias dashboard `.btn-sm/.btn-primary/.btn-outline` (`dashboard.html:263-268`) and studio `.btn` (`studio.html:14-16`) to `theme.css` `.jm-btn-*` (`theme.css:65-84`); collapse the three badge forks into `.jm-badge-*` (`theme.css:108-117`); migrate `studio.html`'s private `--bg/--panel` tokens onto `--jm-*` (`theme.css:10-47`). Fixes #41, #42, #45 and propagates brand/theme to Studio.

2. **Promote real components into `theme.css`.** Lift the de-facto `.modal-*` system (`dashboard.html:287-317`) to `.jm-modal`, the `.stat-card` (`:84-90`) to `.jm-stat-card`, and add **JMTable**, **JMCalendar**, **JMAvatar** wrappers around the existing ad-hoc markup (calendar grids `:8855-8910`, `.user-avatar`/`.msgr-avatar` `:22,244`). Closes #43.

3. **10-KPI command grid.** Replace the 4-real-card grid (`:595-598`) with a 10-card `repeat(auto-fit,minmax(min(180px,100%),1fr))` grid (`:44`) using `.jm-stat-card`: My Courses, Today's Classes, **Upcoming Classes**, **Tests Pending**, **Attendance Pending**, **Recorded Sessions**, **Monthly Earnings**, Students (true count from `d.enrollments`), **Unread Messages**, **Notifications**. (Data wiring in §4/§7.)

4. **Notion/Linear visual language.** Add `--jm-space-*` + type-scale tokens; give the course-workspace tab bar a real `.cw-active` CSS rule (border-bottom + color) instead of inline JS (`:1465, 1481-1487`); use the auto-fit grid idiom (`:44,129,422`) as the standard for all new grids — closing #44.

5. **Zoom-grade live header & studio.** Surface scene state + a prominent record indicator via `renderScenes` (`studio.html:978`); add **brightness/contrast/saturation** sliders applied through `octx.filter` in `renderLoop` (`studio.html:2304`) — a pure-render addition needing no backend (closes the image-adjustment camera-controls gap).

6. **Canva-style scene/layout templates** already exist (`saveTemplate` `studio.html:789`, `renderTemplateList` `:803`); expose them as a visible template gallery in the studio sidebar.

---

## 4. Missing Workflows

Absent end-to-end; most are *wiring* of existing endpoints, a few are genuine backend additions.

| Workflow | What's missing | Build approach (reuse-first) |
|----------|----------------|------------------------------|
| **All-Institutes combined view** | No aggregate-across-my-institutes mode (#38). | Add `'all'` sentinel to `setActiveInstitution` (`:6955`); when active, loaders skip scoping and merge. Adapt the `eduos.js:740-762` franchise rollup pattern, sourced from `my-institutions` (`institutions.js:215`). |
| **Working institute re-scoping** | Courses untagged (#35); header not sent (#36); routes ignore header (#37). | (a) Set `institution_id` on course create (`courses.js:169-197`) + a creation-time institute picker; (b) route `loadDashboard()` through `api()` (`:2700`) so the header is sent; (c) apply shared `resolveInstitution(req)` (`dashboard.js:11-20`) middleware to timetable/students/earnings/recordings routes. |
| **Per-topic content rollup** | `/full` returns flat arrays (#7, #8, #10). | Group flat `lectures/materials/tests` by `topic_id` — server-side in the `/full` handler (`courseContent.js:618`) or client-side after fetch. Single change unblocks both broken views (`:1545`, `:1689`). |
| **DM / "Message this student"** | No frontend caller for working DM backend (#30). | Contact picker + per-student "Message" button calling `GET /chat/rooms/dm/:userId` (`chat.js:73`); fix room-name display (`chat.js:92`). |
| **Unread + real-time chat** | No read-state, no polling (#31, #32). | Add `last_read` column + `GET /chat/unread` (new); 15s poll in `msgrRenderRoom` (`:5113`); badge in `msgrLoadConvos` (`:5039`). |
| **AI: notes / quiz-from-content / report** | No `/ai/notes`, no quiz-from-content endpoint, no `generateReport` button (Messages map). | New endpoints on the `ai()` chokepoint (`config/aiProvider.js`), `safeJson()`, and `retrieveChunks()` (`rag.js`) for grounding — mirroring `/ai/lesson-plan` (`ai.js:408`). Notes reuses the `/ai/generate` + `aiSummarize` pattern. |
| **AI: homework button** | No wired `generateHomework` action. | Backend `/ai/create-assignment` (`ai.js:176`) already exists — add a button that posts its result into `MODAL_DEFS.addAssignment` (`:2331`) → `POST /assignments` (`assignments.js:85`). |
| **Functional course analytics** | Stub tab (#12, #28). | New course-analytics endpoint aggregating completion/attendance/revenue (Backend map flags this gap explicitly — only `GET /teacher/tests/:testId/analytics` `:282` exists today); render in the Analytics tab (`:1612`). |
| **Move recording → topic** | Backend accepts `topicId`, no UI (#16). | "File under chapter" control reusing `scheduleLiveLoadTopics` (`:2741`) + the recording upload's `topicId` support (`liveClasses.js:484`); send it in the `liveRoom.html:412` FormData. |
| **Studio record → course/topic/cloud targets** | Only local/class targets (Studio map). | Extend the `saveTarget` select (`studio.html:157`) with topic + generic-cloud targets; reuse the `wbDoSaveCourse` (`studio.html:2164`) `POST /api/course-content` save pattern. |
| **Recurring-series management** | No series id (#17). | Add `series_id` in recurring expansion (`teacherExtras.js:83-112`) enabling cancel-series / edit-future. |
| **Audio / whiteboard / AI-summary content type** | Not in materials enum (#13). | Extend the material type enum + `addMaterial` select (`:2557`); save via `POST /course-content/:id/materials` (`courseContent.js:203`). |
| **Test scheduling / publish gate, rubrics, late-submission** | Missing (Student/Test map). | Extend `PUT /tests/:id` (`courseContent.js:300`) with publish/schedule fields; extend grade flow (`assignments.js:229`) with rubric + late flags. |

---

## 5. New Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│ TOP APP BAR  [☰] JeetMantra   [Institute ▾ Active / All]   🔔(unread)  💬  │  ← #486 switcher always-on
├───────────┬──────────────────────────────────────────────────────────────┤
│           │  COMMAND HEADER                                                │
│  SIDEBAR  │  ┌─────────────────────────────────────────────────────────┐  │
│  (drawer  │  │ Good morning, {first} 👋   {full date}   📍 {institute}  │  │  ← #580/581 + new pill
│  <768px)  │  │ ⏭ NEXT: {course} in 14m  [Join]      [✨ AI Assistant]   │  │  ← new next-class + AI launcher
│           │  └─────────────────────────────────────────────────────────┘  │
│  Home     │  10 KPI CARDS (auto-fit grid)                                  │  ← .jm-stat-card ×10
│  Courses  │  [Courses][Today][Upcoming][Tests⏳][Attend⏳][Rec][₹Month]  │
│  Live     │  [Students][Msgs●][Notif●]                                     │
│  Calendar │  ┌──────────────────────────┬──────────────────────────────┐  │
│  Students │  │ TODAY'S TIMELINE         │ UNIFIED CALENDAR (mini)      │  │  ← #608 timeline + #8790 cal
│  Messages │  │ join/edit/reschedule/    │ Day·Week·Month·Agenda         │  │
│  Studio   │  │ share/cancel per row     │ click-slot-to-create (all)    │  │
│  Profile  │  └──────────────────────────┴──────────────────────────────┘  │
└───────────┴──────────────────────────────────────────────────────────────┘
   BOTTOM NAV (mobile, <768): Home · Courses · Live · Calendar · Profile        ← PRESETS.teacher #8168
```

**Single Course Workspace** (`openCourseHub` `:1438`, tabs scroll horizontally `:1464`):
```
[Overview] [Structure] [Live] [Assignments] [Tests] [Attendance] [Students] [Analytics] [Recordings] [Discussion]
   │           │          │         │          │         │           │          │           │           │
 hub       Configure   schedule  assignments tests+    take-att   roster+    completion  grouped     forum
 +price     tree        +recur    +AI grade   bank+AI  +bulk      quick-acts  +attend+rev recordings  (eduos)
(#1643)    (#2965)      (#2085)   (#6022)     (#2590)  (#5627)    (#3839)     (NEW agg)   (#5810)     (#323)
```
- **Structure tab** embeds `_renderConfigurePage` (`:2965`) — the working CRUD tree — with content **grouped by `topic_id`** so per-topic badges finally populate (fixes #7, #8).
- **Course → Module → Chapter → Topic**: surface a `course_topics` row as "Chapter" with nested lecture / material / test / page / audio / whiteboard / AI-summary content items grouped under each (addresses #7, #8, #10, #13).

**Smart Studio** (`studio.html`): left **Scene Manager** (`renderScenes` `:978`) · center **Stage / Layout builder** (`drawLayout` `:1038`, `renderComposite` `:1069`) · right **Controls** (camera: zoom/rotate/crop/perspective + new brightness/contrast/saturation; VBG; **Record → local / course / topic / cloud** `:157`) · **Template gallery** (`saveTemplate` `:789`).

---

## 6. Responsive Improvements

Coverage is **already thorough** — a layered cascade exists (768 drawer, 900 grid collapse, 600 row/modal stacking, 640/420 fine-tuning, 1280 tablet, 1600/2000/2200 ultrawide/TV, `pointer:coarse` touch targets). Improvements are targeted:

1. **10-KPI grid reflow.** Use the existing `repeat(auto-fit,minmax(min(180px,100%),1fr))` idiom (`:44`) so 10 cards flow 5→4→2→1 across the existing 1600/900/600/420 breakpoints — no new media queries.
2. **Command header stacks under 600.** Next-class card and AI launcher drop below greeting; reuse the modal-stacking pattern at `:410-415`.
3. **Calendar create-from-slot on touch.** Extend `_calAddAt` (`:8974`) to Month/Week within the existing `overflow-x:auto` + `min-width:560px` wrappers (`:8879-8893`); 44px touch targets via the existing `pointer:coarse` block (`:9275-9280`).
4. **Course workspace tab bar** already scrolls horizontally (`:1464-1466`) — verify the new tabs (Structure, Discussion) inherit the scroll.
5. **Studio migration to `--jm-*`** lets the existing `data-theme` dark overrides (`dashboard.html:46-50`) finally reach Studio (closes the theming half of #41); Studio's 3→2→1-col grid (`studio.html:37-42`) is retained.
6. **JMTable wrapper** standardizes the ad-hoc `overflow-x:auto` table handling (`:382-383, 397`) so roster/gradebook/billing tables share one responsive scroll model.

---

## 7. Files To Modify

**Frontend**
| File | Changes |
|------|---------|
| `public/dashboard.html` | Command header + next-class card + AI launcher (around `:580`); 10-KPI grid replacing `:595-598`; wire KPIs via `_tSet` (`:1880`); fix `#notifDot` from `r.unread` (`:489,8220`); group `/full` arrays by `topic_id` for Topics tab (`:1545`) & `_cgTree` (`:1689`); de-dupe `addTopic` + invalidate `_cgTreeCache` (`:2400/2504`); reschedule modal replacing `prompt()` (`:4018`); DM picker + per-student quick actions (`:3839`); messenger unread badge + 15s poll (`:5039,5113`); AI Generate menu; `'all'` institute path in `setActiveInstitution` (`:6955`) + `openMyInstitutions` (`:6919`); route `loadDashboard` through `api()` (`:2018`); always-on switcher (`:8076`); calendar create-from-slot Month/Week (`:8888,8900`); local items in Month/Week (`:8883-8903`); course analytics render (`:1612`); fix recordings template string (`:4968`). |
| `public/studio.html` | Migrate `--bg/--panel`→`--jm-*` (`:9`); fix screen-share `ended` dangling refs (`:871`); multi-page PDF save (`:2180`); capture screen/system audio (`:871,2340`); `layerUp` → `drawLayout` (`:1002`); brightness/contrast/saturation `octx.filter` (`:2304`); record save-targets course/topic/cloud (`:157`). |
| `public/theme.css` | Add `--jm-space-*` + type scale; promote `.jm-modal`, `.jm-stat-card`, `.jm-table`, `.jm-calendar`, `.jm-avatar`; add `.cw-active` rule. |
| `public/liveRoom.html` | Send `topicId` in recording FormData (`:412`). |

**Backend**
| File | Changes |
|------|---------|
| `backend/routes/courses.js` | Set `institution_id` on create (`:169-197`); accept institute param. |
| `backend/routes/dashboard.js` | Return `pendingAssignments`, true `students` count (from enrollments), monthly earnings, and upcoming/tests/attendance/recordings/messages counts in the teacher branch (`:111-120`); add `'all'` aggregation branch (`:80`); export `resolveInstitution` (`:11-20`) for reuse. |
| `backend/routes/teacherExtras.js` | Honor `X-Active-Institution` on `/timetable` (`:22`), bookings (`:198`), payments (`:225`), recordings (`:720`); add `series_id` to recurring (`:83-112`); unify recording field names with `liveClasses.js` (`:720`). |
| `backend/routes/courseContent.js` | Optionally nest children under topics in `/full` (`:618`); extend material type enum (`:215-224`); test publish/schedule fields (`:300`). |
| `backend/routes/liveClasses.js` | Unify recording shape with `/teacher/recordings` (`:496`); persist `/documents` with a DB insert + ownership gate (`:268`). |
| `backend/routes/chat.js` | `last_read` column + `GET /unread`; fix DM display name (`:92`). |
| `backend/routes/ai.js` | New `/notes`, `/quiz-from-content`, `/report` endpoints (built on `ai()`/`safeJson()`/`retrieveChunks()`). |
| `backend/routes/eduos.js` | Adapt `franchise/branches` (`:740-762`) into a teacher All-Institutes aggregate. |
| **New** `backend/middleware/resolveInstitution.js` | Extract `dashboard.js:11-20` into shared middleware applied across teacher routes. |

---

## 8. Implementation Plan

**Phase A — Make multi-institute real (unblocks everything institute-scoped)**
1. Add `institution_id` to `courses` create (`courses.js:169-197`) + a course-create institute picker.
2. Extract `resolveInstitution` → `backend/middleware/resolveInstitution.js` (from `dashboard.js:11-20`); apply to `/timetable`, students, earnings, recordings.
3. Route `loadDashboard()` through `api()` (`dashboard.html:2018`) so `X-Active-Institution` is sent.
4. Add `'all'` aggregation branch (`dashboard.js:80`) + `'all'` entry in `openMyInstitutions`/`setActiveInstitution`; always-on switcher (`:8076`).

**Phase B — Command-center shell**
5. Build command header: next-class card (reuse `todayClasses` `:1894` + row template `:1902`), AI launcher (`ensureMessengerAI` `:6213`).
6. Backend: return the 6 missing KPI fields (`dashboard.js:111-120`).
7. 10-KPI grid + `_tSet` wiring; fix `#notifDot` from `r.unread`; fix recordings template string (`:4968`).

**Phase C — Course workspace unification**
8. Group `/full` arrays by `topic_id` (`courseContent.js:618` or client at `:1545/:1689`); de-dupe `addTopic`; invalidate `_cgTreeCache`.
9. Embed Configure tree (`:2965`) as the Structure tab; add Discussion tab (`eduos.js:323`).
10. Course-analytics endpoint + Analytics tab render (`:1612`).

**Phase D — Live / calendar / studio polish**
11. Reschedule modal (`:4018`); calendar create-from-slot Month/Week (`:8888,8900`); local items in all views (`:8883-8903`).
12. Studio: dangling-ref fix (`:871`), multi-page PDF save (`:2180`), audio capture (`:2340`), camera filters (`:2304`), record save-targets (`:157`).

**Phase E — Messages / AI / quick actions**
13. DM picker + per-student quick actions (`:3839`, `chat.js:73`); unread column/endpoint + 15s poll.
14. New AI endpoints (`/notes`, `/quiz-from-content`, `/report`) + AI Generate menu; homework via existing `/ai/create-assignment`.

**Phase F — Design system + responsive**
15. Promote `.jm-modal/.jm-stat-card/.jm-table/.jm-calendar/.jm-avatar`; alias dashboard/studio primitives; migrate Studio to `--jm-*`; add `--jm-space-*`; verify all breakpoints with the new 10-KPI grid and 10 tabs.

---

## 9. Priority Order

**P0 — Critical / blocks core value (do first)**
- **Multi-institute scoping** (#35, #36, #37): course `institution_id`, `loadDashboard` via `api()`, `resolveInstitution` middleware. *Rationale: the entire multi-institute promise is silently inert; a switch currently hides all courses — actively destructive.*
- **Per-topic content rollup** (#7, #8, #10): group `/full` by `topic_id`. *Rationale: every course shows "No content yet" — the workspace is functionally broken for real courses.*
- **Pending/Students KPI correctness** (#1, #2, #27): backend fields + true student count. *Rationale: the command center shows wrong/zero numbers, undermining trust.*
- **Studio screen-share dangling refs & multi-page PDF loss** (#21, #22): broken-scene / data-loss bugs.

**P1 — High-value, core command-center experience**
- All-Institutes combined view (#38); next-class header + AI launcher (#6); DM reachability + unread (#30, #31); reschedule modal (#14); 10-KPI grid; course Analytics (#12, #28). *Rationale: deliver the Notion/Linear/Zoom "command center" feel and unlock daily workflows.*
- Design-system unification (#41, #43): canonical `.jm-*` + Studio token migration. *Rationale: prerequisite for consistent UI across all P1/P2 surfaces.*

**P2 — Polish, depth, nice-to-haves**
- Calendar create-from-slot in Month/Week (#19) + local items in all views (#18); recording field unification + move-to-topic (#15, #16); recurring series id (#17); studio camera filters / audio capture (#24, #26); new AI endpoints (notes/quiz/report); cross-course recording leak (#11); notification-dot polish (#3); voice NLU entity parsing (#34); spacing/type tokens (#45). *Rationale: refine an already-working experience; can ship incrementally.*

---

## 10. Completion Percentage

Per-area completion is estimated from the ratio of working `exists` features to the total required surface (`exists` + `broken` + `missing`) in each map, weighted by how much of the *command-center vision* is already deliverable via reuse.

| Area | Working today | Key gaps | Completion |
|------|---------------|----------|------------|
| **Command-center shell** | greeting, date, today timeline, bottom nav, 4 real KPIs | 6 missing KPIs, no next-class header, no AI launcher, broken Pending/Students/notifDot/recordings-template | **45%** |
| **Course management** | full CRUD via Configure tree, create/duplicate/archive, rich pages, tests/materials/lectures | flat model, empty Topics/Explore, stub analytics, no audio/wb/AI content type | **60%** |
| **Live / Calendar / Recordings** | one-off + recurring schedule, start/end, attendance roster, share, record, 4-view calendar, slot-create (Day) | prompt() reschedule, dual recording shapes, no series mgmt, local items partial, docs not persisted | **80%** |
| **Smart Studio** | scene mgr, layout builder, whiteboard toolkit, zoom/rotate/crop/perspective, recording w/ fallback, templates | no brightness/contrast/sat, no true VBG segmentation, dangling refs, multi-page PDF loss, no audio capture, no topic/cloud target | **70%** |
| **Students / Tests / Assignments / Analytics** | roster+detail, test+question bank+AI gen, test analytics, assignment create/submit/grade+AI, attendance grid | pending tile, course analytics stub, no rubrics/late/publish gate, no batch/institute analytics | **70%** |
| **Messages / AI / Voice** | unified messenger, course chat, announcements, RAG tutor, lesson-plan, dictation, voice FAB+intents | no DM entry, no unread/real-time, no PPT/notes/quiz/homework/report buttons, keyword-only voice | **65%** |
| **Multi-institute** | data model, my-institutions, switcher UI, header injection in `api()`, franchise rollup pattern | courses untagged, loadDashboard bypasses api(), only 1 route scopes, no All-Institutes, no batches entity | **25%** |
| **Design system / Responsive** | canonical `.jm-*` tokens/components, thorough breakpoint cascade, auto-fit grids | dashboard/studio bypass `.jm-*`, 3-way badge fork, no JMTable/Calendar/Avatar/Modal in theme.css | **65%** |
| **Backend API surface** | ~135 endpoints; nearly every teacher workflow already has an endpoint | per-student targeting, gradebook export, course analytics, push tokens, non-institution bulk import | **90%** |

**Overall completion: ~62%** (mean of the nine area figures: 45, 60, 80, 70, 70, 65, 25, 65, 90 → 570/9 ≈ 63%, held at ~62% given the disproportionate severity of the P0 multi-institute breaks).

Justification: the **backend is ~90% complete** (~135 endpoints; the audit's explicit finding is "the risk is DUPLICATION, not gaps") and **live/studio are 70–80%** functional, pulling the average up. The drag is **multi-institute at ~25%** (three compounding *critical* breaks) and the **command-center shell at ~45%** (6 of 10 KPIs missing, no next-class header, no AI launcher). Because the largest remaining work is **wiring, grouping, and design-system unification of already-built pieces** — not new construction — the redesign is high-leverage: closing the P0 institute-scoping and per-topic-rollup gaps alone moves the overall figure materially toward ~80%.

---

**Key file references for the implementing team:** `D:\React App\jeetmantraclaude-main\public\dashboard.html`, `D:\React App\jeetmantraclaude-main\public\studio.html`, `D:\React App\jeetmantraclaude-main\public\liveRoom.html`, `D:\React App\jeetmantraclaude-main\public\theme.css`, and `D:\React App\jeetmantraclaude-main\backend\routes\` (`courses.js`, `dashboard.js`, `courseContent.js`, `liveClasses.js`, `teacherExtras.js`, `chat.js`, `ai.js`, `eduos.js`, `institutions.js`).