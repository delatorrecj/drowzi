import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitGateRouter } from '@/src/features/habits/HabitGateRouter';
import { getAlarmById } from '@/src/platform/alarmStore';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';
import type { Alarm } from '@/src/shared/types';
import { AppText, Icon, radius } from '@/src/ui';
import { AlarmPulse } from '@/src/ui/motion';
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
        <AppText variant="body" color={palette.groundedBrown}>
          Alarm not found.
        </AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={styles.pretitleRow}>
            <Icon name="alarm-bell" size={18} stroke={palette.groundedBrown} />
            <AppText variant="label" color={palette.groundedBrown}>
              Wake habit
            </AppText>
          </View>
          <AppText variant="h1" color={palette.groundedBrown} style={styles.title}>
            {alarm.time}
          </AppText>
          <AppText variant="body" color={palette.groundedBrown} style={{ opacity: 0.9 }}>
            {alarm.habitType} · local preview
          </AppText>
          <AlarmPulse style={styles.chip}>
            <AppText variant="label" color="#FFFFFF" style={{ fontSize: 11 }}>
              ● Alarm active
            </AppText>
          </AlarmPulse>
        </View>
        <Image
          source={require('@/assets/images/mascot/mascot-excited.png')}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>
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
  pretitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    marginTop: 4,
    fontSize: 56,
    lineHeight: 58,
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  body: {
    flex: 1,
    marginTop: 28,
  },
});
