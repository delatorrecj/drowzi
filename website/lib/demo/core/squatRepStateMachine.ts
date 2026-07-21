import type { LegChains } from "@/lib/demo/core/poseTypes";
import { calculateAngle2D } from "@/lib/demo/core/geometry";

export type SquatPhase = "stand" | "squat";

export type SquatMachineConfig = {
  /** Knee angle at/above which the user is standing (rep completes here). */
  standMinDeg: number; // e.g. 160
  /** Knee angle at/below which the user is in the squat bottom. */
  squatMaxDeg: number; // e.g. 110
  targetReps: number;
  /** Ignore reps closer than this apart — kills double-counts from jitter. */
  minRepIntervalMs?: number; // default 400
  /** EMA factor for angle smoothing, 0..1 (higher = snappier). */
  smoothingAlpha?: number; // default 0.5
};

export type SquatMachineState = {
  phase: SquatPhase;
  reps: number;
  /** Deepest (smallest) smoothed knee angle reached in the current rep. */
  minAngleThisRep: number;
};

/**
 * Counts squats from the average of both knee angles (2D). Standing→squat→stand
 * completes one rep. Uses hysteresis (two thresholds), an EMA to smooth webcam
 * jitter, and a min-interval debounce.
 * ponytail: single-user, single-pose; no per-leg symmetry scoring — averaged
 * angle is enough. Add symmetry check if users want "uneven" feedback.
 */
export function createSquatRepMachine(config: SquatMachineConfig) {
  const {
    standMinDeg,
    squatMaxDeg,
    targetReps,
    minRepIntervalMs = 400,
    smoothingAlpha = 0.5,
  } = config;

  let phase: SquatPhase = "stand";
  let reps = 0;
  let smoothed = Number.NaN;
  let lastRepAt = -Infinity;
  let minAngleThisRep = 180;

  /** Mean of the valid (finite) knee angles across both legs, or null. */
  function kneeAngleFromLegs(legs: LegChains): number | null {
    const angles: number[] = [];
    if (legs.left) {
      const a = calculateAngle2D(legs.left.hip, legs.left.knee, legs.left.ankle);
      if (Number.isFinite(a)) angles.push(a);
    }
    if (legs.right) {
      const a = calculateAngle2D(legs.right.hip, legs.right.knee, legs.right.ankle);
      if (Number.isFinite(a)) angles.push(a);
    }
    if (!angles.length) return null;
    return angles.reduce((s, a) => s + a, 0) / angles.length;
  }

  function feedKneeAngleDeg(angle: number, nowMs: number): boolean {
    if (!Number.isFinite(angle)) return reps >= targetReps;
    smoothed = Number.isNaN(smoothed) ? angle : smoothed + smoothingAlpha * (angle - smoothed);

    if (phase === "stand") {
      if (smoothed <= squatMaxDeg) {
        phase = "squat";
        minAngleThisRep = smoothed;
      }
    } else {
      if (smoothed < minAngleThisRep) minAngleThisRep = smoothed;
      if (smoothed >= standMinDeg) {
        phase = "stand";
        if (nowMs - lastRepAt >= minRepIntervalMs) {
          reps += 1;
          lastRepAt = nowMs;
        }
      }
    }
    return reps >= targetReps;
  }

  function feedLegs(legs: LegChains, nowMs: number): boolean {
    const angle = kneeAngleFromLegs(legs);
    if (angle === null) return reps >= targetReps;
    return feedKneeAngleDeg(angle, nowMs);
  }

  function snapshot(): SquatMachineState {
    return { phase, reps, minAngleThisRep };
  }

  return { feedLegs, feedKneeAngleDeg, kneeAngleFromLegs, snapshot };
}

export type SquatRepMachine = ReturnType<typeof createSquatRepMachine>;
