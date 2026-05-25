import {
  jointAngle,
  landmarkAt,
  landmarkScore,
  landmarksMeetConfidence,
  HOLD_CONFIDENCE_MIN,
  type BlazePoseLandmarkName,
  type PoseLandmarks33,
} from '@/src/features/exercise/landmarks';
import type { ExerciseDetector, HoldDetectorConfig } from '@/src/features/exercise/detectorTypes';

const LOST_PAUSE_MS = 1500;
const TICK_MS = 100;

const WARRIOR_REQUIRED: BlazePoseLandmarkName[] = [
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftWrist',
  'rightWrist',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
];

function isWarriorIPose(landmarks: PoseLandmarks33): boolean {
  const ls = landmarkAt(landmarks, 'leftShoulder');
  const rs = landmarkAt(landmarks, 'rightShoulder');
  const lw = landmarkAt(landmarks, 'leftWrist');
  const rw = landmarkAt(landmarks, 'rightWrist');
  const lh = landmarkAt(landmarks, 'leftHip');
  const rh = landmarkAt(landmarks, 'rightHip');
  const lk = landmarkAt(landmarks, 'leftKnee');
  const rk = landmarkAt(landmarks, 'rightKnee');
  const la = landmarkAt(landmarks, 'leftAnkle');
  const ra = landmarkAt(landmarks, 'rightAnkle');
  if (!ls || !rs || !lw || !rw || !lh || !rh || !lk || !rk || !la || !ra) return false;

  const armsRaised = lw.y < ls.y && rw.y < rs.y;
  const leftKneeAngle = jointAngle(lh, lk, la);
  const rightKneeAngle = jointAngle(rh, rk, ra);
  const frontKneeBent = leftKneeAngle <= 110 || rightKneeAngle <= 110;
  const hipsLevel = Math.abs(lh.y - rh.y) < 0.12;
  return armsRaised && frontKneeBent && hipsLevel;
}

export function createWarriorIDetector(config: HoldDetectorConfig): ExerciseDetector {
  let heldMs = 0;
  let lastTickAt = Date.now();
  let trackingLost = false;
  let inPose = false;
  let lostSince: number | null = null;

  return {
    feed(landmarks) {
      const now = Date.now();
      const dt = Math.min(now - lastTickAt, TICK_MS * 3);
      lastTickAt = now;

      if (!landmarks || !landmarksMeetConfidence(landmarks, WARRIOR_REQUIRED, HOLD_CONFIDENCE_MIN)) {
        trackingLost = true;
        inPose = false;
        lostSince = lostSince ?? now;
        if (lostSince && now - lostSince > LOST_PAUSE_MS) {
          /* timer paused while lost */
        }
        return heldMs / 1000 >= config.holdDurationSeconds;
      }

      const poseOk = isWarriorIPose(landmarks);
      if (!poseOk) {
        trackingLost = true;
        inPose = false;
        lostSince = lostSince ?? now;
        return heldMs / 1000 >= config.holdDurationSeconds;
      }

      trackingLost = false;
      inPose = true;
      if (lostSince && now - lostSince <= LOST_PAUSE_MS) {
        lostSince = null;
      }
      if (!lostSince) {
        heldMs += dt;
      }
      return heldMs / 1000 >= config.holdDurationSeconds;
    },
    snapshot() {
      return {
        mode: 'hold',
        heldSeconds: Math.floor(heldMs / 1000),
        targetSeconds: config.holdDurationSeconds,
        inPose,
      };
    },
    isTrackingLost() {
      return trackingLost;
    },
    simulateOneStep() {
      heldMs = config.holdDurationSeconds * 1000;
      inPose = true;
      trackingLost = false;
    },
  };
}

export { isWarriorIPose };
