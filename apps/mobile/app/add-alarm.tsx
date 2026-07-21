import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { Button, Input } from '@/src/ui';
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
  const [saving, setSaving] = useState(false);

  const selectedExercise = getExerciseDefinition(exerciseId);
  const normalizedTime = normalizeAlarmTime(timeInput);
  const timeValid = normalizedTime !== null;

  function adjustTime(deltaMinutes: number) {
    const base = normalizeAlarmTime(timeInput) ?? '07:00';
    const [h, m] = base.split(':').map(Number);
    const total = (h * 60 + m + deltaMinutes + 1440) % 1440;
    const nh = String(Math.floor(total / 60)).padStart(2, '0');
    const nm = String(total % 60).padStart(2, '0');
    setTimeInput(`${nh}:${nm}`);
  }

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
    if (!time) return; // guarded by disabled Save + inline error

    const usePhysicalFields =
      !editing || editing.habitType === 'motion' || editing.habitType === 'pose';
    const built = usePhysicalFields
      ? buildHabitConfigFromInputs(exerciseId, repInput, holdInput)
      : null;
    const habitConfig = built?.habitConfig ?? editing!.habitConfig;
    const habitType = built?.habitType ?? editing!.habitType;

    setSaving(true);
    try {
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
    } finally {
      setSaving(false);
    }

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
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image 
                source={require('@/assets/images/mascot/mascot-thinking.png')} 
                style={{ width: 120, height: 120 }} 
                resizeMode="contain" 
              />
            </View>
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
            <View style={styles.timeDisplayWrap}>
              <Text style={styles.timeDisplay}>{normalizedTime ?? timeInput}</Text>
            </View>
            <View style={styles.stepperRow}>
              <Button title="-1h" variant="secondary" style={styles.stepper} onPress={() => adjustTime(-60)} />
              <Button title="-5m" variant="secondary" style={styles.stepper} onPress={() => adjustTime(-5)} />
              <Button title="+5m" variant="secondary" style={styles.stepper} onPress={() => adjustTime(5)} />
              <Button title="+1h" variant="secondary" style={styles.stepper} onPress={() => adjustTime(60)} />
            </View>
            <Input
              value={timeInput}
              onChangeText={setTimeInput}
              keyboardType="numbers-and-punctuation"
              placeholder="07:00"
            />
            {!timeValid && timeInput.length > 0 ? (
              <Text style={styles.errorText}>Use 24h format like 06:30 or 18:45.</Text>
            ) : null}

            {selectedExercise.verificationMode === 'reps' ? (
              <>
                <Text style={styles.label}>Rep target</Text>
                <Input value={repInput} onChangeText={setRepInput} keyboardType="number-pad" />
              </>
            ) : (
              <>
                <Text style={styles.label}>Hold duration (seconds)</Text>
                <Input value={holdInput} onChangeText={setHoldInput} keyboardType="number-pad" />
              </>
            )}
          </View>

          <View style={styles.footer}>
            <Button
              title="Save alarm"
              variant="primary"
              loading={saving}
              disabled={!timeValid}
              onPress={() => void handleSave()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
