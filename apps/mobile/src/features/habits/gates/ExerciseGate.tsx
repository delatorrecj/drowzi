import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, radius } from '@/src/ui';
import { palette } from '@/src/shared/theme';
import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { useAlarmLoop } from '@/src/features/habits/hooks/useAlarmLoop';
import { ExerciseCamera } from '@/src/features/exercise/ExerciseCamera';
import {
  createDetectorForAlarm,
  resolveExerciseFromAlarm,
} from '@/src/features/exercise/exerciseRegistry';
import type { ExerciseDebug, ExerciseProgress } from '@/src/features/exercise/detectorTypes';
import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import { PoseDebugOverlay } from '@/src/features/exercise/PoseDebugOverlay';
import { poseLog } from '@/src/features/exercise/poseDebugLog';
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
  const [showDebug, setShowDebug] = useState(__DEV__);
  const [debugLandmarks, setDebugLandmarks] = useState<PoseLandmarks33 | null>(null);
  const [debugInfo, setDebugInfo] = useState<ExerciseDebug | null>(null);
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
      const snap = det.snapshot();
      setProgress(snap);
      const dbg = det.debug?.() ?? null;
      poseLog(
        'gate',
        1000,
        'landmarks=', landmarks ? `${landmarks.length}pts` : 'NULL',
        'trackingLost=', trackingLost || det.isTrackingLost(),
        'metric=', dbg?.metric ?? '—',
        'phase=', dbg?.phase ?? '—',
        'progress=', snap.mode === 'reps' ? `${snap.reps}/${snap.target}` : `${snap.heldSeconds}/${snap.targetSeconds}s`,
      );
      if (showDebug) {
        setDebugLandmarks(landmarks);
        setDebugInfo(dbg);
      }
      if (finished && !doneRef.current) {
        doneRef.current = true;
        setDone(true);
        void finishVerified();
      }
    },
    [finishVerified, showDebug],
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
        <AppText variant="h3" color={palette.groundedBrown}>
          Unknown exercise configuration
        </AppText>
        <AppText variant="body" color={palette.groundedBrown}>
          Edit the alarm and pick a supported exercise.
        </AppText>
      </View>
    );
  }

  const cameraActive = !done;

  return (
    <View style={styles.wrap}>
      <AppText variant="h3" color={palette.groundedBrown}>
        {title}
      </AppText>
      <AppText variant="body" color={palette.groundedBrown}>
        {resolved.definition.description}
      </AppText>
      <AppText variant="caption" color={palette.groundedBrown}>
        Alarm loops until you finish. Use HTTPS or localhost on web for the camera.
      </AppText>

      <View style={styles.cameraBox}>
        <ExerciseCamera active={cameraActive} onLandmarks={onLandmarks} />
        {showDebug && cameraActive ? (
          <PoseDebugOverlay
            landmarks={debugLandmarks}
            debug={debugInfo}
            trackingLost={reposition}
          />
        ) : null}
        {reposition && cameraActive ? (
          <View style={styles.repositionOverlay} pointerEvents="none">
            <AppText variant="bodyStrong" color="#FFFFFF" style={{ textAlign: 'center' }}>
              Reposition camera — show your full body in frame
            </AppText>
          </View>
        ) : null}
      </View>

      <Button
        title={showDebug ? 'Hide pose debug' : 'Show pose debug'}
        variant="secondary"
        onPress={() => setShowDebug((v) => !v)}
      />

      <Button
        title={
          resolved.definition.verificationMode === 'reps'
            ? 'Simulate one rep (fallback)'
            : 'Simulate hold complete (fallback)'
        }
        onPress={simulateOneStep}
        disabled={done}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  cameraBox: {
    height: 280,
    borderRadius: radius.button,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  repositionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 12,
  },
});
