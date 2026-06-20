# EduOS / JeetMantra — Student Success Platform Audit

**Author:** CTO Office
**Date:** 2026-06-20
**Vision:** Duolingo + Google Classroom + Coursera + Khan Academy + Notion + Discord — gamified, engaging, motivating, mobile-first, voice-first, fully multilingual.
**Reuse posture:** 30+ routers, ~190 endpoints already exist. Most "missing" student features are wiring + a handful of new tables (streaks, badges, achievements, certificates, flashcards, study plans).

---

## 1. Current Student Workflow Analysis

The student journey today is functional but transactional — built for "do homework, take test, watch lecture" not for "fall in love with learning daily."

**What works (strong foundation, already shipped):**

- **Dashboard render** (`public/dashboard.html:503-574`, renderer `renderStudentDash` at `1372-1389`) — 4 KPI cards, Continue Learning, My Courses, Assignments, Live, Purchases, Tests, Submissions, Wall, Notes, Profile.
- **Continue Learning** — `renderContinueLearning` (`dashboard.html:9286-9308`) consuming `GET /api/student/continue-learning` (`backend/routes/studentExtras.js:200`). Picks the first lecture with no `lecture_progress` row.
- **Reader** — `openReader` / `_renderReader` (`dashboard.html:6493-6754`) is a flagship experience: TOC, video, notes panel, KaTeX, offline IndexedDB fallback (`6644-6659`), and inline AI Summarize / Explain / Ask Tutor on every lecture (`6700-6702`).
- **Tests & assignments** — `openTakeTest` (`3561`), `openSubmitAssignment` (`3720`), session start/submit + proctor events at `routes/courseContent.js:436/453/775`.
- **Live join** — `joinLive(id)` wired from `s-liveList` (`1384`).
- **Calendar (legacy)** — student still calls `/api/student/calendar` (`studentExtras.js:384`); unified `/api/calendar` (`routes/calendar.js:67`) shipped Sprint 2 but **student frontend not yet rewired** (S2A-2 deferred).
- **Voice TTS in reader** — `vSpeak` / `readerSpeakAll` (`6188-6229`) with multilingual voice picker.
- **AI in reader** — Tutor (`/api/ai/tutor`, `ai.js:345`), Summarize, Explain (`dashboard.html:2829, 2836`).
- **Multi-institute switching** — Sprint 1, personal academy auto-provisioned.

**What is broken / underwhelming for student motivation:**

- **No emotional hook on the dashboard.** `renderNextClassHeader` (`8231-8275`) is **creator-gated** at line `8233`. Students get no countdown banner, no greeting, no streak chip, no XP, no "you're on fire today."
- **No quick-action bar.** `injectQuickActions` (`8170-8190`) hard-returns for non-creators at `8173`. Students lack one-tap "Resume", "Ask AI", "Take quiz", "Translate."
- **Today is anaemic.** `renderTodaySchedule` (`8195-8225`) student branch only hits `/live-classes/upcoming` — no tests due, no assignments due, no AI-suggested practice for today.
- **Continue Learning is binary** — `lecture_progress.completed=true` only. No `last_position` seconds, no scrub-resume on videos, no per-topic %.
- **Activity Wall is a list, not a feed.** `logEvent` (`activity.js:19`) is only emitted from 2 sites: `assignments.js:58` and `courseContent.js:563`. Enrollment, lecture-completion, payment, certificate, streak, badge events do not surface.
- **Translation invisible.** `content_translations` + `translations.js` shipped Sprint 3; zero frontend consumer. Students cannot "Translate this topic" anywhere in the reader.
- **Calendar fragmented.** Student dashboard does not yet consume `/api/calendar`.
- **No gamification anywhere.** Zero grep hits for streak/xp/badge/leaderboard/achievement in `dashboard.html` beyond CSS pill styling (`107-111`).

---

## 2. Missing Features

Ranked by student-motivation impact:

| # | Feature | Why it matters |
|---|---|---|
| F1 | **Daily streak + freeze** | The Duolingo hook. Drives daily return. |
| F2 | **XP + level + progress ring** | Tangible reward for every action. |
| F3 | **Badges & achievements wall** | Long-term collection loop. |
| F4 | **Leaderboards** (course / institute / friends) | Discord-style social pressure. |
| F5 | **AI Study Plan (weekly, persisted)** | Khan Academy mastery map. |
| F6 | **AI Flashcards + SRS revision** | Anki-grade retention. |
| F7 | **Translate this** on every reader surface | Unlocks 12 languages for 100% of stored content. |
| F8 | **Listen to this** on tests / assignments / chat / notifications | Voice-first inclusivity. |
| F9 | **Resume-from-second** on video lectures | Eliminates re-scrub friction. |
| F10 | **Today agenda** (tests + assignments + live + AI practice) consuming `/api/calendar` | One screen, one truth. |
| F11 | **Certificate gallery + share + verify URL** | Social proof, recruiter-ready. |
| F12 | **Skill tree + mastery viz** | Replaces flat "Skills Tracked: 3" stat. |
| F13 | **Friends / study buddies + presence** | Discord-style social layer. |
| F14 | **Real-time activity feed** | Replaces dead `s-wallList`. |
| F15 | **Onboarding nudge + empty-state illustrations** | First-90-seconds matters. |
| F16 | **Push notifications** (web + mobile) | Re-engagement. |
| F17 | **Quick-action bar for students** | Lift the creator-only gate on `injectQuickActions`. |
| F18 | **Greeting + next-class countdown** | Lift the creator-only gate on `renderNextClassHeader`. |
| F19 | **Voice-to-text into AI Tutor** | Lower the typing barrier. |
| F20 | **Wishlist + similar courses + ratings** in marketplace | Discovery loop. |

---

## 3. Missing APIs

All routes scoped under `/api/student/*` unless noted. Reuse existing middleware (`authenticateToken`, `resolveInstitution`).

| # | Method + Path | Purpose | New table(s) |
|---|---|---|---|
| A1 | `GET /api/student/streak` | current, longest, last_active, freezes_left, today_done | `study_streaks` |
| A2 | `POST /api/student/streak/checkin` | idempotent daily ping | — |
| A3 | `GET /api/student/xp` | total, level, this_week, next_level_at | `user_xp_ledger` |
| A4 | `POST /api/student/xp/award` (internal) | called from `logEvent` hook | — |
| A5 | `GET /api/student/badges` | earned + locked catalog | `badges`, `user_badges` |
| A6 | `POST /api/student/badges/award` (system) | event-driven | — |
| A7 | `GET /api/student/leaderboard?scope=course\|institute\|global&window=daily\|weekly\|alltime` | ranked list | `leaderboard_snapshots` |
| A8 | `POST /api/ai/study-plan` | persisted weekly plan | `study_plans`, `study_plan_items` |
| A9 | `GET /api/student/study-plan` | current week | — |
| A10 | `POST /api/ai/flashcards/generate` | from lecture/topic | `flashcards` |
| A11 | `GET /api/student/flashcards?due=true` | SRS-due cards | `flashcard_reviews` |
| A12 | `POST /api/student/flashcards/:id/review` | SM-2 update | — |
| A13 | `POST /api/ai/revision-notes` | from lecture (today only `transcribe-summary` `ai.js:248`) | — |
| A14 | `POST /api/ai/explain-wrong-answer` | feed `test-history` row to AI | — |
| A15 | `GET /api/student/certificates` | list (today only single-fetch `courses.js:569`) | `certificates` |
| A16 | `GET /api/certificates/verify/:hash` (public) | recruiter verification | — |
| A17 | `POST /api/student/certificates/:id/share` | one-click LinkedIn | — |
| A18 | `POST /api/student/skills` / `POST /:id/assess` / `GET /recommendations` | skill writes (today read-only via dashboard `skillsThisWeek`) | extend `user_skills` |
| A19 | `GET /api/student/learning-path` | prerequisite graph | `learning_paths`, `learning_path_courses` |
| A20 | `GET /api/notifications` / `POST /:id/read` | dedicated feed (today fused into `activity.js:34`) | `notifications` |
| A21 | `POST /api/student/lectures/:id/position` | seconds-level resume | extend `lecture_progress` |
| A22 | `GET /api/content/:type/:id/translation?lang=` | wrap Sprint 3 `translations.js GET /content` | — |
| A23 | `POST /api/student/friends/request`, `GET /friends`, `GET /friends/presence` | social layer | `friendships` |
| A24 | `GET /api/student/today` | aggregate (live + tests + assignments + AI suggestion + streak) | — |
| A25 | `POST /api/push/subscribe` / `POST /api/push/send` (internal) | web push | `push_subscriptions` |

**Producer hooks to add inside `logEvent` (single change point in `activity.js:19`)** so every new event also: (a) writes to `notifications`, (b) awards XP, (c) checks badge rules, (d) bumps streak. Trigger from:

- `enrollments.js:44` (enroll), `courses.js:569` (cert earned), payment success in `wallet.js`, `studentExtras.js:287` (lecture completed), live join in `live-classes/*`, chat send in `chat.js:156`, AI tutor ask in `ai.js:345`, marketplace purchase in `marketplace.js:237`.

---

## 4. Missing UI Components

Mobile-first, all reachable from `dashboard.html` student section (`503-574`):

| # | Component | Mount point |
|---|---|---|
| U1 | **StreakChip** (🔥 N + freezes) | new topbar slot next to `468`; mirror on bottom nav |
| U2 | **XPRing + LevelBadge** | new `s-xp` card top of student section |
| U3 | **BadgeWall** | new tab inside Profile (`s-profile`) |
| U4 | **Leaderboard tab** | new section after Activity Wall |
| U5 | **TodayCard** (countdown + agenda) | lift gate on `renderNextClassHeader` (`8233`); add student render path |
| U6 | **StudentQuickActionBar** | lift gate on `injectQuickActions` (`8173`); chips: Resume, Ask AI, Translate, Flashcards, Practice |
| U7 | **AITutorHero** | dashboard hero card (today only inside reader) |
| U8 | **TranslateThisButton** | inside `_renderReader` near `6700-6702` for topic/lecture/material |
| U9 | **LanguageSwitcher** (per-page) | reader header |
| U10 | **ListenButton** | render in test question stems, assignment prompts, chat bubbles, notification rows |
| U11 | **MicInput for AI Tutor** | `aiTutorIn` at `6363` — reuse `micBtn` already used at `6734` |
| U12 | **FlashcardDeckViewer** + swipe gestures | new modal `openFlashcards()` |
| U13 | **SkillTree** | replace flat `s-skills` integer (`1378`) with a visual mastery graph |
| U14 | **CertificateGallery + ShareSheet** | inside Profile |
| U15 | **FriendsList + PresenceDots** | sidebar drawer |
| U16 | **ActivityFeedCard** (real-time, icons, templates) | upgrade `s-wallList` |
| U17 | **EmptyStates with illustrations** | replace plain text at `514, 540, 545` |
| U18 | **OnboardingChecklist** ("first 5 steps") | dismissible card top of dashboard |
| U19 | **CircularProgressRing** | swap `.progress-bar` `1422,1428` |
| U20 | **NotificationCenter v2** | upgrade existing `8327` to consume `/api/notifications` with read-state |
| U21 | **MarketplaceFiltersDrawer** | rating, language, schedule, age, distance |
| U22 | **WishlistButton** on course cards | call existing `studentExtras.js:337` |
| U23 | **MotivationalGreeting** | port `renderGreeting` to student path |
| U24 | **AIStudyPlanCard** (weekly) | new card on dashboard |

---

## 5. Missing Analytics

Today: `studentExtras.js` exposes `time-summary` (`97`), `activity-daily` (`111`), `progress` (`142`). The student dashboard does not chart any of it.

**Student-facing additions:**

1. **Streak heatmap** (GitHub-style 12-week grid) consuming `/activity-daily`.
2. **Time-on-task weekly bar chart** consuming `/time-summary`.
3. **Mastery radar** per subject/skill.
4. **Test-score trendline** from `/test-history` (`studentExtras.js:165`).
5. **Strengths vs weaknesses** auto-tagged from question-level test data (requires storing `question_id` on `test_submissions.answers` JSON).
6. **Predicted exam readiness %** (AI-derived) — blends mastery + recency + practice volume.
7. **"You vs the class"** — anonymized class median overlay on every chart.
8. **Course velocity** — lectures/week, projected finish date.
9. **AI Tutor usage** — questions asked, top topics.
10. **Translation usage** — which languages, which content (signal for Sprint 3 ROI).

**Operator-facing (institute admin) additions:** at-risk student detection (streak break + falling score), cohort retention curve, language-mix per institute, AI-tutor heat per topic, certificate-issuance rate.

---

## 6. Missing Gamification Features

Backend grep confirmed: zero gamification primitives exist.

| Layer | What to add | Notes |
|---|---|---|
| **Currency** | XP (lifetime), Coins (spendable) | XP from event rules; Coins purchasable + earned. Reuse `wallet.js` for Coins. |
| **Levels** | Level 1–100 with XP curve; unlock cosmetics, AI credits, themes | `user_xp_ledger` is the truth; level is derived. |
| **Streaks** | Daily streak + 2 freezes/month + "streak saver" purchasable | `study_streaks` table; check-in idempotent per day. |
| **Achievements** | First lecture, 7-day streak, perfect quiz, polyglot (used 3 languages), night-owl, early-bird, marathon (3h session), certified (first cert), 100 flashcards reviewed, helped a friend | `badges` (catalog) + `user_badges`. |
| **Leaderboards** | Course / institute / friends / global; daily / weekly / all-time | Materialized via cron into `leaderboard_snapshots`. |
| **Quests** | Daily (3 small), Weekly (1 big) — auto-generated per enrolled course | Reuse `study_plans` table with `quest=true`. |
| **Streak-recovery** | Pay Coins or watch ad to restore | Spend hook in `wallet.js:111`. |
| **Cosmetics** | Avatar frames, profile themes, banner art | Unlock via level / achievements. |
| **Combos** | "3 quizzes in a row 100%" → bonus XP | Stateless check in award hook. |
| **Class league** | Discord-style weekly class ranking with promotion/demotion bronze→silver→gold | Pure derivation from snapshots. |
| **Social proof** | "12 classmates are studying right now" presence pill | Requires `friendships` + presence ping. |

**Event→XP rule examples** (configured in a single JSON map):

- Lecture completed: 20 XP
- Test passed ≥80%: 100 XP, ≥60%: 40 XP
- Assignment submitted on time: 50 XP
- Daily check-in: 10 XP (multiplier with streak)
- Flashcard reviewed (SRS): 2 XP
- AI Tutor question: 5 XP (capped daily)
- Translate-this used: 5 XP (capped)
- Live class attended ≥80%: 60 XP

---

## 7. Missing AI Features

Reuse `routes/ai.js` (tutor `345`, suggest `403`, lesson-plan `458`, practice-questions `484`, translate `94`, transcribe-summary `248`).

| # | AI feature | Endpoint to add | Surface |
|---|---|---|---|
| AI1 | **Persisted weekly study plan** | `POST /api/ai/study-plan` | Dashboard card + Today |
| AI2 | **Flashcard generator** | `POST /api/ai/flashcards/generate` | Per lecture/topic + bulk per course |
| AI3 | **Spaced revision (SRS)** | `POST /api/student/flashcards/:id/review` | Daily review modal |
| AI4 | **Revision notes from lecture** | `POST /api/ai/revision-notes` | Reader topic header |
| AI5 | **Quiz from topic** | reuse `practice-questions` `484` + persist | Reader topic header |
| AI6 | **Explain-my-wrong-answer** | `POST /api/ai/explain-wrong-answer` | Test result detail |
| AI7 | **Weakness diagnosis** | `POST /api/ai/diagnose` (feed `/test-history`) | Profile + Today |
| AI8 | **Voice tutor (STT in)** | client uses Web Speech API → existing `/tutor` | `aiTutorIn` `6363` |
| AI9 | **Voice tutor (TTS out)** | reuse `vSpeak` `6189` on tutor responses | Tutor panel |
| AI10 | **Real-time translation in chat** | wrap `translate` `94` | `chat.js:156` outbound on demand |
| AI11 | **Auto-summary of live class** | reuse `transcribe-summary` `248` post-class | Course workspace |
| AI12 | **Career coach** | `POST /api/ai/career` | Profile → Career tab |
| AI13 | **Smart search (semantic)** | `POST /api/ai/search` over enrolled-course corpus | Cmd-K (`447`) |
| AI14 | **Adaptive difficulty** in practice | server-side selection of next question | `practice-questions` |
| AI15 | **"Notion-style"** ask-anywhere AI on notes | reuse `tutor` with note context | `loadNotes` `5417` |

---

## 8. Recommended Dashboard Layout

Mobile-first, three-zone vertical scroll. All sections lazy-load.

```
┌─────────────────────────────────────────────┐
│ TOPBAR  [🔥 12]  [💎 L7 1820/2400]  [🔔 3] [🌐 hi] │  ← StreakChip + XPRing + Notif + Lang
├─────────────────────────────────────────────┤
│ GREETING + Next class in 23m → Join         │  ← lift gate on renderNextClassHeader
├─────────────────────────────────────────────┤
│ QUICK ACTIONS  [Resume] [Ask AI] [Flashcards] [Translate] [Practice] │
├─────────────────────────────────────────────┤
│ TODAY  (agenda from /api/calendar)           │
│  • 10:00 Live: Algebra II  (Join)            │
│  • Due Test: Chapter 4 quiz  (Take)          │
│  • Due Assignment: Essay v2  (Submit)        │
│  • AI suggestion: Review fractions (Start)   │
├─────────────────────────────────────────────┤
│ CONTINUE LEARNING  (resume-from-second)      │
├─────────────────────────────────────────────┤
│ STUDY PLAN (week) — 3 of 7 done • ring      │
├─────────────────────────────────────────────┤
│ FLASHCARDS DUE  [Review 14 →]                │
├─────────────────────────────────────────────┤
│ MY COURSES  (grid w/ progress ring)          │
├─────────────────────────────────────────────┤
│ ACHIEVEMENTS  recent 3 + [See all]           │
├─────────────────────────────────────────────┤
│ LEADERBOARD  (Friends · Class · Institute)   │
├─────────────────────────────────────────────┤
│ ACTIVITY FEED (real-time, iconified)         │
├─────────────────────────────────────────────┤
│ MARKETPLACE — "for you" (AI rec)             │
└─────────────────────────────────────────────┘
BOTTOM NAV: Home · Learn · Quests · Friends · Profile
```

`PRESETS.student` at `dashboard.html:8298-8304` rewrites to: Home, Learn, Quests, Friends, Profile.

---

## 9. Responsive Improvements

Current breakpoints: `768`, `1100`, `760`, `640` (`9365`), `420` (`9381`), `1600` (`9386`), `2000` (`9405`), `(pointer:coarse) and (min-width:1200px)` (`9412`).

**Mobile (≤640px) fixes:**

1. StreakChip and XPRing collapse to icon-only with badge count.
2. Quick-action bar becomes horizontal scroll with snap-points.
3. Today agenda becomes vertical timeline with sticky time gutter.
4. Reader `_renderReader` already collapses to 1-col at 1100/760 — add a **floating "Translate / Listen / Ask AI" FAB** on mobile to reach `6700-6702` actions without scrolling.
5. Course grid → 1 col is in place at `9365`; add **swipeable carousels** for Continue Learning, Flashcards Due, Achievements.
6. Bottom nav (`8298-8304`) keep at 5 items max; show streak as a small pip on the Home icon when on a streak.
7. Tests on mobile: collapse instructions to bottom-sheet; question full-screen.
8. Notification center (`8327`) → bottom-sheet on mobile, side-rail on desktop.
9. Add `prefers-reduced-motion` guard around all new XP/streak animations.
10. Voice/Listen buttons sized ≥44px tap target.

**Tablet (768–1100):** two-column layout for dashboard — left rail (Streak, XP, Today, Quick Actions), right column (Continue, Courses, Activity).

**Desktop (≥1600):** three-column — add Friends/Presence rail on the right.

---

## 10. Implementation Plan

**Guiding rule:** ship value every week. No new feature without a backend hook into `logEvent` so the gamification loop tightens with each release.

### Phase 1 — Foundations (Weeks 1–2)
- **Tables:** `study_streaks`, `user_xp_ledger`, `badges`, `user_badges`, `notifications`.
- **Hook:** centralize event production by extending `logEvent` (`activity.js:19`) to also (a) award XP per rule map, (b) bump streak, (c) check badge rules, (d) insert into `notifications`.
- **Producers:** add `logEvent` calls in `enrollments.js:44`, `courses.js:569`, `studentExtras.js:287`, `wallet.js`, `chat.js:156`, `ai.js:345`, `marketplace.js:237`, `live-classes/*` join.
- **APIs:** A1–A7, A20.
- **UI:** StreakChip (U1), XPRing (U2), upgraded NotificationCenter (U20). Lift student gate on `renderNextClassHeader` (`8233`) and `injectQuickActions` (`8173`).
- **Acceptance:** every student-meaningful action awards XP, increments streak, and surfaces in the new notification center.

### Phase 2 — Today & Translation (Weeks 3–4)
- **Calendar rewire (closes S2A-2):** student dashboard now consumes `GET /api/calendar` (`calendar.js:67`). Retire `/student/calendar` call at `dashboard.html:8959`.
- **TodayCard** (U5) — agenda from unified calendar + AI-suggested practice.
- **Translate this** (U8) + **LanguageSwitcher** (U9) consuming Sprint 3 `translations.js`. Reader integration around `6700-6702`. **First frontend consumer of `content_translations`.**
- **Listen** (U10) extending `readerSpeakAll` (`6194`) to test stems, assignment prompts, chat bubbles, notifications.
- **MicInput for AI Tutor** (U11) — reuse `micBtn`.

### Phase 3 — Mastery loops (Weeks 5–6)
- **Tables:** `flashcards`, `flashcard_reviews`, `study_plans`, `study_plan_items`.
- **APIs:** A8–A14.
- **UI:** FlashcardDeckViewer (U12), AIStudyPlanCard (U24), SkillTree (U13).
- **Resume-from-second** — extend `lecture_progress` with `last_position_seconds`; API A21; reader video player wires `timeupdate` throttled writes.
- **Achievements wave 1** — 10 starter badges shipped.

### Phase 4 — Social (Weeks 7–8)
- **Tables:** `friendships`, `leaderboard_snapshots`, `push_subscriptions`.
- **APIs:** A7 (full), A23, A25.
- **UI:** Leaderboard tab (U4), Friends list (U15), ActivityFeed upgrade (U16), BadgeWall (U3).
- **Class league** weekly promotion/demotion cron.
- **Web push** for streak reminder, class start, leaderboard rank changes.

### Phase 5 — Discovery & Career (Weeks 9–10)
- **Tables:** `certificates`, `learning_paths`, `learning_path_courses`.
- **APIs:** A15–A19, AI12, AI13.
- **UI:** CertificateGallery (U14), MarketplaceFiltersDrawer (U21), WishlistButton (U22), CareerCoach panel.
- **Smart search** in Cmd-K.

### Phase 6 — Polish (Week 11)
- Empty states with illustrations (U17), onboarding checklist (U18), CircularProgressRing (U19), responsive sweeps, perf budget, push-notif consent flow.

---

## 11. Completion Percentage

Per area, weighted by student-experience impact.

| Area | Backend | Frontend | Weighted | Notes |
|---|---|---|---|---|
| Auth + roles + multi-institute | 95% | 90% | **92%** | Sprint 1 |
| Courses + content + reader | 85% | 80% | **82%** | Reader is a strength |
| Tests + assignments | 85% | 80% | **82%** | Solid |
| Live classes | 80% | 75% | **77%** | Works |
| Calendar | 90% (unified) | 30% (student still legacy) | **55%** | S2A-2 deferred |
| Marketplace | 70% | 55% | **62%** | Filters thin, no ratings |
| Wallet + payments | 80% | 70% | **75%** | OK |
| Activity feed | 50% (only 2 producers) | 50% | **50%** | Underfed |
| Notifications | 30% (fused into wall) | 30% | **30%** | Dedicated route missing |
| AI tutor / summarize / explain | 80% | 70% | **75%** | Strong in reader, weak on dashboard |
| AI study plan / flashcards / SRS / weakness | 10% | 0% | **5%** | Mostly missing |
| Voice (TTS) | 70% (reader) | 35% (reader only) | **50%** | Needs to spread |
| Voice (STT) | 30% | 10% | **20%** | Cmd-K only |
| Translation backend (Sprint 3) | 85% | **0%** | **40%** | No consumer yet |
| Gamification (streak/XP/badges/leaderboard) | 0% | 0% | **0%** | Greenfield |
| Skill tracking / learning path | 20% (read only) | 10% | **15%** | `user_skills` exists |
| Certificates | 40% (single fetch) | 20% | **30%** | No list/verify/share |
| Continue Learning / resume | 60% | 60% | **60%** | Binary completion only |
| Friends / social | 0% | 0% | **0%** | Greenfield |
| Mobile responsiveness | 70% | 70% | **70%** | Good base, needs polish |
| Onboarding & empty states | 30% | 30% | **30%** | Plain text only |

**Overall student-experience completion: ~56%.**

Backend ~62% (heavy lifting done across 30+ routers, gaps are tables + a handful of routes). Frontend ~48% (reader strong, dashboard motivational layer is the gap). Weighted by motivational impact, the headline is **56%** — a functional LMS with the gamified-learning soul not yet wired in.

---

## 12. Next Sprint Plan — Sprint 4: "Streak, Translate, Today"

**Theme:** turn EduOS from a functional LMS into a daily habit.
**Duration:** 2 weeks.
**Goal:** ship the gamification spine + close the two deferred Sprint 2/3 gaps (`/api/calendar` for student, first `content_translations` consumer).

### Scope

**Backend (Week 1)**
- Migrations: `study_streaks`, `user_xp_ledger`, `badges`, `user_badges`, `notifications`.
- Extend `activity.js logEvent` (`19`) into a single award-pipeline (XP + streak + badge + notification).
- New routes: `GET /api/student/streak`, `POST /streak/checkin`, `GET /xp`, `GET /badges`, `GET /api/notifications`, `POST /:id/read`, `GET /api/student/today`.
- Add `logEvent` producers in `enrollments.js:44`, `studentExtras.js:287`, `courses.js:569`, `wallet.js` payment success, `chat.js:156`, `ai.js:345`, `live-classes/*` join, `marketplace.js:237`.
- XP rule map (JSON, version 1).
- 10 starter badges seeded.

**Frontend (Week 2)**
- StreakChip + XPRing in topbar (`dashboard.html:468` neighborhood).
- Lift creator gates: `renderNextClassHeader` (`8233`), `injectQuickActions` (`8173`).
- Student-flavored QuickActionBar: Resume, Ask AI, Translate, Flashcards (placeholder), Practice.
- New **TodayCard** consuming `GET /api/calendar?view=day` — replaces `/student/calendar` legacy call at `8959`. Closes **S2A-2**.
- **Translate-this** button inside `_renderReader` near `6700-6702`, wired to Sprint 3 `GET /api/translations/content`. First production consumer of `content_translations`. Closes **Sprint 3 frontend gap**.
- LanguageSwitcher in reader header (12 supported languages).
- NotificationCenter v2 consuming `/api/notifications` with read-state.
- Listen-this on test question stems and assignment prompts (extend `readerSpeakAll` `6194`).
- MicInput on `aiTutorIn` (`6363`) — reuse existing `micBtn`.
- Responsive: 44px tap targets on all new buttons, mobile bottom-sheet for notifications.

### Out of scope (Sprint 5)
Flashcards + SRS, leaderboards, friends, certificate gallery, learning paths, smart search.

### Acceptance criteria
- Every student action across the 8 producer sites awards XP and updates streak within 1 request.
- Student lands on dashboard and sees streak, XP, level, next class countdown, today agenda.
- Student can switch any reader page to any of 12 languages and persist preference.
- Student can hit Listen on a test question and Mic into AI Tutor.
- Zero call to legacy `/api/student/calendar` from `dashboard.html`.
- Mobile Lighthouse Perf ≥ 85 on student dashboard, A11y ≥ 95.

### Risks
- **Award-pipeline hot path:** keep XP/streak/badge writes async-fire-and-forget where possible to avoid latency regression on the producer routes.
- **Translation cost:** cache aggressively in `content_translations`; serve from DB on hit, AI fallback on miss with TTL.
- **Notification fan-out:** index `notifications(user_id, created_at desc)` from day one.

### Definition of Done
Gamification spine live, Sprint 2 student calendar gap closed, Sprint 3 translation gap closed, voice expanded to tests + tutor. Headline completion moves from **56% → ~68%**.

---

*End of audit.*
