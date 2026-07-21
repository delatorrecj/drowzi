import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import scheduleNotificationAsync from 'expo-notifications/build/scheduleNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

import {
  PRACTICE_TEST_ALARM_ID,
  createPracticeAlarm,
} from '@/src/features/practice/practiceDefaults';
import { saveAlarm } from '@/src/platform/alarmStore';
import { ensureNotificationPermissions } from '@/src/platform/alarmScheduler';
import { ANDROID_ALARM_CHANNEL_ID } from '@/src/platform/notificationChannel';
import { AppText } from '@/src/ui';
import { dashboardTheme } from '@/src/shared/dashboardTheme';

const DURATIONS = [5, 15, 30, 60] as const;

export default function PracticeAlarmScreen() {
  const [seconds, setSeconds] = useState<(typeof DURATIONS)[number]>(15);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [arming, setArming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const openGate = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRemaining(null);
    router.replace(`/habit-gate/${PRACTICE_TEST_ALARM_ID}`);
  }, []);

  const arm = useCallback(async () => {
    setArming(true);
    try {
      const alarm = createPracticeAlarm('motion', PRACTICE_TEST_ALARM_ID);
      await saveAlarm(alarm);

      if (Platform.OS !== 'web') {
        const ok = await ensureNotificationPermissions();
        if (ok) {
          await scheduleNotificationAsync({
            identifier: `drowzi-practice-test-${Date.now()}`,
            content: {
              title: 'Drowzi — Practice alarm',
              body: 'Tap to open the habit gate.',
              sound: true,
              data: {
                type: 'drowzi-alarm',
                alarmId: PRACTICE_TEST_ALARM_ID,
                url: `/habit-gate/${PRACTICE_TEST_ALARM_ID}`,
              },
            },
            trigger: {
              type: SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds,
              channelId: Platform.OS === 'android' ? ANDROID_ALARM_CHANNEL_ID : undefined,
            },
          });
        }
      }

      setRemaining(seconds);
      if (timerRef.current) clearInterval(timerRef.current);
      let left = seconds;
      timerRef.current = setInterval(() => {
        left -= 1;
        if (left <= 0) {
          openGate();
          return;
        }
        setRemaining(left);
      }, 1000);
    } catch (e) {
      Alert.alert('Could not arm test', e instanceof Error ? e.message : String(e));
    } finally {
      setArming(false);
    }
  }, [openGate, seconds]);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={styles.block}>
        <AppText variant="h2" color={dashboardTheme.text}>
          One-shot alarm test
        </AppText>
        <AppText variant="body" color={dashboardTheme.textMuted}>
          Arms a short timer, schedules a local notification, then opens the motion habit gate
          (same path as a fired wake alarm).
        </AppText>

        <AppText variant="label" color={dashboardTheme.textMuted}>
          Delay
        </AppText>
        <View style={styles.row}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d}
              style={[styles.chip, seconds === d && styles.chipOn]}
              onPress={() => setSeconds(d)}
              disabled={remaining !== null}>
              <AppText
                variant="bodyStrong"
                color={seconds === d ? dashboardTheme.textOnPrimary : dashboardTheme.text}>
                {d}s
              </AppText>
            </Pressable>
          ))}
        </View>

        {remaining !== null ? (
          <AppText variant="h1" color={dashboardTheme.primary} style={styles.countdown}>
            {remaining}s
          </AppText>
        ) : null}

        <Pressable
          style={[styles.primary, (arming || remaining !== null) && styles.primaryDisabled]}
          disabled={arming || remaining !== null}
          onPress={() => void arm()}>
          <AppText variant="bodyStrong" color={dashboardTheme.textOnPrimary}>
            {remaining !== null ? 'Armed…' : 'Arm test alarm'}
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: dashboardTheme.bg, padding: 20 },
  block: { gap: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: dashboardTheme.border,
    backgroundColor: dashboardTheme.surface,
  },
  chipOn: {
    backgroundColor: dashboardTheme.primary,
    borderColor: dashboardTheme.primary,
  },
  countdown: { textAlign: 'center', marginVertical: 12 },
  primary: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: dashboardTheme.primary,
  },
  primaryDisabled: { opacity: 0.55 },
});
