import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';

export type RepProgress = {
  mode: 'reps';
  reps: number;
  target: number;
};

export type HoldProgress = {
  mode: 'hold';
  heldSeconds: number;
  targetSeconds: number;
  inPose: boolean;
};

export type ExerciseProgress = RepProgress | HoldProgress;

export type ExerciseDetector = {
  feed(landmarks: PoseLandmarks33 | null): boolean;
  snapshot(): ExerciseProgress;
  isTrackingLost(): boolean;
  simulateOneStep(): void;
};

export type RepDetectorConfig = {
  targetReps: number;
};

export type HoldDetectorConfig = {
  holdDurationSeconds: number;
};

/** Frame gate — returns false to reject a frame (anti-cheat / orientation). */
export type Validator = (landmarks: PoseLandmarks33) => boolean;

/** Arbitrary scalar from a frame (openness, movement energy). null = untrackable. */
export type MetricFn = (
  landmarks: PoseLandmarks33,
  prev: PoseLandmarks33 | null,
) => number | null;

/** Rep counting off a joint angle in the best-visible arm/leg chain. */
export type RepChainSpec = {
  kind: 'reps';
  chain: 'arm' | 'leg';
  activeBelowDeg: number;
  restAboveDeg: number;
  validators?: Validator[];
  /** Anti-cheat: minimum ms between counted reps. */
  minRepIntervalMs?: number;
};

/** Rep counting off a custom scalar metric (jumping jacks openness, motion energy). */
export type RepMetricSpec = {
  kind: 'reps';
  metric: MetricFn;
  activeAbove: number;
  restBelow: number;
  validators?: Validator[];
  /** Anti-cheat: minimum ms between counted reps. */
  minRepIntervalMs?: number;
};

/** Timed hold of a static pose. */
export type HoldSpec = {
  kind: 'hold';
  inPose: (landmarks: PoseLandmarks33) => boolean;
  validators?: Validator[];
};

export type ExerciseSpec = RepChainSpec | RepMetricSpec | HoldSpec;
