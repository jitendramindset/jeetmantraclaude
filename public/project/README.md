# JeetMantra Design System

## Company Overview

**JeetMantra – The Modern Gurukul**

JeetMantra is a next-generation education ecosystem based in Ranchi, Jharkhand. It combines academic coaching (Class 7–12, JEE, NEET, CA) with skills, AI, sports, and real-world earning opportunities. The platform works like an "Amazon for Education" — students can learn, earn, and explore multiple activities from different teachers and partners in one place.

**Mission:** *"Seekho. Bano. Jeeto."* (Learn. Become. Win.)

**Core Pillars:** Study + Skill + Sports + AI + Earning

### Target Users
- **Students** (12–20 years)
- **Parents**
- **Teachers / Tutors**
- **Activity Partners** (schools, sports centers, coaches)

### Core Products
| Product | Description |
|---|---|
| Coaching Institute | Offline + online classes (Class 7–12, JEE, NEET, CA) |
| Skill Marketplace | AI, coding, sports, arts — like an activity bazaar |
| Student Earning System | Referral, task completion, content creation |
| Partner Ecosystem | Schools, activity centers, coaches |
| AI Automation Layer | WhatsApp bot, CRM, dashboards (n8n-powered) |

### Sources Provided
- **Brand brief (text):** Pasted directly in chat (April 25, 2026)
- No Figma link provided
- No codebase attached
- No logo or image assets uploaded

> ⚠️ All visual decisions in this design system are original interpretations of the written brief. Upload a logo, brand images, or Figma link to refine.

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Hinglish-friendly:** A natural mix of Hindi and English. E.g. *"Apna future banao JeetMantra ke saath."*
- **Motivational & action-driven:** Short, punchy lines. Never passive. Imperative verbs.
- **Direct:** No fluff. Every sentence earns its place.
- **Aspirational but grounded:** Speaks to real students in Tier 2 cities. Avoids corporate jargon.

### Casing
- **Headlines:** Title Case or ALL CAPS for impact
- **CTAs:** ALL CAPS or Title Case — never lowercase ("JOIN NOW", "Book Free Demo")
- **Body copy:** Sentence case
- **Taglines:** Mixed for emphasis — *"Seekho. Bano. Jeeto."*

### Copy Examples
- Hero: *"India ka sabse smart education system. Seekho. Bano. Jeeto."*
- CTA: *"Book Your Free Demo"* / *"Join the Gurukul"*
- Feature: *"Earn while you learn — real money, real skills."*
- Urgency: *"Limited seats. Don't miss out."*
- Teacher: *"Apni knowledge ko income mein badlo."*

### Emoji & Unicode
- Emoji used **sparingly** in marketing contexts (WhatsApp, social media) — not in product UI
- Unicode arrows (→) acceptable in UI navigation labels
- No decorative emoji in formal UI components

### Numbers & Social Proof
- Specific numbers preferred: *"500+ students"*, *"30-day guarantee"*, *"₹10,000 earned"*
- Use ₹ symbol for Indian Rupee throughout

---

## VISUAL FOUNDATIONS

### Color Philosophy
Saffron + Navy — energy meets discipline. Rooted in Indian cultural symbolism (saffron = action/courage, navy = trust/knowledge).

### Colors
- **Saffron Orange** `#f97316` — Primary CTA, energy, action, highlights
- **Deep Navy** `#0f172a` — Backgrounds, headings, trust elements
- **Amber Accent** `#fbbf24` — Secondary highlights, rewards, badges
- **White** `#ffffff` — Cards, surfaces, breathing room
- **Light Gray** `#f4f6f8` — Page backgrounds, subtle dividers
- **Mid Gray** `#64748b` — Secondary text, captions
- **Success Green** `#22c55e` — Attendance, earnings confirmed, badges
- **Alert Red** `#ef4444` — Errors, warnings

### Typography
- **Display / Hero:** Bold, heavy weight. Large scale (48–96px on desktop). Tight line-height.
- **Headings (H1–H3):** Semi-bold to bold. Clear hierarchy.
- **Body:** Regular weight, 16–18px, generous line-height (1.6).
- **Labels / Badges:** Uppercase, tracked, small (11–13px).
- **Font:** `Plus Jakarta Sans` (Google Fonts) — modern, friendly, slightly geometric. Closest match to the "bold modern sans" brand direction.
- **Mono:** `JetBrains Mono` for code/data displays in dashboard.

> ⚠️ No font files were provided. Using Google Fonts: `Plus Jakarta Sans` (display + body) and `JetBrains Mono` (code). Please provide custom font files if the brand has them.

### Spacing System
Base unit: **4px**. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

### Corner Radii
- **Small** (badges, tags): 6px
- **Medium** (cards, inputs): 12px
- **Large** (modals, hero blocks): 20px
- **Full** (pills, avatars): 9999px

### Shadows
- **sm:** `0 1px 3px rgba(0,0,0,0.08)`
- **md:** `0 4px 16px rgba(0,0,0,0.10)`
- **lg:** `0 8px 32px rgba(0,0,0,0.14)`
- **glow-orange:** `0 0 24px rgba(249,115,22,0.3)` — used on primary CTAs

### Cards
- Background: white
- Border-radius: 12–16px
- Shadow: md
- Padding: 24px
- Optional subtle border: `1px solid rgba(0,0,0,0.06)`

### Backgrounds
- **Light pages:** `#f4f6f8` base, white cards
- **Dark sections:** `#0f172a` navy with white text — used for hero, testimonials, footers
- **Gradient hero:** `linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)` — deep navy gradient
- **Orange accent blocks:** Saffron `#f97316` used for full-bleed CTA strips
- No busy textures in UI; subtle dot pattern acceptable in hero backgrounds

### Imagery Direction
- Students in action: studying, using tech, playing sports
- Confident, aspirational youth — Tier 2 India context
- Warm-toned photography (not blue-cold)
- Real environments: classrooms, labs, sports fields
- No stock-photo aesthetic; documentary feel preferred

### Animations
- **Duration:** 200ms (micro), 350ms (transitions), 600ms (page-level)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` — smooth ease-in-out
- **Hover states:** Slight lift (`translateY(-2px)`) + shadow increase on cards
- **CTA buttons:** Background darkens 10%, subtle scale(1.02) on hover; scale(0.98) on press
- **No aggressive animations** in UI — educational context demands focus

### Iconography
See ICONOGRAPHY section below.

### Layout Rules
- Max content width: 1280px, centered
- Mobile-first; breakpoints at 640, 768, 1024, 1280px
- Navigation: sticky top bar on desktop; bottom tab bar on mobile app
- Fixed sidebar in dashboard at 240px width

---

## ICONOGRAPHY

### Approach
- **No custom icon font** was provided
- Using **Lucide Icons** (CDN: `https://unpkg.com/lucide@latest`) — stroke-style, 1.5px weight, consistent 24×24 grid
- Lucide is closest to the clean, modern aesthetic the brand requires
- Icons used in: navigation, feature lists, badge labels, dashboard widgets

> ⚠️ Substitution: Lucide icons are used as a placeholder. If JeetMantra has a custom icon set, provide it for replacement.

### Usage Rules
- Size: 20px in body, 24px in navigation, 32px in feature cards
- Stroke weight: 1.5–2px
- Color: inherits text color; orange for highlighted states
- Never use emoji as icons in product UI

---

## File Index

```
/
├── README.md                    ← You are here
├── SKILL.md                     ← Agent skill definition
├── colors_and_type.css          ← Full CSS variable system
├── assets/
│   ├── logo.svg                 ← JeetMantra wordmark (generated)
│   └── logo-icon.svg            ← Icon mark
├── preview/
│   ├── colors-primary.html      ← Primary + accent color swatches
│   ├── colors-neutral.html      ← Neutral + semantic colors
│   ├── type-scale.html          ← Typography scale specimen
│   ├── type-body.html           ← Body + label type specimens
│   ├── spacing-tokens.html      ← Spacing + radius + shadow tokens
│   ├── components-buttons.html  ← Button states
│   ├── components-cards.html    ← Card variants
│   ├── components-badges.html   ← Badges + tags
│   ├── components-inputs.html   ← Form inputs
│   └── components-nav.html      ← Navigation components
├── ui_kits/
│   ├── website/
│   │   ├── README.md
│   │   ├── index.html           ← Marketing website prototype
│   │   └── *.jsx                ← Component files
│   └── dashboard/
│       ├── README.md
│       ├── index.html           ← Student dashboard prototype
│       └── *.jsx                ← Component files
└── fonts/                       ← (empty — using Google Fonts CDN)
```
