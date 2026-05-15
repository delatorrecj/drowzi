import { StyleSheet, Text, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { PlaceholderGate } from '@/src/features/habits/gates/PlaceholderGate';

export function BarcodeGate(props: HabitGateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.copy}>Scan the registered item (kitchen / bathroom).</Text>
      <PlaceholderGate {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  copy: {
    fontSize: 17,
    fontWeight: '600',
    color: '#654321',
    textAlign: 'center',
  },
});
