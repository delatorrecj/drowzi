import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import type { PosePoint } from '@/src/features/pushup/poseTypes';

/** What the detector is measuring this frame — for the on-screen debug overlay. */
export type ExerciseDebug = {
  /** 'rest' | 'active' for reps, 'hold' for timed poses. */
  phase: string;
  /** Measured scalar this frame (joint angle in deg, openness, energy). null = untrackable. */
  metric: number | null;
  /** Human label for the metric, e.g. "arm angle". */
  metricLabel: string;
  /** Unit suffix appended to metric, e.g. "°" or "". */
  unit: string;
  /** Rule that flips into the active half of a rep, e.g. "active < 90°". */
  activeRule: string;
  /** Rule that flips back to rest and counts, e.g. "rest > 150°". */
  restRule: string;
  /** Joint chains being measured this frame (highlighted in the overlay). */
  chains: PosePoint[][];
  /** 0..1 depth of the current rep: 0 = fully at rest, 1 = full active/bottom. */
  repProgress: number;
};

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
  /** Optional: last measured metric + thresholds for the debug overlay. */
  debug?(): ExerciseDebug;
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

/** Rep counting off a joint angle in the best-visible arm/leg chain(s). */
export type RepChainSpec = {
  kind: 'reps';
  chain: 'arm' | 'leg' | 'legs';
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
