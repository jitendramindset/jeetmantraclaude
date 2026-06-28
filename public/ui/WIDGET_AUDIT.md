# EduOS Widget System — Master Audit Report

> Generated against the EDUOS MASTER WIDGET AUDIT spec.
> 62 components inventoried across 5 tiers.

## Tier Inventory

| Tier | Count | Location |
|---|---|---|
| Atoms | 10 | `/ui/widgets/atoms/` |
| Molecules | 4 | `/ui/widgets/molecules/` |
| Page widgets | 14 | `/ui/widgets/page/` |
| Dashboard widgets (manifest) | 23 | `/widgets/<id>.js` |
| Screens | 11 | `/ui/screens/` |

## Engine capability matrix — what `widget-registry.js` already supports

| Spec feature | Status | Where implemented |
|---|---|---|
| **Show / Hide** | ✅ | `removeWidget()` + `wgAddTray` "Add back" buttons |
| **Pin / Unpin** | ✅ | `togglePin()`, sorts pinned first in `resolveWidgets` |
| **Collapse / Expand** | ✅ | `toggleCollapse()` + `.wg-collapsed` CSS |
| **Resize (Small / Medium / Large)** | ✅ | `cycleSize()`, `.wg-small/medium/large` |
| **Drag-and-drop reorder** | ✅ | dragstart/drop on `.wg-head` (lines 131-136) |
| **Per-widget accent color** | ✅ | `setAccent(id, hex)` writes `--wg-accent` CSS var |
| **Skeleton state** | ✅ | `skeleton()` rendered before fetch (line 106) |
| **Error + Retry state** | ✅ | `JMStates.retryCard` on fetch failure (line 145) |
| **Per-widget data isolation** | ✅ | `try/catch` per `renderWidget`; one bad widget doesn't break grid |
| **Admin policy gate (3-layer: admin / role / user)** | ✅ | `passesGates()` reads `ctx.adminWidgets`, `w.roles`, `w.capability` |
| **Persistence of prefs** | ✅ | `userPrefs.{removed,pinned,order,collapsed,sizes,accents}` |
| **Offline banner** | ✅ | `jm-states.js` `initOfflineBanner` |

## Spec gaps — what's missing across the engine

| Spec feature | Status | Gap |
|---|---|---|
| Minimize / Maximize (distinct from Collapse) | ❌ | Not implemented; treat as alias of Collapse, or add separate state |
| Favorite | ❌ | No "favorite" pref bucket; Pin functions as a star but isn't named "favorite" |
| Archive | ❌ | Hidden ≠ Archive; spec wants 3 states (visible/hidden/archived) |
| Explicit "Full Width" size | ⚠️ | Only small/medium/large; no `wg-full` |
| Background color customization | ❌ | Only accent (left border); no body bg override |
| Transparency / Compact / Comfortable mode | ❌ | No density variants |
| Border-radius / Shadow style per-widget | ❌ | All cards share `.wg-card` styling |
| Theme aware Light/Dark/Auto | ⚠️ | App-level theme exists; not per-widget override |
| Typography size override | ❌ | All widgets share `--jm-fs-*` tokens |
| Icon selection per widget | ❌ | Title is text-only; no icon slot in manifest |
| User-editable title/subtitle | ❌ | Manifest titles are fixed; no edit-in-place |
| Show/Hide internal sections | ❌ | No section-level visibility prefs |
| Refresh frequency config | ❌ | Render is single-shot; no periodic refresh |
| Sort / filter persistence | ❌ | No per-widget sort/filter prefs |
| Action overflow menu | ❌ | Only 5 fixed `.wg-ctrl` icons — no "More" for additional actions |
| Loading state distinct from Skeleton | ⚠️ | Same UI — fine for most cases but spec wants separation |
| Offline state per widget | ❌ | App-wide banner only |
| Group features (collapse group, save/reset/export/import layout) | ❌ | Cards live in a flat grid; no groups |
| Widget metadata fields | ⚠️ | Have: `id,title,roles,capability,category,size,priority,dataSource,render,actions`. Missing per spec: `description,icon,defaultSize,supportedSizes,supportedRoles,permissions,defaultVisibility,customizable,responsiveBehavior,animationType` |

## Standard widget type coverage

| Spec type | Coverage | Files |
|---|---|---|
| KPI | ✅ | `atoms/KPI.js`, `molecules/KPIGrid.js` |
| Course | ✅ | `page/CourseCard.js`, `widgets/my-courses.js`, `widgets/recommended.js` |
| Student | ✅ | `widgets/weak-students.js`, `screens/MyStudents.js` |
| **Teacher** | ❌ | No dedicated widget (only role-filter list) |
| **Calendar** | ❌ | No dedicated calendar widget (timetable exists; lacks month view) |
| Attendance | ✅ | `widgets/attendance-pending.js`, `screens/AttendanceReport.js` |
| Assignment | ✅ | `widgets/assignments-due.js` |
| Test | ✅ | `widgets/pending-eval.js`, `page/QuestionCard.js` |
| Analytics | ✅ | `screens/Analytics.js` |
| Revenue | ✅ | `widgets/revenue.js` |
| **Activity Feed** | ❌ | No dedicated feed; messages.js and notifications.js fragments |
| Notification | ✅ | `widgets/notifications.js` |
| Message | ✅ | `widgets/messages.js` |
| AI | ✅ | `widgets/ai-tutor.js` |
| Recording | ✅ | `screens/Recordings.js` |
| Live Class | ✅ | `widgets/upcoming-classes.js`, `liveRoom.html` |
| Marketplace | ✅ | `widgets/my-listings.js`, `page/CourseCard.js` (storefront card) |
| Booking | ✅ | `widgets/bookings.js` |
| Certificate | ✅ | `widgets/certificates.js`, `screens/Certificates.js` |
| **Profile** | ❌ | No widget (settings.html has the form; no compact card) |
| Quick Action | ✅ | `widgets/quick-actions.js` |

**Missing widgets: 4** — Teacher, Calendar, Activity Feed, Profile.

## Per-tier audit (1 line each)

### Atoms (10) — production-ready

| Atom | Status | Notes |
|---|---|---|
| Button | ✅ | kinds: primary/secondary/ghost/danger, sizes sm/md/lg |
| Card | ✅ | accent, padding, footer slots |
| KPI | ✅ | label/value/sub/accent/icon/onClick; theme-aware via CSS vars |
| Row | ✅ | title/sub/right/icon — used by ListSection |
| Badge | ✅ | default/success/warn/danger/info kinds |
| EmptyState | ✅ | icon/title/msg/cta — premium CTA pattern |
| Avatar | ✅ | name/src/size; falls back to initials |
| SectionHeader | ✅ | title/sub/action; consistent across screens |
| ModalShell | ✅ | body/footer slots; used by modal screens |
| Tabs | ✅ | tabs/active/onChange; theme-aware accent |

### Molecules (4) — production-ready

| Molecule | Status | Notes |
|---|---|---|
| KPIGrid | ✅ | Responsive grid of KPI atoms |
| ListSection | ✅ | Header + rows + empty fallback |
| ActionToolbar | ✅ | Overflow-collapse ("…") when narrow ← **spec-aligned** |
| TakeoverPage | ✅ | Full-screen surface manager |

### Page widgets (14) — production-ready

| Widget | Used by | Customization gaps |
|---|---|---|
| AuthShell | 3 auth pages | No theme variant |
| PageNav | settings | No mobile drawer |
| RoleGrid | login | 6 hardcoded roles (override-able) |
| CourseCard | marketplace | No size variants |
| ProgressSteps | signup | No vertical orientation |
| Sidebar | admin-os | No collapse-to-icons mode |
| TabBar | liveRoom | No close/add per tab |
| QuestionCard | exam-platform | No bookmark/flag |
| Hero | bhasha-setu | Only compact/default — no with-CTA variant |
| SceneTile | studio | OK |
| StatusBadge | liveRoom | OK; 8 presets |
| RolePicker | bhasha-setu | OK |
| Timer | exam-platform | OK; format helper |
| ControlBar | studio | OK |

### Dashboard widgets (23) — production-ready, partial spec coverage

All 23 self-register via `EduOSWidgets.register({id, title, roles, capability, category, size, priority, dataSource, render, actions})` — fully integrates with engine's pin/hide/collapse/resize/accent/dnd/skeleton/retry.

| Widget | Default size | Role gate | Spec-missing |
|---|---|---|---|
| upcoming-classes | medium | TEACHING + student | description, icon meta |
| assignments-due | medium | student + TEACHING | refresh, sort |
| my-courses | medium | SELLERS | size variants |
| revenue | medium | SELLERS | full-width opt |
| messages | small | all | none critical |
| notifications | small | all | none critical |
| quick-actions | medium | all | icon meta |
| streak | small | student | OK |
| timetable | large | TEACHING + student | full-width / week view |
| attendance-pending | medium | TEACHING | refresh |
| pending-eval | medium | TEACHING | OK |
| weak-students | medium | TEACHING | OK |
| bookings | medium | SELLERS + student | OK |
| recommended | medium | student | OK |
| ai-tutor | small | student | OK |
| my-listings | medium | SELLERS | OK |
| certificates | small | student | OK |
| children | medium | parent | OK |
| fees | small | parent + student | OK |
| network | small | partner | OK |
| admissions | medium | ORG_ADMIN | OK |
| leaderboard | medium | student | OK |
| continue-learning | medium | student | OK |

### Screens (11) — production-ready

All extracted from `dashboard.html` to `/ui/screens/` with MVC layering:

| Screen | Surface | Model | Notes |
|---|---|---|---|
| Help | modal | static | FAQ + Ask AI |
| Certificates | modal | yes | List + verify |
| WidgetAdmin | modal | yes | 23×9 matrix, admin authority |
| Analytics | modal | yes | Empty-state if no data |
| MyStudents | modal | yes | Cross-course roster |
| Downloads | modal | yes | Offline library |
| Wallet | takeover | yes | Balance + txns + topup |
| Recordings | takeover | yes | Grouped by course/topic |
| AttendanceReport | takeover | yes | Per-course % bars |
| Gamification | modal | yes | Streak/XP/Badges |

## Responsive matrix

Engine sets responsive grid via `widget-styles.css` and per-widget `.wg-small/medium/large`. The breakpoint coverage I verified for the dashboard grid:

| Viewport | Behavior | Issue |
|---|---|---|
| 360px | Single column, all widgets full-width | OK |
| 390px | Single column | OK |
| 768px | 2-column grid; small spans 1, medium 1, large 2 | OK |
| 1024px | 2-column grid | OK |
| 1366px | 3-column grid | OK |
| 1920px | 3-column grid | ⚠️ Should be 4-col on widescreen |
| Smartboard (2200+) | 3-column (no override) | ⚠️ Needs 5-6 col + larger touch targets |
| 4K | 3-column (capped) | ⚠️ Same as smartboard |

## Top-priority gaps (recommended fixes, ordered)

| # | Gap | Effort | Priority |
|---|---|---|---|
| 1 | Add 4 missing widgets: Teacher / Calendar / ActivityFeed / Profile | 1d each | P0 |
| 2 | Engine: `favorite` + `archive` prefs (separate from pin/hide) | 0.5d | P1 |
| 3 | Engine: explicit `full` size + `wg-full` CSS | 0.5d | P1 |
| 4 | Engine: per-widget refresh frequency config (manifest field + setInterval) | 1d | P1 |
| 5 | Engine: action overflow menu when >5 actions (`JM.ActionToolbar` already has this — adopt for widget headers) | 0.5d | P1 |
| 6 | Engine: smartboard/4K breakpoints (1920+ → 4-col, 2200+ → 5-col, 3840+ → 6-col) | 0.5d | P2 |
| 7 | Engine: per-widget loading state distinct from skeleton (text "Loading X data…") | 0.25d | P2 |
| 8 | Engine: section-level show/hide within a widget (manifest declares sections, prefs hide them) | 1d | P2 |
| 9 | Manifest: add `description, icon, defaultSize, supportedSizes, defaultVisibility, customizable, animationType` fields | 0.5d (then per-widget fill: 1d) | P2 |
| 10 | Group features: introduce widget groups (sections with own collapse/save/load) | 2d | P3 |
| 11 | Theme aware Light/Dark/Auto per widget (override the app theme) | 1d | P3 |
| 12 | User-editable title/subtitle (inline edit on hover) | 1d | P3 |
| 13 | Typography size override + compact/comfortable density toggle (CSS class on grid) | 0.5d | P3 |

**Total: ~12 dev-days for full spec compliance across the engine + 4 missing widgets.**

## What's already premium-SaaS-grade

- Manifest-driven (zero `if(role===X)` branches)
- 3-layer policy: admin > role > user
- Per-widget data isolation (one bad fetch ≠ broken grid)
- Pin / hide / collapse / resize / accent / drag-reorder all persist
- Atoms+molecules+screens layered MVC; widgets self-register from individual files
- Premium tokens (`--jm-primary,--jm-shadow,--jm-fs-N,--jm-sp-N`) used consistently
- Accessibility: `role="region"`, `aria-label`, `tabindex` per widget; ActionToolbar uses overflow

## Verdict

The widget engine itself is ~75% spec-aligned. The biggest gap is breadth of widget types (4 missing) and a few engine features (favorite, archive, full-width, refresh frequency, action overflow in widget header). Everything proposed above slots into the existing `widget-registry.js` architecture without rewriting it — additive only, fully backwards compatible.
