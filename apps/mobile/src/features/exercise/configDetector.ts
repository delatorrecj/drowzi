import {
  bestArmChain,
  bestLegChain,
  bothLegChains,
  jointAngle,
  jointAngle2D,
  landmarksMeetConfidence,
  type BlazePoseLandmarkName,
  type PoseLandmarks33,
} from '@/src/features/exercise/landmarks';
import type { PosePoint } from '@/src/features/pushup/poseTypes';
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
      debug() {
        return {
          phase: inPose ? 'in pose' : 'not in pose',
          metric: Math.floor(heldMs / 1000),
          metricLabel: 'held',
          unit: 's',
          activeRule: `hold pose for ${target}s`,
          restRule: `pauses ${LOST_PAUSE_MS}ms if pose lost`,
          chains: [],
          repProgress: Math.max(0, Math.min(1, heldMs / 1000 / target)),
        };
      },
    };
  }

  // Reps: build the phase predicates from the spec shape.
  const repSpec = spec; // narrowed to RepChainSpec | RepMetricSpec (hold returned above)
  let lastMetric: number | null = null;
  let lastChains: PosePoint[][] = [];
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
        lastChains = arm ? [[arm.shoulder, arm.elbow, arm.wrist]] : [];
        return arm ? jointAngle(arm.shoulder, arm.elbow, arm.wrist) : null;
      }
      if (repSpec.chain === 'legs') {
        const legs = bothLegChains(landmarks, confidenceMin);
        const present = [legs.left, legs.right].filter(
          (leg): leg is NonNullable<typeof leg> => leg !== null,
        );
        lastChains = present.map((leg) => [leg.hip, leg.knee, leg.ankle]);
        const angles = present
          .map((leg) => jointAngle2D(leg.hip, leg.knee, leg.ankle))
          .filter(Number.isFinite);
        return angles.length > 0
          ? angles.reduce((sum, angle) => sum + angle, 0) / angles.length
          : null;
      }
      const leg = bestLegChain(landmarks, confidenceMin);
      lastChains = leg ? [[leg.hip, leg.knee, leg.ankle]] : [];
      return leg ? jointAngle(leg.hip, leg.knee, leg.ankle) : null;
    }
    lastChains = [];
    return repSpec.metric(landmarks, prev);
  }

  const isChain = 'chain' in repSpec;

  // Map the live metric to 0..1 rep depth between the rest and active thresholds.
  // Chain angle shrinks as you go active (rest > active); metric grows (active > rest).
  function repDepth(metric: number | null): number {
    if (metric === null || !Number.isFinite(metric)) return 0;
    const [rest, active] = isChain
      ? [repSpec.restAboveDeg, repSpec.activeBelowDeg]
      : [repSpec.restBelow, repSpec.activeAbove];
    const span = active - rest;
    if (span === 0) return 0;
    const t = (metric - rest) / span;
    return Math.max(0, Math.min(1, t));
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
      lastMetric = metric;
      if (metric === null || !Number.isFinite(metric)) {
        trackingLost = true;
        return done;
      }
      prev = landmarks;
      trackingLost = false;
      return machine.feed(metric);
    },
    snapshot() {
      return { mode: 'reps', reps: machine.snapshot().reps, target };
    },
    isTrackingLost() {
      return trackingLost;
    },
    debug() {
      return {
        phase: machine.snapshot().phase,
        metric: lastMetric,
        metricLabel: isChain ? `${repSpec.chain} angle` : 'metric',
        unit: isChain ? '°' : '',
        activeRule: isChain
          ? `active < ${repSpec.activeBelowDeg}°`
          : `active ≥ ${repSpec.activeAbove}`,
        restRule: isChain
          ? `rest > ${repSpec.restAboveDeg}°`
          : `rest < ${repSpec.restBelow}`,
        chains: lastChains,
        repProgress: repDepth(lastMetric),
      };
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
