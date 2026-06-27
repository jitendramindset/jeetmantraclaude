# /public/widgets — extracted widget manifests

Every dashboard widget is now ONE self-contained file. The widget engine in
`/widget-registry.js` only owns: registry, resolver, renderer, and admin policy.

## Pattern (every widget file)
```js
EduOSWidgets.register({
  id: 'my-widget',
  title: 'My Widget',
  roles: ['student'],            // null = everyone
  capability: 'analytics.read',  // optional
  category: 'learning',
  size: 'medium',                // small | medium | large | full
  priority: 20,                  // lower = higher up
  aiTriggers: ['my widget'],     // command-bar trigger phrases
  dataSource: ctx => EduOSWidgets._lib.api('/some/endpoint'),
  render: function(data, ctx) {
    const { esc, pct, empty, fmtMoney, when, listOf } = EduOSWidgets._lib;
    // ... return HTML string
  }
});
```

## Helpers on `EduOSWidgets._lib`
| Helper | Purpose |
|---|---|
| `esc(str)` | HTML-escape user text |
| `pct(n)` | Clamp 0..100 (and integer) |
| `api(path)` | Authenticated GET (Bearer jm_token) |
| `fmtMoney(n)` | `₹1,23,456` |
| `when(t)` | Friendly date/time string |
| `listOf(d, ...keys)` | Resolve an array out of a flexible response |
| `empty(msg)` / `empty(msg, {label, onclick})` | Empty state with optional CTA |
| `CREATOR · TEACHING · SELLERS · ORG_ADMIN · SPORTS` | Role groups |

## How they load
`/widgets/_index.js` injects every widget script tag at boot, before
`EduOSWidgets.boot()` runs. Adding a widget = one new file + one line in
`_index.js`. No engine change.
