import { StyleSheet, Text, View } from 'react-native';

import { dashboardTheme } from '@/src/shared/dashboardTheme';

export default function MoreScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Developer split</Text>
      <Text style={styles.body}>
        Platform & data: apps/mobile/src/platform — notifications, local persistence (AsyncStorage on device and
        web).
      </Text>
      <Text style={styles.body}>
        Product & gates: apps/mobile/src/features/habits — replace stubs with real sensors / ML Kit.
      </Text>
      <Text style={styles.body}>See docs/plan-dev-workflow-split.md and apps/mobile/CONTRACT.md.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: dashboardTheme.bg,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: dashboardTheme.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: dashboardTheme.textMuted,
  },
});
