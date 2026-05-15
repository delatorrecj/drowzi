# QA & Test Plan (QAD)

**Project:** Drowzi — Habit-Gated Wake-Up App
**Date:** 2026-05-15
**Version:** 0.1
**Owner:** delatorrecj
**PRD:** [prd-drowzi.md](prd-drowzi.md)
**RFC(s):** [rfc-drowzi-habit-verification.md](rfc-drowzi-habit-verification.md)

---

## 1. Testing Strategy & Scope

**In Scope:**
- All Must-Have and Should-Have features from PRD §3
- Habit gate engine: motion (push-ups), barcode scan, voice reading, pose hold
- Alarm scheduling, firing, and OS notification delivery
- Onboarding flow (first-time setup)
- Streak tracking and mascot state transitions
- Offline behavior (gates function with no network)
- Supabase sync: habit log persisted after habit completion
- Auth: sign-up, login, session persistence, logout

**Out of Scope:**
- Load/stress testing above 100 concurrent users (V1 is a solo launch)
- Accessibility audit for screen reader (documented as V2 task)
- Android versions below API 31 (Android 12)
- iOS versions below iOS 16
- Social sharing features (Won't-Have in V1)

**Testing levels:**

| Level | Tooling | Owner |
|-------|---------|-------|
| Unit tests | Jest + React Native Testing Library | Engineer (write alongside code) |
| Integration tests | Jest + Supabase local instance | Engineer |
| E2E tests | Maestro (RN-native E2E framework) | Engineer / QA |
| Manual exploratory | Physical iOS + Android device | delatorrecj |
| On-device sensor tests | Physical device only (can't mock camera/mic in CI) | delatorrecj |

---

## 2. Test Environments & Data

**Staging URL:** EAS Preview build (internal distribution URL generated per build)
**Test credentials:** Stored in local `.env.test`; two test accounts: `qa-ios@drowzi.test` and `qa-android@drowzi.test`
**Data policy:** Seeded test accounts in Supabase staging project. Never use production user data. Reset test streak/log data before each major test cycle.

**Test data setup:**
```bash
# Seed test accounts and reset streak data
supabase db reset --db-url $SUPABASE_STAGING_URL
pnpm db:seed:test
```

---

## 3. Core Test Scenarios

### Happy Paths (must all pass before launch)

| ID | Scenario | Steps | Expected Result | US-ID |
|----|----------|-------|-----------------|-------|
| H-01 | New user completes onboarding and creates first motion-gate alarm | Open app → complete 3-screen onboarding → select Push-Ups → set 10 reps → set 7:00 AM | Home screen shows alarm at 7:00 AM with push-up icon; streak shows 0 | US-05 |
| H-02 | Alarm fires; user completes 10 push-ups; alarm dismisses | Wait for alarm to fire → perform 10 push-ups in front of camera | Alarm audio stops; completion overlay shows; habit logged in streak | US-01 |
| H-03 | Barcode gate — user scans registered item; alarm dismisses | Alarm fires → open barcode gate → scan registered coffee bag barcode | Alarm dismisses; habit logged | US-02 |
| H-04 | Voice gate — user reads passage; alarm dismisses | Alarm fires → open voice gate → read passage aloud at ≥80% accuracy | Alarm dismisses; habit logged | US-03 |
| H-05 | Streak increments after 3 consecutive successful mornings | Complete habit gate on day 1, 2, and 3 | Streak counter shows 3; mascot shows energized state | US-04 |
| H-06 | User logs in on new device; streak and alarms sync from Supabase | Log out → install on second device → log in → navigate to home | All alarms and streak data restored from cloud | — |
| H-07 | Alarm functions fully offline | Enable Airplane Mode → wait for alarm to fire → complete push-up gate | Alarm fires and dismisses correctly offline; habit log syncs when connectivity restored | — |

### Sad Paths (edge cases and error handling)

| ID | Scenario | Input / Trigger | Expected Behavior |
|----|----------|-----------------|-------------------|
| S-01 | User performs fewer reps than required | 5 push-ups when 10 required | Rep counter shows 5/10; alarm continues; no dismiss |
| S-02 | Wrong barcode scanned | Scan unregistered item during barcode gate | "Wrong item — try again" message; alarm continues |
| S-03 | User reads wrong passage (low accuracy) | Read unrelated text into voice gate | "Try again" prompt; mic resets; alarm continues |
| S-04 | User force-closes the app during active alarm | Swipe-kill app during alarm | OS notification alarm continues ringing; reopening app returns to habit gate screen |
| S-05 | Camera permission denied | Revoke camera permission → alarm fires with motion gate | "Camera access needed" prompt with Settings deep-link; fallback timer gate activates |
| S-06 | ML model fails to load (mocked failure) | Inject ML init error in dev mode | Fallback mode activates; "Limited mode" banner shown; gyroscope timer gate used |
| S-07 | User misses a day (no alarm completion) | Skip one day in streak | Streak resets to 0; mascot returns to sleepy base state |
| S-08 | Voice gate: user stops speaking mid-passage | Stop speaking for 5+ seconds during voice gate | Listening resets; "Start again" prompt shown |
| S-09 | Network drops during Supabase sync | Complete habit → disable network before sync | Habit logged locally; pending sync icon shown; syncs automatically on reconnection |
| S-10 | Duplicate alarm fire (OS bug) | Simulate duplicate notification | Second gate session ignored; only one habit_log entry written |

---

## 4. Automation vs. Manual Testing

### Automated (CI pipeline)

```yaml
# What runs on every PR:
- pnpm lint          # ESLint + Prettier
- pnpm typecheck     # tsc --noEmit
- pnpm test          # Jest: unit tests for HabitGateEngine state machine, streak calculation, data models
- pnpm test:integration  # Jest + Supabase local: auth flow, habit log write/sync, streak recalculation
# E2E (Maestro) runs on merge to main, not per-PR (device farm required):
- maestro test flows/onboarding.yaml
- maestro test flows/alarm-motion-gate.yaml
- maestro test flows/alarm-barcode-gate.yaml
```

**CI gate:** PR cannot merge if lint, typecheck, or unit tests fail. E2E failures on `main` trigger Slack alert.

### Manual / Exploratory

- Full onboarding flow on physical iPhone 16 and a mid-range Android (Samsung Galaxy A55 or similar)
- All 4 habit gates tested on physical devices (camera/mic required)
- Alarm firing tested by setting a 1-minute alarm and waiting — not mocked
- Offline test: airplane mode + alarm fire + habit completion + connectivity restore
- Low-light test: habit gate in dark room to verify UI legibility (DSD alarm-active screen spec)
- 30-minute free-form exploratory session simulating a real user's first 3 days

---

## 5. Bug Triage Protocol

| Severity | Definition | Action |
|----------|------------|--------|
| **P0 — Blocker** | Alarm does not fire, habit gate crashes, user data lost, security breach | Cannot launch. Fix immediately. |
| **P1 — High** | Habit gate fails to credit a valid completion, streak incorrectly resets, barcode always accepts wrong item | Cannot launch. Fix before release. |
| **P2 — Medium** | Mascot animation glitch, sync takes >10s on good network, minor UI misalignment | Can launch. Fix in next update. |
| **P3 — Low** | Cosmetic text truncation, minor color inconsistency, non-critical copy error | Can launch. Backlog. |

**Bug tracking:** GitHub Issues with labels `bug/P0`, `bug/P1`, `bug/P2`, `bug/P3`

---

## 6. Release Criteria (Definition of Done)

Launch is approved when all of the following are true:

- [ ] All P0 bugs resolved
- [ ] All P1 bugs resolved
- [ ] All happy path scenarios H-01 through H-07 pass on both iOS and Android physical devices
- [ ] Sad paths S-01 through S-10 verified manually
- [ ] Automated test suite passes: lint + typecheck + unit + integration
- [ ] Maestro E2E: onboarding, motion gate, barcode gate flows green
- [ ] Manual exploratory session (30 min) completed with no newly discovered P0/P1 issues
- [ ] Alarm fire accuracy verified: alarm fires within ±30 seconds of scheduled time on iOS and Android
- [ ] App submitted and approved on App Store and Google Play (or at minimum, internal testing track approved)

---

## 7. AI / LLM Evaluation

**What makes an AI response "correct" in this product?**
Drowzi uses on-device ML (not LLM) for verification. "Correct" means:
- Motion gate: rep counter increments once and only once per valid push-up/squat cycle (landmarks show clear down-up movement with confidence >0.6)
- Barcode gate: exact barcode string match to registered value — any mismatch = reject
- Voice gate: Jaro-Winkler word similarity score ≥0.80 between recognized transcript and target passage
- Pose gate: all required keypoints detected with confidence ≥0.65 for the full hold duration

### Eval Suite (on-device, manual for V1)

| Eval ID | Input | Expected Behavior | Pass Criterion |
|---------|-------|------------------|----------------|
| AI-01 | 10 clean push-ups performed at normal pace | Rep counter reaches 10; gate completes | Counter = 10; alarm dismisses |
| AI-02 | Phone lying still on floor (motion gate open) | No rep credit for random/gravity movement | Counter stays at 0 after 30s |
| AI-03 | Registered barcode scanned | Gate accepts | Alarm dismisses |
| AI-04 | Different barcode (same physical item) scanned | Gate rejects | "Wrong item" shown |
| AI-05 | Passage read clearly and completely | Voice gate passes | Score ≥0.80; alarm dismisses |
| AI-06 | Passage read in thick accent (non-native English) | Voice gate still passes if words recognizable | Score ≥0.80; if score <0.80 after 3 tries → fallback offered |
| AI-07 | Unrelated speech detected | Voice gate rejects | Score <0.80; "Try again" shown |
| AI-08 | Warrior I yoga pose held for 30s | Pose gate passes | Hold timer completes; alarm dismisses |

**Regression evals:** Re-run AI-01 through AI-08 manually before any ML Kit version upgrade.

**Model upgrade protocol:**
1. Run full eval suite against new ML Kit version on reference device set
2. Any regression in AI-01 through AI-08 pass rate → block upgrade, investigate
3. Log eval results in `docs/eval-log.md`

**Observability:**
- Traces: none in V1 (on-device, no cloud trace tooling)
- Key metric: habit completion rate (habit_logs.method = 'verified' / total habit_logs) — target ≥75%
- Fallback rate: habit_logs.method = 'fallback_timer' / total — target <10%
- Alert: if fallback rate >10% over any 7-day period → investigate ML Kit compatibility issue

---

## Self-Check

- [x] Every Must-Have PRD feature has at least one Happy Path scenario
- [x] Every Happy Path has at least one corresponding Sad Path
- [x] Automated checks are defined and will run in CI
- [x] Section 7 is filled (on-device ML eval suite defined)
- [x] Release criteria are binary (pass/fail), not subjective
- [x] Test data setup command is documented

---

*Next document: [GTM](gtm-drowzi.md)*
