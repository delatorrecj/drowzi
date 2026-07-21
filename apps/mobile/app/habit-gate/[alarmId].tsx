import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitGateRouter } from '@/src/features/habits/HabitGateRouter';
import { PRACTICE_TEST_ALARM_ID } from '@/src/features/practice/practiceDefaults';
import { getAlarmById } from '@/src/platform/alarmStore';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';
import { dashboardTheme } from '@/src/shared/dashboardTheme';
import type { Alarm } from '@/src/shared/types';
import { AppText, Icon } from '@/src/ui';
import { AlarmPulse } from '@/src/ui/motion';

export default function HabitGateScreen() {
  const params = useLocalSearchParams<{ alarmId: string | string[] }>();
  const alarmId = Array.isArray(params.alarmId) ? params.alarmId[0] : params.alarmId;
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!alarmId) {
        setAlarm(null);
        setLoading(false);
        return;
      }
      const found = await getAlarmById(alarmId);
      if (!cancelled) {
        setAlarm(found);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [alarmId]);

  const onVerified = useCallback(async () => {
    if (!alarm) return;
    await recordHabitCompletion({
      alarmId: alarm.id,
      habitType: alarm.habitType,
      success: true,
      method: 'verified',
      localDate: todayLocalDate(),
    });
    const isPracticeTest = alarm.id === PRACTICE_TEST_ALARM_ID;
    Alert.alert(
      isPracticeTest ? 'Practice alarm cleared' : 'Alarm cleared',
      isPracticeTest ? 'Test complete.' : 'Completion saved locally.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }],
    );
  }, [alarm]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={dashboardTheme.textOnPrimary} />
      </SafeAreaView>
    );
  }

  if (!alarm) {
    return (
      <SafeAreaView style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <AppText variant="body" color={dashboardTheme.textOnPrimary}>
          Alarm not found.
        </AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={styles.pretitleRow}>
            <Icon name="alarm-bell" size={16} stroke={dashboardTheme.textOnPrimary} />
            <AppText variant="label" color={dashboardTheme.textOnPrimary} style={styles.pretitle}>
              Wake habit
            </AppText>
          </View>
          <AppText variant="h1" color={dashboardTheme.textOnPrimary} style={styles.title}>
            {alarm.time}
          </AppText>
          <AppText variant="body" color={dashboardTheme.textOnPrimary} style={styles.subtitle}>
            {alarm.habitType} · alarm ringing
          </AppText>
        </View>
        <Image
          source={require('@/assets/images/mascot/mascot-excited.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
      </View>

      <AlarmPulse style={styles.banner}>
        <AppText variant="bodyStrong" color="#FFFFFF" style={styles.bannerText}>
          Complete your habit to stop the alarm
        </AppText>
      </AlarmPulse>

      <View style={styles.panel}>
        <HabitGateRouter alarm={alarm} onVerified={onVerified} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: dashboardTheme.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dashboardTheme.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  headerCopy: { flex: 1 },
  pretitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pretitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.85,
  },
  title: {
    marginTop: 4,
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  mascot: { width: 80, height: 80 },
  banner: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: dashboardTheme.alarmAccent,
    alignItems: 'center',
  },
  bannerText: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 13,
    textAlign: 'center',
  },
  panel: {
    flex: 1,
    marginTop: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: dashboardTheme.bg,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
});
