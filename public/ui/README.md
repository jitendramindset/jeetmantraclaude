# EduOS UI — Layered MVC Widget Architecture

> Screens compose molecules. Molecules compose atoms. Models fetch data.
> Controllers handle actions. Admin owns policy. The user owns customization.

---

## Layers (top-down)

```
┌──────────────────────────────────────────────────────────────────┐
│  SCREENS         /ui/screens/<Name>.js                           │
│  ─ each screen registers itself with ScreenRegistry              │
│  ─ a screen is JUST a composition of widgets + a model           │
├──────────────────────────────────────────────────────────────────┤
│  WIDGETS         /widgets/<id>.js (dashboard cards, 23 of them)  │
│                  /ui/widgets/molecules/ (List, KPIGrid, …)       │
│                  /ui/widgets/atoms/    (Card, Button, Row, …)    │
├──────────────────────────────────────────────────────────────────┤
│  MODELS          /ui/models/<Name>.js                            │
│  ─ pure data fetchers; one place to know the API URL + shape     │
├──────────────────────────────────────────────────────────────────┤
│  CONTROLLERS     /ui/controllers/<Name>.js                       │
│  ─ action dispatch + mutations; no DOM, no rendering             │
├──────────────────────────────────────────────────────────────────┤
│  REGISTRY        /ui/registry/screens.js (the screen index)      │
│  REGISTRY        /widget-registry.js     (the widget engine)     │
├──────────────────────────────────────────────────────────────────┤
│  THEMES + MOTION /ui/themes/, /ui/animations/                    │
│  TOKENS          premium-ui.css :root variables                  │
└──────────────────────────────────────────────────────────────────┘
```

## Folder map

```
/public/ui/
  ├── README.md                       ← this file
  ├── EXTRACTION_CATALOG.md           ← every screen + extraction status
  ├── widgets/
  │   ├── atoms/                      ← smallest reusable pieces
  │   │   ├── Button.js               ← JM.Button({label, kind, onClick, icon})
  │   │   ├── Card.js                 ← JM.Card({title, body, accent, padding})
  │   │   ├── KPI.js                  ← JM.KPI({label, value, sub, accent})
  │   │   ├── Row.js                  ← JM.Row({title, sub, right, onClick})
  │   │   ├── Badge.js                ← JM.Badge({text, kind})
  │   │   ├── EmptyState.js           ← JM.EmptyState({icon, title, msg, cta})
  │   │   ├── Avatar.js               ← JM.Avatar({name, src, size})
  │   │   ├── SectionHeader.js        ← JM.SectionHeader({title, action})
  │   │   ├── ModalShell.js           ← JM.ModalShell({title, body, footer})
  │   │   └── Tabs.js                 ← JM.Tabs({tabs, active, onChange})
  │   └── molecules/                  ← compositions of atoms
  │       ├── KPIGrid.js              ← JM.KPIGrid([{label, value}])
  │       ├── ListSection.js          ← KPI/Row list + empty state
  │       └── ActionToolbar.js        ← responsive button row → overflow menu
  ├── screens/                        ← composed screen widgets
  │   ├── Wallet.js                   ← uses model + atoms
  │   ├── Help.js
  │   ├── WidgetAdmin.js
  │   └── Certificates.js
  ├── models/                         ← data fetchers (one per domain)
  │   ├── Wallet.js                   ← Wallet.fetch() → balance + tx list
  │   ├── Certificates.js
  │   └── Analytics.js
  ├── controllers/                    ← action handlers (no DOM)
  │   └── Wallet.js                   ← Wallet.topUp(amount), .refund(tx)
  ├── registry/
  │   └── screens.js                  ← global JM.Screens registry
  ├── themes/                         ← per-theme overrides (alongside premium-ui.css)
  ├── animations/                     ← reusable motion definitions
  └── layouts/                        ← responsive grid primitives
```

## The atom contract

Every atom is a pure function on `props`:

```js
// /ui/widgets/atoms/Button.js
window.JM = window.JM || {};
JM.Button = function (props) {
  var p = props || {};
  var kind = p.kind || 'primary';                  // primary | secondary | ghost | danger
  var icon = p.icon ? p.icon + ' ' : '';
  var onClick = p.onClick ? ' onclick="' + p.onClick + '"' : '';
  return '<button class="jm-btn jm-btn--' + kind + '"' + onClick + '>'
    + icon + JM.esc(p.label || '') + '</button>';
};
```

Properties layer cleanly:
- **data** (`label`, `value`, `items`)
- **style** (`kind`, `accent`, `size`)
- **action** (`onClick`, `href`)
- **animation** (`enter`, `hover`)
- **theme** (`theme` override that picks a token set)

## The screen contract

```js
// /ui/screens/Wallet.js
JM.Screens.register({
  id: 'wallet',
  title: 'My Wallet',
  model: JM.Models.Wallet,                        // fetches data
  controller: JM.Controllers.Wallet,              // handles actions
  render: function (data, ctx) {
    return JM.ModalShell({
      title: '💳 Wallet',
      body: JM.KPIGrid([
        { label: 'Balance',     value: '₹' + data.balance, accent: '#7c3aed' },
        { label: 'This month',  value: data.txCount }
      ]) + JM.ListSection({
        items: data.transactions,
        empty: { icon: '💸', title: 'No transactions yet', cta: { label: '💳 Top up', onClick: 'JM.Screens.action("wallet.topup")' } }
      })
    });
  }
});
```

A screen opens via `JM.Screens.open('wallet')` — the registry calls
`model.fetch(ctx)` then `render(data, ctx)`. Loading/empty/error are handled
by the shell using `JMStates`.

## How widgets and screens differ

| Aspect | Widget (`/widgets/<id>.js`) | Screen (`/ui/screens/<Name>.js`) |
|---|---|---|
| Surface | a CARD on a dashboard grid | a FULL panel / modal / page |
| Renders inside | `EduOSWidgets.renderDashboard` | `JM.Screens.open` |
| Identity | `id` in `EduOSWidgets.WIDGETS` | `id` in `JM.Screens` |
| Examples | streak, revenue, my-courses | Wallet, Certificates, Analytics |

## Admin policy stays the highest authority

The admin policy (LevelDB-backed `PUT /api/admin/widget-config`) already
covers dashboard widgets. The screen registry takes the same policy shape
(`global[id]`, `byRole[role][id]`), so admin can disable a *screen* the
same way they disable a *widget*. Phase-2 user customisation
(pin/collapse/resize/colour/reorder) applies inside dashboards.

## Responsive rule (mobile-first)

The `ActionToolbar` molecule auto-collapses extra buttons into a `…`
overflow menu when space is tight. The same rule already powers the
Studio drawer and dashboard `☰`. Use it everywhere.

## Extraction progress

See `EXTRACTION_CATALOG.md` for the live status of every screen.
