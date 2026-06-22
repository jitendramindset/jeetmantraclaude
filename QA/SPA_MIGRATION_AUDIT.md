# EduOS — Single App Shell Migration: HTML Audit & Roadmap

Date: 2026-06-22 · Goal: collapse 21 standalone HTML pages into **one application shell**
(`/app`) with dynamic role nav + widget/route rendering. Public marketing/auth pages stay
standalone; everything post-login renders inside the shell.

## Architectural decision (and why)

`dashboard.html` is **already the app shell** — it has role-driven dynamic navigation
(`buildNav`, ~22–27 items/role), a widget engine (`EduOSWidgets`), in-page section routing, the
top bar, sidebar, content area, and a bottom mobile nav. Rebuilding a parallel shell would throw
away thousands of lines of **validated** functionality (3 QA sessions).

**So the migration is evolutionary, not a big-bang rewrite:**
1. Promote `dashboard.html` to the canonical shell, served at **`/app`** (and `/app/*`).
2. Always enter the app at `/app` after auth (done — login + signup redirect there).
3. Bring the heavy standalone modules **into** the shell as routes that render in the content
   area (embed mode hides each module's own chrome) — one module per phase, re-verifying each.
4. Consolidate duplicate admin/settings/widget pages into shell modules, then delete the files.

This preserves every working flow while delivering the single-shell UX incrementally — the
"continuous migration process" the brief asks for, done safely.

---

## Full HTML inventory & classification (21 files)

| File | KB | Purpose | Class | Target route / action | Remove? | Priority | % |
|---|---|---|---|---|---|---|---|
| `dashboard.html` | 689 | Logged-in shell (role nav, widgets, sections) | **App Shell** | served at `/app` | No (it *is* the shell) | — | **100** |
| `index.html` | 1 | Landing/loading splash | Public | Keep `/` | No | — | 100 |
| `website.html` | 223 | Marketing site (features/pricing) | Public | Keep `/website.html` | No | — | 100 |
| `login.html` | 20 | Login (email/OTP/Google) | Public | Keep; redirects → `/app` | No | — | **100** |
| `signup.html` | 45 | Signup | Public | Keep; redirects → `/app` | No | — | **100** |
| `forgot-password.html` | 2 | Forgot password | Public | Keep | No | — | 100 |
| `reset-password.html` | 3 | Reset password | Public | Keep | No | — | 100 |
| `verify-email.html` | 1 | Email verification | Public | Keep | No | — | 100 |
| `marketplace.html` | 40 | Course marketplace | Convert→Route (+public browse) | `/app/marketplace` | After embed | P1 | 10 |
| `settings.html` | 8 | User settings | Convert→Route (consolidate) | `/app/settings` | After merge | P1 | 10 |
| `studio.html` | 160 | Smart-camera studio workspace | Convert→Route (embed) | `/app/studio` | After embed | P2 | 5 |
| `exam-platform.html` | 133 | Test/exam authoring + taking | Convert→Route | `/app/tests` (Test Center) | After embed | P2 | 5 |
| `bhasha-setu.html` | 96 | Language-learning / reading hub | Convert→Route | `/app/learn` (Learning Hub) | After embed | P3 | 5 |
| `liveRoom.html` | 38 | Live class room | Convert→Route | `/app/live/:classId` | After embed | P2 | 5 |
| `admin-os.html` | 59 | Platform OS (admin) | Convert→Route | `/app/admin` | After embed | P2 | 5 |
| `admin.html` | 37 | Legacy SuperAdmin panel | **Merge → Remove** | superseded by admin-os | **Yes** (after parity check) | P1 | 0 |
| `control-center.html` | 10 | "AI Dev Control Center" (dev) | **Remove from prod** | dev-only tool | **Yes** (gate to dev) | P3 | 0 |
| `widgets.html` | 3 | "Your Workspace" widget config | **Merge** | into `/app/settings` → Appearance/Widgets | **Yes** | P2 | 0 |
| `components.html` | 30 | Component/style gallery (dev) | **Remove from prod** | dev style reference | **Yes** (dev-only) | P3 | 0 |
| `jeetmantra-enhance.html` | 21 | Title "Print" — print/legacy template | **Analyze → Remove** | fold any live use into shell print/export | **Likely** | P3 | 0 |
| `webhook-test.html` | 16 | Webhook tester (dev) | **Remove from prod** | dev-only tool | **Yes** (dev-only) | P3 | 0 |

**Summary:** 7 public (keep) · 1 shell · 7 convert-to-route · 6 merge/remove.

---

## Phased roadmap

### ✅ Phase 1 — Canonical `/app` entry (DONE, live-verified)
- `backend/server.js`: `GET /app` + `/app/*` serve the shell (deep-link/refresh safe).
- `login.html` (`redirectToDashboard` + auto-redirect) and `signup.html` now send users to
  `/app?role=…`, never a standalone page.
- Verified: `/app?role=teacher` stays on `/app`, renders the Teacher Dashboard shell (sidebar, 22
  nav items, "👨‍🏫 Teacher" badge), no console errors, no login bounce.

### Phase 2 — In-shell module host + embed mode (next)
- Add a route layer to the shell: `/app#/studio`, `/app#/tests`, `/app#/live/:id`, `/app#/admin`,
  `/app#/marketplace`, `/app#/settings`. The content area hosts the module in an `<iframe>` with
  `?embed=1`; each module checks `embed` and hides its own top bar / exit button / duplicate nav so
  only the shell chrome shows. Start with **studio** (clearest separate workspace), re-verify, then
  exam-platform, liveRoom, admin-os, marketplace, settings.
- Rewrite the shell's `location.href='/studio.html'` / `'/exam-platform.html'` / `'/liveRoom.html'`
  / marketplace links to in-shell route navigation.

### Phase 3 — Consolidate duplicates
- `admin.html` → confirm admin-os parity, repoint links to `/app/admin`, delete file.
- `widgets.html` → merge into `/app/settings` (Appearance/Widgets), delete.
- `control-center.html`, `components.html`, `webhook-test.html`, `jeetmantra-enhance.html` →
  move behind a dev-only guard (or delete from `public/`), keep out of the production shell.

### Phase 4 — Global theme & settings
- One theme system (already partly central via `jm-theme.js`); Settings module owns Theme/Color/
  Font/Language/Accessibility/Layout. Remove any per-page theme toggles once modules are embedded.

### Phase 5 — Re-audit
- Full responsive + role + nav sweep of the unified shell (reuse the `e2e/` suite + the live
  preview harness from the QA sprint). Stop condition: no standalone **application** HTML remains —
  only landing, website, login, signup, forgot/reset password, verify-email.

---

## Stop condition tracking
Standalone application pages remaining to absorb: **7** (studio, exam-platform, bhasha-setu,
liveRoom, admin-os, marketplace, settings) + **6** to merge/remove. Public pages that legitimately
stay standalone: index, website, login, signup, forgot-password, reset-password, verify-email.
