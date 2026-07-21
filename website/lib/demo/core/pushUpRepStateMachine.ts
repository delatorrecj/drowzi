import type { LeftArmChain } from "@/lib/demo/core/poseTypes";
import { calculateAngle } from "@/lib/demo/core/geometry";

export type PushUpPhase = "top" | "bottom";

export type PushUpMachineConfig = {
  extendedMinDeg: number;
  bentMaxDeg: number;
  targetReps: number;
  /** Ignore reps closer than this apart — kills double-counts from jitter. */
  minRepIntervalMs?: number; // default 400
  /** EMA factor for angle smoothing, 0..1 (higher = snappier). */
  smoothingAlpha?: number; // default 0.5
};

export type PushUpMachineState = {
  phase: PushUpPhase;
  reps: number;
};

/**
 * Counts push-ups from the left elbow angle. Top→bottom→top completes one rep.
 * Uses hysteresis (two thresholds), an EMA to smooth webcam jitter, and a
 * min-interval debounce so a single noisy frame can't count a rep. `nowMs` is
 * optional; when omitted the debounce is skipped (for sims/tests).
 */
export function createPushUpRepMachine(config: PushUpMachineConfig) {
  const {
    extendedMinDeg,
    bentMaxDeg,
    targetReps,
    minRepIntervalMs = 400,
    smoothingAlpha = 0.5,
  } = config;

  let phase: PushUpPhase = "top";
  let reps = 0;
  let smoothed = Number.NaN;
  let lastRepAt = -Infinity;

  function elbowAngleDeg(frame: LeftArmChain): number {
    return calculateAngle(frame.leftShoulder, frame.leftElbow, frame.leftWrist);
  }

  function feedLandmarks(frame: LeftArmChain, nowMs?: number): boolean {
    return feedElbowAngleDeg(elbowAngleDeg(frame), nowMs);
  }

  function feedElbowAngleDeg(angle: number, nowMs?: number): boolean {
    if (!Number.isFinite(angle)) return reps >= targetReps;
    smoothed = Number.isNaN(smoothed) ? angle : smoothed + smoothingAlpha * (angle - smoothed);

    if (phase === "top") {
      if (smoothed <= bentMaxDeg) phase = "bottom";
    } else {
      if (smoothed >= extendedMinDeg) {
        phase = "top";
        // Debounce only when a timestamp is supplied.
        if (nowMs === undefined || nowMs - lastRepAt >= minRepIntervalMs) {
          reps += 1;
          if (nowMs !== undefined) lastRepAt = nowMs;
        }
      }
    }
    return reps >= targetReps;
  }

  function snapshot(): PushUpMachineState {
    return { phase, reps };
  }

  return { feedLandmarks, feedElbowAngleDeg, snapshot, elbowAngleDeg };
}

export type PushUpRepMachine = ReturnType<typeof createPushUpRepMachine>;
