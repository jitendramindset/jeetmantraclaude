# EduOS Stabilization Sprint — Live Browser Validation Report

Date: 2026-06-22 · Method: **real browser preview driving a live backend** (Express on
:5001, Supabase connected) with **real test-account logins** (`{role}_test@jm.test`). This is
runtime observation — every result below was executed, not authored.

---

## Summary

| Phase | Scope | Result |
|---|---|---|
| 1 — Suite / page load | All pages + 6 role dashboards | ✅ Pass — no console or server errors |
| 2 — Role workflows | student, teacher, admin, school, coaching, partner | ✅ Pass — all render real data |
| 3–4 — UI/UX + responsive | Priority screens × 360→1920 | ⚠️ **2 bugs found → fixed → re-verified** |
| 5 — Navigation / permissions | admin-os gate vs 4 roles | ✅ Pass — non-admins bounced, no leak |
| 6 — API + UI integration | Profile write round-trip | ✅ Pass — persists + restores |

**Net: 2 real responsive defects found and fixed. No critical/high issues remain on the
validated surfaces.**

---

## Issues found & fixed

### ISSUE-1 (High) — Dashboard topbar overflows 211px on mobile (all roles)
- **Screen:** `dashboard.html` (every role — shared topbar) · **Severity:** High · **Width:** ≤768px
- **Symptom:** `.topbar-actions` (notifications, messages, language, marketplace, streak/XP chips)
  is a non-wrapping flex row. At 360px the page overflowed horizontally by **211px**.
- **Root cause:** the topbar-wrap rule existed only in the **tablet** breakpoint
  (`769–1280px`); it was never carried into the `≤768px` mobile block, so on phones the row
  neither wrapped nor scrolled.
- **Fix:** `public/dashboard.html` — added to `@media(max-width:768px)`: `.topbar{flex-wrap:wrap}`,
  search bar drops to its own full-width row, `.topbar-actions{flex-wrap:wrap;justify-content:flex-end}`,
  title ellipsizes.
- **Re-verified:** overflow **0px** at 360 & 768; clean at 1280/1920 (no regression).

### ISSUE-2 (Medium) — admin-os.html keeps a 240px sidebar on mobile
- **Screen:** `admin-os.html` (Platform OS) · **Severity:** Medium (admin-only) · **Width:** ≤768px
- **Symptom:** `.shell{grid-template-columns:240px 1fr}` had **no mobile breakpoint**. At 360px the
  240px sidebar left only ~120px for content; overview cards overflowed (~26px).
- **Root cause:** shell grid never collapsed; only the inner `.row` was responsive.
- **Fix (2 iterations):** `public/admin-os.html` — added `@media(max-width:768px)` collapsing the
  shell to a single column with a horizontally-scrollable nav strip. First pass regressed (88px)
  because a `1fr` grid track has `min-width:auto` and the `white-space:nowrap` nav row forced it
  wider than the viewport; corrected with `grid-template-columns:minmax(0,1fr)` + `min-width:0` on
  sidebar/content so the column shrinks and the nav scrolls internally.
- **Re-verified:** overflow **0px** at 360/390/768; nav items still present and tappable.

### ISSUE-3 (High, UX) — Studio unusable for teaching on mobile (cramped buttons, tiny board)
- **Screen:** `studio.html` · **Severity:** High (core teaching surface) · **Width:** ≤760px
- **Symptom:** on a phone the control columns stack below a small ~42vh board → "lots of buttons
  and scroll", the actual board/whiteboard was barely visible, and there was no way to hide the
  panels for a clean teaching board or take the whiteboard full-screen.
- **Fix:** `public/studio.html` — added a **Focus / clean-board mode** (🔳 Focus button + `Esc`):
  - hides the topbar and both control columns; the `.stage` (camera/whiteboard board) fills the
    whole viewport (`#out` up to 86vh, full width);
  - a floating **top bar** (`✕ Exit focus` + live format badge) and a floating **bottom action
    bar** (⚙ Tools · 🖍 Board · 🎥 Cam · ⏺ Rec · ⤢ Exit) keep teaching controls one tap away;
  - **⚙ Tools** slides the sources panel back in as a drawer without leaving focus, so you can add
    a camera / screen / whiteboard / course content mid-lesson;
  - reuses existing handlers (`toggleRecord`, `addWhiteboard`, `enableDevices`) — no new APIs.
  - Also bumped the default mobile board from 42vh→50vh / `#out` 46vh→56vh so it's bigger even
    outside focus mode.
- **Re-verified (live):** Focus toggles on/off cleanly (topbar+cols hide, floating bars show,
  board fills full width, overflow 0px, no console errors); exits restore the normal layout;
  studio normal mode unchanged at 360/768/1280. Screenshot captured.

---

## Per-screen scorecard (validated screens)

Scores are Pass / Review / Manual based on live observation. UI/UX/Nav use rendered-structure +
console; Responsive = horizontal-overflow check at 360/768/1280; API = real data load / write.

| Screen | Load | Console | Responsive | Nav | API/Data | Notes |
|---|---|---|---|---|---|---|
| Login | ✅ | ✅ clean | ✅ (after fix verify) | ✅ email/OTP/Google present | ✅ `/auth/config` 200 | Mobile overflow was a `preview_resize` emulation artifact + transient i18n-FAB reflow; true 360px iframe = clean |
| Teacher dashboard | ✅ | ✅ | ✅ **fixed** | ✅ 26 nav items | ✅ real data | empty-states correct |
| Student dashboard | ✅ | ✅ | ✅ **fixed** | ✅ 27 nav items | ✅ real data | |
| Admin dashboard | ✅ | ✅ | ✅ **fixed** | ✅ 13 nav items | ✅ real data | |
| School dashboard | ✅ | ✅ | ✅ **fixed** | ✅ 15 nav items | ✅ real data | |
| Coaching dashboard | ✅ | ✅ | ✅ **fixed** | ✅ 16 nav items | ✅ real data | |
| Partner dashboard | ✅ | ✅ | ✅ **fixed** | ✅ 15 nav items | ✅ real data | |
| Marketplace | ✅ | ✅ | ✅ clean 360→1920 | ✅ | ✅ | |
| Settings | ✅ | ✅ | ✅ clean | ✅ | ✅ | |
| Studio | ✅ | ✅ | ✅ **focus mode added** | ✅ + clean-board bars | ✅ | 🔳 Focus hides panels, board full-screen, floating top+bottom action bars |
| Admin OS | ✅ | ✅ | ✅ **fixed** | ✅ gate enforced | ✅ migrations/backup UI | |
| Exam platform | ✅ | ✅ | ✅ clean | ✅ | ✅ | |

---

## Permission validation (live)

| Role | Visited `/admin-os.html` | Result |
|---|---|---|
| student | → redirected to `dashboard.html?role=student` | ✅ no admin content |
| teacher | → redirected to own dashboard | ✅ no admin content |
| coaching | → redirected to own dashboard | ✅ no admin content |
| admin | stayed on `admin-os.html` (16 nav items) | ✅ full access |

Backend gate (prior session, request-context): `/api/admin/users` → **401** no auth, **401/403**
tampered token. Frontend gate (this session): non-admins bounced to their dashboard.

## API + UI integration (live)

`PUT /api/users/profile` (teacher token) → **200**; re-fetch shows the written value
(`persistedAfterReload: true`); original value **restored** afterward. Confirms writes persist to
Supabase and round-trip through the API.

---

## Gaps — not defects (need context/accounts, with how to close each)

These are **not bugs** — they are surfaces this pass couldn't exercise without extra setup. Each
has a concrete way to validate it:

| Gap | Status | Note |
|---|---|---|
| parent / corporate_trainer / content_creator / franchise dashboards | ✅ **CLOSED** — seeded + validated | created via `/api/auth/signup`; all 4 load real data, no console errors, correct humanized titles/badges (see ISSUE-5) |
| `liveRoom.html` | open (not a defect) | redirects to dashboard without a live-class room id; open `liveRoom.html?class=<id>` for a seeded live class |
| Visual-regression baselines (Phase 8) | open (not a defect) | needs a browser that can spawn; run the authored `e2e/` suite in CI (`.github/workflows/e2e.yml`) |
| Lighthouse perf (Phase 9) | open (not a defect) | run Lighthouse CI against the deployed preview |

### ISSUE-4 (Medium, UX) — Studio mobile still button-heavy; added hide/unhide panels
- **Screen:** `studio.html` · **Severity:** Medium · **Width:** ≤760px
- **Symptom:** even after the Focus mode, the *normal* mobile view stacked both control columns
  (sources + setup) as a long wall of buttons under the board.
- **Fix:** made the two control columns **collapsible** — each gets a sticky header
  (`📥 Sources & scenes`, `⚙ Output & setup`) that toggles its body, and on mobile both **start
  collapsed** so Studio opens to a clean board; tap a header to reveal only what you need
  (`studioToggleCol`). Hidden on desktop where space is ample.
- **Re-verified (live):** both columns start collapsed at 375px (only headers show); toggle
  expands to 21 controls / re-collapses; overflow 0; no console errors. Screenshot captured.

### ISSUE-5 (Low, polish) — raw role names leaked into dashboard title/badge
- **Screen:** `dashboard.html` (corporate_trainer, content_creator, parent) · **Severity:** Low
- **Symptom:** tab title showed `Corporate_trainer Dashboard` (underscore, single-cap); `parent`
  was missing from `ROLE_LABELS`/`ROLE_CLS` so its badge showed raw lowercase `parent`.
- **Fix:** added `parent:'👪 Parent'` to `ROLE_LABELS`/`ROLE_CLS`; the tab title now reuses the
  friendly label (`Corporate Trainer Dashboard`, `Content Creator Dashboard`, `Parent Dashboard`).
- **Re-verified (live):** all 4 roles show humanized titles + badges.

**Re-sweep after these changes:** 11 combinations (studio ×3 widths + 4 new role dashboards ×2)
→ **0 overflows**, no regressions. (Earlier full sweep: 23 combos clean.)

## Environment note

Browser-driven validation used the **preview** browser (the Bash-launched Playwright Chromium
can't spawn in this sandbox — `spawn UNKNOWN`). `preview_resize` emulates width but reports an
inflated `window.innerWidth`; true-viewport checks used sized same-origin iframes, which is why
the login "overflow" resolved to clean.

---

## Continued testing — session 2 (live class + API integration sweep)

Closed the `liveRoom` gap (created a real live class as the teacher and opened
`liveRoom.html?class=<id>`) and ran a broad API-integration sweep. Three more real bugs found,
fixed, and live-verified:

### ISSUE-6 (High) — liveRoom deleted a valid session on any 403
`api()` treated **403 like 401**: a forbidden response cleared `jm_token` and forced re-login. A
403 (authenticated but not allowed — e.g. a student not enrolled) is not an expired session. Now
only 401 clears the token + redirects; 403 surfaces a clear "no access" error and keeps the
session. *(commit `19b901f`)*

### ISSUE-7 (Medium) — liveRoom off-canvas sidebar overflowed 340–360px on mobile
The chat/attendees slide-over (`position:absolute; transform:translateX(100%)`) leaked past the
root (`html` overflow-x was visible), so the page could scroll right into the hidden panel. Fixed
with `position:relative` on body + `html{overflow-x:hidden}`. Re-verified 0 overflow at
360/768/1280; the slide-over still opens and is fully visible. *(commit `19b901f`)*

### ISSUE-8 (High) — GET /api/notifications 500 on every load (schema drift)
The notifications table uses `read_at`/`sent_at` (+ channel/provider/status), but
`routes/notifications.js` queried `is_read`/`created_at` and `services/award.js` inserted
`icon`/`metadata` — neither column exists. Result: every bell/inbox load 500'd, and award-pipeline
notifications silently failed to insert. Aligned both to the real schema (matching the correct
`routes/eduos.js` producer); the read path now maps derived `is_read`/`created_at` aliases.
Live-verified: GET/unread/?status=unread all 200; insert→read→mark-read→delete round-trip
201/200/200/200. *(commit `b5a9108`)*

### API integration sweep (teacher, real token) — otherwise healthy
`/dashboard /calendar /chat/rooms /gamification/summary /live-classes/upcoming /wallet /courses
/marketplace` → all **200**. Course **create→fetch→delete** round-trip → **201/200/200** (writes
persist). `/assignments` 400 (wants a `courseId` query param — by design); `/bookings` &
`/certificates` 404 (no list route at `/` — sub-routes only, not a defect).

### Gap closed
- **liveRoom** — ✅ validated with a real live class; loads (status "scheduled"), 403/responsive
  bugs fixed. Remaining open (not defects): visual-regression + Lighthouse (need a CI browser).

### Known minor (not a crash)
- `/notifications/unread` can serve a stale count briefly after a server-side insert that bypasses
  the per-user GET cache (60s TTL); the query itself is correct. Worth wiring cache invalidation
  into the notification producers in a later pass.
