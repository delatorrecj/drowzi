import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';

import { setOnboardingComplete } from '@/src/platform/onboarding';
import { palette } from '@/src/shared/theme';

const STEPS = [
  {
    title: 'Drowzi',
    body: 'Your alarm stays on until a real habit is done — not another swipe puzzle.',
  },
  {
    title: 'Pick your gate',
    body: 'Motion, barcode scan, or voice — each ties urgency to a habit you already want.',
  },
  {
    title: 'Lock it in',
    body: 'Next: set your first alarm from Home. Use Simulate alarm to demo without waiting.',
  },
] as const;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const last = step >= STEPS.length - 1;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Welcome', headerTintColor: palette.groundedBrown }} />
      <View style={styles.content}>
        <Text style={styles.kicker}>
          Step {step + 1} / {STEPS.length}
        </Text>
        <Text style={styles.title}>{STEPS[step].title}</Text>
        <Text style={styles.body}>{STEPS[step].body}</Text>
      </View>

      <View style={styles.footer}>
        {!last ? (
          <Pressable style={styles.primary} onPress={() => setStep((s) => s + 1)}>
            <Text style={styles.primaryLabel}>Next</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.primary}
            onPress={async () => {
              await setOnboardingComplete(true);
              router.replace('/(tabs)');
            }}>
            <Text style={styles.primaryLabel}>Enter app</Text>
          </Pressable>
        )}
        <Pressable
          style={styles.ghost}
          onPress={async () => {
            await setOnboardingComplete(true);
            router.replace('/(tabs)');
          }}>
          <Text style={styles.ghostLabel}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: palette.surfaceLight,
  },
  content: {
    flex: 1,
    gap: 12,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.groundedBrown,
    opacity: 0.7,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: '900',
    color: palette.groundedBrown,
  },
  body: {
    marginTop: 16,
    fontSize: 17,
    lineHeight: 26,
    color: palette.groundedBrown,
  },
  footer: {
    paddingBottom: 32,
    gap: 12,
  },
  primary: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: palette.adrenalineRed,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  ghost: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostLabel: {
    color: palette.groundedBrown,
    fontSize: 16,
    fontWeight: '600',
  },
});
