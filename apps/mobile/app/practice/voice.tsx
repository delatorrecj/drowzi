import { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitGateRouter } from '@/src/features/habits/HabitGateRouter';
import { PRACTICE_ALARMS } from '@/src/features/practice/practiceDefaults';
import { AppText } from '@/src/ui';
import { dashboardTheme } from '@/src/shared/dashboardTheme';

export default function PracticeVoiceScreen() {
  const alarm = PRACTICE_ALARMS.voice;

  const onVerified = useCallback(() => {
    Alert.alert('Practice complete', 'Voice gate marked verified (stub).', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={styles.header}>
        <AppText variant="label" color={dashboardTheme.textMuted}>
          Practice · Voice
        </AppText>
        <AppText variant="body" color={dashboardTheme.textMuted}>
          Speech recognition is a stub — use Mark verified to finish.
        </AppText>
      </View>
      <View style={styles.body}>
        <HabitGateRouter alarm={alarm} onVerified={onVerified} standalone />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: dashboardTheme.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 6 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
});
