# JeetMantra / EduOS — Architecture Guide for AI Agents

> **Purpose of this file.** This is the orientation map for an AI (or new dev)
> about to change code in this repo. Read it first. It explains how the system
> is wired, where things live, the conventions you must follow, and the exact
> recipe for adding/adjusting an API or a UI screen. When in doubt, grep the
> patterns named here rather than inventing new ones.

---

## 1. What this is

A multi-role education platform ("EduOS"). One Node/Express backend serves a
REST API **and** the static frontend. The frontend is plain HTML + vanilla JS
(no build step, no framework). Data lives in a **self-hosted Supabase
(Postgres)**; a **LevelDB** layer adds offline-tolerant caching and a write
sync-queue. Auth is **stateless JWT** (no sessions).

**Ten roles:** `student, teacher, partner, school, coaching, admin, parent,
corporate_trainer, content_creator, franchise`.

---

## 2. Tech stack (ground truth)

| Layer | Choice |
|---|---|
| Server | Node.js + Express (CommonJS, `require`) |
| DB | Self-hosted Supabase / Postgres, accessed via `SERVICE_ROLE_KEY` (bypasses RLS — **all tenancy is enforced in app code**) |
| Local cache/queue | LevelDB (`backend/config/leveldb.js`) wired as global middleware |
| Auth | JWT bearer tokens; `jm_token` / `jm_user` in browser localStorage |
| Frontend | Static HTML in `public/`, vanilla JS, **no bundler** |
| Validation | Joi schemas via `middleware/validation.js` (`validate('schemaName')`) |
| Automation | optional n8n webhook addon (`config/n8nConfig.js`) |
| Tests | Jest + supertest (backend), Playwright (`e2e/`) |

> ⚠️ Self-hosted Supabase quirks: the anon key is invalid (only
> `SERVICE_ROLE_KEY` works); raw DDL goes through `/pg/query`;
> `jeetmantra_users.id` is **varchar** so PostgREST FK embeds don't work — join
> in app code. See `memory/supabase-selfhosted-quirks.md`.

---

## 3. Folder structure

```
/
├── ARCHITECTURE.md            ← you are here
├── backend/
│   ├── server.js              ← app entry: middleware order + all route mounts
│   ├── routes/                ← ~42 Express routers, one per domain (see §5)
│   ├── middleware/            ← auth, validation, datasync (cache+sync), security,
│   │                            requireCapability, resolveInstitution, verifyWebhookSecret
│   ├── services/              ← reusable logic: award, mailer, settings, identity,
│   │                            chatUnread, notifyLocalized
│   ├── config/                ← supabase.js, leveldb.js, roles.js, aiProvider.js, n8nConfig.js
│   ├── scripts/               ← migrations runners + seed-test-users + test-e2e
│   └── mcp-server.mjs         ← MCP server exposing the platform to Claude/n8n
├── public/                    ← the entire frontend (static, served by Express)
│   ├── dashboard.html         ← THE SPA SHELL. Served at /app. All roles enter here.
│   ├── login.html, signup.html, website.html, marketplace.html, studio.html,
│   │   exam-platform.html, bhasha-setu.html, liveRoom.html, admin-os.html, settings.html
│   ├── widget-registry.js     ← dashboard widget manifests (EduOSWidgets), per-role
│   ├── offline-sync.js        ← window.JMOffline: offline login + GET cache + write outbox
│   ├── jm-settings.js         ← JMSettings: theme/colors/font/lang single source of truth
│   ├── login-api.js, jm-theme.js, jm-nav.js, i18n-*.js, sw.js
├── migrations/                ← versioned SQL (001_rls_policies, 002_indexes, …)
├── e2e/                       ← Playwright specs + config
├── monitoring/                ← Prometheus alerts
├── docs/, QA/, project/       ← documentation + audit reports
└── docker-compose*.yml        ← local + prod compose
```

---

## 4. Request lifecycle (read this before touching `server.js`)

Middleware order in `backend/server.js` is **deliberate** — do not reorder:

1. `cors`, `express.json` (10mb), `express.urlencoded`
2. `/uploads` static, then `express.static(public/)` — static wins before API
3. **`cacheMiddleware`** — cache-aside reads from LevelDB, Supabase on miss.
   Emits `X-Cache: HIT/MISS`. Per-user keyed by hashed auth token.
4. **`syncMiddleware`** — records every successful write to the LevelDB
   `SyncQueue` for offline replay + fires the n8n addon. Skips `/api/auth`,
   `/api/sync`, `/api/n8n`.
5. **Route mounts** (`/api/...`) — see §5.
6. SPA routes: `/app` and `/app/*` serve `dashboard.html`.
7. SEO root router (`/sitemap.xml`, `/robots.txt`), 404, error handler.

> Because cache+sync are **global**, any new route gets caching + offline sync
> for free. Don't add per-route caching. Adjust `CACHE_TTL` / `NO_CACHE_PREFIXES`
> in `middleware/datasync.js` instead.

> **Gotcha:** capture `req.originalUrl` at middleware entry, not inside a
> deferred `res.json` wrapper — Express rewrites `req.path` to the sub-router
> path during routing.

---

## 5. API surface (~311 endpoints across these mounts)

Every line below is `app.use('<mount>', <router>)` in `server.js`. The router
file is `backend/routes/<name>.js`.

| Mount | Router | Domain |
|---|---|---|
| `/api/auth` | auth.js | login, signup, OTP, Google, verify, config |
| `/api/users`, `/api/me` | users.js, me.js | profile, stats, self |
| `/api/courses`, `/api/course-content` | courses.js, courseContent.js | courses, topics, lectures, students, analytics |
| `/api/enrollments` | enrollments.js | enroll / unenroll |
| `/api/dashboard` | dashboard.js | the single role-aware dashboard payload |
| `/api/payments`, `/api/wallet`, `/api/payouts` | payments/wallet/payouts.js | money flows, coupons, billing, refunds |
| `/api/marketplace`, `/api/search`, `/api/seo` | … | listings, search, sitemap |
| `/api/live-classes`, `/api/studio`, `/api/attendance` | … | live teaching |
| `/api/assignments`, `/api/certificates`, `/api/gamification` | … | learning + rewards |
| `/api/institutions`, `/api/orgs`, `/api/eduos`, `/api/approvals` | … | multi-tenant org management |
| `/api/teacher`, `/api/student`, `/api/parent` | *Extras.js | per-role extra endpoints |
| `/api/calendar`, `/api/timetable`, `/api/bookings` | … | scheduling |
| `/api/chat`, `/api/notifications`, `/api/support`, `/api/activity` | … | messaging + alerts |
| `/api/ai`, `/api/rag`, `/api/translations`, `/api/i18n` | … | AI tutor, RAG, localization |
| `/api/webhooks`, `/api/n8n`, `/api/payments/webhook` | … | external integrations (signature-verified) |
| `/api/admin`, `/api/notifications-admin`, `/api/reports` | … | admin/Platform-OS |
| `/api/capabilities`, `/api/categories` | orgs.js sub-routers | RBAC capabilities + taxonomy |

Full machine-readable inventory: `API_INVENTORY_VERIFIED.md` +
`JeetMantra_API.postman_collection.json`.

---

## 6. Auth & authorization (the part you must not break)

- **Authenticate:** `middleware/auth.js` → `authenticateToken` sets `req.user`
  (`{ id, role, roles[], … }` from the JWT). `id` is a varchar.
- **Authorize (role):** `authorizeRole([...roles])` — union check; a user may
  hold multiple roles (`req.user.roles` array, JWT-embedded).
- **Authorize (capability):** `middleware/requireCapability.js` →
  `requireCapability('certificate.issue')` — finer-grained than roles, backed by
  the org/capabilities tables. Prefer this for org/admin write actions.
- **Tenant scoping:** `middleware/resolveInstitution.js` reads the
  `X-Active-Institution` header and scopes queries. Courses carry
  `institution_id`. See `memory/multi-institute-scoping.md`.
- **Role constants:** `backend/config/roles.js` exports `CREATOR_ROLES`,
  `SELLER_ROLES`, `INSTITUTION_ROLES`, `STUDENT_ROLES`, `PARENT_ROLES`,
  `ALL_ROLES`. **Import these — never hand-type role arrays.**

Because the backend uses `SERVICE_ROLE_KEY` (RLS bypassed), **every endpoint
must enforce ownership/tenancy itself** (e.g. `course.teacher_id === req.user.id
|| req.user.role === 'admin'`). Missing that check = an IDOR bug.

---

## 7. Recipe — add or adjust an API endpoint

1. **Pick the router** in `backend/routes/` by domain (don't make a new file
   unless it's a genuinely new domain; if you do, mount it in `server.js` in the
   §5 list and keep alphabetical-ish grouping).
2. **Write the handler:**
   ```js
   const { authenticateToken, authorizeRole } = require('../middleware/auth');
   const { CREATOR_ROLES } = require('../config/roles');
   const { validate } = require('../middleware/validation');
   const { supabaseAdmin } = require('../config/supabase');

   router.post('/thing',
     authenticateToken,
     authorizeRole(CREATOR_ROLES),     // or requireCapability('thing.create')
     validate('thingCreate'),          // Joi schema (add to validation.js)
     async (req, res) => {
       try {
         // 1. ownership/tenancy guard (RLS is bypassed!)
         // 2. supabaseAdmin.from('table')…  (join in JS, no FK embeds)
         res.json({ thing });
       } catch (e) { res.status(500).json({ error: e.message }); }
     });
   ```
3. **Validation:** add the Joi schema to `middleware/validation.js`. All money
   and write endpoints MUST validate input.
4. **No manual caching** — the global middleware handles it. If the new route
   must never be cached, add its prefix to `NO_CACHE_PREFIXES` in `datasync.js`.
5. **Errors:** return `{ error: '…' }` with a real status. The frontend `api()`
   surfaces `j.error`. 401 → client redirects to login; 403 → "no permission".
6. **Test:** add a Jest+supertest case under `backend/tests/`; for a user-facing
   flow add/extend an `e2e/` spec. Seed users exist: `{role}_test@jm.test` /
   `Test1234!`.

---

## 8. Frontend model (the SPA shell)

- **One shell:** `public/dashboard.html` served at **`/app`**. Every role logs
  in and lands here — there are no other post-login HTML pages to navigate to.
- **Navigation:** the `NAV` object (top of dashboard.html) maps each role to its
  sidebar items. An item is one of:
  - `{i:'🏠', l:'Label', t:'sectionKey'}` → scrolls to `#sec-<role>-<key>`,
  - `{i:'…', l:'…', action:'openThing()'}` → calls a JS function (modal/overlay),
  - `{i:'…', l:'…', h:'/module.html'}` → heavy module; rendered **in-shell** via
    the hash router (`location.hash='#/m/<module>'`), not a full-page jump.
  - `{group:'Header'}` → a visual section divider.
- **Data calls:** use the `api(path, method, body)` helper in dashboard.html.
  It injects the bearer token + `X-Active-Institution`, parses JSON, and now
  has offline fallback (see §9). Always go through `api()`, never raw `fetch`.
- **Overlay pages:** `showModal(title, html)` renders a breadcrumbed modal. The
  pattern for a new page: an `async function openX(){ showModal(...); const r =
  await api('/x','GET'); render(); }`. Empty states should be **game-screen
  CTAs** (purple gradient button), not passive "no data" text — see the
  `openCertificatesPage` / `openAnalyticsPage` functions for the template.
- **Widgets:** `widget-registry.js` (`EduOSWidgets`) holds per-role dashboard
  card manifests. Role is read from `ctx.roles` (array) — **not** `ctx.role`.
- **Customization:** `jm-settings.js` (`JMSettings`, key `jm_settings`) is the
  single source for theme/colors/font/language, applied live across frames via
  the `storage` event.

---

## 9. Offline-first (client)

`public/offline-sync.js` → `window.JMOffline`, loaded in `login.html` and
`dashboard.html`:

- **Offline login:** after each *online* login, `rememberCredential()` stores
  `SHA-256(email:password)` + user + JWT (key `jm_offline_cred`; **password
  never stored**). When the login `fetch` throws, `login.html` falls back to
  `offlineLogin()`.
- **Offline reads:** `api()` caches successful GETs (`cacheGet`); on fetch
  failure a GET returns the cached copy (`readGet`).
- **Offline writes:** on fetch failure, writes are `enqueue`'d to `jm_outbox`
  and auto-replayed (`flush`) on the `online` event and at `loadDashboard()`.

The cached JWT is local-read only; the server re-validates online. Server-side
LevelDB cache/sync (§4) is **separate** from this client layer. See
`memory/offline-first-client.md`.

---

## 10. Conventions & guardrails

- **CommonJS** on the backend (`require`/`module.exports`), **vanilla JS** on the
  frontend (no imports, no JSX, no TS).
- **Match surrounding style** — comment density, naming, 2-space indent, single
  quotes. Don't introduce a framework or build step.
- **Secrets:** never commit a filled `.env` (only `.env.example`); mask secrets
  in logs with `***`. `SMTP_PASS` must be a Gmail App Password. Webhooks are
  signature-verified and fail-closed in production.
- **Money & IDOR:** validate input, enforce ownership, keep wallet ops atomic.
- **Don't fabricate tooling state:** `gh` CLI is not authenticated here — open
  PRs via the GitHub compare URL, don't claim a PR was created.

---

## 11. Run / test / verify

```bash
# backend serves BOTH the /api and the static public/ frontend
cd backend && npm start                   # node server.js  (reads backend/.env)
cd backend && npm run dev                  # nodemon (auto-reload)

# browser QA: the preview server "jeetmantra-backend" (.claude/launch.json) → port 5001
# seed users: {role}_test@jm.test / Test1234!  (all 10 roles); seed via npm run seed

cd backend && npm test                    # Jest + supertest
cd backend && npm run test:e2e            # scripts/test-e2e.js — API smoke
cd e2e && npm test                        # Playwright (pin @playwright/test@1.48.2)
```

---

## 12. Where to learn more

- `API_INVENTORY_VERIFIED.md` / Postman collection — every endpoint.
- `EDUOS_*` and `QA/*` — domain audits & roadmaps.
- `DEPLOYMENT.md`, `RESTORE.md` — ops.
- `memory/*.md` — durable gotchas (Supabase quirks, local-sync, multi-institute,
  offline-first). These encode hard-won facts; trust but verify against code.
