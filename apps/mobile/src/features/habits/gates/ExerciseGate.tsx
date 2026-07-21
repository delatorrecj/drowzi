import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText, Button, color, radius } from '@/src/ui';
import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { useAlarmLoop } from '@/src/features/habits/hooks/useAlarmLoop';
import { ExerciseCamera, type CameraFacing } from '@/src/features/exercise/ExerciseCamera';
import {
  createDetectorForAlarm,
  resolveExerciseFromAlarm,
} from '@/src/features/exercise/exerciseRegistry';
import type { ExerciseDebug, ExerciseProgress } from '@/src/features/exercise/detectorTypes';
import type { PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import { PoseDebugOverlay } from '@/src/features/exercise/PoseDebugOverlay';
import { poseLog } from '@/src/features/exercise/poseDebugLog';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';

function progressLabel(progress: ExerciseProgress): string {
  if (progress.mode === 'reps') {
    return `${progress.reps} / ${progress.target} reps`;
  }
  return `${progress.heldSeconds} / ${progress.targetSeconds}s hold`;
}

export function ExerciseGate({ alarm, onVerified, standalone }: HabitGateProps) {
  const resolved = resolveExerciseFromAlarm(alarm);
  const [progress, setProgress] = useState<ExerciseProgress | null>(null);
  const [done, setDone] = useState(false);
  const [reposition, setReposition] = useState(false);
  const [showDebug, setShowDebug] = useState(__DEV__);
  const [facing, setFacing] = useState<CameraFacing>('front');
  const [debugLandmarks, setDebugLandmarks] = useState<PoseLandmarks33 | null>(null);
  const [debugInfo, setDebugInfo] = useState<ExerciseDebug | null>(null);
  useAlarmLoop(!done && !standalone);
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

  const finishVerified = useCallback(async () => {
    try {
      await recordHabitCompletion({
        alarmId: alarm.id,
        habitType: alarm.habitType,
        success: true,
        method: 'verified',
        localDate: todayLocalDate(),
      });
    } catch {
      // Don't trap the user in a ringing alarm over a storage glitch — inform,
      // then still clear. Completion may not be recorded in the streak.
      Alert.alert('Could not save', 'Your completion may not have been recorded, but the alarm will stop.');
    }
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

  const progressPct = useMemo(() => {
    if (!progress) return 0;
    const frac =
      progress.mode === 'reps'
        ? progress.target > 0
          ? progress.reps / progress.target
          : 0
        : progress.targetSeconds > 0
          ? progress.heldSeconds / progress.targetSeconds
          : 0;
    return Math.max(0, Math.min(1, frac));
  }, [progress]);

  if (!resolved) {
    return (
      <View style={styles.wrap}>
        <AppText variant="h3" color={color.text}>
          Unknown exercise configuration
        </AppText>
        <AppText variant="body" color={color.text}>
          Edit the alarm and pick a supported exercise.
        </AppText>
      </View>
    );
  }

  const cameraActive = !done;

  return (
    <View style={styles.wrap}>
      <AppText variant="h3" color={color.text}>
        {title}
      </AppText>
      <AppText variant="body" color={color.text}>
        {resolved.definition.description}
      </AppText>
      <AppText variant="caption" color={color.textMuted}>
        Alarm loops until you finish. Use HTTPS or localhost on web for the camera.
      </AppText>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progressPct * 100)}%` }]} />
      </View>

      <View style={styles.cameraBox}>
        <ExerciseCamera active={cameraActive} facing={facing} onLandmarks={onLandmarks} />
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
        title={facing === 'front' ? 'Use back camera' : 'Use front camera'}
        variant="secondary"
        onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
      />

      <Button
        title={showDebug ? 'Hide pose debug' : 'Show pose debug'}
        variant="secondary"
        onPress={() => setShowDebug((v) => !v)}
      />

      {__DEV__ ? (
        <Button
          title={
            resolved.definition.verificationMode === 'reps'
              ? 'Simulate one rep (fallback)'
              : 'Simulate hold complete (fallback)'
          }
          variant="secondary"
          onPress={simulateOneStep}
          disabled={done}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(244, 196, 48, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.primary,
  },
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
