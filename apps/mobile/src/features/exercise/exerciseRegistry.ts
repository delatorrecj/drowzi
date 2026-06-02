import type { ExerciseDetector } from '@/src/features/exercise/detectorTypes';
import { createJumpingJacksDetector } from '@/src/features/exercise/detectors/jumpingJacksDetector';
import { createPushupsDetector } from '@/src/features/exercise/detectors/pushupsDetector';
import { createSquatsDetector } from '@/src/features/exercise/detectors/squatsDetector';
import { createWarriorIDetector } from '@/src/features/exercise/detectors/warriorIDetector';
import type { BlazePoseLandmarkName } from '@/src/features/exercise/landmarks';
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

const SQUAT_LANDMARKS: BlazePoseLandmarkName[] = [
  'leftHip',
  'leftKnee',
  'leftAnkle',
  'rightHip',
  'rightKnee',
  'rightAnkle',
];

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

export const EXERCISE_REGISTRY: Record<ExerciseId, ExerciseDefinition> = {
  pushups: {
    id: 'pushups',
    label: 'Push-ups',
    description: 'Count reps from arm bend in the front camera.',
    verificationMode: 'reps',
    defaultTarget: 10,
    habitType: 'motion',
    requiredLandmarks: PUSHUP_LANDMARKS,
    createDetector: (target) => createPushupsDetector({ targetReps: target }),
  },
  squats: {
    id: 'squats',
    label: 'Squats',
    description: 'Count reps from knee bend — phone propped to see legs.',
    verificationMode: 'reps',
    defaultTarget: 10,
    habitType: 'motion',
    requiredLandmarks: SQUAT_LANDMARKS,
    createDetector: (target) => createSquatsDetector({ targetReps: target }),
  },
  jumping_jacks: {
    id: 'jumping_jacks',
    label: 'Jumping jacks',
    description: 'Arms up and legs out — step back so your full body is visible.',
    verificationMode: 'reps',
    defaultTarget: 10,
    habitType: 'motion',
    requiredLandmarks: JACK_LANDMARKS,
    createDetector: (target) => createJumpingJacksDetector({ targetReps: target }),
  },
  warrior_i: {
    id: 'warrior_i',
    label: 'Warrior I hold',
    description: 'Hold the yoga pose steady for the target duration.',
    verificationMode: 'hold',
    defaultTarget: 30,
    habitType: 'pose',
    requiredLandmarks: WARRIOR_LANDMARKS,
    createDetector: (target) => createWarriorIDetector({ holdDurationSeconds: target }),
  },
};

export const PHYSICAL_EXERCISES: ExerciseDefinition[] = Object.values(EXERCISE_REGISTRY);

export function getExerciseDefinition(id: ExerciseId): ExerciseDefinition {
  return EXERCISE_REGISTRY[id];
}

export function isMotionExerciseId(id: string): id is MotionExerciseId {
  return id === 'pushups' || id === 'squats' || id === 'jumping_jacks';
}

export function isPoseExerciseId(id: string): id is PoseExerciseId {
  return id === 'warrior_i';
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
