import {
  landmarkAt,
  landmarkScore,
  landmarksMeetConfidence,
  MOTION_CONFIDENCE_MIN,
  type BlazePoseLandmarkName,
} from '@/src/features/exercise/landmarks';
import type { ExerciseDetector, RepDetectorConfig } from '@/src/features/exercise/detectorTypes';
import { createJumpingJackRepMachine } from '@/src/features/exercise/detectors/jumpingJackRepStateMachine';

const REQUIRED: BlazePoseLandmarkName[] = [
  'leftShoulder',
  'rightShoulder',
  'leftWrist',
  'rightWrist',
  'leftHip',
  'rightHip',
  'leftAnkle',
  'rightAnkle',
];

function isJumpingJackOpen(landmarks: import('@/src/features/exercise/landmarks').PoseLandmarks33): boolean {
  const ls = landmarkAt(landmarks, 'leftShoulder');
  const rs = landmarkAt(landmarks, 'rightShoulder');
  const lw = landmarkAt(landmarks, 'leftWrist');
  const rw = landmarkAt(landmarks, 'rightWrist');
  const lh = landmarkAt(landmarks, 'leftHip');
  const rh = landmarkAt(landmarks, 'rightHip');
  const la = landmarkAt(landmarks, 'leftAnkle');
  const ra = landmarkAt(landmarks, 'rightAnkle');
  if (!ls || !rs || !lw || !rw || !lh || !rh || !la || !ra) return false;

  const shoulderY = (ls.y + rs.y) / 2;
  const wristsAbove = lw.y < shoulderY && rw.y < shoulderY;
  const hipWidth = Math.abs(lh.x - rh.x);
  const ankleWidth = Math.abs(la.x - ra.x);
  const legsSpread = ankleWidth > hipWidth * 1.25;
  return wristsAbove && legsSpread;
}

export function createJumpingJacksDetector(config: RepDetectorConfig): ExerciseDetector {
  const machine = createJumpingJackRepMachine({ targetReps: config.targetReps });
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
      const minWrist = Math.min(
        landmarkScore(landmarkAt(landmarks, 'leftWrist')),
        landmarkScore(landmarkAt(landmarks, 'rightWrist')),
      );
      if (minWrist < MOTION_CONFIDENCE_MIN) {
        trackingLost = true;
        return machine.snapshot().reps >= config.targetReps;
      }
      trackingLost = false;
      return machine.feedOpenSignal(isJumpingJackOpen(landmarks));
    },
    snapshot() {
      return { mode: 'reps', reps: machine.snapshot().reps, target: config.targetReps };
    },
    isTrackingLost() {
      return trackingLost;
    },
    simulateOneStep() {
      machine.feedOpenSignal(false);
      machine.feedOpenSignal(true);
      machine.feedOpenSignal(false);
    },
  };
}
