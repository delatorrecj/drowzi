import { StyleSheet, Text, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { fonts } from '@/src/shared/theme';
import { PlaceholderGate } from '@/src/features/habits/gates/PlaceholderGate';

/** Accelerometer / pose counting lands here — see docs/rfc-drowzi-habit-verification.md */
export function MotionGate(props: HabitGateProps) {
  const cfg = props.alarm.habitConfig;
  const reps =
    'repTarget' in cfg ? cfg.repTarget : NaN;

  return (
    <View style={styles.wrap}>
      <Text style={styles.copy}>Complete {Number.isFinite(reps) ? reps : '…'} reps to silence the alarm.</Text>
      <PlaceholderGate {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  copy: {
    fontSize: 17,
    fontFamily: fonts.bodySemiBold,
    color: '#654321',
    textAlign: 'center',
  },
});
