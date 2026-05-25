import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

import { ExercisePicker } from '@/src/features/alarm/ExercisePicker';
import {
  PHYSICAL_EXERCISES,
  buildHabitConfigFromInputs,
  exerciseIdFromAlarmConfig,
  getExerciseDefinition,
  normalizeAlarmTime,
  targetInputFromAlarmConfig,
} from '@/src/features/alarm/alarmSetupShared';
import { alarmSetupScreenOptions, alarmSetupStyles as styles } from '@/src/features/alarm/alarmSetupStyles';
import { getAlarmById, saveAlarm } from '@/src/platform/alarmStore';
import { notifyIfSchedulingFailed } from '@/src/platform/schedulingFeedback';
import { dashboardTheme } from '@/src/shared/dashboardTheme';
import type { Alarm, ExerciseId } from '@/src/shared/types';

export default function AddAlarmScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const editId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ready, setReady] = useState(!editId);
  const [editing, setEditing] = useState<Alarm | null>(null);
  const [timeInput, setTimeInput] = useState('07:00');
  const [repInput, setRepInput] = useState('10');
  const [holdInput, setHoldInput] = useState('30');
  const [exerciseId, setExerciseId] = useState<ExerciseId>('pushups');

  const selectedExercise = getExerciseDefinition(exerciseId);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    void (async () => {
      const existing = await getAlarmById(editId);
      if (cancelled) return;
      if (!existing) {
        Alert.alert('Alarm missing', 'This alarm is no longer on the device.');
        router.back();
        return;
      }
      setEditing(existing);
      setTimeInput(existing.time);
      const exId = exerciseIdFromAlarmConfig(existing.habitType, existing.habitConfig);
      const targets = targetInputFromAlarmConfig(existing.habitType, existing.habitConfig);
      setExerciseId(exId);
      setRepInput(targets.repInput);
      setHoldInput(targets.holdInput);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  async function handleSave() {
    const time = normalizeAlarmTime(timeInput);
    if (!time) {
      Alert.alert('Check the time', 'Use 24h format like 06:30 or 18:45.');
      return;
    }

    const usePhysicalFields =
      !editing || editing.habitType === 'motion' || editing.habitType === 'pose';
    const built = usePhysicalFields
      ? buildHabitConfigFromInputs(exerciseId, repInput, holdInput)
      : null;
    const habitConfig = built?.habitConfig ?? editing!.habitConfig;
    const habitType = built?.habitType ?? editing!.habitType;

    const { scheduling } = await saveAlarm({
      id: editing?.id ?? `alarm-${Date.now()}`,
      userId: editing?.userId ?? 'local-user',
      time,
      recurrence: editing?.recurrence ?? { type: 'daily' },
      habitType,
      habitConfig,
      isActive: editing?.isActive ?? true,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    });
    notifyIfSchedulingFailed(scheduling);

    router.back();
  }

  if (!ready) {
    return (
      <SafeAreaView style={[styles.flex, { justifyContent: 'center', alignItems: 'center' }]} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: editId ? 'Edit alarm' : 'Add alarm',
            ...alarmSetupScreenOptions,
          }}
        />
        <ActivityIndicator color={dashboardTheme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Stack.Screen
          options={{
            title: editing ? 'Edit alarm' : 'Add alarm',
            ...alarmSetupScreenOptions,
          }}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.block}>
            <Text style={styles.kicker}>Physical habit</Text>
            <Text style={styles.title}>Time & exercise</Text>
            <Text style={styles.lede}>Camera verifies whichever exercise you pick.</Text>

            <Text style={styles.label}>Exercise</Text>
            <ExercisePicker
              exercises={PHYSICAL_EXERCISES}
              selectedId={exerciseId}
              onSelect={setExerciseId}
            />

            <Text style={styles.label}>Wake time (24h)</Text>
            <TextInput
              value={timeInput}
              onChangeText={setTimeInput}
              keyboardType="numbers-and-punctuation"
              placeholder="07:00"
              placeholderTextColor={dashboardTheme.placeholderMuted}
              style={styles.input}
            />

            {selectedExercise.verificationMode === 'reps' ? (
              <>
                <Text style={styles.label}>Rep target</Text>
                <TextInput
                  value={repInput}
                  onChangeText={setRepInput}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Hold duration (seconds)</Text>
                <TextInput
                  value={holdInput}
                  onChangeText={setHoldInput}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </>
            )}
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.primary} onPress={() => void handleSave()}>
              <Text style={styles.primaryLabel}>Save alarm</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
