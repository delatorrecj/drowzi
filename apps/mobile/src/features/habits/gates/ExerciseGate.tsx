import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { useAlarmLoop } from '@/src/features/habits/hooks/useAlarmLoop';
import { ExerciseCamera } from '@/src/features/exercise/ExerciseCamera';
import {
  createDetectorForAlarm,
  resolveExerciseFromAlarm,
} from '@/src/features/exercise/exerciseRegistry';
import type { ExerciseProgress } from '@/src/features/exercise/detectorTypes';
import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import { upsertHabitConfig, insertHabitLogRow } from '@/src/platform/habitSqlite';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';

function progressLabel(progress: ExerciseProgress): string {
  if (progress.mode === 'reps') {
    return `${progress.reps} / ${progress.target} reps`;
  }
  return `${progress.heldSeconds} / ${progress.targetSeconds}s hold`;
}

export function ExerciseGate({ alarm, onVerified }: HabitGateProps) {
  const resolved = resolveExerciseFromAlarm(alarm);
  const [progress, setProgress] = useState<ExerciseProgress | null>(null);
  const [done, setDone] = useState(false);
  const [reposition, setReposition] = useState(false);
  useAlarmLoop(!done);
  const doneRef = useRef(false);
  const detectorRef = useRef(createDetectorForAlarm(alarm));

  useEffect(() => {
    detectorRef.current = createDetectorForAlarm(alarm);
    doneRef.current = false;
    setDone(false);
    setReposition(false);
    const det = detectorRef.current;
    setProgress(det ? det.snapshot() : null);
  }, [alarm.id, alarm.habitType, alarm.habitConfig]);

  useEffect(() => {
    if (!resolved) return;
    const target =
      resolved.definition.verificationMode === 'reps'
        ? { repTarget: resolved.target }
        : { repTarget: resolved.target };
    void upsertHabitConfig({
      alarmId: alarm.id,
      habitType: alarm.habitType,
      repTarget: 'repTarget' in target ? target.repTarget : resolved.target,
    });
  }, [alarm.habitType, alarm.id, resolved]);

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

  const onLandmarks = useCallback(
    (landmarks: PoseLandmarks33 | null, trackingLost: boolean) => {
      if (doneRef.current) return;
      const det = detectorRef.current;
      if (!det) return;

      setReposition(trackingLost || det.isTrackingLost());
      const finished = det.feed(landmarks);
      setProgress(det.snapshot());
      if (finished && !doneRef.current) {
        doneRef.current = true;
        setDone(true);
        void finishVerified();
      }
    },
    [finishVerified],
  );

  const simulateOneStep = useCallback(() => {
    const det = detectorRef.current;
    if (!det || doneRef.current) return;
    det.simulateOneStep();
    const snap = det.snapshot();
    setProgress(snap);
    setReposition(false);
    const complete =
      (snap.mode === 'reps' && snap.reps >= snap.target) ||
      (snap.mode === 'hold' && snap.heldSeconds >= snap.targetSeconds);
    if (complete) {
      doneRef.current = true;
      setDone(true);
      void finishVerified();
    }
  }, [finishVerified]);

  const title = useMemo(() => {
    if (!resolved) return 'Exercise gate';
    const prog = progress ? progressLabel(progress) : '…';
    return `${resolved.definition.label}: ${prog}${done ? ' — done' : ''}`;
  }, [done, progress, resolved]);

  if (!resolved) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Unknown exercise configuration</Text>
        <Text style={styles.hint}>Edit the alarm and pick a supported exercise.</Text>
      </View>
    );
  }

  const cameraActive = !done;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{resolved.definition.description}</Text>
      <Text style={styles.hint}>
        Alarm loops until you finish. Use HTTPS or localhost on web for the camera.
      </Text>

      <View style={styles.cameraBox}>
        <ExerciseCamera active={cameraActive} onLandmarks={onLandmarks} />
        {reposition && cameraActive ? (
          <View style={styles.repositionOverlay} pointerEvents="none">
            <Text style={styles.repositionText}>
              Reposition camera — show your full body in frame
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable style={styles.demo} onPress={simulateOneStep} disabled={done}>
        <Text style={styles.demoLabel}>
          {resolved.definition.verificationMode === 'reps'
            ? 'Simulate one rep (fallback)'
            : 'Simulate hold complete (fallback)'}
        </Text>
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
  repositionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 12,
  },
  repositionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
  demo: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4C430',
    alignItems: 'center',
  },
  demoLabel: { fontWeight: '700', color: '#654321' },
});
