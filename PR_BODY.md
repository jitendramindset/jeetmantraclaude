# EduOS Platform — Sprints 1–12 + Phases A–D + Widget Architecture + UX Unification

39 commits transforming the LMS into a multi-tenant Education Operating System, then giving it a modern widget-driven UX and one coherent navigation/settings shell. **All 12 DB migrations applied to the live Supabase (0 errors).** API surface **→ 380 endpoints**, ~334 auth/capability-gated, ~59 Joi-validated.

## Backend / platform
- **Identity & authorization** — multi-role identity (`user_roles`), JWT role union, personal-institute auto-provision; capability model (`capabilities` 28 + `role_capabilities` + `requireCapability`), **~33 of ~40 write routes cut over** from role-lists to capabilities.
- **Org/tenant spine** — `organizations` as tenant root, `role_assignments` membership, org write surface, `GET /api/me/contexts` + active-context switcher.
- **Marketplace & SEO** — faceted `/api/marketplace` + `/facets` + `/trending`; `sitemap.xml`, `robots.txt`, `/api/seo/course/:slug` (schema.org JSON-LD), `/api/seo/org/:slug`.
- **Verticals** — timetable templates (schools), recurring booking slots (sports/yoga/dance), batch lifecycle; `courses.class_mode` covers online/offline/hybrid.
- **Polish** — UI i18n bundles (`/api/i18n/:lang`), Smart Studio persistence, global `/api/search/all`.
- **Security** — 100% Joi on money flows; refund/fee-invoice IDOR fixes; webhook signature verification; n8n sync fail-open → fail-closed.
- **Student success** — gamification (streak/XP/badges), award pipeline, certificates, notifications.

## Widget architecture (the audit, built)
- `widget-registry.js` — manifest-driven engine that replaces the 9-way `if(role===…)` dashboard switch; **23-widget library** covering all roles.
- Resolver = role ∩ capability ∩ admin-config ∩ user-prefs; personalization (pin/remove/add, persisted via `widget_prefs`); admin widget-config UI in admin-os.
- Command palette + voice (intent → widget); responsive tiers (smartboard/TV/ultrawide) + a11y.
- `dashboard.html` defaults student/teacher to widgets with a Classic toggle; the other 7 roles reach their validated set via `/widgets.html`.

## UX unification
- **`jm-nav.js`** — one shared app drawer across marketplace/exam/bhasha/website/studio/widgets (role-aware, highlights current page).
- **Dashboard menu sync** — every item (Calendar/Bookings/Settings/Courses…) now opens the same way: nav stays visible, content swaps.
- **`settings.html` + `jm-settings.js`** — central settings; one save fans out to Exam (`examforge_ai_url`), Bhasha (`bs_config`), global `jm_lang` + org settings.
- **Website location search** — find teachers/partners *and* courses by city, with geolocation "Near me".

## Migrations (applied, idempotent)
`s2-identity → s3-i18n → s3-ops → s4-booking → s5-student-success → s6-certs-impersonate → s7-role-org → s8-permission-tiers → s9-org-settings → s10-verticals → s11-polish → s12-widget-prefs`
Runner: `node backend/scripts/run-all-migrations.js`.

## Verification
Every change verified via syntax checks + clean server boot + 401 anon smoke tests, and frontend changes driven live in the browser preview (resolver assertions, rendered widget sets, nav drawer, settings fan-out, location search). Full route table in `API_INVENTORY_VERIFIED.md`; audits in `EDUOS_GAP_ANALYSIS_V2.md` + `EDUOS_WIDGET_UX_AUDIT.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
