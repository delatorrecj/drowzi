import { StyleSheet, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { AppText, color } from '@/src/ui';
import { PlaceholderGate } from '@/src/features/habits/gates/PlaceholderGate';

/** Web has no native speech module — use the demo fallback. */
export function VoiceGate(props: HabitGateProps) {
  const passage =
    'passageText' in props.alarm.habitConfig ? props.alarm.habitConfig.passageText : '';
  return (
    <View style={styles.wrap}>
      <AppText variant="bodyStrong" color={color.textMuted} style={styles.copy}>
        Voice verification runs on the mobile app.
      </AppText>
      {passage ? (
        <AppText variant="body" color={color.textMuted} style={styles.quote}>
          “{passage}”
        </AppText>
      ) : null}
      <PlaceholderGate {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  copy: { textAlign: 'center' },
  quote: { fontStyle: 'italic', paddingHorizontal: 8 },
});
