import { StyleSheet, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { AppText, Icon, color, radius } from '@/src/ui';
import { ScanLine } from '@/src/ui/motion';
import { palette } from '@/src/shared/theme';
import { PlaceholderGate } from '@/src/features/habits/gates/PlaceholderGate';

const VIEWFINDER_H = 190;

export function BarcodeGate(props: HabitGateProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="bodyStrong" color={palette.groundedBrown} style={styles.copy}>
        Scan the registered item (kitchen / bathroom).
      </AppText>

      <View style={styles.viewfinder}>
        <View style={styles.graphic}>
          <Icon name="barcode" size={120} stroke={color.primary} />
        </View>
        <ScanLine height={VIEWFINDER_H} />
      </View>

      <PlaceholderGate {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  copy: { textAlign: 'center' },
  viewfinder: {
    height: VIEWFINDER_H,
    borderRadius: radius.card,
    backgroundColor: color.bg,
    borderWidth: 2,
    borderColor: color.border,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  graphic: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
