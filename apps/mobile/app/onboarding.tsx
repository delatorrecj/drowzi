import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import {
  PHYSICAL_SETUP_CATEGORY,
  buildHabitConfigFromInputs,
  normalizeAlarmTime,
} from '@/src/features/alarm/alarmSetupShared';
import { alarmSetupScreenOptions, alarmSetupStyles as styles } from '@/src/features/alarm/alarmSetupStyles';
import {
  clearAlarmSetupSkipFlags,
  clearSavedOnboardingScreen,
  getSavedOnboardingScreen,
  setAlarmSetupSkipped,
  setDisplayName,
  setOnboardingComplete,
  setSavedOnboardingScreen,
} from '@/src/platform/onboarding';
import { saveAlarm } from '@/src/platform/alarmStore';
import { dashboardTheme } from '@/src/shared/dashboardTheme';

export default function OnboardingScreen() {
  const { resumeStep } = useLocalSearchParams<{ resumeStep?: string }>();

  /** Prevents late AsyncStorage restore from overwriting after the user taps Next/Back. */
  const ignoreLateRestoreRef = useRef(false);

  const [step, setStep] = useState(0);
  const [nameInput, setNameInput] = useState('');
  const [timeInput, setTimeInput] = useState('06:30');
  const [repInput, setRepInput] = useState('10');

  const selectedCategory = PHYSICAL_SETUP_CATEGORY;

  async function finishOnboardingSkip() {
    await clearSavedOnboardingScreen();
    await setDisplayName(nameInput);
    await setAlarmSetupSkipped(true);
    await setOnboardingComplete(true);
    router.replace('/(tabs)');
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (resumeStep === '1') {
        if (!cancelled) setStep(1);
        return;
      }
      if (resumeStep === '2') {
        if (!cancelled) setStep(2);
        return;
      }
      const saved = await getSavedOnboardingScreen();
      if (cancelled || ignoreLateRestoreRef.current) return;
      if (saved !== null) setStep(saved);
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeStep]);

  function goBackStep() {
    ignoreLateRestoreRef.current = true;
    const prev = step - 1;
    setStep(prev);
    if (prev === 0) void clearSavedOnboardingScreen();
    else void setSavedOnboardingScreen(prev as 1 | 2);
  }

  function goForwardFromWelcome() {
    ignoreLateRestoreRef.current = true;
    setStep(1);
    void setSavedOnboardingScreen(1);
  }

  function goForwardFromName() {
    ignoreLateRestoreRef.current = true;
    setStep(2);
    void setSavedOnboardingScreen(2);
  }

  const habitConfig = useMemo(
    () => buildHabitConfigFromInputs(selectedCategory.habitType, repInput, '', ''),
    [selectedCategory.habitType, repInput],
  );

  async function handleFinish() {
    const time = normalizeAlarmTime(timeInput);
    if (!time) {
      Alert.alert('Check the time', 'Use 24h format like 06:30 or 18:45.');
      return;
    }

    const alarm = {
      id: `alarm-${Date.now()}`,
      userId: 'local-user',
      time,
      recurrence: { type: 'daily' as const },
      habitType: selectedCategory.habitType,
      habitConfig,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await saveAlarm(alarm);
    await clearAlarmSetupSkipFlags();
    await clearSavedOnboardingScreen();
    await setDisplayName(nameInput);
    await setOnboardingComplete(true);
    router.replace('/(tabs)');
  }

  const headerTitle =
    step === 0 ? 'Welcome' : step === 1 ? 'Your name' : 'Alarm & reps';

  return (
    <SafeAreaView style={styles.flex} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Stack.Screen
          options={{
            title: headerTitle,
            ...alarmSetupScreenOptions,
          }}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {step === 0 ? (
            <View style={styles.block}>
              <Text style={styles.kicker}>Meet Drowzi</Text>
              <Text style={styles.hero}>Grogginess loses. Your habit wins.</Text>
              <Text style={styles.body}>
                For now your alarm is gated by one thing only: a physical habit — reps counted by motion so you
                actually get out of sleep inertia. More habit types come later.
              </Text>
              <Text style={styles.bodyMuted}>Three quick steps. Under two minutes.</Text>
            </View>
          ) : step === 1 ? (
            <View style={styles.block}>
              <Text style={styles.kicker}>Step 2 of 3</Text>
              <Text style={styles.title}>What should we call you?</Text>
              <Text style={styles.lede}>We&apos;ll use this to greet you on your dashboard.</Text>

              <Text style={styles.label}>Your name</Text>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Alex"
                placeholderTextColor={dashboardTheme.placeholderMuted}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={48}
                accessibilityLabel="Your display name"
              />
            </View>
          ) : (
            <View style={styles.block}>
              <Text style={styles.kicker}>Step 3 of 3</Text>
              <Text style={styles.title}>When & how many reps</Text>
              <Text style={styles.lede}>Motion-only · {selectedCategory.subtitle}</Text>

              <Text style={styles.label}>Wake time (24h)</Text>
              <TextInput
                value={timeInput}
                onChangeText={setTimeInput}
                keyboardType="numbers-and-punctuation"
                placeholder="06:30"
                placeholderTextColor={dashboardTheme.placeholderMuted}
                style={styles.input}
                accessibilityLabel="Alarm time in 24 hour format"
              />

              <Text style={styles.label}>Rep target</Text>
              <TextInput
                value={repInput}
                onChangeText={setRepInput}
                keyboardType="number-pad"
                style={styles.input}
                accessibilityLabel="Number of repetitions"
              />
            </View>
          )}

          <View style={styles.footer}>
            {step > 0 ? (
              <Pressable style={styles.secondary} onPress={goBackStep}>
                <Text style={styles.secondaryLabel}>Back</Text>
              </Pressable>
            ) : null}

            {step === 0 ? (
              <Pressable style={styles.primary} onPress={goForwardFromWelcome}>
                <Text style={styles.primaryLabel}>Next</Text>
              </Pressable>
            ) : step === 1 ? (
              <Pressable style={styles.primary} onPress={goForwardFromName}>
                <Text style={styles.primaryLabel}>Next</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.primary} onPress={() => void handleFinish()}>
                <Text style={styles.primaryLabel}>Save first alarm</Text>
              </Pressable>
            )}

            <Pressable style={styles.ghost} onPress={() => void finishOnboardingSkip()}>
              <Text style={styles.ghostLabel}>Skip for now</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
