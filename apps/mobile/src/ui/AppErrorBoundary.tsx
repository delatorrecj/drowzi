import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button, color, space } from '@/src/ui';

type Props = { error: Error; retry: () => Promise<void> };

/**
 * Themed fallback for expo-router's ErrorBoundary — shown when the navigation
 * tree throws. Replaces the unstyled default so a crash is recoverable, not a
 * blank red screen. Error text is dev-only.
 */
export function AppErrorBoundary({ error, retry }: Props) {
  return (
    <SafeAreaView style={styles.wrap}>
      <AppText variant="h2">Something broke</AppText>
      <AppText variant="body" color={color.textMuted} style={styles.msg}>
        The app hit an unexpected error. Try again — if it keeps happening, restart the app.
      </AppText>
      {__DEV__ ? (
        <AppText variant="caption" color={color.alarmAccent} style={styles.msg}>
          {error.message}
        </AppText>
      ) : null}
      <Button title="Try again" onPress={() => void retry()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[6],
    gap: space[3],
  },
  msg: { textAlign: 'center' },
});
