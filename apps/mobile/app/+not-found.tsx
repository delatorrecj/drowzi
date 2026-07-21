import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppText, Screen, color } from '@/src/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen edges={['top', 'bottom']} style={styles.container}>
        <AppText variant="h3">This screen doesn't exist.</AppText>
        <Link href="/" style={styles.link}>
          <AppText variant="bodyStrong" color={color.primary}>
            Go to home screen!
          </AppText>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  link: { marginTop: 15, paddingVertical: 15 },
});
