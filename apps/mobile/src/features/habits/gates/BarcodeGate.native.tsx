import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { useHabitCompletion } from '@/src/features/habits/hooks/useHabitCompletion';
import { AppText, Button, color, radius } from '@/src/ui';
import { ScanLine } from '@/src/ui/motion';

const CODE_TYPES = ['qr', 'ean-13', 'ean-8', 'code-128', 'upc-a', 'code-39'] as const;
const CAMERA_H = 280;

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
      <AppText variant="bodyStrong" color={color.text} style={styles.copy}>
        Scan the registered item to turn off the alarm.
      </AppText>

      <View style={styles.cameraBox}>
        {cameraActive ? (
          <>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={cameraActive}
              codeScanner={codeScanner}
            />
            {/* Viewfinder frame + sweeping scan line for aiming feedback. */}
            <View style={styles.viewfinder} pointerEvents="none">
              <ScanLine height={CAMERA_H - 36} />
            </View>
          </>
        ) : (
          <View style={styles.overlay}>
            <AppText variant="body" color="#FFFFFF" style={styles.overlayText}>
              {done
                ? 'Verified.'
                : !hasPermission
                  ? 'Camera permission is required to scan.'
                  : 'Camera unavailable.'}
            </AppText>
          </View>
        )}
      </View>

      {!target ? (
        <AppText variant="caption" color={color.alarm} style={styles.warn}>
          No barcode configured for this alarm.
        </AppText>
      ) : lastSeen && lastSeen !== target && !done ? (
        <AppText variant="caption" color={color.alarm} style={styles.warn}>
          Scanned a different code — keep looking for the right item.
        </AppText>
      ) : null}

      {__DEV__ ? (
        <Button
          title="Mark verified (dev)"
          variant="secondary"
          onPress={() => void finish()}
          disabled={done}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  copy: { textAlign: 'center' },
  cameraBox: {
    height: CAMERA_H,
    borderRadius: radius.button,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  viewfinder: {
    ...StyleSheet.absoluteFillObject,
    margin: 16,
    borderWidth: 2,
    borderColor: 'rgba(244, 196, 48, 0.55)',
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  overlayText: { textAlign: 'center' },
  warn: { textAlign: 'center' },
});
