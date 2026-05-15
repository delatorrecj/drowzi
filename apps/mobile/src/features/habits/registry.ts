import type { ComponentType } from 'react';

import type { HabitType } from '@/src/shared/types';
import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { BarcodeGate } from '@/src/features/habits/gates/BarcodeGate';
import { MotionGate } from '@/src/features/habits/gates/MotionGate';
import { PlaceholderGate } from '@/src/features/habits/gates/PlaceholderGate';
import { VoiceGate } from '@/src/features/habits/gates/VoiceGate';

export const habitGateRegistry: Record<HabitType, ComponentType<HabitGateProps>> = {
  motion: MotionGate,
  barcode: BarcodeGate,
  voice: VoiceGate,
  pose: PlaceholderGate,
  meditation: PlaceholderGate,
};
