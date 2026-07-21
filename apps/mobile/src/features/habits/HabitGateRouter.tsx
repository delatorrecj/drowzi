import type { Alarm } from '@/src/shared/types';
import { habitGateRegistry } from '@/src/features/habits/registry';

type Props = {
  alarm: Alarm;
  onVerified: () => Promise<void> | void;
  standalone?: boolean;
};

export function HabitGateRouter({ alarm, onVerified, standalone }: Props) {
  const Gate = habitGateRegistry[alarm.habitType];
  return <Gate alarm={alarm} onVerified={onVerified} standalone={standalone} />;
}
