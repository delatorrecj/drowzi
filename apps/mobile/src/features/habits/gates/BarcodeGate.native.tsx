import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { useHabitCompletion } from '@/src/features/habits/hooks/useHabitCompletion';
import { fonts } from '@/src/shared/theme';

const CODE_TYPES = ['qr', 'ean-13', 'ean-8', 'code-128', 'upc-a', 'code-39'] as const;

export function BarcodeGate({ alarm, onVerified }: HabitGateProps) {
  const target =
    'barcodeValue' in alarm.habitConfig ? alarm.habitConfig.barcodeValue.trim() : '';
  const { done, doneRef, finish } = useHabitCompletion(alarm, onVerified);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission) void requestPermission();
  }, [hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: [...CODE_TYPES],
    onCodeScanned: (codes) => {
      if (doneRef.current) return;
      for (const c of codes) {
        const value = c.value?.trim();
        if (!value) continue;
        setLastSeen(value);
        if (value === target) {
          void finish();
          return;
        }
      }
    },
  });

  const cameraActive = !done && hasPermission && !!device;

  return (
    <View style={styles.wrap}>
      <Text style={styles.copy}>Scan the registered item to turn off the alarm.</Text>

      <View style={styles.cameraBox}>
        {cameraActive ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={cameraActive}
            codeScanner={codeScanner}
          />
        ) : (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>
              {done
                ? 'Verified.'
                : !hasPermission
                  ? 'Camera permission is required to scan.'
                  : 'Camera unavailable.'}
            </Text>
          </View>
        )}
      </View>

      {!target ? (
        <Text style={styles.warn}>No barcode configured for this alarm.</Text>
      ) : lastSeen && lastSeen !== target && !done ? (
        <Text style={styles.warn}>Scanned a different code — keep looking for the right item.</Text>
      ) : null}

      <Pressable style={styles.demo} onPress={() => void finish()} disabled={done}>
        <Text style={styles.demoLabel}>Mark verified (dev)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  copy: {
    fontSize: 17,
    fontFamily: fonts.bodySemiBold,
    color: '#654321',
    textAlign: 'center',
  },
  cameraBox: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  overlayText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  warn: { fontSize: 13, color: '#B23A48', textAlign: 'center' },
  demo: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4C430',
    alignItems: 'center',
  },
  demoLabel: { fontWeight: '700', color: '#654321' },
});
