import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/ui/Text';
import { color, radius } from '@/src/ui/tokens';

type Props = {
  label: string;
  /** Accent color for border + text (default yellow). */
  tone?: string;
};

/** The habit-type pill from the dashboard alarm cards. */
export function Badge({ label, tone = color.primary }: Props) {
  return (
    <View style={[styles.badge, { borderColor: tone, backgroundColor: tint(tone) }]}>
      <AppText variant="label" color={tone} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

/** Faint fill matched to the accent — yellow tint by default. */
function tint(tone: string): string {
  return tone === color.primary ? 'rgba(244, 196, 48, 0.15)' : 'rgba(230, 57, 70, 0.12)';
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.input,
    borderWidth: 1,
  },
  text: { fontSize: 12, letterSpacing: 0.5 },
});
