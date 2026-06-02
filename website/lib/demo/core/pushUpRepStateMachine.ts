import type { LeftArmChain } from "@/lib/demo/core/poseTypes";
import { calculateAngle } from "@/lib/demo/core/geometry";

export type PushUpPhase = "top" | "bottom";

export type PushUpMachineConfig = {
  extendedMinDeg: number;
  bentMaxDeg: number;
  targetReps: number;
};

export type PushUpMachineState = {
  phase: PushUpPhase;
  reps: number;
};

export function createPushUpRepMachine(config: PushUpMachineConfig) {
  const { extendedMinDeg, bentMaxDeg, targetReps } = config;

  let phase: PushUpPhase = "top";
  let reps = 0;

  function elbowAngleDeg(frame: LeftArmChain): number {
    return calculateAngle(frame.leftShoulder, frame.leftElbow, frame.leftWrist);
  }

  function feedLandmarks(frame: LeftArmChain): boolean {
    const angle = elbowAngleDeg(frame);
    if (!Number.isFinite(angle)) return reps >= targetReps;

    if (phase === "top") {
      if (angle <= bentMaxDeg) phase = "bottom";
    } else {
      if (angle >= extendedMinDeg) {
        phase = "top";
        reps += 1;
      }
    }
    return reps >= targetReps;
  }

  function feedElbowAngleDeg(angle: number): boolean {
    if (!Number.isFinite(angle)) return reps >= targetReps;
    if (phase === "top") {
      if (angle <= bentMaxDeg) phase = "bottom";
    } else {
      if (angle >= extendedMinDeg) {
        phase = "top";
        reps += 1;
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
