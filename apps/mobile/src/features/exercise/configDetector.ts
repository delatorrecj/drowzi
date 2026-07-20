import {
  bestArmChain,
  bestLegChain,
  jointAngle,
  landmarksMeetConfidence,
  type BlazePoseLandmarkName,
  type PoseLandmarks33,
} from '@/src/features/exercise/landmarks';
import type { ExerciseDetector, ExerciseSpec, Validator } from '@/src/features/exercise/detectorTypes';
import { createRepMachine } from '@/src/features/exercise/repStateMachine';

const LOST_PAUSE_MS = 1500;
const TICK_MS = 100;

function passesValidators(landmarks: PoseLandmarks33, validators?: Validator[]): boolean {
  return !validators || validators.every((v) => v(landmarks));
}

/**
 * Single data-driven detector factory. Adding an exercise is now a spec in the
 * registry, not a new file. Replaces the per-exercise pushup/squat/jack/warrior
 * detectors, which were the same confidence -> chain/metric -> machine pipeline.
 */
export function createConfigDetector(
  spec: ExerciseSpec,
  target: number,
  required: BlazePoseLandmarkName[],
  confidenceMin: number,
): ExerciseDetector {
  let trackingLost = false;
  let prev: PoseLandmarks33 | null = null;

  const gate = (landmarks: PoseLandmarks33 | null): landmarks is PoseLandmarks33 => {
    if (!landmarks) return false;
    if (!landmarksMeetConfidence(landmarks, required, confidenceMin)) return false;
    return passesValidators(landmarks, spec.validators);
  };

  if (spec.kind === 'hold') {
    let heldMs = 0;
    let lastTickAt = Date.now();
    let inPose = false;
    let lostSince: number | null = null;

    return {
      feed(landmarks) {
        const now = Date.now();
        const dt = Math.min(now - lastTickAt, TICK_MS * 3);
        lastTickAt = now;

        const done = () => heldMs / 1000 >= target;
        if (!gate(landmarks) || !spec.inPose(landmarks)) {
          trackingLost = true;
          inPose = false;
          lostSince = lostSince ?? now;
          return done();
        }
        trackingLost = false;
        inPose = true;
        if (lostSince && now - lostSince <= LOST_PAUSE_MS) lostSince = null;
        if (!lostSince) heldMs += dt;
        return done();
      },
      snapshot() {
        return {
          mode: 'hold',
          heldSeconds: Math.floor(heldMs / 1000),
          targetSeconds: target,
          inPose,
        };
      },
      isTrackingLost() {
        return trackingLost;
      },
      simulateOneStep() {
        heldMs = target * 1000;
        inPose = true;
        trackingLost = false;
      },
    };
  }

  // Reps: build the phase predicates from the spec shape.
  const repSpec = spec; // narrowed to RepChainSpec | RepMetricSpec (hold returned above)
  const machine = createRepMachine(
    'chain' in repSpec
      ? {
          targetReps: target,
          isActive: (a) => a <= repSpec.activeBelowDeg,
          isRest: (a) => a >= repSpec.restAboveDeg,
          minRepIntervalMs: repSpec.minRepIntervalMs,
        }
      : {
          targetReps: target,
          isActive: (v) => v >= repSpec.activeAbove,
          isRest: (v) => v < repSpec.restBelow,
          minRepIntervalMs: repSpec.minRepIntervalMs,
        },
  );

  function metricFrom(landmarks: PoseLandmarks33): number | null {
    if ('chain' in repSpec) {
      if (repSpec.chain === 'arm') {
        const arm = bestArmChain(landmarks, confidenceMin);
        return arm ? jointAngle(arm.shoulder, arm.elbow, arm.wrist) : null;
      }
      const leg = bestLegChain(landmarks, confidenceMin);
      return leg ? jointAngle(leg.hip, leg.knee, leg.ankle) : null;
    }
    return repSpec.metric(landmarks, prev);
  }

  return {
    feed(landmarks) {
      const done = machine.snapshot().reps >= target;
      if (!gate(landmarks)) {
        trackingLost = true;
        prev = landmarks ?? null;
        return done;
      }
      const metric = metricFrom(landmarks);
      prev = landmarks;
      if (metric === null || !Number.isFinite(metric)) {
        trackingLost = true;
        return done;
      }
      trackingLost = false;
      return machine.feed(metric);
    },
    snapshot() {
      return { mode: 'reps', reps: machine.snapshot().reps, target };
    },
    isTrackingLost() {
      return trackingLost;
    },
    simulateOneStep() {
      // Complete one rep, clearing the frame debounce (2 frames per phase).
      const active = 'chain' in repSpec ? repSpec.activeBelowDeg - 10 : repSpec.activeAbove + 1;
      const rest = 'chain' in repSpec ? repSpec.restAboveDeg + 10 : repSpec.restBelow - 1;
      machine.feed(active);
      machine.feed(active);
      machine.feed(rest);
      machine.feed(rest);
    },
  };
}
