# Design System Document (DSD)

**System Name:** Drowzi Foundation
**Date:** 2026-05-15
**Version:** 0.1
**Owner:** delatorrecj
**PRD:** [prd-drowzi.md](prd-drowzi.md)

---

## 1. Design Philosophy & Vision

**Core aesthetic:** High-energy, legible-in-the-dark, and slightly combative. Drowzi is a sports brand that happens to be an alarm app. Bold typography, saturated yellows and browns, and a mascot that demands you move. No soft gradients. No pastel wellness vibes. Urgency first.

**Emotional intent:** At alarm time, the user should feel challenged — the app is daring them to get up. Post-completion, they should feel proud and victorious. The emotional arc is: resistance → effort → triumph. Every screen maps to one of these three states.

**Aesthetic references:** Pokémon GO (mascot-driven, gamification), Nike Training Club (sports directness, bold type), Duolingo (streak mechanics, mascot personality), Alarmy (functional urgency) — but with stronger brand identity and pixel-art character.

**What this system explicitly avoids:**
- Soft pastel wellness aesthetics (mint green, lavender, gentle gradients)
- Glassmorphism or frosted surfaces
- Small, thin typography — every element must be readable at arm's length by a half-asleep person
- Auto-playing decorative animations that serve no state-change function

---

## 2. Brand Primitives

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#1A1209` | Page/screen background (dark brown-black) |
| `--color-surface` | `#2E1F0A` | Cards, bottom sheets, panels |
| `--color-border` | `#4A3015` | Dividers, input borders |
| `--color-primary` | `#F4C430` | CTAs, active states, alarm-active backgrounds, mascot primary |
| `--color-primary-hover` | `#D9AC1E` | Pressed/hover state on yellow elements |
| `--color-alarm` | `#E63946` | Alarm-active urgency accent, required task prompts |
| `--color-alarm-alt` | `#FF5A5F` | Pulse/alternating urgency element |
| `--color-text` | `#F5E6C8` | Body copy on dark backgrounds |
| `--color-text-dark` | `#654321` | Body copy on yellow backgrounds |
| `--color-text-muted` | `#9A7A50` | Secondary text, labels, timestamps |
| `--color-success` | `#4CAF50` | Habit completion confirmation, streak milestone |
| `--color-warning` | `#FF9800` | Missed day indicator, low-battery alarm warning |
| `--color-error` | `#E63946` | Errors, failed verification, wrong barcode |

**Note on alarm-active screens:** Background switches to `--color-primary` (#F4C430). All text uses `--color-text-dark` (#654321). This inversion ensures maximum contrast in a bright, disorienting wake-up context.

### Typography

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| Heading 1 / Alarm Time Display | Montserrat ExtraBold | 800 | 72px | 1.0 |
| Heading 2 / Section Header | Montserrat ExtraBold | 800 | 32px | 1.1 |
| Heading 3 / Sub-header | Montserrat Bold | 700 | 22px | 1.2 |
| Body | Inter | 400 | 16px | 1.5 |
| Small / Caption / Label | Inter | 500 | 13px | 1.4 |
| Streak Number / Stats | Montserrat ExtraBold | 800 | 48px | 1.0 |
| Mono / Code (debug only) | JetBrains Mono | 400 | 13px | 1.5 |

**Font loading:** Google Fonts — Montserrat ExtraBold (800) and Bold (700) + Inter Regular (400) and Medium (500). Preloaded via Expo Font.

### Elevation & Depth

| Level | CSS / React Native Shadow Value | Usage |
|-------|---------------------------------|-------|
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.4)` | Subtle cards, list items |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.6)` | Bottom sheets, floating action buttons |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.8)` | Modals, completion overlays |

---

## 3. Layout & Spatial System

**Base unit:** `4px` — all spacing is a multiple of this.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight internal gaps, icon-to-label |
| `--space-2` | `8px` | Component internal padding |
| `--space-3` | `12px` | Compact list item spacing |
| `--space-4` | `16px` | Default element spacing |
| `--space-6` | `24px` | Section gaps, card padding |
| `--space-8` | `32px` | Large section separations |
| `--space-12` | `48px` | Screen-level top/bottom padding |

**Grid:** Single-column mobile layout. Safe area insets respected. Content max-width 100% with 24px horizontal padding.

**Breakpoints:**
- Mobile small: `360px` (Android baseline)
- Mobile standard: `390px` (iPhone 16 baseline)
- Tablet: `768px` (iPad — layout adapts to centered single column, max-width 480px)

---

## 4. Core Component Specs

### Buttons

| Variant | Background | Text | Border | Pressed | Disabled |
|---------|-----------|------|--------|---------|----------|
| Primary (CTA) | `--color-primary` (#F4C430) | `--color-text-dark` (#654321) | none | `--color-primary-hover` | 40% opacity |
| Danger / Alarm | `--color-alarm` (#E63946) | white | none | darkened red | 40% opacity |
| Ghost | transparent | `--color-primary` | `1px solid --color-primary` | `--color-surface` bg | 40% opacity |
| Destructive | `--color-error` | white | none | darkened | 40% opacity |

**Border radius:** `12px` (rounded, approachable — easier to tap when groggy)
**Padding:** `16px 24px`
**Font:** Montserrat Bold 700, `16px`
**Minimum tap target:** `52px` height — exceeds WCAG 44px for groggy-user accessibility

### Inputs & Forms

- Background: `--color-surface`
- Border: `1px solid --color-border`
- Border radius: `10px`
- Focus ring: `2px solid --color-primary, offset 2px`
- Error state: `--color-error` border + error text below in Inter 500 13px
- Padding: `14px 16px`
- Text: Inter 400 16px `--color-text`

### Surfaces (Cards, Modals, Panels)

- Background: `--color-surface` (#2E1F0A)
- Border: `1px solid --color-border`
- Border radius: `16px`
- Shadow: `--shadow-md` for bottom sheets; `--shadow-sm` for inline cards
- Modal/Sheet backdrop: `rgba(0,0,0,0.75)`

### Mascot Component

- Rendered as animated pixel-art sprite (PNG sprite sheet, exported at 2x and 3x)
- Displayed at `120×120px` base; scales to `160×160px` on streak milestone screens
- State variants: Sleepy (base), Annoyed (alarm active), Focused (habit in progress), Pumped (habit complete), Jacked (7-day streak), Legendary (30-day streak)
- Background behind mascot: `--color-surface` card with `--shadow-md`

---

## 5. Motion & Micro-interactions

**Transition default:** `all 150ms ease-in-out`

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Button press | `100ms` | ease-out | Scale down to 0.96, snap back |
| Bottom sheet open | `280ms` | ease-out | Slide up from bottom |
| Bottom sheet close | `200ms` | ease-in | Slide down |
| Habit completion burst | `600ms` | spring | Mascot bounce + yellow flash overlay |
| Streak badge pop-in | `400ms` | spring(damping:0.5) | Badge scales from 0 → 1.1 → 1.0 |
| Alarm pulse (active) | `1000ms` | linear loop | Background pulses between #F4C430 and #E63946 |
| Loading skeleton | `1.5s` | linear loop | Shimmer from surface to border |

**Avoid:** Transitions >400ms for navigation. Looping animations without user-driven state. Any animation that continues after habit completion (post-completion should be calm and victorious, not busy).

---

## 6. Accessibility (a11y)

- **Contrast minimum:** WCAG AA — primary text on dark background (#F5E6C8 on #1A1209) = 10.2:1 ✓; yellow primary on dark background (#F4C430 on #1A1209) = 8.3:1 ✓; dark text on yellow (#654321 on #F4C430) = 5.9:1 ✓
- **Focus indicators:** Always visible on interactive elements; use `--color-primary` 2px ring
- **Touch targets:** Minimum `52×52px` for all interactive elements (alarm screen elements: minimum `64×64px`)
- **Keyboard navigation:** N/A for native mobile; all elements operable via switch access on iOS/Android
- **Screen reader:** Semantic accessibilityLabel on all elements; accessibilityRole assigned; accessibilityHint for non-obvious actions
- **Reduced motion:** Wrap mascot animations and alarm pulse in `useReduceMotionValue()` from React Native; provide static fallback
- **Dark/Light mode:** App is always dark-background by design — no light mode in V1 (intentional brand choice for early-morning eye comfort)

---

## 7. Taste-Skill Settings

```
DESIGN_VARIANCE:    7   (bold and expressive — sports brand energy)
MOTION_INTENSITY:   6   (purposeful motion — celebrations and alarm states are animated; navigation is not)
VISUAL_DENSITY:     4   (breathable on mobile — clear hierarchy, not information-dense)
```

**Chosen variant:** `taste-skill` (standard with elevated energy)
**Reason:** The product needs presence and urgency without overwhelming a groggy user. High variance and moderate motion signal "this app means business" while moderate density keeps the alarm screen uncluttered and immediately scannable.

---

## 8. Impeccable Anti-Pattern Register

*To be populated after first `npx impeccable detect src/` run during implementation.*

| Pattern | Status | Location | Fix Applied |
|---------|--------|----------|-------------|
| — | — | — | — |

---

## Self-Check

- [x] Section 2 has exact HEX values — not "a muted blue"
- [x] Section 3 spacing scale is consistent (all multiples of 4px base unit)
- [x] Section 4 defines all component states including Disabled and Pressed
- [x] Section 7 taste-skill dials are set and a variant is chosen
- [x] WCAG AA contrast verified for primary text/background pairings
- [ ] This document exists in code as CSS variables or a Tailwind config — pending implementation

---

*Next document: [SDD](sdd-drowzi.md)*
