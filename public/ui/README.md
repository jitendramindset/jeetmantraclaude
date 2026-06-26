# EduOS Widget-Driven UI Architecture

> The screen is dumb. The widget owns the experience. The admin owns the policy.

---

## Folder layout

```
/public
  /ui                      ← single source for the new UI architecture
    /screens               ← thin screens. ONE job: pick widgets, render them.
    /widgets               ← thin re-exports of /widgets/<id>.js for screens
    /layouts               ← grid/list/responsive layout primitives
    /themes                ← theme tokens + per-theme overrides
    /animations            ← reusable motion definitions
    /components            ← shared atoms (Button, Input, Avatar…)
    /registry              ← the WidgetRegistry — resolves which widgets show
  /widgets                 ← canonical widget definitions (manifest pattern)
    <widget-id>.js         ← one file per widget; self-contained manifest
```

## The contract a screen follows

```
Authenticate User
       ↓
Load Role + Permissions  (existing /me/contexts)
       ↓
Load Enabled Widgets     (admin defaults ⊕ user prefs ⊕ role gates)
       ↓
Render Widgets           (grid/responsive; widgets fetch their own data)
```

A screen contains **no business UI** of its own. If a screen needs a card,
chart, list or action — it asks the registry for the matching widget.

## Widget manifest

Every widget is a manifest object (currently defined inline in
`widget-registry.js`; new widgets should be added to `/widgets/<id>.js`). All
fields are optional except `id`, `title`, `render`:

```js
{
  id: 'my-courses',           // unique key (kebab-case)
  title: 'My Courses',
  category: 'teaching',       // ops | learning | teaching | finance | social
  size: 'medium',             // small | medium | large | full

  // Visibility & policy ---------------------------------------------------
  roles: ['teacher','admin'], // null = everyone; admin always overrides
  capability: 'course.edit',  // optional fine-grained capability gate
  priority: 18,               // lower = higher up by default

  // Data fetching --------------------------------------------------------
  dataSource: ctx => api('/courses/mine'),

  // Render & states ------------------------------------------------------
  render: (data, ctx) => '<html string or DOM>',
  // (skeleton + retry are handled by the engine — see jm-states.js)

  // Customization (already supported per-user via userPrefs) -------------
  // pin · hide · collapse · resize · accent colour · drag-reorder
}
```

## The three-layer policy

A widget is visible only if it passes ALL three:

1. **Admin policy** (highest authority): `adminWidgets[id] !== false` AND
   `adminRoleConfig[role][id] !== false`. Admin can globally disable a widget,
   or disable it for a specific role.
2. **Role/capability gate**: the widget's `roles` array (or `null` = all) and
   optional `capability` check via the caller's `capabilities` set.
3. **User preference**: the user hasn't hidden the widget. (Per-user pin /
   order / collapse / size / accent are layered on top of this — see
   `prefs.removed/pinned/order/sizes/collapsed/accents` in
   `widget-registry.js`.)

Admin > Role > User. Admin can force a widget on or off regardless of role
defaults; user prefs apply only to widgets the admin allows.

## Admin Widget Management

Admin reaches it at `/app#/m/admin` → **Widget Management** (or the in-shell
Settings → Widgets). For each widget, the admin sees:

- **☑ Enabled globally** (master kill-switch)
- **Per-role checkboxes**: Student, Teacher, Coach, Parent, Institute,
  School, Partner, Admin
- **Default size** + **default position** (priority drag)
- Save → persisted via `PUT /api/admin/widget-config`. The next dashboard
  load applies the new policy to every user of that role.

## Responsive rule (mobile-first)

Every widget has an inline render budget. When space is tight:

- Side-panel/secondary actions collapse into a `…` overflow menu (existing
  studio drawer + dashboard `☰` already follow this rule).
- The main content (chart, list, KPI) stays full-width.
- Buttons drop to compact mode (icon-only with `aria-label`).
- The widget engine flips `wg-small/medium/large` based on viewport when
  the user has not set an explicit size override.

## What this turn delivered

| Item | State |
|---|---|
| `/ui/*` + `/widgets/` folder structure | ✅ scaffolded |
| Architecture doc (this file) | ✅ |
| Admin Widget Management UI + endpoint | ✅ shipped (see `ui/screens/admin-widgets.md`) |
| Per-user customization (pin/collapse/resize/accent/reorder) | ✅ shipped earlier (Phase 2) |
| Existing 10 widgets still working | ✅ zero regressions |

## What still needs doing (queued)

1. **Extract** each widget from `widget-registry.js` into its own
   `/widgets/<id>.js` file (12 widgets × careful test each).
2. Add **`/ui/screens/dashboard.js`** as the new thin-screen example that
   reads from the registry and renders.
3. Build the **/ui/components** atoms (currently we inline-style; an atomic
   set lets every widget share `<JMCard>`, `<JMButton>` etc.).
4. Wire role-specific **default dashboards** explicitly into admin config
   so each role has a curated set out of the box.

This refactor is intentionally incremental — each extracted widget gets a
live test before moving to the next so we never break the dashboard.
