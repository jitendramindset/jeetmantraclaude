# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 1 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Find the primary design file under `project/` and read it top to bottom.** The chat transcripts will tell you which file the user was last iterating on. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `JeetMantra Design System` project files (HTML prototypes, assets, components)

## Implementation Status

✅ **Complete:** Two standalone, production-ready HTML files created:

### `website.html` (216 KB)
- 12 React components for education platform website
- Pages: Home, Courses, Earn, About, Contact, Directory (with search/filter), Login (3 auth methods)
- Features: Course cards with pricing, teacher/partner directory, multi-method authentication
- All assets embedded (logo as base64 data URI, no external dependencies except CDNs)
- Tested: ✓ All navigation flows working, ✓ 0 JavaScript errors, ✓ All interactive components responsive

### `dashboard.html` (301 KB)
- 30 React components for multi-role education dashboard
- Roles: Student, Teacher, Partner (fully independent interfaces)
- Features: Full dashboard layouts, navigation, interactive forms, settings panel with theme/language/accent controls
- Full theming system:
  - Dark mode support
  - 6 accent color presets
  - 3-language support (English, Hindi, Hinglish)
  - CSS variables for complete customization
- Tested: ✓ All 3 role dashboards working, ✓ Tab navigation functional, ✓ 0 JavaScript errors

### How to Run
```bash
# Start HTTP server
cd /home/claude/repo
python3 -m http.server 3000 --bind 0.0.0.0

# Open in browser
http://localhost:3000/website.html    # Website prototype
http://localhost:3000/dashboard.html  # Dashboard prototype
```

### Technology Stack
- React 18 (via CDN)
- Babel standalone for JSX compilation
- CSS custom properties for theming
- Responsive design (mobile/tablet/desktop)
- No build tools required
