# /ui/themes/ — design theme overrides

> Placeholder. The current theme tokens live in `/premium-ui.css :root` and
> `/theme.css :root`. When we add per-theme variants (Dark Pro, High Contrast,
> Custom Brand), each goes here as `<theme>.css` and is loaded by the theme
> engine via `data-theme="<name>"`.

## Today
- `--jm-primary`, `--jm-bg`, `--jm-surface`, `--jm-border`, `--jm-text`,
  `--jm-radius`, `--jm-shadow*`, motion tokens — all in `premium-ui.css`.

## Planned
- `light.css`, `dark.css`, `high-contrast.css` — token overrides keyed off
  `html[data-theme="..."]` selectors.
