import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HabitGateProps } from '@/src/features/habits/gates/types';
import { usePushupAlarmLoop } from '@/src/features/habits/hooks/usePushupAlarmLoop';
import { PushupWebCamera } from '@/src/features/habits/gates/PushupWebCamera';
import { createPushUpRepMachine } from '@/src/features/pushup/pushUpRepStateMachine';
import type { LeftArmChain } from '@/src/features/pushup/poseTypes';
import { upsertHabitConfig, insertHabitLogRow } from '@/src/platform/habitSqlite';
import { recordHabitCompletion } from '@/src/platform/recordCompletion';
import { todayLocalDate } from '@/src/shared/date';

const EXTENDED_MIN = 160;
const BENT_MAX = 90;

/** Web: webcam + MoveNet (TF.js), same elbow rep logic as native. */
export function PosePushupGate({ alarm, onVerified }: HabitGateProps) {
  const repTarget =
    'repTarget' in alarm.habitConfig ? alarm.habitConfig.repTarget : 10;

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
  }, [repTarget]);

  useEffect(() => {
    void upsertHabitConfig({
      alarmId: alarm.id,
      habitType: alarm.habitType,
      repTarget,
    });
  }, [alarm.habitType, alarm.id, repTarget]);

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
    (arm: LeftArmChain | null) => {
      if (doneRef.current || !arm) return;
      const m = machineRef.current;
      const finished = m.feedLandmarks(arm);
      setReps(m.snapshot().reps);
      if (finished && !doneRef.current) {
        doneRef.current = true;
        setDone(true);
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

  const title = useMemo(
    () => `Push-ups: ${reps} / ${repTarget}${done ? ' — done' : ''}`,
    [done, repTarget, reps],
  );

  const cameraActive = !done;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>
        Live preview: camera + MoveNet. Alarm loops from an online clip until reps are done (if the browser blocks
        autoplay, tap “Simulate one rep” once to unlock audio). Use HTTPS or localhost for the camera.
      </Text>

      <View style={styles.cameraBox}>
        <PushupWebCamera active={cameraActive} onLandmarks={onLandmarks} />
      </View>

      <Pressable style={styles.demo} onPress={simulateOneRep} disabled={done}>
        <Text style={styles.demoLabel}>Simulate one rep (fallback)</Text>
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
  demo: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4C430',
    alignItems: 'center',
  },
  demoLabel: { fontWeight: '700', color: '#654321' },
});
