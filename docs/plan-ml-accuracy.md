# Drowzi — ML accuracy pass (squat + pose overlay + speech)

## Goals (user-chosen)
1. **Squat accurate** — count real squats reliably.
2. **Both legs green** — pose overlay highlights BOTH hip-knee-ankle chains green; rep counting uses the average of both knee angles.
3. **Speech accurate** — fuzzy, word-accurate passage matching (word-boundary + Levenshtein), kills substring false-passes and STT-error false-rejects.
4. **Upgrade pose model** — `pose_landmarker_lite` → `pose_landmarker_full` for better joints.

## Current state (verified)
- Squat: `configDetector` uses `bestLegChain` (ONE best-confidence leg) + `jointAngle` (3D, includes noisy monocular z). Spec: `activeBelowDeg:100, restAboveDeg:160, torsoVertical, minRepIntervalMs:350`, no smoothing (2-frame debounce only).
- Overlay: `ExerciseDebug.chain: PosePoint[]|null` — a single 3-point chain drawn cyan; all bones drawn white.
- Speech: `passageMatches` — substring `t.includes(w)` (so "cat" matches "category"), pass at ≥85% word overlap.
- Model: `POSE_MODEL = 'pose_landmarker_lite.task'` in `ExerciseCamera.native.tsx`; bundled at `assets/models/pose_landmarker_lite.task`; plugin `assetsPaths: ["./assets/models/"]` in `app.json`.

---

## Part A — Squat accuracy + both-leg averaging

### A1. Types (`detectorTypes.ts`)
- `RepChainSpec.chain`: add `'legs'` → `'arm' | 'leg' | 'legs'` (bilateral).
- `ExerciseDebug.chain: PosePoint[] | null` → **`chains: PosePoint[][]`** (list of chains). Single-chain exercises return `[[a,b,c]]`; squat returns `[[Lhip,Lknee,Lankle],[Rhip,Rknee,Rankle]]`; empty `[]` when untrackable.

### A2. 2D angle (`pushup/geometry.ts`)
- Add `calculateAngle2D(a,b,c)` — same as `calculateAngle` but ignores z. Monocular z is unreliable; knee angle is far more stable in 2D. Re-export via `landmarks.ts` as `jointAngle2D`.

### A3. Bilateral leg helper (`landmarks.ts`)
- Add `bothLegChains(landmarks, minScore)` → `{ left, right }` each `null` unless all 3 joints ≥ minScore (reuse existing per-side confidence logic from `bestLegChain`).

### A4. Detector (`configDetector.ts`)
- In `metricFrom`, handle `repSpec.chain === 'legs'`:
  - Get both legs via `bothLegChains`. Set `lastChains` to whichever legs are present (0, 1, or 2 chains) for the overlay.
  - Compute knee angle per present leg with `jointAngle2D`; return the **mean of valid angles**, or `null` if none.
- Replace single `lastChain: PosePoint[]|null` with `lastChains: PosePoint[][]`. Arm/leg (single) push one chain; hold/metric push `[]`.
- `debug()` returns `chains: lastChains` (rename from `chain`).

### A5. Squat spec (`exerciseRegistry.ts`)
- `chain: 'legs'`.
- Tune thresholds (calibration knobs, `ponytail:` comment): `activeBelowDeg: 100 → 110` (count real-depth squats, not only deep ATG), keep `restAboveDeg: 160`. Add `minPhaseFrames`/`smoothingAlpha` only if jitter shows in testing — leave default first.
- Description tweak: "Face the camera, full legs in frame."

*Note:* pushups stay `chain:'arm'` (unchanged), warrior/jacks/motion unchanged — only their debug producer switches `chain`→`chains` (mechanical).

---

## Part B — Both legs green (`PoseDebugOverlay.tsx`)
- Consume `debug.chains: PosePoint[][]` instead of `chain`.
- Render EVERY chain's consecutive segments green (loop chains → for each, draw seg[i,i+1]). Bones still white underneath.
- Dot highlight: a landmark is "in chain" if it appears in ANY chain (`chains.some(c => c.includes(pt))`), size 6 + green.
- Keep single-chain exercises visually identical (one green chain), squat now shows two.

---

## Part C — Speech accuracy (`voice/passageMatch.ts`)
Rewrite `passageMatches` (keep `normalizeSpeech`):
- Tokenize transcript + passage into word arrays.
- Add small `levenshtein(a,b)` helper (~12 lines, no dep).
- A passage word is matched if any transcript token is: exact equal, OR within edit distance `≤1` (words ≤4 chars) / `≤2` (longer) — tolerates STT slips/homophones without substring bleed.
- Pass when matched/total ≥ **0.85** (unchanged bar) OR full normalized substring containment (short passages).
- Result: "cat" no longer matches "category"; "recognise"/"recognize" and minor mishears still pass.

---

## Part D — Model upgrade (native, needs rebuild)
- Download `pose_landmarker_full.task` (MediaPipe) → `apps/mobile/assets/models/pose_landmarker_full.task`. **[requires network + manual download]**
- `ExerciseCamera.native.tsx`: `POSE_MODEL = 'pose_landmarker_full.task'`.
- Requires a native rebuild (dev-client / EAS) — not an OTA/JS reload. Keep GPU delegate + `fpsMode:15`; if a mid phone drops frames, fall back to `fpsMode:10` (calibration knob).
- Optional: bump `minPoseDetectionConfidence`/`minTrackingConfidence` 0.5→0.6 with the better model to cut ghost detections.

---

## Files
| File | Change |
|---|---|
| `src/features/exercise/detectorTypes.ts` | `chain:'legs'`; `ExerciseDebug.chain`→`chains: PosePoint[][]` |
| `src/features/pushup/geometry.ts` | `calculateAngle2D` |
| `src/features/exercise/landmarks.ts` | `jointAngle2D` re-export, `bothLegChains` |
| `src/features/exercise/configDetector.ts` | bilateral `'legs'` branch, `lastChains`, 2D angle, `debug.chains` |
| `src/features/exercise/exerciseRegistry.ts` | squat `chain:'legs'` + threshold tune |
| `src/features/exercise/PoseDebugOverlay.tsx` | render N green chains, multi-chain dots |
| `src/features/exercise/ExerciseCamera.native.tsx` | `POSE_MODEL` full + confidence bump |
| `assets/models/pose_landmarker_full.task` | NEW asset (download) |
| `src/features/voice/passageMatch.ts` | fuzzy Levenshtein word match |

## Tests (Jest, no new deps)
- `__tests__/configDetector.test.ts` — add: squat counts a rep when BOTH knees bend (averaged), and when only one leg is visible; `debug.chains` has 2 entries when both legs present. Update existing chain-field references.
- `__tests__/passageMatch.test.ts` — add: "cat" ✗ "category"; 1-char typo passes; homophone passes; wrong passage fails. (existing file)
- `npx tsc --noEmit` + `npm test` green.

## Verification (device)
- Rebuild dev-client (model is native). Squat facing camera: both leg lines turn green, reps count at realistic depth, no double-count.
- Voice: read passage → passes; read a different passage → fails; minor mishear still passes.

## Deliberate cuts (ponytail)
- No ML form-classifier / no per-joint form scoring — angle thresholds only. Add if users want "bad rep" feedback.
- Keep 15fps + GPU; only downgrade on measured frame drops.
- Levenshtein over full fuzzy phonetic (Soundex/Metaphone) — edit distance covers the common STT slips; add phonetic only if homophones still slip.
