import { z } from 'zod';

import type { HabitConfig, HabitType } from '@/src/shared/types';

const motion = z.object({
  configVersion: z.literal(1),
  repTarget: z.number().int().min(1).max(500),
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
    case 'motion':
      return motion.parse(raw);
    case 'barcode':
      return barcode.parse(raw);
    case 'voice':
      return voice.parse(raw);
    case 'pose':
    case 'meditation':
      return placeholder.parse(raw);
    default: {
      const _exhaustive: never = habitType;
      return _exhaustive;
    }
  }
}
