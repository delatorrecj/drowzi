# Website Plan — Drowzi Landing Page

**Type:** Single-page informational website
**Framework:** Next.js 15 (App Router, static export)
**Folder:** `/website`
**Goal:** Communicate the product, build trust, drive App Store / Play Store downloads. Nothing else.

---

## Philosophy

- **One job:** Get the visitor to tap "Download."
- **Narrative first:** The page tells the same story as the slide deck — hook → problem → solution → proof → CTA. Never lead with features; lead with feeling.
- **No clutter:** No blog, no pricing page, no nav links beyond one scroll-to-download anchor. Single page, single scroll, single action.
- **Brand exact:** Colors, type, and tone from `dsd-drowzi.md` — dark background, Awakening Yellow, Montserrat ExtraBold for every headline.

---

## Tech Stack

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js 15 App Router | Static export (`output: 'export'`); no server needed for an informational page |
| Styling | Tailwind CSS v4 | Utility-first; fast to build; no runtime CSS |
| Fonts | `next/font/google` — Montserrat (800, 700) + Inter (400, 500) | Exact DSD spec; zero layout shift |
| Icons | `lucide-react` | Lightweight, tree-shakeable |
| Animations | Tailwind `animate-*` + CSS keyframes only | No JS animation libraries; keeps bundle minimal |
| Images | `next/image` (static) | Optimized, lazy-loaded phone mockups |
| Deployment | Vercel (auto-deploy on push to `main`) | Free tier, global CDN, zero config |
| Analytics | Vercel Analytics (optional) | One-line install; no cookie banner needed |

---

## Folder Structure

```
website/
├── app/
│   ├── layout.tsx          # Fonts, metadata, og:image, dark bg body
│   ├── page.tsx            # Imports all sections in order
│   └── globals.css         # Tailwind base + CSS custom properties from DSD
├── components/
│   ├── Navbar.tsx          # Logo + single "Download" CTA
│   ├── HeroSection.tsx     # Hook headline + tagline + phone mockup + download badges
│   ├── ProblemSection.tsx  # Sleep inertia — name the enemy
│   ├── HowItWorksSection.tsx  # 3 gate cards (motion, barcode, voice)
│   ├── ScienceSection.tsx  # 3 behavioral proof points
│   ├── MascotSection.tsx   # Evolution strip + streak narrative
│   ├── CtaSection.tsx      # Full-width yellow CTA + app store badges
│   └── Footer.tsx          # Minimal: logo, links, copyright
├── lib/
│   └── constants.ts        # All copy strings, download URLs, brand tokens
├── public/
│   ├── images/
│   │   ├── phone-hero.png          # App screenshot — alarm active screen (yellow)
│   │   ├── phone-motion-gate.png   # Push-up gate demo screenshot
│   │   ├── phone-barcode-gate.png  # Barcode scan gate screenshot
│   │   ├── phone-voice-gate.png    # Voice gate screenshot
│   │   ├── mascot-sleepy.png       # Mascot state 1
│   │   ├── mascot-pumped.png       # Mascot state 3+
│   │   └── mascot-legendary.png    # Mascot day-30 state
│   ├── og-image.png                # 1200×630 Open Graph image
│   └── favicon.ico
├── next.config.ts          # output: 'export', images unoptimized for static
├── tailwind.config.ts      # Brand color tokens, font families
├── tsconfig.json
└── package.json
```

---

## Page Sections — Content & Design Spec

### 1. Navbar
**Height:** 64px, sticky, background `#1A1209` with bottom border `#4A3015`
**Left:** Drowzi wordmark — Montserrat ExtraBold, yellow (#F4C430)
**Right:** Single button — "Download Free" — yellow fill, brown text, `rounded-xl`
**Behavior:** Scrolls to `#download` anchor on click. On mobile: full-width pill button.

---

### 2. Hero Section
**Background:** `#1A1209` (darkest)
**Layout:** Two-column on desktop (text left, phone mockup right), stacked on mobile

**Headline (Montserrat ExtraBold 800, ~72px desktop / 48px mobile):**
> Your alarm won't stop.
> Until you do.

**Subheadline (Inter 400, ~20px, `#9A7A50`):**
> The first alarm app that uses your phone's camera, mic, and sensors to verify you've actually done your morning habit. Not a puzzle. Not a swipe. The habit is the off-switch.

**CTA row:**
- App Store badge (SVG) — links to App Store
- Google Play badge (SVG) — links to Play Store
- Small caption below: "Free to download · iOS & Android"

**Phone mockup:** `phone-hero.png` — alarm-active yellow screen, mascot demanding, rep counter visible. Slight drop shadow. No device frame (flat screenshot preferred over generic device mockup).

---

### 3. Problem Section
**Background:** `#2E1F0A` (surface, slightly lighter)
**Layout:** Centered, max-width 720px

**Eyebrow (small caps, yellow, Inter 500):** THE PROBLEM

**Headline (Montserrat ExtraBold 800, 48px):**
> Sleep inertia wins every morning.

**Body (Inter 400, 18px, `#F5E6C8`):**
> Your brain is in a low-arousal state for 15–30 minutes after waking. Willpower is offline. The intentions you made the night before collapse the moment the alarm goes off.
> 
> Puzzle alarms make you solve a math problem. Swipe alarms let you dismiss with muscle memory. Neither one changes your physical or mental state. They're all just noise.

**3 failure cards (horizontal row, dark surface cards with red left-border accent):**
| Icon | Label | Caption |
|------|-------|---------|
| 🧩 | Math puzzles | Short-term memory. Back asleep in 2 min. |
| 👆 | Swipe to dismiss | Pure muscle reflex. Zero effort. |
| 📱 | Traditional snooze | Infinite delay. Infinite failure. |

---

### 4. How It Works Section
**Background:** `#1A1209`
**Layout:** Eyebrow + headline centered; 3 cards in a row (desktop), stacked (mobile)

**Eyebrow:** THE SOLUTION

**Headline (Montserrat ExtraBold 800, 48px):**
> The habit is the off-switch.

**Subline (Inter 400, `#9A7A50`):**
> Choose your habit. Register it once. The alarm does not stop until it's verified.

**3 Gate Cards** — dark surface `#2E1F0A`, yellow top-border accent, `rounded-2xl`, subtle shadow

**Card 1 — Physical**
- Icon: 💪 (large, centered)
- Title: Motion Gate
- Body: Camera counts your push-ups, squats, or jumping jacks. Rep target must be reached. No exceptions.
- Screenshot: `phone-motion-gate.png` (small, below card body)

**Card 2 — Environmental**
- Icon: 📦
- Title: Barcode Gate
- Body: Register any item in your home — coffee bag, toothpaste, supplement bottle. You have to walk there to scan it.
- Screenshot: `phone-barcode-gate.png`

**Card 3 — Mindfulness**
- Icon: 🎤
- Title: Voice Gate
- Body: Read a motivational passage aloud. Voice recognition confirms you said it — clearly, fully, intentionally.
- Screenshot: `phone-voice-gate.png`

---

### 5. Science Section
**Background:** `#2E1F0A`
**Layout:** Centered headline + 3 horizontal proof blocks

**Eyebrow:** THE SCIENCE

**Headline (Montserrat ExtraBold 800, 48px):**
> This isn't willpower. It's architecture.

**3 Proof Blocks (no cards — just icon + title + 2-line body, separated by vertical dividers on desktop)**

**Block 1 — Habit Stacking**
> Behavioral psychology: tying a new behavior to an unavoidable cue makes it automatic. The alarm is the cue. The habit is the response. Drowzi digitally enforces this loop.

**Block 2 — Environmental Shift**
> Chronobiology: moving to a new physical space rapidly signals to your circadian system that sleep is over. Walking to the kitchen defeats grogginess faster than any alarm sound.

**Block 3 — Micro-Commitments**
> 10 push-ups. A barcode scan. A spoken sentence. Small wins build momentum. Lower barriers drive compliance. You stay consistent because it's achievable — every morning.

---

### 6. Mascot Section
**Background:** `#1A1209`
**Layout:** Left-aligned headline, right: mascot evolution strip (horizontal row of 5 sprites)

**Headline (Montserrat ExtraBold 800, 40px):**
> You grow. Drowzi grows with you.

**Body (Inter 400, `#9A7A50`):**
> Every morning you complete your habit, Drowzi evolves. Miss a day, it goes back to sleep. The streak is the product.

**Evolution strip:**
5 mascot sprites in a row, labeled below each:
`Day 0 · Sleepy` → `Day 7 · Awake` → `Day 14 · Focused` → `Day 21 · Pumped` → `Day 30 · Legendary`

Small caption below strip (Inter 500, yellow):
> 30-day streak unlocks Legendary form. Don't break the chain.

---

### 7. CTA Section `id="download"`
**Background:** `#F4C430` (full-width yellow inversion)
**Text color:** `#654321` (Grounded Brown)

**Headline (Montserrat ExtraBold 800, 56px, brown):**
> Your alarm goes off tomorrow.
> What are you going to do about it?

**CTA row (centered):**
- App Store badge (dark variant — brown/black on yellow)
- Google Play badge (dark variant)
- Caption: "Free · iOS 16+ · Android 12+"

**No other content. No email capture. No form.**

---

### 8. Footer
**Background:** `#1A1209`
**Layout:** Single row on desktop — logo left, links center, copyright right

**Links (Inter 400, `#9A7A50`, small):**
- Privacy Policy
- GitHub (links to `github.com/delatorrecj/drowzi`)

**Copyright:** `© 2026 Drowzi. All rights reserved.`

---

## CSS Custom Properties (globals.css)

```css
:root {
  --color-bg:            #1A1209;
  --color-surface:       #2E1F0A;
  --color-border:        #4A3015;
  --color-primary:       #F4C430;
  --color-primary-hover: #D9AC1E;
  --color-alarm:         #E63946;
  --color-text:          #F5E6C8;
  --color-text-dark:     #654321;
  --color-text-muted:    #9A7A50;
}
```

---

## Tailwind Config Additions

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      bg:      '#1A1209',
      surface: '#2E1F0A',
      border:  '#4A3015',
      primary: '#F4C430',
      alarm:   '#E63946',
      tx:      '#F5E6C8',
      'tx-dark':  '#654321',
      'tx-muted': '#9A7A50',
    },
    fontFamily: {
      display: ['Montserrat', 'sans-serif'],
      body:    ['Inter', 'sans-serif'],
    },
  },
}
```

---

## Metadata & SEO

```ts
// app/layout.tsx
export const metadata = {
  title: 'Drowzi — The alarm that won't stop until you do.',
  description: 'Drowzi is the habit-gated alarm app that uses your phone\'s camera, mic, and sensors to verify your morning routine. Not a puzzle. The habit is the off-switch.',
  openGraph: {
    title: 'Drowzi — Your alarm won\'t stop. Until you do.',
    description: 'Habit-gated alarms that enforce real morning routines. Motion, barcode, and voice verification.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
}
```

---

## Build & Deploy

```bash
# Local dev
cd website
npm install
npm run dev        # http://localhost:3000

# Static export (for Vercel or any CDN)
npm run build      # outputs to website/out/

# Vercel deploy (auto on push to main, root: website/)
vercel --prod
```

**Vercel config:** Set root directory to `website/` in project settings. Framework preset: Next.js.

---

## What This Page Is NOT

- Not a blog
- Not a documentation site
- Not a sign-up / waitlist form (no email capture in V1)
- Not a pricing page
- Not a dashboard

One page. One scroll. One button. Download.
