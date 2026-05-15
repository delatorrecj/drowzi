# Drowzi — Two-Developer Workflow Split (Hackathon)

**Purpose:** Two devs shipping in parallel under time pressure: minimal blocking, one demo path that works, everything else stubbed or deferred.  
**Baseline docs:** [prd-drowzi.md](prd-drowzi.md), [sdd-drowzi.md](sdd-drowzi.md), [rfc-drowzi-habit-verification.md](rfc-drowzi-habit-verification.md), [dsd-drowzi.md](dsd-drowzi.md).

**Persistence scope:** **Local only** — AsyncStorage on native Expo builds and the same API on **web** (Expo). No cloud backend in this plan.

---

## 0. Hackathon operating mode

**Default timebox:** Assume **one vertical slice first** (alarm fires → one real habit gate → alarm stops → something is saved), then widen. If the event is short (e.g. ≤12h), treat “vertical slice” as the only non-negotiable goal.

**Simultaneous work rule:** Do not wait for perfect types. **Pair for 20–30 minutes at the start** on Section 4 (one shared `types.ts` or JSON shapes + `recordCompletion` stub), then split. Re-pair whenever integration is stuck more than 15 minutes.

**Scope knives (use aggressively):**

| If time is tight | Cut or defer |
|------------------|--------------|
| Backend | **Out of scope** — only AsyncStorage / on-device persistence |
| Auth | Skip signup; hardcode a test user ID or “anonymous mode” |
| Gates | **One** real gate for the pitch (barcode or motion often demo well); others = “Coming soon” or fake verify button |
| Streak / mascot | Static UI or fake numbers (dashboard placeholders OK) |
| CI | Run `tsc` / lint locally; skip GitHub Actions until after the hackathon if needed |

**Demo checklist (minimum):** One scheduled alarm (or “Fire test alarm” button that mimics the real path) → habit screen → verified dismiss → completion persisted locally.

---

## 1. Principles

1. **Offline-first alarm:** Scheduling + reading alarm config at fire time stays with **Dev A**. **Dev B** never reads storage directly for routing—only through the contract (Section 4).
2. **Habit verification on-device:** Sensors/camera/mic UX = **Dev B**; persistence shape for `habit_config` / completions = agree once with **Dev A**, then stop bikeshedding.
3. **Thin integration surface:** Shared types + `recordCompletion` + `openHabitGate(alarmId)` beat cross-importing feature folders.
4. **Merge constantly:** Same branch (`main` or `hackathon`) or **short-lived** `integration`; merge at least **every 1–2 hours** so neither drifts.

---

## 2. Ownership map

| Area | Primary owner | Hackathon note |
|------|---------------|----------------|
| Expo scaffold, env, running | Dev A | One “golden” command in README: `npx expo start` |
| Notifications / alarm trigger | Dev A | If OS scheduling is flaky mid-hackathon, add **dev-only “Simulate alarm”** so B is never blocked |
| Local persistence | Dev A | AsyncStorage everywhere for V1 in this plan |
| Auth | Dev A | Likely skip or stub |
| Alarm shell → route to gate | Dev A owns router; B owns gate screens | Registry pattern (`habit_type` → component) |
| Onboarding / dashboard / product UI | Dev B | Wire to local store |
| Habit gates (motion / barcode / voice) | Dev B | **One** gate polished beats three half-done |
| Mascot assets / streak UI | Dev B | Placeholder frames until pixel art ships |

---

## 3. Developer labels

- **Dev A — Platform & local data:** Expo, notifications, AsyncStorage, alarm routing, completion writes.
- **Dev B — Product & gates:** Flows, dashboard, onboarding, habit gates, pitch-ready UI.

Swap if skills differ; **do not** swap the integration contract mid-hackathon without a 5-minute pair sync.

---

## 4. Integration contract (define in the first 30–60 minutes)

Agree in code immediately (one PR or pair commit):

1. **`Alarm` + `HabitConfig` shape** — Even if v0 is `type HabitConfig = Record<string, unknown>` + one Zod schema for the gate you’re building.
2. **`getAlarmById(id)` / list** — Or props passed from A’s router only—pick one pattern and stick to it.
3. **`recordCompletion({ alarmId, success, habitType, method })`** — Writes **local storage only**.
4. **`HabitGateScreen` entry** — Router passes `alarmId`; screen loads alarm via A’s helper **or** receives `alarm` object from route params (choose one).
5. **Gate registry** — e.g. `{ motion: MotionGate, barcode: BarcodeGate, voice: VoiceGate }` with missing types → `PlaceholderGate`.

Until stable, paste the agreed `habit_config` JSON for your **one** real gate into this doc or `apps/mobile/CONTRACT.md` (30 seconds, saves arguments later).

---

## 5. Time blocks (parallel tracks)

Adapt to your schedule; order matters more than clock time.

| Block | Dev A | Dev B |
|-------|-------|--------|
| **T0 — Kickoff (together)** | Create repo branch strategy; stub `recordCompletion` + types | Scaffold navigation + dashboard / onboarding / gate screens |
| **T1 — Vertical slice** | Alarm scheduling **or** dev “fire alarm” → navigates to gate with `alarmId` | One gate: ugly but **real** verify → calls `recordCompletion` → dismiss |
| **T2 — Demoji** | Persist alarm list; polish notification path if time | Onboarding + dashboard wired to same store; DSD colors / big tap targets |
| **T3 — WOW / backup** | Edge cases (permissions, cold start) | Second gate stub + mascot asset swap |
| **T4 — Demo freeze (together)** | Rehearse on **real device**; fix crash on cold start | Story script; turn off experimental flags |

**Rule:** T1 is not “done” until **both** have pulled the same `main` and seen the full path on one phone.

---

## 6. Git habits (hackathon)

- **Branching:** `main` + `feat/*` with **frequent merges**, or **pair on `hackathon`** if you’re colocated—pick one in T0.
- **Reviews:** Nitpick later. **Required check:** the *other* dev pulls and runs before you call a block “done.”
- **Conflict hotspots:** Root navigator, `package.json`, native folders—**one person per file per hour** or pair on those edits.

---

## 7. Sync cadence (not weekly)

| When | What |
|------|------|
| **Start of day** | 20–30m pair: contract + branch naming + demo scope |
| **Every 1–2h while building** | 2–5m: “I merged X — pull now”; surface blockers |
| **Before demo** | 15m: freeze, device pass, rehearse Narrator A / Narrator B |

No long ADRs during the event; a Slack/Discord pin or `CONTRACT.md` is enough.

---

## 8. Risk hotspots

- **OS alarm reliability** — Have **Plan B:** in-app “Trigger alarm” for judges + honest voiceover if notification timing slips.
- **ML / camera permissions** — B tests on hardware early; A keeps a permissions checklist in demo script.
- **Merge debt** — If you haven’t merged in 3h, stop features and integrate.

---

## 9. Done definition (hackathon)

**Must-have for submission:**

- [ ] Judges see: set or choose alarm → alarm experience → complete habit → alarm stops / success state.
- [ ] Works on **at least one physical device** you can hand over or screen-share.

**Nice-to-have:** second gate, mascot asset polish (replace placeholders), extra dashboard delight.

---

*Hackathon mode: optimize for demo truth; add cloud/auth later if product requires it.*
