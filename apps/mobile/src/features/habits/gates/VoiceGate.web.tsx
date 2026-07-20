import { StyleSheet, Text, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { fonts } from '@/src/shared/theme';
import { PlaceholderGate } from '@/src/features/habits/gates/PlaceholderGate';

/** Web has no native speech module here — use the demo fallback. */
export function VoiceGate(props: HabitGateProps) {
  const passage =
    'passageText' in props.alarm.habitConfig ? props.alarm.habitConfig.passageText : '';
  return (
    <View style={styles.wrap}>
      <Text style={styles.copy}>Voice verification runs on the mobile app.</Text>
      {passage ? <Text style={styles.quote}>{passage}</Text> : null}
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
  quote: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
    color: '#654321',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
});
