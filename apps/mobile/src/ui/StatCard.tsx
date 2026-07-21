import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/ui/Text';
import { color, radius, space } from '@/src/ui/tokens';

type Props = {
  value: number | string;
  label: string;
};

/** Streak / logs tile — big yellow number (DSD stat role) over an uppercase label. */
export function StatCard({ value, label }: Props) {
  return (
    <View style={styles.card}>
      <AppText
        variant="stat"
        color={color.primary}
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}>
        {value}
      </AppText>
      <AppText variant="label" color={color.textMuted} numberOfLines={1} style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: space[4],
    paddingHorizontal: space[4],
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    gap: space[1],
  },
  value: { fontSize: 40, lineHeight: 44, alignSelf: 'stretch', textAlign: 'center' },
  label: { alignSelf: 'stretch', textAlign: 'center' },
});
