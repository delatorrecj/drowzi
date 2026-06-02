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
