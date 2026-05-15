import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { fonts } from '@/src/shared/theme';

/** Fallback when a gate is not implemented yet (hackathon stub). */
export function PlaceholderGate({ alarm, onVerified }: HabitGateProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{alarm.habitType.toUpperCase()} gate</Text>
      <Text style={styles.body}>
        Implement verification here (camera / ML Kit / mic). For demos, use the button below.
      </Text>
      <Pressable style={styles.cta} onPress={() => void onVerified()}>
        <Text style={styles.ctaLabel}>Mark verified (dev)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(101, 67, 33, 0.08)',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: '#654321',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
    color: '#654321',
  },
  cta: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#E63946',
    alignItems: 'center',
  },
  ctaLabel: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.bodyBold,
  },
});
