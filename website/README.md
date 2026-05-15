# Drowzi Website

Single-page informational landing page for the Drowzi habit-gated alarm app.

**Stack:** Next.js 15 · Tailwind CSS · `next/font` · Static Export

---

## Setup

```bash
cd website
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build      # static export → out/
```

## Deploy

Vercel auto-deploys on push to `main`. Set root directory to `website/` in Vercel project settings.

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
