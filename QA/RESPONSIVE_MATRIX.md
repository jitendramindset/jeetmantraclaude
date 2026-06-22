# Responsive QA Matrix — EduOS Platform

Status legend:

- **Auto** — Automatically checked by `e2e/specs/responsive.spec.js` at this exact
  (page, viewport) pair. The automated invariant is **no horizontal overflow**
  (`document.documentElement.scrollWidth <= clientWidth + 2px`), plus `<body>` is
  visible and has non-empty rendered text. A screenshot is captured per pair into
  `test-results/responsive/`. **Authored — not asserted to pass here.** Run with the
  server up to get a runtime verdict.
- **Manual** — Requires manual visual review. Either the page is not in the automated
  page list, or the viewport is not in the automated viewport list, or both.

> Honesty note: every "Auto" cell below means the check is *authored and wired*, not
> that it has been executed and passed. The suite self-skips when `GET /health` is
> unreachable (`beforeAll` guard). Overflow is the only layout property the automation
> measures; spacing, alignment, truncation, control reachability, video/canvas behavior,
> and aesthetics are **always** manual.

---

## Scope of the automated suite (ground truth)

Source: `e2e/specs/responsive.spec.js`.

**Pages automated (5):** `login.html`, `signup.html`, `marketplace.html`,
`dashboard.html?role=student` (seeded session via `e2e/fixtures/session.js`),
`settings.html`.

**Viewports automated (7):**

| Label in spec        | Size       |
|----------------------|------------|
| `360x640-phone-sm`   | 360 × 640  |
| `390x844-phone`      | 390 × 844  |
| `768x1024-tablet`    | 768 × 1024 |
| `1024x768-tablet-l`  | 1024 × 768 |
| `1366x768-laptop`    | 1366 × 768 |
| `1920x1080-desktop`  | 1920 × 1080|
| `2560x1440-2k`       | 2560 × 1440 (smartboard) |

**Not in the automated suite:**

- **Pages:** `studio.html`, `liveRoom.html`, `admin-os.html` — none are exercised by
  `responsive.spec.js`. (The dashboard is seeded for the `student` role only; other
  roles render the same `dashboard.html?role=<role>` shell and are manual.)
- **Viewport:** `3840 × 2160` (4K TV) — not present in the spec's `VIEWPORTS` array.
- **Total combinations:** 5 pages × 7 viewports = **35 automated (page, viewport)
  pairs**. Everything else in the matrix below is manual.

---

## Matrix — Pages × Viewports

Columns are viewports. Cells are **Auto** (covered by the spec) or **Manual**.

| Page \ Viewport            | 360×640 | 390×844 | 768×1024 | 1024×768 | 1366×768 | 1920×1080 | 2560×1440 (smartboard) | 3840×2160 (4K TV) |
|----------------------------|:-------:|:-------:|:--------:|:--------:|:--------:|:---------:|:----------------------:|:-----------------:|
| **login.html**             | Auto    | Auto    | Auto     | Auto     | Auto     | Auto      | Auto                   | Manual            |
| **signup.html**            | Auto    | Auto    | Auto     | Auto     | Auto     | Auto      | Auto                   | Manual            |
| **marketplace.html**       | Auto    | Auto    | Auto     | Auto     | Auto     | Auto      | Auto                   | Manual            |
| **dashboard.html** (student)| Auto   | Auto    | Auto     | Auto     | Auto     | Auto      | Auto                   | Manual            |
| **settings.html**          | Auto    | Auto    | Auto     | Auto     | Auto     | Auto      | Auto                   | Manual            |
| **studio.html**            | Manual  | Manual  | Manual   | Manual   | Manual   | Manual    | Manual                 | Manual            |
| **liveRoom.html**          | Manual  | Manual  | Manual   | Manual   | Manual   | Manual    | Manual                 | Manual            |
| **admin-os.html**          | Manual  | Manual  | Manual   | Manual   | Manual   | Manual    | Manual                 | Manual            |

Counts: **35 Auto** cells (5 automated pages × 7 automated viewports). All remaining
cells — the 4K TV column for every page, plus all of `studio`, `liveRoom`, and
`admin-os` — are **Manual** (29 cells).

---

## What "Auto" actually verifies (and does not)

Per the spec, each Auto pair asserts:

1. **No horizontal overflow** — `scrollWidth - clientWidth <= 2px` (sub-pixel/scrollbar
   tolerance).
2. **`<body>` is visible.**
3. **`<body>` has non-empty rendered text** (`innerText.trim().length > 0`).

The suite does **not** assert: correct vertical layout, no clipped/overlapping
controls, readable font sizes, working sticky headers/sidebars, modal/drawer behavior,
touch-target sizing, or any pixel-diff. Those remain manual even on Auto cells.

Notes on the dashboard Auto cells:

- `dashboard.html?role=student` is reached by seeding a **frontend** session
  (`seedSession(page, 'student')`) so the client-side guard does not bounce to
  `/login.html`. The seeded JWT is **not** backend-valid, so dashboard data XHRs may
  `401`; layout invariants are measured on the **static shell**, which is unaffected.
- The spec guards against a redirect bounce by asserting the URL still contains
  `/dashboard.html` after load.
- Only the **student** dashboard variant is automated. The other 10 roles
  (`teacher, partner, school, coaching, admin, parent, corporate_trainer,
  content_creator, franchise`) share the same file but are **manual** for responsive
  review.

---

## Manual visual review — required checklist

These need a human (or an extended/visual-diff pass) because they fall outside the
automated page/viewport set or involve media/canvas the overflow check cannot judge.

### studio.html (teacher live-class studio) — all viewports, Manual

- Multi-element layout (camera, screen, recording, course-connect panels) must reflow
  without overlap from 360-wide phones up to 4K.
- Camera/preview surfaces and control bars: verify no clipping and that record/connect
  controls stay reachable at small heights (e.g., 1024×768, 1366×768).
- Smartboard (2560×1440) and **4K TV (3840×2160)**: confirm controls and video scale up
  rather than pinning to a tiny top-left region; check text legibility at large sizes.

### liveRoom.html (participant live room) — all viewports, Manual

- Requires `?class=<id>` and a token; guard redirects to `/login.html` when either is
  missing and clears `jm_token` on `401`. Manual setup of a session/class is needed.
- Video tiles / participant grid reflow across phone → tablet → desktop → TV.
- 4K TV (3840×2160): verify the stage uses the available area and chat/roster panels do
  not become hairline-thin or oversized.

### admin-os.html (Admin Platform OS) — all viewports, Manual

- Admin-gated (`token AND role === 'admin'`, else redirect to
  `/login.html?next=/admin-os.html`); needs a real admin session to render. Uses the
  `X-Active-Institution` (`jm_active_institution`) context.
- Dense admin tables, people/institute panels, widget-config (`#wgcRole`, `#pp-role`),
  impersonation, and bookings/payments oversight: check for table overflow, sticky
  headers, and column truncation at 360–768 widths.
- Smartboard / 4K: confirm dense data UI scales legibly and does not leave large empty
  gutters.

### 4K TV (3840 × 2160) column — every page, Manual

Not in the spec's viewport matrix, so **no page** is auto-checked at 4K. Manually
verify on all eight pages: content does not pin to a narrow top-left region, max-width
containers center sensibly, font/control scaling is legible at TV viewing distance, and
no unexpected horizontal scrollbar appears.

---

## How to run the automated portion

```bash
# from repo root; server must serve public/ statically and answer GET /health
E2E_BASE_URL=http://localhost:5000 npx playwright test e2e/specs/responsive.spec.js
```

- If the server is down, `beforeAll` sets `serverUp = false` and `beforeEach` **skips**
  every test — a clean run will report skips, not failures.
- Per-pair screenshots land in `test-results/responsive/<page>__<viewport>.png`; use
  them as the visual artifact for the Manual review of the same pages and for the
  smartboard column.
