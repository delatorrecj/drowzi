# Product Requirements Document (PRD)

**Project:** Drowzi — Habit-Gated Wake-Up App
**Date:** 2026-05-15
**Version:** 0.1
**Owner:** delatorrecj
**Status:** Draft
**BRD:** [brd-drowzi.md](brd-drowzi.md)

---

## 1. Product Purpose & Value Proposition

Drowzi is a mobile alarm app that will not turn off until you complete a real habit. You choose your habit at setup — ten push-ups verified by the accelerometer, a barcode scan on your toothpaste tube, a yoga pose held for 30 seconds via camera pose detection, or a motivational passage read aloud via voice recognition. The alarm blares until your body has moved. This isn't a puzzle; it's a behavioral contract. Drowzi targets the 18–40-year-old chronic snoozer who has tried and failed to build morning routines, and it solves the problem through unavoidable accountability: the habit is the off-switch.

---

## 2. Target Personas

**Primary Persona — The Chronic Snoozer (Alex)**
- *Who they are:* 24-year-old grad student or early-career professional. Sets 3 alarms daily, hits snooze on all of them, arrives to their morning feeling sluggish and behind.
- *Their core frustration:* They want to be a "morning person" and have tried journaling, meditation apps, and fitness apps — but willpower at 6:30 AM is zero.
- *What success looks like for them:* After 30 days with Drowzi, they've done push-ups every morning without thinking about it. The habit is automatic because the alarm made it non-negotiable.

**Secondary Persona — The Routine Builder (Sam)**
- *Who they are:* 32-year-old parent or professional with a packed schedule. Mornings are the only uninterrupted self-improvement time, but they keep sleeping through them.
- *Their core frustration:* They know what habits they want to build; they just can't activate those habits in the foggy minutes after waking.

---

## 3. Core Features & Priorities

| Feature | Description | Priority |
|---------|-------------|----------|
| Habit-Gated Alarm Engine | Alarm plays and continues until the selected habit is verified by sensor. No snooze. No swipe-to-dismiss. | Must-Have |
| Physical Habit Gate — Motion Count | Camera or accelerometer counts push-ups, squats, or jumping jacks. Rep target must be reached to dismiss. | Must-Have |
| Environmental Habit Gate — Barcode Scan | Camera scans a registered barcode (coffee bag, toothpaste, supplement bottle). Requires user to physically walk to that location. | Must-Have |
| Cognitive/Mindfulness Gate — Voice Reading | Microphone captures user reading a configured motivational passage aloud. Voice recognition confirms completion. | Must-Have |
| Alarm Scheduler | Set time, recurrence (daily, weekdays, custom), and select which habit gate to require. | Must-Have |
| Onboarding Habit Selector | First-launch flow: user selects their habit category, configures the specific habit, and registers any needed assets (barcode, phrase). | Must-Have |
| Mascot Evolution System | Drowzi mascot starts sleepy at alarm time; becomes progressively more energized as habit streaks accumulate. Visual reward tied to consistency. | Should-Have |
| Streak Tracking & History | Persistent record of daily habit completions. Shown on home screen and mascot. | Should-Have |
| Pose-Based Habit Gate | Camera-based yoga/stretch pose detection using on-device ML. Held for a configurable duration. | Should-Have |
| Meditation Timer Gate | Camera or microphone confirms user is still and present for a set period (e.g., 2 minutes). | Could-Have |
| Multiple Alarm Profiles | Different habits for different days (e.g., push-ups Mon/Wed/Fri, barcode scan Tue/Thu). | Could-Have |
| Social Sharing | Share mascot evolution milestone or streak card to social media. | Won't-Have (v1) |
| Paid Subscription / Premium Habits | Advanced habit types (journaling, workout logging) behind a paywall. | Won't-Have (v1) |

---

## 4. User Stories & Acceptance Criteria

**US-01 — Set Up a Motion-Based Habit Alarm**
> As Alex, I want to set a 6:30 AM alarm that requires 10 push-ups so that I never lay in bed after my alarm goes off.

Acceptance Criteria:
- Given I have completed onboarding, when I create a new alarm and select "Push-Ups" as the habit gate and set the rep target to 10, then the alarm is saved and displayed on the home screen with a push-up icon.
- Given the alarm fires at 6:30 AM, when I have not completed 10 push-ups, then the alarm audio continues regardless of tapping the screen.
- Given I perform 10 push-ups while the alarm is active, when the accelerometer/camera confirms the 10th rep, then the alarm stops and the completion is logged to my streak.

**US-02 — Set Up a Barcode Scan Alarm**
> As Sam, I want my alarm to require me to scan my coffee maker's bag so that I physically get out of bed and go to the kitchen.

Acceptance Criteria:
- Given I am in alarm setup, when I choose "Barcode Scan" and tap "Register Item," then the camera opens and I can scan the target barcode which is saved to this alarm profile.
- Given the alarm fires and I open the barcode scan gate, when I scan any barcode that does not match the registered item, then the alarm continues and I see "Wrong item — try again."
- Given I scan the correct registered barcode, when it matches, then the alarm dismisses and the habit is logged.

**US-03 — Voice Reading Gate**
> As Alex, I want to read a motivational quote aloud each morning so that I start my day with an intentional mindset.

Acceptance Criteria:
- Given I select "Voice Reading" in alarm setup and enter a passage of text, when the alarm fires and I tap the mic button, then the app listens and compares my spoken words to the target passage using speech recognition.
- Given I read the passage with ≥80% word match accuracy, when recognition completes, then the alarm dismisses and the habit logs.
- Given I stop speaking mid-read, when no audio is detected for 5 seconds, then the listening resets and I must start again.

**US-04 — Mascot Reacts to Streak**
> As Alex, I want to see my Drowzi mascot evolve as I build my streak so that I feel rewarded for consistency.

Acceptance Criteria:
- Given I am on day 1 (no streak), then the mascot is displayed in its sleepy/demanding form on the home screen.
- Given I have completed 7 consecutive days, then the mascot displays an energized visual state and a streak badge showing "7-day streak."
- Given I miss a day (alarm force-closed or not dismissed via habit), then the streak resets to 0 and the mascot returns to its base state.

**US-05 — First-Time Onboarding**
> As a new user, I want a guided setup so that I can configure my first habit alarm in under 3 minutes.

Acceptance Criteria:
- Given I open the app for the first time, when onboarding begins, then I am shown exactly 3 screens: (1) welcome/brand intro, (2) habit category selection, (3) alarm time + habit config.
- Given I complete onboarding, when I reach the home screen, then my first alarm is already scheduled and visible.
- Given I tap "Skip" during habit configuration, when I reach the home screen, then I am prompted once to complete alarm setup before I can set any other features.

---

## 5. UX & Design Intent

**Design reference:** [dsd-drowzi.md](dsd-drowzi.md)

**Key flows:**
- Onboarding (first alarm setup) — must complete in ≤3 screens, ≤3 minutes
- Alarm active state (habit execution screen) — must be legible in low-light, eyes half-open; large tap targets, maximum contrast
- Home screen (streak + mascot) — glanceable; one tap to add or edit alarm

**Constraints:**
- Mobile-first; designed for 390px (iPhone 16 base) with Android parity at 360px
- No interaction requiring fine motor control during the alarm screen — user is groggy
- All alarm-screen elements must function with screen brightness at minimum
- Mascot art must be provided in a pixel-art style consistent with the Drowzee pixel art inspiration
- Awakening Yellow (#F4C430) as dominant background for alarm-active screens; Grounded Brown (#654321) for text and navigation

---

## 6. Out of Scope for This Release

- Social leaderboards and friend challenges — deferred to v2
- Paid subscription tier and premium habit gates — deferred to v2
- Apple Watch / wearable integration — deferred to v2
- Habit recommendation engine powered by AI/LLM — deferred to v2
- Web or desktop dashboard — deferred to v2
- Third-party calendar sync (Google Calendar, Apple Calendar) — deferred to v2

---

## 7. AI / Agent Feature Specifications

*This section covers the on-device ML used for habit verification — not an external LLM. Drowzi uses device-side inference to avoid latency and preserve privacy.*

**AI Component:** On-Device Pose Detection (Physical & Pose Gates)
**Model(s) considered:** Google ML Kit Pose Detection, MediaPipe Pose, Apple Vision Framework (ARKit)
**Selected model:** Google ML Kit Pose Detection (via React Native) — *reason: Cross-platform (iOS + Android), on-device inference with no API calls, well-documented landmark detection, free.*

**What the AI does:**
Analyzes camera frames in real-time to detect body keypoints (shoulders, elbows, hips, knees) and classifies rep counts for push-ups/squats or validates pose holds for yoga/stretch gates. All inference runs on-device; no frames leave the phone.

**Input → Output contract:**
- Input: Camera frames at 15fps during the active habit gate session
- Output: Rep count integer (motion gates) or pose-held duration in seconds (yoga gates)
- Latency expectation: <100ms per frame on mid-range devices (Snapdragon 700-series and up, A15 and up)

**Human-in-the-loop points:**
- User must explicitly start the habit verification session (tap a button) — camera does not activate until user initiates
- If pose detection confidence drops below threshold, user is shown a "reposition camera" prompt; no auto-accept

**Fallback behavior when AI fails or is unavailable:**
If ML model fails to load (corrupted install, unsupported device), fall back to a manual timer-based gate: user must hold the phone still for the configured duration, confirmed by gyroscope only. Log the fallback event.

**Token / cost budget per operation:**
On-device only — $0 per operation. No external API costs for pose detection.

---

## 8. Dependencies & Assumptions

**Dependencies:**
- Expo / React Native (cross-platform mobile framework)
- Google ML Kit (on-device pose detection, barcode scanning)
- React Native Voice or Expo Speech (voice recognition via platform OS — iOS SpeechRecognition, Android SpeechRecognizer)
- Supabase (user auth, streak and habit log persistence)
- Expo Notifications (foreground and background alarm delivery)
- App Store Connect account + Google Play Console account

**Assumptions:**
- Users will grant microphone, camera, and notification permissions on first use; onboarding will explain why these are needed
- Target devices are iOS 16+ and Android 12+; no support for older OS versions in V1
- Users have internet connectivity for account creation and streak sync; alarm functionality (firing + sensor verification) must work fully offline
- Mascot pixel art will be created by the owner; not generated procedurally in V1

---

## 9. Milestones

| Milestone | Deliverable | Target Date |
|-----------|-------------|-------------|
| M0 | Repo scaffolded, Expo project running, Supabase project linked, CI passing | Week 1 |
| M1 | Core alarm engine working: alarm fires, at least one habit gate (motion) verified end-to-end, streak logs to DB | Week 4 |
| M2 | All 3 must-have habit gates implemented (motion, barcode, voice); onboarding complete; mascot base state rendered | Week 7 |
| M3 | Should-Have features (pose gate, streak history, mascot evolution); QA sign-off; staging build | Week 10 |
| Launch | App Store + Play Store submission; QAD passed; GTM assets live | Week 12 |

---

## Self-Check

- [x] Every Must-Have feature in Section 3 has at least one user story in Section 4
- [x] Acceptance criteria are testable (Given/When/Then format)
- [x] Section 6 explicitly names things that were discussed but cut
- [x] Section 7 is filled (on-device ML component documented)
- [x] Section 9 has realistic dates
- [x] This document answers *what* to build, not *how* (architecture goes in the SDD)

---

*Next document: [DSD](dsd-drowzi.md) | [SDD](sdd-drowzi.md)*
