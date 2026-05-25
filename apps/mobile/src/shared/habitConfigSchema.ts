import { z } from 'zod';

import type { HabitConfig, HabitType } from '@/src/shared/types';
import { migrateHabitConfig } from '@/src/platform/migrateHabitConfig';

const motionExerciseId = z.enum(['pushups', 'squats', 'jumping_jacks']);

const poseExerciseId = z.enum(['warrior_i']);

const motionV1 = z.object({
  configVersion: z.literal(1),
  repTarget: z.number().int().min(1).max(500),
});

const motionV2 = z.object({
  configVersion: z.literal(2),
  exerciseId: motionExerciseId,
  repTarget: z.number().int().min(1).max(500),
});

const poseV2 = z.object({
  configVersion: z.literal(2),
  exerciseId: poseExerciseId,
  holdDurationSeconds: z.number().int().min(5).max(600),
});

const barcode = z.object({
  configVersion: z.literal(1),
  barcodeValue: z.string().min(1),
});

const voice = z.object({
  configVersion: z.literal(1),
  passageText: z.string().min(1),
});

const placeholder = z.object({
  configVersion: z.literal(1),
  note: z.string().optional(),
});

export function parseHabitConfig(habitType: HabitType, raw: unknown): HabitConfig {
  switch (habitType) {
    case 'motion': {
      const parsed = z.union([motionV2, motionV1]).safeParse(raw);
      if (parsed.success) return migrateHabitConfig('motion', parsed.data);
      return migrateHabitConfig('motion', raw);
    }
    case 'pose': {
      const parsed = poseV2.safeParse(raw);
      if (parsed.success) return parsed.data;
      return migrateHabitConfig('pose', raw);
    }
    case 'barcode':
      return barcode.parse(raw);
    case 'voice':
      return voice.parse(raw);
    case 'meditation':
      return placeholder.parse(raw);
    default: {
      const _exhaustive: never = habitType;
      return _exhaustive;
    }
  }
}
