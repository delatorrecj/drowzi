import { Video, ResizeMode } from 'expo-av';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { mascotAssets } from '@/assets/images/mascot';
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
import { notifyIfSchedulingFailed } from '@/src/platform/schedulingFeedback';
import { dashboardTheme } from '@/src/shared/dashboardTheme';

const onboardingStyles = StyleSheet.create({
  video: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginVertical: 16,
    backgroundColor: dashboardTheme.surface,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  mascotImage: {
    width: 160,
    height: 160,
  },
  optionCard: {
    backgroundColor: dashboardTheme.surface,
    borderWidth: 1,
    borderColor: dashboardTheme.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: dashboardTheme.primary,
    backgroundColor: 'rgba(244, 196, 48, 0.1)',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: dashboardTheme.text,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: dashboardTheme.textMuted,
    lineHeight: 20,
  },
  choiceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: dashboardTheme.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  }
});

type Tone = 'supportive' | 'challenger';
type RootCause = 'physical' | 'mental' | 'environmental';

export default function OnboardingScreen() {
  const { resumeStep } = useLocalSearchParams<{ resumeStep?: string }>();

  const ignoreLateRestoreRef = useRef(false);

  const [step, setStep] = useState(0);
  const [tone, setTone] = useState<Tone>('challenger');
  const [rootCause, setRootCause] = useState<RootCause>('physical');
  const [nameInput, setNameInput] = useState('');
  const [timeInput, setTimeInput] = useState('06:30');
  const [repInput, setRepInput] = useState('10');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const saved = await getSavedOnboardingScreen();
      if (cancelled || ignoreLateRestoreRef.current) return;
      if (saved !== null) setStep(saved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function goBackStep() {
    ignoreLateRestoreRef.current = true;
    setStep((prev) => prev - 1);
  }

  function goNextStep() {
    ignoreLateRestoreRef.current = true;
    setStep((prev) => prev + 1);
  }

  async function finishOnboardingSkip() {
    await clearSavedOnboardingScreen();
    await setDisplayName(nameInput || 'Friend');
    await setAlarmSetupSkipped(true);
    await setOnboardingComplete(true);
    router.replace('/(tabs)');
  }

  const habitConfig = useMemo(() => {
    const habitType = rootCause === 'physical' ? 'motion' : rootCause === 'mental' ? 'voice' : 'barcode';
    return buildHabitConfigFromInputs(habitType, repInput, 'Coffee Bag', 'Scan your coffee bag');
  }, [rootCause, repInput]);

  async function handleFinish() {
    const time = normalizeAlarmTime(timeInput);
    if (!time) {
      Alert.alert('Check the time', 'Use 24h format like 06:30 or 18:45.');
      return;
    }

    const habitType = rootCause === 'physical' ? 'motion' : rootCause === 'mental' ? 'voice' : 'barcode';

    const alarm = {
      id: `alarm-${Date.now()}`,
      userId: 'local-user',
      time,
      recurrence: { type: 'daily' as const },
      habitType: habitType as any,
      habitConfig,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const { scheduling } = await saveAlarm(alarm);
    notifyIfSchedulingFailed(scheduling);
    await clearAlarmSetupSkipFlags();
    await clearSavedOnboardingScreen();
    await setDisplayName(nameInput || 'Friend');
    await setOnboardingComplete(true);
    router.replace('/(tabs)');
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.block}>
            <Text style={styles.kicker}>Meet Drowzi</Text>
            <View style={onboardingStyles.mascotContainer}>
              <Image source={mascotAssets.thinking} style={onboardingStyles.mascotImage} resizeMode="contain" />
            </View>
            <Text style={styles.hero}>Grogginess loses. Your habit wins.</Text>
            <Text style={styles.body}>
              Drowzi is the only alarm that doesn't stop until you do your habit. 
              Verified by your phone's sensors.
            </Text>
            <Text style={styles.bodyMuted}>Let's calibrate your experience.</Text>
          </View>
        );
      case 1:
        return (
          <View style={styles.block}>
            <Text style={styles.kicker}>Question 1 of 3</Text>
            <Text style={styles.title}>How should we handle your mornings?</Text>
            <View style={onboardingStyles.mascotContainer}>
              <Image source={mascotAssets.surprised} style={onboardingStyles.mascotImage} resizeMode="contain" />
            </View>
            
            <Pressable 
              style={[onboardingStyles.optionCard, tone === 'supportive' && onboardingStyles.optionCardSelected]}
              onPress={() => setTone('supportive')}
            >
              <Text style={onboardingStyles.optionTitle}>The Supportive Companion</Text>
              <Text style={onboardingStyles.optionDesc}>Empathetic productivity. Soft animations and gentle nudges.</Text>
            </Pressable>

            <Pressable 
              style={[onboardingStyles.optionCard, tone === 'challenger' && onboardingStyles.optionCardSelected]}
              onPress={() => setTone('challenger')}
            >
              <Text style={onboardingStyles.optionTitle}>The Challenger</Text>
              <Text style={onboardingStyles.optionDesc}>The personal trainer. High-contrast UI and firm demands.</Text>
            </Pressable>
          </View>
        );
      case 2:
        return (
          <View style={styles.block}>
            <Text style={styles.kicker}>Question 2 of 3</Text>
            <Text style={styles.title}>What keeps you in bed the longest?</Text>
            <View style={onboardingStyles.mascotContainer}>
              <Image source={mascotAssets.thinking} style={onboardingStyles.mascotImage} resizeMode="contain" />
            </View>

            <Pressable 
              style={[onboardingStyles.optionCard, rootCause === 'physical' && onboardingStyles.optionCardSelected]}
              onPress={() => setRootCause('physical')}
            >
              <Text style={onboardingStyles.optionTitle}>Physical Heaviness</Text>
              <Text style={onboardingStyles.optionDesc}>Targets biological sleep inertia with movement.</Text>
            </Pressable>

            <Pressable 
              style={[onboardingStyles.optionCard, rootCause === 'mental' && onboardingStyles.optionCardSelected]}
              onPress={() => setRootCause('mental')}
            >
              <Text style={onboardingStyles.optionTitle}>Mental Fog</Text>
              <Text style={onboardingStyles.optionDesc}>Targets cognitive alertness with mindfulness.</Text>
            </Pressable>

            <Pressable 
              style={[onboardingStyles.optionCard, rootCause === 'environmental' && onboardingStyles.optionCardSelected]}
              onPress={() => setRootCause('environmental')}
            >
              <Text style={onboardingStyles.optionTitle}>The 'One More Minute' Loop</Text>
              <Text style={onboardingStyles.optionDesc}>Targets environmental comfort. Get out of the room!</Text>
            </Pressable>
          </View>
        );
      case 3:
        return (
          <View style={styles.block}>
            <Text style={styles.kicker}>Question 3 of 3</Text>
            <Text style={styles.title}>Let's set your first anchor</Text>
            <View style={onboardingStyles.mascotContainer}>
              <Image source={mascotAssets.excited} style={onboardingStyles.mascotImage} resizeMode="contain" />
            </View>

            <Text style={styles.label}>Your Name</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Alex"
              placeholderTextColor={dashboardTheme.placeholderMuted}
              style={styles.input}
            />

            <Text style={styles.label}>First Alarm Time (24h)</Text>
            <TextInput
              value={timeInput}
              onChangeText={setTimeInput}
              placeholder="06:30"
              placeholderTextColor={dashboardTheme.placeholderMuted}
              style={styles.input}
            />

            {rootCause === 'physical' && (
              <>
                <Text style={styles.label}>Push-up Reps</Text>
                <TextInput
                  value={repInput}
                  onChangeText={setRepInput}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </>
            )}

            {rootCause === 'mental' && (
              <Text style={styles.body}>You'll be asked to read a motivational passage aloud.</Text>
            )}

            {rootCause === 'environmental' && (
              <Text style={styles.body}>You'll need to scan a barcode in another room (e.g. coffee maker).</Text>
            )}
          </View>
        );
      case 4:
        return (
          <View style={styles.block}>
            <Text style={styles.kicker}>Ready to start</Text>
            <View style={onboardingStyles.mascotContainer}>
              <Image source={mascotAssets.thinking2} style={onboardingStyles.mascotImage} resizeMode="contain" />
            </View>
            <Text style={styles.hero}>Toll Set.</Text>
            <Text style={styles.body}>
              To stop tomorrow's alarm, you must meet the bear and complete your habit.
            </Text>
            <Text style={styles.bodyMuted}>Consistency evolves your mascot. Don't break the streak.</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          {renderStep()}

          <View style={styles.footer}>
            {step > 0 && (
              <Pressable style={styles.secondary} onPress={goBackStep}>
                <Text style={styles.secondaryLabel}>Back</Text>
              </Pressable>
            )}

            {step < 4 ? (
              <Pressable style={styles.primary} onPress={goNextStep}>
                <Text style={styles.primaryLabel}>Next</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.primary} onPress={() => void handleFinish()}>
                <Text style={styles.primaryLabel}>Commit to Morning</Text>
              </Pressable>
            )}

            {step === 0 && (
              <Pressable style={styles.ghost} onPress={() => void finishOnboardingSkip()}>
                <Text style={styles.ghostLabel}>Skip for now</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
