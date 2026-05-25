import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import type { PosePoint } from '@/src/features/pushup/poseTypes';

/** Normalized landmark from MediaPipe / ML Kit BlazePose (33 points). */
export type RawLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
};

function toPosePoint(lm: RawLandmark): PosePoint {
  return {
    x: lm.x,
    y: lm.y,
    z: lm.z ?? 0,
    visibility: lm.visibility ?? lm.presence ?? 0,
  };
}

/** MediaPipe Pose Landmarker output (web + native). */
export function normalizeMediaPipePose(landmarks: RawLandmark[] | null | undefined): PoseLandmarks33 | null {
  if (!landmarks || landmarks.length < 33) return null;
  const out: PosePoint[] = [];
  for (let i = 0; i < 33; i++) {
    out.push(toPosePoint(landmarks[i] ?? { x: 0, y: 0, visibility: 0 }));
  }
  return out;
}

/** ML Kit Pose Detection landmark map keyed by type name. */
const MLKIT_TYPE_TO_INDEX: Record<string, number> = {
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
};

export type MlKitLandmark = {
  type: string;
  x: number;
  y: number;
  z?: number;
  likelihood?: number;
};

export function normalizeMlKitPose(landmarks: MlKitLandmark[] | null | undefined): PoseLandmarks33 | null {
  if (!landmarks?.length) return null;
  const out: PosePoint[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 0 }));
  for (const lm of landmarks) {
    const idx = MLKIT_TYPE_TO_INDEX[lm.type];
    if (idx === undefined) continue;
    out[idx] = {
      x: lm.x,
      y: lm.y,
      z: lm.z ?? 0,
      visibility: lm.likelihood ?? 0,
    };
  }
  const hasBody = out[11]?.visibility && out[11].visibility > 0;
  return hasBody ? out : null;
}

export type PoseFrameCallback = (
  landmarks: PoseLandmarks33 | null,
  trackingLost: boolean,
) => void;
