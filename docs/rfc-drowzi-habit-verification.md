# Request for Comments (RFC) / Tech Spec

**Title:** Habit Verification Engine — Multi-Modal Alarm Gate System
**Date:** 2026-05-15
**Author:** delatorrecj
**Status:** `Draft`
**PRD Reference:** [prd-drowzi.md §3 — Core Features, §4 US-01 through US-03](prd-drowzi.md)
**SDD Reference:** [sdd-drowzi.md §8 — AI / Agent Architecture](sdd-drowzi.md)
**RFC ID:** `drowzi-rfc-001`

---

## 1. Context & Objective

**The problem this solves:**
The core value of Drowzi is that the alarm cannot be dismissed until a real habit is verified. This requires a reliable, low-latency, offline-capable engine that orchestrates three distinct sensor modalities (motion/camera, barcode, voice) through a single unified gate lifecycle. The verification logic must be: tamper-resistant (can't be bypassed by a groggy tap), fast enough to not frustrate a user who is actively doing the habit, and gracefully degradable when sensors fail.

**Reference in PRD/SDD:**
This RFC implements PRD §3 Must-Have features (Habit Gate Engine, Motion Gate, Barcode Gate, Voice Gate) and the on-device ML architecture from SDD §8.

**Success criteria:**
- Habit gate accurately credits a completed rep/scan/speech event within 200ms of the qualifying action
- False positive rate for motion gate <2% (alarm doesn't dismiss on random phone movement)
- False negative rate for motion gate <5% (10 clean push-ups always count)
- Voice gate accepts correct passage read with ≥80% word accuracy within 5 seconds of speech end
- Barcode gate correctly rejects non-registered barcodes 100% of the time
- All gates function fully offline (no network required)

---

## 2. Proposed Solution

**Approach:**
A `HabitGateEngine` class manages the entire lifecycle of an active alarm verification session. It is instantiated when an alarm fires and the user enters the habit gate screen. The engine accepts a `HabitConfig` object (from the alarm record), selects the appropriate sensor module, starts acquisition, and emits state events to the React UI layer via a `useHabitGate` hook.

The engine is deliberately separated from the UI — the React component only displays state; it never contains sensor logic. This allows the engine to be unit-tested without a device.

**Architecture changes:**
- Add `HabitGateEngine` class (`src/engine/HabitGateEngine.ts`)
- Add sensor modules: `MotionSensorModule`, `BarcodeScanModule`, `VoiceRecognitionModule`, `PoseSensorModule` (each in `src/engine/sensors/`)
- Add `useHabitGate` React hook consuming the engine's event emitter (`src/hooks/useHabitGate.ts`)
- Add `AlarmGateScreen` component that renders exclusively from `useHabitGate` state (`src/screens/AlarmGateScreen.tsx`)
- Add local `HabitLog` write via Expo SQLite immediately on gate success; queue Supabase sync

---

## 3. Technical Details & Contracts

### Data Model Changes

```sql
-- No new tables required. habit_logs table is defined in SDD.
-- Engine writes to local SQLite habit_logs on completion, then syncs to Supabase.

-- habit_logs (local SQLite mirror):
CREATE TABLE IF NOT EXISTS habit_logs (
  id              TEXT PRIMARY KEY,           -- UUID generated client-side
  user_id         TEXT NOT NULL,
  alarm_id        TEXT NOT NULL,
  completed_at    TEXT NOT NULL,              -- ISO8601 timestamp
  habit_type      TEXT NOT NULL,
  success         INTEGER NOT NULL DEFAULT 1, -- 1 = true, 0 = false
  method          TEXT NOT NULL,              -- 'verified' | 'fallback_timer' | 'force_closed'
  local_date      TEXT NOT NULL,              -- YYYY-MM-DD in user's local timezone
  synced          INTEGER NOT NULL DEFAULT 0  -- 0 = pending sync, 1 = synced to Supabase
);
```

### API Changes

The engine is entirely client-side. No new HTTP endpoints. The only external write is the existing Supabase `habit_logs` upsert via `@supabase/supabase-js` after local SQLite write.

```typescript
// HabitGateEngine public interface
interface HabitGateEngine {
  // Start the sensor for the given alarm's habit config
  start(alarmId: string, config: HabitConfig): void;

  // Stop all sensor acquisition (call on screen unmount or alarm dismiss)
  stop(): void;

  // Event emitter interface consumed by useHabitGate hook
  on(event: 'progress', handler: (state: GateProgressState) => void): void;
  on(event: 'complete', handler: (result: GateResult) => void): void;
  on(event: 'error', handler: (error: GateError) => void): void;
}

interface HabitConfig {
  type: 'motion' | 'barcode' | 'voice' | 'pose' | 'meditation';
  motionConfig?: { exercise: 'pushups' | 'squats' | 'jumping_jacks'; repTarget: number };
  barcodeConfig?: { registeredBarcode: string };
  voiceConfig?: { passage: string; matchThreshold: number }; // matchThreshold default: 0.80
  poseConfig?: { poseName: string; holdDurationSeconds: number };
}

interface GateProgressState {
  type: HabitConfig['type'];
  progress: number;  // 0.0–1.0 (0% to 100% complete)
  currentCount?: number;  // for motion: current rep count
  heldSeconds?: number;   // for pose/meditation: seconds held
  listeningActive?: boolean; // for voice: is mic open
}

interface GateResult {
  success: boolean;
  method: 'verified' | 'fallback_timer';
  completedAt: string; // ISO8601
}
```

### State Management

The `HabitGateEngine` maintains an internal state machine with these phases:

```
IDLE → INITIALIZING → ACQUIRING → VERIFYING → COMPLETE | FAILED
         ↓ (sensor init fail)
       FALLBACK_MODE → ACQUIRING (timer-based)
```

- `IDLE`: Engine instantiated, not started
- `INITIALIZING`: Requesting camera/mic permission, loading ML model
- `ACQUIRING`: Sensor is active; data streaming in; progress events emitting
- `VERIFYING`: Sufficient data collected; running final classification (e.g., voice word match score)
- `COMPLETE`: Gate passed; `complete` event emitted; engine stops itself
- `FAILED`: Unrecoverable error; `error` event emitted; fallback triggered
- `FALLBACK_MODE`: ML model unavailable; engine switches to gyroscope shaking or countdown timer

The `useHabitGate` React hook subscribes to the engine and exposes `{ phase, progress, currentCount, heldSeconds }` — UI renders exclusively from this.

---

## 4. Alternatives Considered

| Option | Why Rejected |
|--------|-------------|
| **Server-side verification (stream frames to backend)** | Network latency makes this unusable at alarm time (groggy user, potentially on poor connection). Privacy concern: raw camera frames leaving device. Ongoing API cost per alarm. All rejected for V1. |
| **Single-class mega-component with sensor logic in JSX** | Untestable without device. Mixes sensor orchestration with rendering concerns. Ruled out for maintainability. |
| **Expo Camera + custom CV (no ML Kit)** | ML Kit provides production-quality pose detection trained on millions of samples. Writing custom computer vision from raw frames would require significant expertise and testing. Not feasible for solo V1 build. |
| **Cloud speech-to-text (Whisper API / Google Cloud STT)** | Requires network. Adds latency (~1–3s round trip). Adds cost per alarm dismissal. Platform ASR is offline-capable and sufficient for reading a known passage. |

---

## 5. AI / Agent Implementation Notes

**Model used:** Google ML Kit Pose Detection (BlazePose backbone)
**Prompt strategy:** N/A — this is CV/ML inference, not LLM. No prompt engineering required.
**Tool calls in this feature:** None — all inference is local SDK calls.

**Edge cases specific to ML behavior:**
- Push-up rep counter: use a down-up cycle detector on the nose Y-coordinate landmark. Require landmark confidence >0.6 on shoulders, elbows, and nose. If confidence drops (dark room, user out of frame), pause counting and show "Reposition" prompt — do not increment rep count.
- Barcode gate: if multiple barcodes are in frame simultaneously, use the highest-confidence detection. If the highest-confidence match ≠ registered barcode, show "Wrong item" feedback immediately.
- Voice gate: use Jaro-Winkler similarity (not exact match) to compute word match score; threshold at 0.80. If user reads extra words or minor mispronunciation, still pass. If score <0.80 after 3 attempts, offer the fallback timer gate.
- Pose hold gate: require continuous confidence >0.65 for the entire hold duration. If confidence drops below threshold for >1.5 seconds, pause the hold timer and show "Hold still" — resume when confidence recovers.

**Token budget for this feature:** $0 — on-device ML, no tokens consumed.

---

## 6. Security, Privacy & Performance

**Security surface:**
- Camera and microphone activated only within the explicit alarm gate screen; React Navigation prevents accidental navigation into the screen
- No camera frames or audio leave the device under any circumstances
- `HabitConfig.barcodeConfig.registeredBarcode` is stored in local SQLite and Supabase with RLS; never exposed in logs
- Force-close bypass (user kills the app during active alarm): OS-level Expo Notification alarm continues ringing until explicitly dismissed via the app's notification action — this surfaces the habit gate screen again

**Performance:**
- ML Kit Pose Detection target: <100ms inference per frame at 15fps on Snapdragon 720G / A15 Bionic
- Camera preview frames: downscaled to 480×640 before ML inference to reduce memory pressure
- Voice recognition: platform ASR streams incrementally; UI shows live transcript so user sees progress
- Barcode scan: single-frame detection; no streaming required; camera closes immediately on successful scan

**Privacy:**
- Camera and mic data: processed in RAM; never written to disk, never transmitted
- User-registered barcodes: stored locally + in Supabase user row (encrypted at rest); no third-party sharing
- Habit completion logs: stored in Supabase under RLS; user can delete via Settings > Data in V2

---

## 7. Execution Plan

**Can this ship behind a feature flag?** Yes — `ENABLE_HABIT_GATE=true` environment variable. Until flag is enabled, alarm uses a simple snooze-less countdown timer dismiss (for internal testing).

**Ticket breakdown:**

| Ticket | Description | Size |
|--------|-------------|------|
| `DRW-01` | Scaffold `HabitGateEngine` class + state machine (no sensors, just lifecycle) | S |
| `DRW-02` | Implement `MotionSensorModule` (ML Kit Pose → push-up rep counter) | M |
| `DRW-03` | Implement `BarcodeScanModule` (ML Kit Barcode → registered barcode match) | S |
| `DRW-04` | Implement `VoiceRecognitionModule` (platform ASR → Jaro-Winkler passage match) | M |
| `DRW-05` | Implement `PoseSensorModule` (ML Kit Pose → hold timer with confidence gate) | M |
| `DRW-06` | Implement fallback mode (gyroscope shaking counter + countdown timer) | S |
| `DRW-07` | Build `useHabitGate` hook + `AlarmGateScreen` UI | M |
| `DRW-08` | Local SQLite habit_log write + Supabase sync queue on gate complete | S |
| `DRW-09` | Unit tests for engine state machine and sensor modules (mocked sensors) | M |
| `DRW-10` | Device integration test: all 4 gates end-to-end on iOS + Android | L |

**Rollout order:** DRW-01 → DRW-02 + DRW-03 + DRW-04 (parallel) → DRW-05 → DRW-06 → DRW-07 → DRW-08 → DRW-09 → DRW-10 → enable feature flag in staging → QA → prod

---

## Self-Check

- [x] Section 3 has exact TypeScript interface contracts — not vague descriptions
- [x] Section 3 local SQLite schema is exact DDL
- [x] Section 4 has real rejected alternatives with genuine reasoning
- [x] Section 5 is filled (on-device ML behavior and edge cases documented)
- [x] Section 7 ticket list is specific enough to act on immediately after approval
- [x] Nothing in this RFC duplicates PRD (features) or SDD (global architecture)

---

*Next document: [QAD](qad-drowzi.md)*
