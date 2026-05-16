import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { Camera, useCameraPermission } from 'react-native-vision-camera';

import { useTensorflowModel } from 'react-native-fast-tflite';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import {
  allocateModelInputTensor,
  movenetLightningTflite,
} from '@/src/features/pushup/movenetModel';
import { createPushUpRepMachine } from '@/src/features/pushup/pushUpRepStateMachine';
import { upsertHabitConfig, insertHabitLogRow } from '@/src/platform/habitSqlite';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';

const EXTENDED_MIN = 160;
const BENT_MAX = 90;

function MoveNetModelStatus() {
  const plugin = useTensorflowModel(movenetLightningTflite, []);

  useEffect(() => {
    if (plugin.state !== 'loaded') return;
    const m = plugin.model;
    const spec = m.inputs[0];
    const buf = allocateModelInputTensor(spec, spec.dataType === 'uint8' ? 114 : 0);
    void m
      .run([buf])
      .then((outs) => {
        if (__DEV__ && outs[0]) {
          console.log('[MoveNet] smoke run ok, out0 bytes=', outs[0].byteLength);
        }
      })
      .catch((e) => console.warn('[MoveNet] smoke run failed', e));
  }, [plugin.state, plugin.model]);

  if (plugin.state === 'loading') {
    return <Text style={styles.hint}>MoveNet: loading…</Text>;
  }
  if (plugin.state === 'error') {
    return (
      <Text style={styles.hint}>
        MoveNet: error — {plugin.error.message}
      </Text>
    );
  }
  return (
    <Text style={styles.hint}>
      MoveNet: ready ({plugin.model.inputs[0].shape.join('×')}{' '}
      {plugin.model.inputs[0].dataType}) → resize camera frames to this tensor next.
    </Text>
  );
}

export function PosePushupGate({ alarm, onVerified }: HabitGateProps) {
  const repTarget =
    'repTarget' in alarm.habitConfig ? alarm.habitConfig.repTarget : 10;

  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraActive, setCameraActive] = useState(true);
  const [reps, setReps] = useState(0);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const machineRef = useRef(
    createPushUpRepMachine({
      targetReps: repTarget,
      extendedMinDeg: EXTENDED_MIN,
      bentMaxDeg: BENT_MAX,
    }),
  );

  useEffect(() => {
    machineRef.current = createPushUpRepMachine({
      targetReps: repTarget,
      extendedMinDeg: EXTENDED_MIN,
      bentMaxDeg: BENT_MAX,
    });
    doneRef.current = false;
    setDone(false);
    setReps(0);
    setCameraActive(true);
  }, [repTarget]);

  useEffect(() => {
    void upsertHabitConfig({
      alarmId: alarm.id,
      habitType: alarm.habitType,
      repTarget,
    });
  }, [alarm.habitType, alarm.id, repTarget]);

  useEffect(() => {
    if (!hasPermission) void requestPermission();
  }, [hasPermission, requestPermission]);

  const feedAngle = useCallback(
    (deg: number) => {
      if (doneRef.current) return;
      const m = machineRef.current;
      const finished = m.feedElbowAngleDeg(deg);
      setReps(m.snapshot().reps);
      if (finished && !doneRef.current) {
        doneRef.current = true;
        setDone(true);
        setCameraActive(false);
        void (async () => {
          const localDate = todayLocalDate();
          await insertHabitLogRow({
            alarmId: alarm.id,
            habitType: alarm.habitType,
            success: true,
            method: 'verified',
            localDate,
          });
          await recordHabitCompletion({
            alarmId: alarm.id,
            habitType: alarm.habitType,
            success: true,
            method: 'verified',
            localDate,
          });
          await onVerified();
        })();
      }
    },
    [alarm.habitType, alarm.id, onVerified],
  );

  const simulateOneRep = useCallback(() => {
    feedAngle(170);
    feedAngle(75);
    feedAngle(165);
  }, [feedAngle]);

  const showCamera = Platform.OS !== 'web' && hasPermission && cameraActive && !done;

  const title = useMemo(
    () =>
      `Push-ups: ${reps} / ${repTarget}${
        done ? ' — done' : ''
      }`,
    [done, repTarget, reps],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>

      {Platform.OS !== 'web' ? <MoveNetModelStatus /> : null}

      {Platform.OS === 'web' ? (
        <Text style={styles.hint}>
          Camera verification runs on iOS/Android dev builds, not in the browser.
          Use the buttons below to exercise the rep counter.
        </Text>
      ) : null}

      {!hasPermission ? (
        <Text style={styles.hint}>Grant camera permission to preview the pose gate.</Text>
      ) : null}

      {showCamera ? (
        <View style={styles.cameraBox}>
          <Camera
            style={StyleSheet.absoluteFill}
            device="front"
            isActive={showCamera}
          />
        </View>
      ) : null}

      <Text style={styles.sub}>
        Next: feed resized RGB frames into MoveNet, then parseMovenetOutputToLeftArm →
        feedLandmarks (see poseFrameBridge.ts).
      </Text>

      <Pressable style={styles.demo} onPress={simulateOneRep} disabled={done}>
        <Text style={styles.demoLabel}>Simulate one rep (dev)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#654321' },
  hint: { fontSize: 14, color: '#654321', opacity: 0.85 },
  sub: { fontSize: 13, color: '#654321', opacity: 0.75 },
  cameraBox: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  demo: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4C430',
    alignItems: 'center',
  },
  demoLabel: { fontWeight: '700', color: '#654321' },
});
