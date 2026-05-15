# Go-To-Market (GTM) Strategy

**Project:** Drowzi — Habit-Gated Wake-Up App
**Date:** 2026-05-15
**Version:** 0.1
**Owner:** delatorrecj
**PRD:** [prd-drowzi.md](prd-drowzi.md)

---

## 1. Product Summary (GTM View)

**What it does (one sentence):** Drowzi is the alarm app that won't shut up until you actually do your morning habit — push-ups, a barcode scan, a yoga pose, or a spoken affirmation.

**Who it's for:** Chronic snoozers and productivity seekers (18–40) who have tried and failed to make morning routines stick and are ready for a solution that forces the issue.

**Core value proposition:** The only alarm app that uses your phone's sensors to verify you've done a real habit — not a puzzle, not a swipe. The habit is the off-switch.

**Category:** Health & Fitness / Productivity / Lifestyle

---

## 2. Target Audience

**Primary ICP (Ideal Customer Profile):**
- *Who:* Young adults (20–35), smartphone-native, who post about productivity and morning routines. They follow "build in public" and self-improvement content. They have downloaded at least one habit app (Habitica, Streaks, Fabulous) in the last year. They know what they want their mornings to look like — they just can't execute it.
- *Where they hang out:* TikTok (morning routine content), Instagram Reels, X/Twitter (productivity Twitter), Reddit (r/productivity, r/selfimprovement, r/GetDisciplined), YouTube (morning routine vlogs)
- *What they already believe:* "I'm not a morning person, but I want to be." "I keep setting goals and failing at 6 AM."
- *What will make them try this:* A video of the alarm refusing to turn off until the person actually does push-ups. The concept is immediately self-explanatory and shareable.

**Secondary audience:**
- *Who:* Fitness beginners and gym starters who struggle to make exercise a daily habit; parents who need structured mornings; students with early classes
- *Why secondary:* Slightly less online/shareable behavior; slower to discover but convert well once they find the app

---

## 3. Pricing Model

**Model:** `Freemium`

| Tier | Price | What's Included | Limit / Gate |
|------|-------|-----------------|-------------|
| Free | $0 | All 3 core habit gate types (motion, barcode, voice); 1 alarm profile; streak tracking; mascot base + 7-day evolution | Single alarm profile; no multiple-day habit rotation |
| Pro | $4.99/mo or $34.99/yr | All habit gates including pose and meditation; unlimited alarm profiles; multiple habit rotation by day; mascot full evolution tree; streak export | No limit |

**Pricing rationale:** The free tier delivers the full core experience — the gate works, the streak tracks, the mascot reacts. The conversion lever is power users who want pose detection, meditation gates, or multiple alarm profiles for different mornings. $4.99/mo is lower than most fitness apps and under the "impulse buy" threshold for the target demographic.

**Payment processor:** RevenueCat (subscription management) + Stripe / App Store / Google Play billing

---

## 4. Positioning & Messaging

**Tagline:** `"Your alarm won't stop. Until you do."`

**Primary message (for landing page hero):**
Every morning you hit snooze, you're already losing. Drowzi is the alarm app that won't turn off until you've done your morning habit — verified by your camera, your microphone, or your barcode scanner. Not a puzzle. Not a swipe. The habit is the off-switch.

**Proof points:**
- Behavioral science-backed: habit stacking, environmental context shifts, and micro-commitments are proven morning routine mechanics — Drowzi digitally enforces all three
- On-device verification: camera, mic, and sensors run locally — no data leaves your phone
- It actually works: 75%+ of alarms dismissed via verified habit completion (target metric, published post-launch)

**Objection handling:**

| Objection | Response |
|-----------|----------|
| "I'll just force-close the app" | OS alarm keeps ringing even if the app is killed. You can't escape it. |
| "What if I don't want to exercise?" | Pick the habit that fits you — scan your coffee maker, read a quote, or hold a stretch. Three categories, dozens of options. |
| "Isn't this just Alarmy?" | Alarmy makes you solve puzzles — short-term memory, trivial effort. Drowzi enforces the *actual* habits you've been trying to build. |
| "My room is too dark for camera features" | Motion gates use the accelerometer, not just the camera. Works in the dark. |

---

## 5. Launch Channels & Tactics

**Owned channels:**

| Channel | Audience Size | Planned Action |
|---------|--------------|----------------|
| GitHub (delatorrecj/drowzi) | 0 → growing | Public repo with great README; builds credibility with developer audience and builds-in-public community |
| Personal social (X/Twitter + TikTok) | TBD | "I'm building an alarm app that refuses to turn off unless you do push-ups" — build-in-public thread series during development |

**Community / earned channels:**

| Channel | Tactic | Timing |
|---------|--------|--------|
| r/productivity, r/GetDisciplined | Post "I built an alarm that won't turn off until you do your morning habit — here's how it works" with a short screen recording | Launch day |
| r/SideProject, r/androidapps, r/iosapps | Product showcase post with demo video | Launch day |
| Product Hunt | Full Product Hunt launch — prepare hunter, gather 5–10 upvote commitments in advance | Beta launch week |
| TikTok / Instagram Reels | 30–60 second video: alarm going off, person groaning, camera detecting push-ups, alarm stopping. No narration needed — the concept sells itself. | 1 week before launch |
| Hacker News Show HN | "Show HN: I built a habit-gated alarm that uses on-device ML to verify your morning routine" | Public launch day, 9am ET |
| Fitness and productivity YouTube creators (micro-influencers, 10k–100k subscribers) | Cold outreach with a free Pro code + demo video | Beta phase |

**Content assets needed before launch:**

- [ ] Demo video (30–60 sec) — alarm fires, person does push-ups, camera counts reps, alarm stops. No dialogue.
- [ ] App Store / Play Store screenshots (5 per store) — alarm active screen (yellow), habit gate UI, mascot evolution, streak home screen
- [ ] App Store / Play Store description copy (short + long)
- [ ] Landing page at drowzi.app (or equivalent) with tagline, demo video, App Store/Play Store download links
- [ ] Product Hunt listing draft (tagline, description, first comment)
- [ ] Reddit post copy (one for productivity subs, one for side project subs)
- [ ] TikTok/Reels video (raw screen recording + real phone footage of push-up gate working)

---

## 6. Launch Phases

| Phase | Criteria to Enter | Target Date | Goal |
|-------|------------------|-------------|------|
| **Alpha** (private) | Core habit gates working on physical device; no P0 bugs; onboarding complete | Week 8 of build | 5–10 trusted users (friends, family); collect real behavioral feedback |
| **Beta** (TestFlight / Play Internal) | Alpha feedback addressed; all 3 must-have gates tested and stable; mascot renders | Week 10 | 50–100 testers; verify alarm reliability on diverse devices; D7 retention baseline |
| **Public Launch** | Beta D7 retention ≥30%; QAD passed; all App Store assets ready; GTM assets live | Week 12 | App Store + Play Store public release; Product Hunt launch; Reddit posts |
| **Post-launch (30 days)** | — | Week 16 | 5,000 downloads; D30 retention data available; first 10 Pro conversions; v1.1 patch for top bugs |

---

## 7. Success Metrics (30-day post-launch)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| App installs | 5,000 | App Store Connect + Google Play Console |
| D7 retention | ≥35% | Users who open app on day 7 after install — Supabase + analytics event |
| D30 retention | ≥20% | Users who open app on day 30 — Supabase event log |
| Habit completion rate | ≥75% | `habit_logs.method = 'verified'` / total `habit_logs` |
| App Store rating | ≥4.3 stars | App Store Connect |
| Pro conversion rate | ≥2% of active users | RevenueCat dashboard |
| Product Hunt ranking | Top 5 on launch day | Product Hunt |

---

## Self-Check

- [x] Section 2 ICP is specific enough — can name the archetype clearly (productivity-chasing chronic snoozer, smartphone-native, 20–35)
- [x] Section 3 pricing has a clear gate (single alarm profile on free → multiple on Pro)
- [x] Section 5 content assets are enumerated and all need to be created before launch
- [x] Section 6 has binary criteria for moving between phases
- [x] Section 7 metrics are measurable on day 1 — tracking plan implicit in Supabase event log and App Store analytics
- [x] This document is drafted before launch, not written as a retrospective

---

*Full FMD suite complete. Document index:*
- *[BRD](brd-drowzi.md) — Why build this*
- *[PRD](prd-drowzi.md) — What to build*
- *[DSD](dsd-drowzi.md) — How it looks*
- *[SDD](sdd-drowzi.md) — How it's built*
- *[RFC](rfc-drowzi-habit-verification.md) — How the habit gate engine works*
- *[QAD](qad-drowzi.md) — How we test it*
- *[GTM](gtm-drowzi.md) — How we launch it*
