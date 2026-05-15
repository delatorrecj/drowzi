/**
 * Pose landmarks subset (MediaPipe-style 33-point layout).
 */
export type LandmarkId =
  | 'leftShoulder'
  | 'leftElbow'
  | 'leftWrist'
  | 'rightShoulder'
  | 'rightElbow'
  | 'rightWrist';

export type PosePoint = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type LeftArmChain = {
  leftShoulder: PosePoint;
  leftElbow: PosePoint;
  leftWrist: PosePoint;
};

export type PoseLandmarks33 = Partial<Record<LandmarkId, PosePoint>> &
  Pick<LeftArmChain, 'leftShoulder' | 'leftElbow' | 'leftWrist'>;
