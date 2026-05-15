import { useState } from 'react';
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
import { router, Stack } from 'expo-router';

import {
  PHYSICAL_SETUP_CATEGORY,
  buildHabitConfigFromInputs,
  normalizeAlarmTime,
} from '@/src/features/alarm/alarmSetupShared';
import { alarmSetupScreenOptions, alarmSetupStyles as styles } from '@/src/features/alarm/alarmSetupStyles';
import { saveAlarm } from '@/src/platform/alarmStore';
import { dashboardTheme } from '@/src/shared/dashboardTheme';

export default function AddAlarmScreen() {
  const [timeInput, setTimeInput] = useState('07:00');
  const [repInput, setRepInput] = useState('10');

  const selectedCategory = PHYSICAL_SETUP_CATEGORY;

  async function handleSave() {
    const time = normalizeAlarmTime(timeInput);
    if (!time) {
      Alert.alert('Check the time', 'Use 24h format like 06:30 or 18:45.');
      return;
    }

    const habitConfig = buildHabitConfigFromInputs(selectedCategory.habitType, repInput, '', '');

    await saveAlarm({
      id: `alarm-${Date.now()}`,
      userId: 'local-user',
      time,
      recurrence: { type: 'daily' },
      habitType: selectedCategory.habitType,
      habitConfig,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    router.back();
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Stack.Screen
          options={{
            title: 'Add alarm',
            ...alarmSetupScreenOptions,
          }}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.block}>
            <Text style={styles.kicker}>Motion only</Text>
            <Text style={styles.title}>Time & reps</Text>
            <Text style={styles.lede}>{selectedCategory.subtitle}</Text>

            <Text style={styles.label}>Wake time (24h)</Text>
            <TextInput
              value={timeInput}
              onChangeText={setTimeInput}
              keyboardType="numbers-and-punctuation"
              placeholder="07:00"
              placeholderTextColor={dashboardTheme.placeholderMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Rep target</Text>
            <TextInput
              value={repInput}
              onChangeText={setRepInput}
              keyboardType="number-pad"
              style={styles.input}
            />
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
