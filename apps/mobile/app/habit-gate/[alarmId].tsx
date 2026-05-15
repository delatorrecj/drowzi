import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitGateRouter } from '@/src/features/habits/HabitGateRouter';
import { getAlarmById } from '@/src/platform/alarmStore';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';
import type { Alarm } from '@/src/shared/types';
import { palette } from '@/src/shared/theme';

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
    Alert.alert('Alarm cleared', 'Completion saved locally.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)') },
    ]);
  }, [alarm]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={palette.groundedBrown} />
      </SafeAreaView>
    );
  }

  if (!alarm) {
    return (
      <SafeAreaView style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.error}>Alarm not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.pretitle}>Wake habit</Text>
      <Text style={styles.title}>{alarm.time}</Text>
      <Text style={styles.sub}>{alarm.habitType} · local preview</Text>
      <View style={styles.body}>
        <HabitGateRouter alarm={alarm} onVerified={onVerified} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: palette.awakeningYellow,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.awakeningYellow,
  },
  pretitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: palette.groundedBrown,
    opacity: 0.85,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    fontSize: 56,
    fontWeight: '900',
    color: palette.groundedBrown,
  },
  sub: {
    marginTop: 4,
    fontSize: 16,
    color: palette.groundedBrown,
    opacity: 0.9,
  },
  body: {
    flex: 1,
    marginTop: 28,
  },
  error: {
    fontSize: 16,
    color: palette.groundedBrown,
  },
});
