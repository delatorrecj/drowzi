"use client";

import { useCallback, useRef, useState } from "react";

import { todayLocalDate } from "@/lib/demo/date";
import { recordHabitCompletion } from "@/lib/demo/storage/db";
import type { Alarm, HabitType } from "@/lib/demo/types";

/**
 * Shared gate completion path for the web demo. Idempotent: `finish` records the
 * habit completion once (when an alarm is present) and fires `onVerified`.
 * Mirrors the mobile app's useHabitCompletion.
 */
export function useDemoGateCompletion(
  alarm: Alarm | undefined,
  habitType: HabitType,
  onVerified?: () => void,
) {
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    if (alarm) {
      await recordHabitCompletion({
        alarmId: alarm.id,
        habitType,
        success: true,
        method: "verified",
        localDate: todayLocalDate(),
      });
    }
    onVerified?.();
  }, [alarm, habitType, onVerified]);

  return { done, doneRef, finish };
}
