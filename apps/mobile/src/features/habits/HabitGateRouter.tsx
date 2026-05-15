import type { Alarm } from '@/src/shared/types';
import { habitGateRegistry } from '@/src/features/habits/registry';

type Props = {
  alarm: Alarm;
  onVerified: () => Promise<void> | void;
};

export function HabitGateRouter({ alarm, onVerified }: Props) {
  const Gate = habitGateRegistry[alarm.habitType];
  return <Gate alarm={alarm} onVerified={onVerified} />;
}
