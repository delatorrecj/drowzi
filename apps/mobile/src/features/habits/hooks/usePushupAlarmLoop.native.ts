import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

import { ALARM_SOUND_REMOTE_URI } from '@/src/features/alarm/alarmSoundConfig';

/** Loops an online alarm sound until `shouldPlay` becomes false (push-ups completed). */
export function usePushupAlarmLoop(shouldPlay: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!shouldPlay) return;

    let cancelled = false;

    void (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } catch {
        /* ignore */
      }

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: ALARM_SOUND_REMOTE_URI },
          { isLooping: true, shouldPlay: true, volume: 1 },
        );
        if (cancelled) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch {
        /* network or load failure — silent; user still sees rep UI */
      }
    })();

    return () => {
      cancelled = true;
      const s = soundRef.current;
      soundRef.current = null;
      if (s) {
        void (async () => {
          try {
            await s.stopAsync();
            await s.unloadAsync();
          } catch {
            /* ignore */
          }
        })();
      }
    };
  }, [shouldPlay]);
}
