import {
  bestLegChain,
  jointAngle,
  landmarksMeetConfidence,
  MOTION_CONFIDENCE_MIN,
  type BlazePoseLandmarkName,
} from '@/src/features/exercise/landmarks';
import type { ExerciseDetector, RepDetectorConfig } from '@/src/features/exercise/detectorTypes';
import { createSquatRepMachine } from '@/src/features/exercise/detectors/squatRepStateMachine';

const EXTENDED_MIN = 160;
const BENT_MAX = 100;

const REQUIRED: BlazePoseLandmarkName[] = [
  'leftHip',
  'leftKnee',
  'leftAnkle',
  'rightHip',
  'rightKnee',
  'rightAnkle',
];

export function createSquatsDetector(config: RepDetectorConfig): ExerciseDetector {
  const machine = createSquatRepMachine({
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
      const leg = bestLegChain(landmarks, MOTION_CONFIDENCE_MIN);
      if (!leg) {
        trackingLost = true;
        return machine.snapshot().reps >= config.targetReps;
      }
      trackingLost = false;
      const angle = jointAngle(leg.hip, leg.knee, leg.ankle);
      return machine.feedKneeAngleDeg(angle);
    },
    snapshot() {
      return { mode: 'reps', reps: machine.snapshot().reps, target: config.targetReps };
    },
    isTrackingLost() {
      return trackingLost;
    },
    simulateOneStep() {
      machine.feedKneeAngleDeg(170);
      machine.feedKneeAngleDeg(90);
      machine.feedKneeAngleDeg(165);
    },
  };
}
