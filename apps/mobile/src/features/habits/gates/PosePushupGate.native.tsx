import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraPermission } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { usePushupAlarmLoop } from '@/src/features/habits/hooks/usePushupAlarmLoop';
import { PushupMovenetCamera } from '@/src/features/habits/gates/PushupMovenetCamera';
import { getMovenetRgbInputSize, movenetLightningTflite } from '@/src/features/pushup/movenetModel';
import { parseMovenetOutputToLeftArm } from '@/src/features/pushup/movenetKeypoints';
import { createPushUpRepMachine } from '@/src/features/pushup/pushUpRepStateMachine';
import { upsertHabitConfig, insertHabitLogRow } from '@/src/platform/habitSqlite';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';

const EXTENDED_MIN = 160;
const BENT_MAX = 90;

export function PosePushupGate({ alarm, onVerified }: HabitGateProps) {
  const repTarget =
    'repTarget' in alarm.habitConfig ? alarm.habitConfig.repTarget : 10;

  const tf = useTensorflowModel(movenetLightningTflite, []);
  const inputSize =
    tf.state === 'loaded' ? getMovenetRgbInputSize(tf.model) : { width: 192, height: 192 };

  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraActive, setCameraActive] = useState(true);
  const [reps, setReps] = useState(0);
  const [done, setDone] = useState(false);
  usePushupAlarmLoop(!done);
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

  const finishVerified = useCallback(async () => {
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
  }, [alarm.habitType, alarm.id, onVerified]);

  const onMovenetOutput = useCallback(
    (buffer: ArrayBuffer) => {
      if (doneRef.current) return;
      const arm = parseMovenetOutputToLeftArm(buffer);
      if (!arm) return;
      const m = machineRef.current;
      const finished = m.feedLandmarks(arm);
      setReps(m.snapshot().reps);
      if (finished && !doneRef.current) {
        doneRef.current = true;
        setDone(true);
        setCameraActive(false);
        void finishVerified();
      }
    },
    [finishVerified],
  );

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
        void finishVerified();
      }
    },
    [finishVerified],
  );

  const simulateOneRep = useCallback(() => {
    feedAngle(170);
    feedAngle(75);
    feedAngle(165);
  }, [feedAngle]);

  const showCamera = hasPermission && cameraActive && !done;
  const modelReady = tf.state === 'loaded';

  const title = useMemo(
    () => `Push-ups: ${reps} / ${repTarget}${done ? ' — done' : ''}`,
    [done, repTarget, reps],
  );

  const modelHint =
    tf.state === 'loading'
      ? 'Loading MoveNet…'
      : tf.state === 'error'
        ? `MoveNet failed: ${tf.error.message}`
        : `MoveNet ready (${inputSize.width}×${inputSize.height}) — show your upper body in the selfie camera.`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{modelHint}</Text>
      <Text style={styles.hint}>
        Alarm sound loops until you finish {repTarget} reps (loads from the network).
      </Text>

      {!hasPermission ? (
        <Text style={styles.hint}>Allow camera to count reps from your form.</Text>
      ) : null}

      {showCamera ? (
        <View style={styles.cameraBox}>
          {modelReady ? (
            <PushupMovenetCamera
              model={tf.model}
              inputWidth={inputSize.width}
              inputHeight={inputSize.height}
              isActive={showCamera}
              onMovenetOutput={onMovenetOutput}
            />
          ) : tf.state === 'error' ? (
            <>
              <Camera style={StyleSheet.absoluteFill} device="front" isActive={showCamera} />
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>Model unavailable — use Simulate below.</Text>
              </View>
            </>
          ) : (
            <View style={styles.loadingCam}>
              <Text style={styles.hint}>Preparing camera + model…</Text>
            </View>
          )}
        </View>
      ) : null}

      <Pressable style={styles.demo} onPress={simulateOneRep} disabled={done}>
        <Text style={styles.demoLabel}>Simulate one rep (dev fallback)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#654321' },
  hint: { fontSize: 14, color: '#654321', opacity: 0.9 },
  cameraBox: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  loadingCam: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 12,
  },
  overlayText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  demo: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4C430',
    alignItems: 'center',
  },
  demoLabel: { fontWeight: '700', color: '#654321' },
});
