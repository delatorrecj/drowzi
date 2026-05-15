# Business Requirements Document (BRD)

**Project:** Drowzi — Habit-Gated Wake-Up App
**Date:** 2026-05-15
**Version:** 0.1
**Owner:** delatorrecj
**Status:** Draft

---

## 1. Executive Summary

Drowzi is a mobile alarm application that refuses to silence until the user physically completes a meaningful morning habit — a push-up set, a barcode scan from the kitchen, a yoga pose, or a spoken motivational passage. Unlike conventional "puzzle alarms" that only require a mental task or a swipe, Drowzi enforces real behavioral change by leveraging the phone's camera, motion sensors, and microphone as verifiers. The result is an alarm that doubles as a daily habit-building engine: every morning the app is used, the user has already made progress toward their health, mindfulness, or routine goals before they have even made their first cup of coffee.

---

## 2. The Problem & Opportunity

**The Problem:**

The intention-behavior gap in morning routines costs millions of people the productive start they intend. Sleep inertia — the physiological grogginess present in the first 15–30 minutes after waking — systematically destroys willpower at precisely the moment it is needed most. Existing alarm apps either let users snooze indefinitely or require trivially easy cognitive tasks (math problems, pattern matching) that do nothing to shift the user's physical or environmental state. The result: chronic snoozers who wake up already feeling like they have failed.

**The Opportunity:**

The behavioral science is settled. Habit stacking (attaching a new behavior to an unavoidable cue), environmental context shifts (physically moving to defeat sleep inertia), and micro-commitments (small wins that build momentum) are all proven mechanisms for building lasting routines. No app currently enforces all three simultaneously at the one moment every person engages with their phone unconditionally: the alarm. The mobile health and wellness app market is growing rapidly, and a product that delivers a verifiable, sensor-backed habit completion experience is a novel and defensible position.

**Target Customer / User:**

Adults aged 18–40 who have repeatedly set morning routine goals (exercise, meditation, journaling, structured mornings) and just as repeatedly broken them. This includes chronic snoozers, productivity-obsessed professionals, students with early schedules, fitness beginners who cannot make gym habits stick, and parents who need structured mornings to function. These users already download health apps; they fail at the follow-through.

---

## 3. Strategic Alignment

Drowzi's primary goal in the first 12 months is to establish a strong free user base with high daily active usage (DAU) rates, creating the behavioral-data foundation and social proof needed to introduce a premium subscription tier. Every product decision in V1 maps to a single OKR: **maximize D30 retention** — users who return to set and dismiss at least one alarm 30 days after install. High D30 retention proves that Drowzi is changing behavior, not just filling a novelty slot.

Secondary goal: **organic growth via shareability**. The mascot evolution system and habit streaks are designed to produce shareable moments (e.g., "Day 30 — Drowzi is jacked and so am I") that drive word-of-mouth without paid acquisition budget.

---

## 4. Scope

**In Scope:**

- Native mobile app (iOS and Android via React Native / Expo)
- Alarm scheduling system with recurring and one-off alarms
- Habit gate engine: camera-based pose/barcode verification, microphone-based speech recognition, accelerometer-based motion counting
- Onboarding habit selector (Physical, Environmental, Cognitive/Mindfulness)
- Mascot evolution system tied to habit streaks
- User account and streak persistence (Supabase backend)
- Free tier with core features
- App Store and Google Play submission

**Out of Scope (V1):**

- Social/community features (leaderboards, friend challenges)
- AI-generated personalized habit recommendations
- Wearable integrations (Apple Watch, Fitbit)
- Web application or desktop version
- Paid subscription tier (deferred to V2)
- Third-party calendar sync

---

## 5. Success Metrics

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| App Store / Play Store downloads | 0 | 5,000 installs | 60 days post-launch |
| D7 retention (users active on day 7) | 0 | ≥35% | Measured at 30-day mark |
| D30 retention (users active on day 30) | 0 | ≥20% | Measured at 60-day mark |
| Average habit completion rate (alarm dismissed via habit, not force-close) | 0 | ≥75% | 30 days post-launch |
| App Store rating | 0 | ≥4.3 stars | 90 days post-launch |
| Organic referral installs | 0 | ≥20% of total installs | 90 days post-launch |

---

## 6. Stakeholders & Owners

| Role | Person | Responsibility |
|------|--------|----------------|
| Sponsor / Decision Maker | delatorrecj | Final approval, publishing, and product direction |
| Business Owner | delatorrecj | Accountable for retention and growth metrics |
| Product / Tech Lead | delatorrecj | Architecture, build, and deployment |

---

## Self-Check

- [x] Section 1 can be read by a non-technical person and makes immediate sense
- [x] Section 2 quantifies the problem (not just describes it)
- [x] Section 5 has at least one metric with a number and a timeline
- [x] Section 4 explicitly names at least one thing that is out of scope
- [x] Nothing in this document describes *how* to build the solution (that's the SDD's job)

---

*Next document: [PRD](prd-drowzi.md)*
