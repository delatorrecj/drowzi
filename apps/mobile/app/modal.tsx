import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { palette } from '@/src/shared/theme';

export default function ModalScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Drowzi boilerplate</Text>
      <Text style={styles.body}>
        Demo path: Home → Simulate alarm → habit gate → completion logged to AsyncStorage.
      </Text>
      <Text style={styles.body}>
        Next wiring: expo-notifications in src/platform/alarmScheduler.ts, Supabase sync after
        recordHabitCompletion.
      </Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 12,
    backgroundColor: palette.surfaceLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: palette.groundedBrown,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: palette.groundedBrown,
  },
});
