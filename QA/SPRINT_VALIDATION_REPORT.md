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
| Studio | ✅ | ✅ | ✅ clean (canvas) | ✅ | ✅ | |
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

## Not validated this pass (needs context/accounts — not defects)

- **liveRoom.html** redirects to the dashboard without a live-class room id — needs a seeded
  active class to exercise; not a bug.
- **parent / corporate_trainer / content_creator / franchise / guest-faculty** dashboards — no
  `*_test@jm.test` accounts exist; seed them to validate (the 6 covered roles share the same
  `dashboard.html` engine, so risk is low).
- Visual-regression baselines (Phase 8) and Lighthouse perf (Phase 9) — the authored Playwright
  suite (`e2e/`) covers screenshot capture; run in CI where a browser can spawn.

## Environment note

Browser-driven validation used the **preview** browser (the Bash-launched Playwright Chromium
can't spawn in this sandbox — `spawn UNKNOWN`). `preview_resize` emulates width but reports an
inflated `window.innerWidth`; true-viewport checks used sized same-origin iframes, which is why
the login "overflow" resolved to clean.
