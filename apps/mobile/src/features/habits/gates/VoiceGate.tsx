import { StyleSheet, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { AppText, Icon, color, radius } from '@/src/ui';
import { Waveform } from '@/src/ui/motion';
import { palette } from '@/src/shared/theme';
import { PlaceholderGate } from '@/src/features/habits/gates/PlaceholderGate';

export function VoiceGate(props: HabitGateProps) {
  const passage =
    'passageText' in props.alarm.habitConfig ? props.alarm.habitConfig.passageText : '';

  return (
    <View style={styles.wrap}>
      <AppText variant="bodyStrong" color={palette.groundedBrown} style={styles.copy}>
        Read your passage aloud.
      </AppText>
      {passage ? (
        <AppText variant="body" color={palette.groundedBrown} style={styles.quote}>
          “{passage}”
        </AppText>
      ) : null}

      <View style={styles.listen}>
        <Waveform />
        <View style={styles.listenRow}>
          <Icon name="voice" size={18} stroke={color.primary} />
          <AppText variant="label" color={color.primary}>
            Listening…
          </AppText>
        </View>
      </View>

      <PlaceholderGate {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  copy: { textAlign: 'center' },
  quote: { fontStyle: 'italic', paddingHorizontal: 8 },
  listen: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
    borderRadius: radius.card,
    backgroundColor: color.bg,
    borderWidth: 2,
    borderColor: color.border,
  },
  listenRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
