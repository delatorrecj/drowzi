import { StyleSheet, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { AppText, color } from '@/src/ui';
import { PlaceholderGate } from '@/src/features/habits/gates/PlaceholderGate';

/** Web has no native code scanner — use the demo fallback. */
export function BarcodeGate(props: HabitGateProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="bodyStrong" color={color.textMuted} style={styles.copy}>
        Barcode scanning runs on the mobile app.
      </AppText>
      <PlaceholderGate {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  copy: { textAlign: 'center' },
});
