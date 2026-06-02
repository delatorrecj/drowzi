import type { HabitConfig, HabitType, MotionExerciseId, PoseExerciseId } from '@/src/shared/types';

export function migrateHabitConfig(habitType: HabitType, raw: unknown): HabitConfig {
  if (!raw || typeof raw !== 'object') {
    return defaultConfigForType(habitType);
  }

  const cfg = raw as Record<string, unknown>;
  const version = cfg.configVersion;

  if (habitType === 'motion') {
    if (version === 2 && typeof cfg.exerciseId === 'string' && typeof cfg.repTarget === 'number') {
      return {
        configVersion: 2,
        exerciseId: cfg.exerciseId as MotionExerciseId,
        repTarget: cfg.repTarget,
      };
    }
    if (version === 1 && typeof cfg.repTarget === 'number') {
      return {
        configVersion: 2,
        exerciseId: 'pushups',
        repTarget: cfg.repTarget,
      };
    }
    return { configVersion: 2, exerciseId: 'pushups', repTarget: 10 };
  }

  if (habitType === 'pose') {
    if (
      version === 2 &&
      typeof cfg.exerciseId === 'string' &&
      typeof cfg.holdDurationSeconds === 'number'
    ) {
      return {
        configVersion: 2,
        exerciseId: cfg.exerciseId as PoseExerciseId,
        holdDurationSeconds: cfg.holdDurationSeconds,
      };
    }
    return { configVersion: 2, exerciseId: 'warrior_i', holdDurationSeconds: 30 };
  }

  if (habitType === 'barcode' && version === 1 && typeof cfg.barcodeValue === 'string') {
    return { configVersion: 1, barcodeValue: cfg.barcodeValue };
  }

  if (habitType === 'voice' && version === 1 && typeof cfg.passageText === 'string') {
    return { configVersion: 1, passageText: cfg.passageText };
  }

  return defaultConfigForType(habitType);
}

function defaultConfigForType(habitType: HabitType): HabitConfig {
  switch (habitType) {
    case 'motion':
      return { configVersion: 2, exerciseId: 'pushups', repTarget: 10 };
    case 'pose':
      return { configVersion: 2, exerciseId: 'warrior_i', holdDurationSeconds: 30 };
    case 'barcode':
      return { configVersion: 1, barcodeValue: 'pending-register-item' };
    case 'voice':
      return { configVersion: 1, passageText: 'Today I wake up on purpose.' };
    case 'meditation':
      return { configVersion: 1, note: 'placeholder' };
    default: {
      const _exhaustive: never = habitType;
      return _exhaustive;
    }
  }
}

export function migrateAlarmFields<T extends { habitType: HabitType; habitConfig: HabitConfig }>(
  alarm: T,
): T {
  return {
    ...alarm,
    habitConfig: migrateHabitConfig(alarm.habitType, alarm.habitConfig),
  };
}
