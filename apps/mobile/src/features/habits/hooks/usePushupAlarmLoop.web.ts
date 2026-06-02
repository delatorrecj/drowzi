import { useEffect } from 'react';

import { ALARM_SOUND_REMOTE_URI } from '@/src/features/alarm/alarmSoundConfig';

/** Loops an online alarm in the browser until push-ups are done. */
export function usePushupAlarmLoop(shouldPlay: boolean) {
  useEffect(() => {
    if (!shouldPlay || typeof Audio === 'undefined') return;

    const el = new Audio(ALARM_SOUND_REMOTE_URI);
    el.loop = true;
    el.volume = 1;
    void el.play().catch(() => {
      /* autoplay blocked until gesture — user can tap simulate */
    });

    return () => {
      el.pause();
      el.src = '';
    };
  }, [shouldPlay]);
}
