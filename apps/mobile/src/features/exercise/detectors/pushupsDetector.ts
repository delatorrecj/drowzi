import {
  bestArmChain,
  jointAngle,
  landmarksMeetConfidence,
  MOTION_CONFIDENCE_MIN,
  type BlazePoseLandmarkName,
  type PoseLandmarks33,
} from '@/src/features/exercise/landmarks';
import type { ExerciseDetector, RepDetectorConfig } from '@/src/features/exercise/detectorTypes';
import { createPushUpRepMachine } from '@/src/features/pushup/pushUpRepStateMachine';

const EXTENDED_MIN = 160;
const BENT_MAX = 90;

const REQUIRED: BlazePoseLandmarkName[] = [
  'leftShoulder',
  'leftElbow',
  'leftWrist',
  'rightShoulder',
  'rightElbow',
  'rightWrist',
];

export function createPushupsDetector(config: RepDetectorConfig): ExerciseDetector {
  const machine = createPushUpRepMachine({
    targetReps: config.targetReps,
    extendedMinDeg: EXTENDED_MIN,
    bentMaxDeg: BENT_MAX,
  });
  let trackingLost = false;

  return {
    feed(landmarks) {
      if (!landmarks) {
        trackingLost = true;
        return machine.snapshot().reps >= config.targetReps;
      }
      if (!landmarksMeetConfidence(landmarks, REQUIRED, MOTION_CONFIDENCE_MIN)) {
        trackingLost = true;
        return machine.snapshot().reps >= config.targetReps;
      }
      const arm = bestArmChain(landmarks, MOTION_CONFIDENCE_MIN);
      if (!arm) {
        trackingLost = true;
        return machine.snapshot().reps >= config.targetReps;
      }
      trackingLost = false;
      return machine.feedLandmarks({
        leftShoulder: arm.shoulder,
        leftElbow: arm.elbow,
        leftWrist: arm.wrist,
      });
    },
    snapshot() {
      return { mode: 'reps', reps: machine.snapshot().reps, target: config.targetReps };
    },
    isTrackingLost() {
      return trackingLost;
    },
    simulateOneStep() {
      machine.feedElbowAngleDeg(170);
      machine.feedElbowAngleDeg(75);
      machine.feedElbowAngleDeg(165);
    },
  };
}

export function elbowAngleFromLandmarks(landmarks: PoseLandmarks33): number | null {
  const arm = bestArmChain(landmarks, MOTION_CONFIDENCE_MIN);
  if (!arm) return null;
  return jointAngle(arm.shoulder, arm.elbow, arm.wrist);
}
