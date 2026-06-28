# /ui/layouts/ — responsive layout primitives

> Placeholder. Reusable grid/flex primitives that screens import to lay out
> their atoms. Today screens use inline `display:grid` styles; this folder is
> where those get extracted as `JM.Stack`, `JM.Grid`, `JM.Cluster` molecules.

## Planned atoms
- `Stack.js` — vertical spacing rhythm
- `Grid.js` — responsive auto-fit grid
- `Cluster.js` — flexbox button cluster with wrap
- `Sidebar.js` — left rail + main two-col

Each will take token-aware props (gap, padding from `--jm-sp-*`).
