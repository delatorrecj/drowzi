import type { HabitConfig, HabitType } from '@/src/shared/types';
import {
  EXERCISE_REGISTRY,
  getExerciseDefinition,
  PHYSICAL_EXERCISES,
  type ExerciseDefinition,
} from '@/src/features/exercise/exerciseRegistry';
import type { ExerciseId } from '@/src/shared/types';

export type AlarmSetupCategoryId = 'physical' | 'environmental' | 'cognitive';

/** Full catalog — environmental & cognitive muted in UI for V1 (motion-only). */
export const ALARM_SETUP_CATEGORIES_ALL: {
  id: AlarmSetupCategoryId;
  title: string;
  subtitle: string;
  habitType: HabitType;
}[] = [
  {
    id: 'physical',
    title: 'Physical',
    subtitle: 'Push-ups, squats, stretches — motion proves you’re awake.',
    habitType: 'motion',
  },
  {
    id: 'environmental',
    title: 'Environmental',
    subtitle: 'Scan something in another room so you actually get up.',
    habitType: 'barcode',
  },
  {
    id: 'cognitive',
    title: 'Cognitive / mindfulness',
    subtitle: 'Read a short passage aloud and start with intention.',
    habitType: 'voice',
  },
];

/** Shown in onboarding / add-alarm. Remove `.filter` to re-enable other gates. */
export const ALARM_SETUP_CATEGORIES = ALARM_SETUP_CATEGORIES_ALL.filter((c) => c.id === 'physical');

export const PHYSICAL_SETUP_CATEGORY = ALARM_SETUP_CATEGORIES_ALL[0];

export { PHYSICAL_EXERCISES, EXERCISE_REGISTRY, getExerciseDefinition };
export type { ExerciseDefinition, ExerciseId };

export function normalizeAlarmTime(raw: string): string | null {
  const s = raw.trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function buildHabitConfigFromInputs(
  exerciseId: ExerciseId,
  repInput: string,
  holdInput: string,
): { habitType: HabitType; habitConfig: HabitConfig } {
  const def = getExerciseDefinition(exerciseId);
  if (def.verificationMode === 'reps') {
    const n = Math.min(500, Math.max(1, parseInt(repInput, 10) || def.defaultTarget));
    return {
      habitType: def.habitType,
      habitConfig: { configVersion: 2, exerciseId: exerciseId as 'pushups' | 'squats' | 'jumping_jacks', repTarget: n },
    };
  }
  const secs = Math.min(600, Math.max(5, parseInt(holdInput, 10) || def.defaultTarget));
  return {
    habitType: def.habitType,
    habitConfig: { configVersion: 2, exerciseId: exerciseId as 'warrior_i', holdDurationSeconds: secs },
  };
}

/** @deprecated Use buildHabitConfigFromInputs with exerciseId */
export function buildLegacyHabitConfigFromInputs(
  habitType: HabitType,
  repInput: string,
  barcodeInput: string,
  passageInput: string,
): HabitConfig {
  if (habitType === 'motion') {
    const { habitConfig } = buildHabitConfigFromInputs('pushups', repInput, '');
    return habitConfig;
  }
  if (habitType === 'barcode') {
    const v = barcodeInput.trim() || 'pending-register-item';
    return { configVersion: 1, barcodeValue: v };
  }
  if (habitType === 'voice') {
    return { configVersion: 1, passageText: passageInput.trim() || 'Today I wake up on purpose.' };
  }
  return { configVersion: 1, note: 'alarm-setup' };
}

export function exerciseIdFromAlarmConfig(habitType: HabitType, habitConfig: HabitConfig): ExerciseId {
  if ('exerciseId' in habitConfig && typeof habitConfig.exerciseId === 'string') {
    return habitConfig.exerciseId as ExerciseId;
  }
  if (habitType === 'motion') return 'pushups';
  return 'warrior_i';
}

export function targetInputFromAlarmConfig(
  habitType: HabitType,
  habitConfig: HabitConfig,
): { repInput: string; holdInput: string } {
  if ('repTarget' in habitConfig) {
    return { repInput: String(habitConfig.repTarget), holdInput: '30' };
  }
  if ('holdDurationSeconds' in habitConfig) {
    return { repInput: '10', holdInput: String(habitConfig.holdDurationSeconds) };
  }
  const def = getExerciseDefinition(exerciseIdFromAlarmConfig(habitType, habitConfig));
  if (def.verificationMode === 'hold') {
    return { repInput: '10', holdInput: String(def.defaultTarget) };
  }
  return { repInput: String(def.defaultTarget), holdInput: '30' };
}
