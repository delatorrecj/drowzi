export type LandmarkId =
  | "leftShoulder"
  | "leftElbow"
  | "leftWrist"
  | "rightShoulder"
  | "rightElbow"
  | "rightWrist";

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

/** One leg's hip-knee-ankle chain; knee angle is measured at `knee`. */
export type LegChain = {
  hip: PosePoint;
  knee: PosePoint;
  ankle: PosePoint;
};

/** Both legs; either side is null when its joints aren't confidently tracked. */
export type LegChains = {
  left: LegChain | null;
  right: LegChain | null;
};
