import { StyleSheet, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { ExerciseGate } from '@/src/features/habits/gates/ExerciseGate';
import { resolveExerciseFromAlarm } from '@/src/features/exercise/exerciseRegistry';
import { AppText, color } from '@/src/ui';

/** Physical exercise verification via ML Kit / MediaPipe pose detection. */
export function MotionGate(props: HabitGateProps) {
  const resolved = resolveExerciseFromAlarm(props.alarm);
  const targetLabel =
    resolved?.definition.verificationMode === 'hold'
      ? `${resolved.target}s hold`
      : `${resolved?.target ?? '…'} reps`;
  const silenceCopy = props.standalone
    ? `Complete ${targetLabel} of ${resolved?.definition.label ?? 'exercise'} to finish practice.`
    : `Complete ${targetLabel} of ${resolved?.definition.label ?? 'exercise'} to silence the alarm.`;

  return (
    <View style={styles.wrap}>
      <AppText variant="bodyStrong" color={color.text} style={styles.copy}>
        {silenceCopy}
      </AppText>
      <ExerciseGate {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  copy: { textAlign: 'center' },
});
