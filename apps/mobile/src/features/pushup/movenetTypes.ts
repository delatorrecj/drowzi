/** MoveNet SinglePose Lightning (17 keypoints) — TensorFlow keypoint order. */
export const MOVENET_KEYPOINT = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16,
} as const;

/** y, x are normalized ~0–1 in model crop; third channel is confidence score. */
export type MovenetPt = { y: number; x: number; confidence: number };
