import type { Alarm } from '@/src/shared/types';

export type HabitGateProps = {
  alarm: Alarm;
  onVerified: () => Promise<void> | void;
};
