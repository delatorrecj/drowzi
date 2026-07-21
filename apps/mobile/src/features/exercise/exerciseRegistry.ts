import { createConfigDetector } from '@/src/features/exercise/configDetector';
import type { ExerciseDetector, ExerciseSpec } from '@/src/features/exercise/detectorTypes';
import {
  jointAngle,
  landmarkAt,
  movementEnergy,
  type BlazePoseLandmarkName,
  type PoseLandmarks33,
} from '@/src/features/exercise/landmarks';
import { MOTION_CONFIDENCE_MIN, HOLD_CONFIDENCE_MIN } from '@/src/features/exercise/landmarks';
import { torsoHorizontal, torsoVertical } from '@/src/features/exercise/validators';
import type {
  Alarm,
  ExerciseId,
  HabitConfig,
  HabitType,
  MotionExerciseId,
  PoseExerciseId,
} from '@/src/shared/types';

export type VerificationMode = 'reps' | 'hold';

export type ExerciseDefinition = {
  id: ExerciseId;
  label: string;
  description: string;
  verificationMode: VerificationMode;
  defaultTarget: number;
  habitType: 'motion' | 'pose';
  requiredLandmarks: BlazePoseLandmarkName[];
  confidenceMin: number;
  spec: ExerciseSpec;
  createDetector: (target: number) => ExerciseDetector;
};

const PUSHUP_LANDMARKS: BlazePoseLandmarkName[] = [
  'leftShoulder',
  'leftElbow',
  'leftWrist',
  'rightShoulder',
  'rightElbow',
  'rightWrist',
];

// Per-side confidence is checked by bothLegChains so one visible leg can still count.
const SQUAT_LANDMARKS: BlazePoseLandmarkName[] = [];

const JACK_LANDMARKS: BlazePoseLandmarkName[] = [
  'leftShoulder',
  'rightShoulder',
  'leftWrist',
  'rightWrist',
  'leftHip',
  'rightHip',
  'leftAnkle',
  'rightAnkle',
];

const TORSO_LANDMARKS: BlazePoseLandmarkName[] = [
  'leftShoulder',
  'rightShoulder',
  'leftHip',
  'rightHip',
];

const WARRIOR_LANDMARKS: BlazePoseLandmarkName[] = [
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

/** Wrists above shoulders and ankles wider than hips. */
export function isJumpingJackOpen(landmarks: PoseLandmarks33): boolean {
  const ls = landmarkAt(landmarks, 'leftShoulder');
  const rs = landmarkAt(landmarks, 'rightShoulder');
  const lw = landmarkAt(landmarks, 'leftWrist');
  const rw = landmarkAt(landmarks, 'rightWrist');
  const lh = landmarkAt(landmarks, 'leftHip');
  const rh = landmarkAt(landmarks, 'rightHip');
  const la = landmarkAt(landmarks, 'leftAnkle');
  const ra = landmarkAt(landmarks, 'rightAnkle');
  if (!ls || !rs || !lw || !rw || !lh || !rh || !la || !ra) return false;

  const shoulderY = (ls.y + rs.y) / 2;
  const wristsAbove = lw.y < shoulderY && rw.y < shoulderY;
  const hipWidth = Math.abs(lh.x - rh.x);
  const ankleWidth = Math.abs(la.x - ra.x);
  const legsSpread = ankleWidth > hipWidth * 1.25;
  return wristsAbove && legsSpread;
}

// ponytail: front-knee window + hips-level, generous thresholds; calibration knobs.
export function isWarriorIPose(landmarks: PoseLandmarks33): boolean {
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

  // Arms clearly above shoulders (margin rejects a loose near-shoulder raise).
  const ARM_MARGIN = 0.05;
  const armsRaised = lw.y < ls.y - ARM_MARGIN && rw.y < rs.y - ARM_MARGIN;
  const leftKneeAngle = jointAngle(lh, lk, la);
  const rightKneeAngle = jointAngle(rh, rk, ra);
  // Front knee bent into a lunge window — not standing straight, not collapsed.
  const inLunge = (a: number) => a >= 90 && a <= 120;
  const frontKneeBent = inLunge(leftKneeAngle) || inLunge(rightKneeAngle);
  const hipsLevel = Math.abs(lh.y - rh.y) < 0.12;
  return armsRaised && frontKneeBent && hipsLevel;
}

export const EXERCISE_REGISTRY: Record<ExerciseId, ExerciseDefinition> = {
  pushups: {
    id: 'pushups',
    label: 'Push-ups',
    description: 'Count reps from arm bend in the front camera.',
    verificationMode: 'reps',
    defaultTarget: 10,
    habitType: 'motion',
    requiredLandmarks: PUSHUP_LANDMARKS,
    confidenceMin: MOTION_CONFIDENCE_MIN,
    spec: {
      kind: 'reps',
      chain: 'arm',
      activeBelowDeg: 90,
      restAboveDeg: 160,
      validators: [torsoHorizontal],
      minRepIntervalMs: 350,
    },
    createDetector(target) {
      return createConfigDetector(this.spec, target, this.requiredLandmarks, this.confidenceMin);
    },
  },
  squats: {
    id: 'squats',
    label: 'Squats',
    description: 'Face the camera, full legs in frame.',
    verificationMode: 'reps',
    defaultTarget: 10,
    habitType: 'motion',
    requiredLandmarks: SQUAT_LANDMARKS,
    confidenceMin: MOTION_CONFIDENCE_MIN,
    spec: {
      kind: 'reps',
      chain: 'legs',
      // ponytail: calibration knobs for realistic depth vs accidental partial reps.
      activeBelowDeg: 110,
      restAboveDeg: 160,
      validators: [torsoVertical],
      minRepIntervalMs: 350,
    },
    createDetector(target) {
      return createConfigDetector(this.spec, target, this.requiredLandmarks, this.confidenceMin);
    },
  },
  jumping_jacks: {
    id: 'jumping_jacks',
    label: 'Jumping jacks',
    description: 'Arms up and legs out — step back so your full body is visible.',
    verificationMode: 'reps',
    defaultTarget: 10,
    habitType: 'motion',
    requiredLandmarks: JACK_LANDMARKS,
    confidenceMin: MOTION_CONFIDENCE_MIN,
    spec: {
      kind: 'reps',
      metric: (lm) => (isJumpingJackOpen(lm) ? 1 : 0),
      activeAbove: 0.5,
      restBelow: 0.5,
      validators: [torsoVertical],
      minRepIntervalMs: 250,
    },
    createDetector(target) {
      return createConfigDetector(this.spec, target, this.requiredLandmarks, this.confidenceMin);
    },
  },
  generic_motion: {
    id: 'generic_motion',
    label: 'Move around',
    description: 'Any vigorous full-body movement counts — no specific exercise.',
    verificationMode: 'reps',
    defaultTarget: 15,
    habitType: 'motion',
    requiredLandmarks: TORSO_LANDMARKS,
    confidenceMin: MOTION_CONFIDENCE_MIN,
    // ponytail: energy thresholds normalized by torso length; calibration knobs.
    spec: {
      kind: 'reps',
      metric: (lm, prev) => movementEnergy(lm, prev),
      activeAbove: 0.15,
      restBelow: 0.05,
      minRepIntervalMs: 250,
    },
    createDetector(target) {
      return createConfigDetector(this.spec, target, this.requiredLandmarks, this.confidenceMin);
    },
  },
  warrior_i: {
    id: 'warrior_i',
    label: 'Warrior I hold',
    description: 'Hold the yoga pose steady for the target duration.',
    verificationMode: 'hold',
    defaultTarget: 30,
    habitType: 'pose',
    requiredLandmarks: WARRIOR_LANDMARKS,
    confidenceMin: HOLD_CONFIDENCE_MIN,
    spec: { kind: 'hold', inPose: isWarriorIPose, validators: [torsoVertical] },
    createDetector(target) {
      return createConfigDetector(this.spec, target, this.requiredLandmarks, this.confidenceMin);
    },
  },
};

export const PHYSICAL_EXERCISES: ExerciseDefinition[] = Object.values(EXERCISE_REGISTRY);

export function getExerciseDefinition(id: ExerciseId): ExerciseDefinition {
  return EXERCISE_REGISTRY[id];
}

export function isMotionExerciseId(id: string): id is MotionExerciseId {
  return EXERCISE_REGISTRY[id as ExerciseId]?.habitType === 'motion';
}

export function isPoseExerciseId(id: string): id is PoseExerciseId {
  return EXERCISE_REGISTRY[id as ExerciseId]?.habitType === 'pose';
}

export type ResolvedExercise = {
  exerciseId: ExerciseId;
  definition: ExerciseDefinition;
  habitType: HabitType;
  target: number;
};

export function resolveExerciseFromConfig(
  habitType: HabitType,
  habitConfig: HabitConfig,
): ResolvedExercise | null {
  if (habitType === 'motion' && 'exerciseId' in habitConfig && 'repTarget' in habitConfig) {
    const def = EXERCISE_REGISTRY[habitConfig.exerciseId as ExerciseId];
    if (!def || def.habitType !== 'motion') return null;
    return {
      exerciseId: habitConfig.exerciseId as ExerciseId,
      definition: def,
      habitType: 'motion',
      target: habitConfig.repTarget,
    };
  }
  if (
    habitType === 'pose' &&
    'exerciseId' in habitConfig &&
    'holdDurationSeconds' in habitConfig
  ) {
    const def = EXERCISE_REGISTRY[habitConfig.exerciseId as ExerciseId];
    if (!def || def.habitType !== 'pose') return null;
    return {
      exerciseId: habitConfig.exerciseId as ExerciseId,
      definition: def,
      habitType: 'pose',
      target: habitConfig.holdDurationSeconds,
    };
  }
  if (habitType === 'motion' && 'repTarget' in habitConfig && !('exerciseId' in habitConfig)) {
    return {
      exerciseId: 'pushups',
      definition: EXERCISE_REGISTRY.pushups,
      habitType: 'motion',
      target: habitConfig.repTarget,
    };
  }
  return null;
}

export function resolveExerciseFromAlarm(alarm: Alarm): ResolvedExercise | null {
  return resolveExerciseFromConfig(alarm.habitType, alarm.habitConfig);
}

export function createDetectorForAlarm(alarm: Alarm): ExerciseDetector | null {
  const resolved = resolveExerciseFromAlarm(alarm);
  if (!resolved) return null;
  return resolved.definition.createDetector(resolved.target);
}
