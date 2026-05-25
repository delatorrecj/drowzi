import { calculateAngle } from '@/src/features/pushup/geometry';
import type { PosePoint } from '@/src/features/pushup/poseTypes';

/** BlazePose / ML Kit / MediaPipe 33-point layout. */
export const BLAZEPOSE = {
  nose: 0,
  leftEyeInner: 1,
  leftEye: 2,
  leftEyeOuter: 3,
  rightEyeInner: 4,
  rightEye: 5,
  rightEyeOuter: 6,
  leftEar: 7,
  rightEar: 8,
  mouthLeft: 9,
  mouthRight: 10,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftPinky: 17,
  rightPinky: 18,
  leftIndex: 19,
  rightIndex: 20,
  leftThumb: 21,
  rightThumb: 22,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFootIndex: 31,
  rightFootIndex: 32,
} as const;

export type BlazePoseLandmarkName = keyof typeof BLAZEPOSE;

export type PoseLandmarks33 = PosePoint[];

export const MOTION_CONFIDENCE_MIN = 0.6;
export const HOLD_CONFIDENCE_MIN = 0.65;

export function landmarkAt(landmarks: PoseLandmarks33, name: BlazePoseLandmarkName): PosePoint | null {
  const idx = BLAZEPOSE[name];
  const pt = landmarks[idx];
  if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return null;
  return pt;
}

export function landmarkScore(pt: PosePoint | null): number {
  if (!pt) return 0;
  return pt.visibility ?? 0;
}

export function landmarksMeetConfidence(
  landmarks: PoseLandmarks33,
  names: BlazePoseLandmarkName[],
  minScore: number,
): boolean {
  return names.every((name) => landmarkScore(landmarkAt(landmarks, name)) >= minScore);
}

export function pickBestSide<T>(left: T | null, leftScore: number, right: T | null, rightScore: number): T | null {
  if (left && right) return leftScore >= rightScore ? left : right;
  return left ?? right;
}

export function armChainFromLandmarks(
  landmarks: PoseLandmarks33,
  side: 'left' | 'right',
): { shoulder: PosePoint; elbow: PosePoint; wrist: PosePoint } | null {
  const prefix = side === 'left' ? 'left' : 'right';
  const shoulder = landmarkAt(landmarks, `${prefix}Shoulder` as BlazePoseLandmarkName);
  const elbow = landmarkAt(landmarks, `${prefix}Elbow` as BlazePoseLandmarkName);
  const wrist = landmarkAt(landmarks, `${prefix}Wrist` as BlazePoseLandmarkName);
  if (!shoulder || !elbow || !wrist) return null;
  return { shoulder, elbow, wrist };
}

export function bestArmChain(
  landmarks: PoseLandmarks33,
  minScore: number,
): { shoulder: PosePoint; elbow: PosePoint; wrist: PosePoint } | null {
  const left = armChainFromLandmarks(landmarks, 'left');
  const right = armChainFromLandmarks(landmarks, 'right');
  const leftOk =
    left &&
    landmarkScore(left.shoulder) >= minScore &&
    landmarkScore(left.elbow) >= minScore &&
    landmarkScore(left.wrist) >= minScore;
  const rightOk =
    right &&
    landmarkScore(right.shoulder) >= minScore &&
    landmarkScore(right.elbow) >= minScore &&
    landmarkScore(right.wrist) >= minScore;
  if (leftOk && rightOk) {
    const leftSum =
      landmarkScore(left!.shoulder) + landmarkScore(left!.elbow) + landmarkScore(left!.wrist);
    const rightSum =
      landmarkScore(right!.shoulder) + landmarkScore(right!.elbow) + landmarkScore(right!.wrist);
    return leftSum >= rightSum ? left : right;
  }
  if (leftOk) return left;
  if (rightOk) return right;
  return null;
}

export function legChainFromLandmarks(
  landmarks: PoseLandmarks33,
  side: 'left' | 'right',
): { hip: PosePoint; knee: PosePoint; ankle: PosePoint } | null {
  const prefix = side === 'left' ? 'left' : 'right';
  const hip = landmarkAt(landmarks, `${prefix}Hip` as BlazePoseLandmarkName);
  const knee = landmarkAt(landmarks, `${prefix}Knee` as BlazePoseLandmarkName);
  const ankle = landmarkAt(landmarks, `${prefix}Ankle` as BlazePoseLandmarkName);
  if (!hip || !knee || !ankle) return null;
  return { hip, knee, ankle };
}

export function bestLegChain(
  landmarks: PoseLandmarks33,
  minScore: number,
): { hip: PosePoint; knee: PosePoint; ankle: PosePoint } | null {
  const left = legChainFromLandmarks(landmarks, 'left');
  const right = legChainFromLandmarks(landmarks, 'right');
  const leftOk =
    left &&
    landmarkScore(left.hip) >= minScore &&
    landmarkScore(left.knee) >= minScore &&
    landmarkScore(left.ankle) >= minScore;
  const rightOk =
    right &&
    landmarkScore(right.hip) >= minScore &&
    landmarkScore(right.knee) >= minScore &&
    landmarkScore(right.ankle) >= minScore;
  if (leftOk && rightOk) {
    const leftSum = landmarkScore(left!.hip) + landmarkScore(left!.knee) + landmarkScore(left!.ankle);
    const rightSum =
      landmarkScore(right!.hip) + landmarkScore(right!.knee) + landmarkScore(right!.ankle);
    return leftSum >= rightSum ? left : right;
  }
  if (leftOk) return left;
  if (rightOk) return right;
  return null;
}

export function jointAngle(a: PosePoint, b: PosePoint, c: PosePoint): number {
  return calculateAngle(a, b, c);
}

export { calculateAngle };
