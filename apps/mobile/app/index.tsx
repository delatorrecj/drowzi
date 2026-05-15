import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { isOnboardingComplete } from '@/src/platform/onboarding';
import { palette } from '@/src/shared/theme';

export default function IndexGate() {
  const [target, setTarget] = useState<'loading' | 'tabs' | 'onboarding'>('loading');

  useEffect(() => {
    void isOnboardingComplete().then((done) => {
      setTarget(done ? 'tabs' : 'onboarding');
    });
  }, []);

  if (target === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={palette.groundedBrown} />
      </View>
    );
  }

  if (target === 'onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceLight,
  },
});
