import { useCallback, useRef, useState } from 'react';

import type { Alarm } from '@/src/shared/types';
import { useAlarmLoop } from '@/src/features/habits/hooks/useAlarmLoop';
import { insertHabitLogRow } from '@/src/platform/habitSqlite';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';

/**
 * Shared verification-complete flow for every habit gate: keep the alarm looping
 * until done, then write the log rows and call onVerified. `finish` is
 * idempotent (guards against a per-frame scanner / detector firing twice).
 */
export function useHabitCompletion(alarm: Alarm, onVerified: () => Promise<void> | void) {
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  useAlarmLoop(!done);

  const finish = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const localDate = todayLocalDate();
    await insertHabitLogRow({
      alarmId: alarm.id,
      habitType: alarm.habitType,
      success: true,
      method: 'verified',
      localDate,
    });
    await recordHabitCompletion({
      alarmId: alarm.id,
      habitType: alarm.habitType,
      success: true,
      method: 'verified',
      localDate,
    });
    await onVerified();
  }, [alarm.id, alarm.habitType, onVerified]);

  const reset = useCallback(() => {
    doneRef.current = false;
    setDone(false);
  }, []);

  return { done, doneRef, finish, reset };
}
