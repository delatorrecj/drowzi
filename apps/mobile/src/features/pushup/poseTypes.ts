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
