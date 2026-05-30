# Drowzi Website

Single-page informational landing page for the Drowzi habit-gated alarm app.

**Stack:** Next.js 15 · Tailwind CSS · `next/font` · Static Export

---

## Setup

```bash
cd website
npm install --ignore-scripts   # use if postinstall fails on paths with "&"
node scripts/download-pose-model.mjs
npm run dev        # http://localhost:3000
npm run dev:lan    # listen on 0.0.0.0 for phone testing
```

Scripts invoke Next via `node ./node_modules/...` so npm works when the repo path contains `&` (Windows bin shim bug).

## Web demo (`/demo`)

Interactive habit gates in the browser (MediaPipe pose, ZXing barcode, Web Speech, IndexedDB, Service Worker alarms).

- Hub: http://localhost:3000/demo
- Motion tuning: `/demo/motion?debug=1`
- Requires camera/mic permissions; data stays on-device
- iOS Safari: background alarms are limited — keep tab open or use Add to Home Screen

`postinstall` downloads `public/models/pose_landmarker_lite.task` (CDN fallback if offline).

## Build

```bash
npm run build      # static export → out/
```

## Deploy

Vercel auto-deploys on push to `main`. Production URL: https://drowzi-axon.vercel.app

Either leave the Vercel **Root Directory** empty (repo root; uses root `vercel.json`) or set it to `website/` with the default Next.js preset.

## Before Launch

1. Replace placeholder emoji cards with real app screenshots in `public/images/` — see `public/images/ASSETS.md`
2. Update `SITE.appStoreUrl` and `SITE.playStoreUrl` in `lib/constants.ts` with real store links
3. Add `public/og-image.png` (1200×630) for social sharing
4. Add `public/favicon.ico` and app icon

## Structure

```
app/
  layout.tsx          # Fonts, metadata
  page.tsx            # Section composition
  globals.css         # Brand CSS tokens

components/
  Navbar.tsx
  HeroSection.tsx
  ProblemSection.tsx
  HowItWorksSection.tsx
  ScienceSection.tsx
  MascotSection.tsx
  CtaSection.tsx
  Footer.tsx

lib/
  constants.ts        # All copy and URLs — edit here, not in components
```
