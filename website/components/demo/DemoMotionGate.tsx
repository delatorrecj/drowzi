"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { createPushUpRepMachine } from "@/lib/demo/core/pushUpRepStateMachine";
import {
  DEFAULT_BENT_MAX,
  DEFAULT_EXTENDED_MIN,
  DEFAULT_REP_TARGET,
} from "@/lib/demo/demoDefaults";
import { todayLocalDate } from "@/lib/demo/date";
import { leftArmFromBlazePoseLandmarks } from "@/lib/demo/pose/blazePoseToLeftArm";
import { useCameraStream } from "@/lib/demo/pose/useCameraStream";
import { usePoseLandmarker } from "@/lib/demo/pose/usePoseLandmarker";
import { recordHabitCompletion } from "@/lib/demo/storage/db";
import type { Alarm, MotionHabitConfig } from "@/lib/demo/types";

type Props = {
  alarm?: Alarm;
  onVerified?: () => void;
  standalone?: boolean;
};

export default function DemoMotionGate({ alarm, onVerified, standalone = false }: Props) {
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug") === "1" || standalone;

  const config = (alarm?.habitConfig ?? {
    configVersion: 1,
    repTarget: DEFAULT_REP_TARGET,
  }) as MotionHabitConfig;

  const [extendedMin, setExtendedMin] = useState(DEFAULT_EXTENDED_MIN);
  const [bentMax, setBentMax] = useState(DEFAULT_BENT_MAX);
  const [angle, setAngle] = useState<number | null>(null);
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState<"top" | "bottom">("top");
  const [done, setDone] = useState(false);
  const [active, setActive] = useState(false);

  const machine = useMemo(
    () =>
      createPushUpRepMachine({
        targetReps: config.repTarget,
        extendedMinDeg: extendedMin,
        bentMaxDeg: bentMax,
      }),
    [config.repTarget, extendedMin, bentMax],
  );

  const { videoRef, status: camStatus, error: camError } = useCameraStream(active);
  const { status: poseStatus, error: poseError, landmarker } = usePoseLandmarker();
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef(-1);

  const finish = useCallback(async () => {
    setDone(true);
    if (alarm) {
      await recordHabitCompletion({
        alarmId: alarm.id,
        habitType: "motion",
        success: true,
        method: "verified",
        localDate: todayLocalDate(),
      });
    }
    onVerified?.();
  }, [alarm, onVerified]);

  useEffect(() => {
    if (!active || poseStatus !== "ready" || camStatus !== "live") return;

    const loop = () => {
      const video = videoRef.current;
      const lm = landmarker.current;
      if (video && lm && video.readyState >= 2) {
        const ts = performance.now();
        if (ts !== lastTsRef.current) {
          lastTsRef.current = ts;
          const result = lm.detectForVideo(video, ts);
          const landmarks = result?.landmarks[0];
          if (landmarks) {
            if (debug) console.log("[pose]", landmarks);
            const arm = leftArmFromBlazePoseLandmarks(landmarks);
            if (arm) {
              const a = machine.elbowAngleDeg(arm);
              setAngle(Math.round(a));
              const complete = machine.feedLandmarks(arm);
              const snap = machine.snapshot();
              setReps(snap.reps);
              setPhase(snap.phase);
              if (complete && !done) void finish();
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, poseStatus, camStatus, landmarker, machine, debug, done, finish, videoRef]);

  const simulateRep = () => {
    machine.feedElbowAngleDeg(170);
    machine.feedElbowAngleDeg(75);
    machine.feedElbowAngleDeg(165);
    const snap = machine.snapshot();
    setReps(snap.reps);
    setPhase(snap.phase);
    if (snap.reps >= config.repTarget && !done) void finish();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#F4C430]">Motion gate</h1>
        <p className="mt-2 font-body text-[#9A7A50]">
          Do {config.repTarget} push-ups. Camera counts reps from your elbow angle.
        </p>
      </div>

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#4A3015] bg-black">
        <video
          ref={videoRef}
          className="h-full w-full scale-x-[-1] object-cover"
          playsInline
          muted
        />
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <button
              type="button"
              onClick={() => setActive(true)}
              className="rounded-xl bg-[#F4C430] px-6 py-3 font-display font-bold text-[#654321]"
            >
              Start camera
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#4A3015] bg-[#2E1F0A] p-5 text-center">
        <p className="font-display text-5xl font-extrabold text-[#F4C430]">
          {reps} / {config.repTarget}
        </p>
        <p className="mt-2 font-body text-sm text-[#9A7A50]">
          Elbow: {angle ?? "—"}° · Phase: {phase}
        </p>
        <p className="mt-1 font-body text-xs text-[#9A7A50]">
          Pose: {poseStatus} · Camera: {camStatus}
        </p>
      </div>

      {(camError || poseError) && (
        <p className="text-sm text-[#E63946]">{camError ?? poseError}</p>
      )}

      {done && (
        <p className="rounded-xl bg-[#F4C430]/20 px-4 py-3 text-center font-display font-bold text-[#F4C430]">
          Habit verified!
        </p>
      )}

      {debug && (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#4A3015] p-4">
          <label className="flex flex-col gap-1 font-body text-sm">
            Extended min (°)
            <input
              type="range"
              min={140}
              max={175}
              value={extendedMin}
              onChange={(e) => setExtendedMin(Number(e.target.value))}
            />
            {extendedMin}
          </label>
          <label className="flex flex-col gap-1 font-body text-sm">
            Bent max (°)
            <input
              type="range"
              min={60}
              max={110}
              value={bentMax}
              onChange={(e) => setBentMax(Number(e.target.value))}
            />
            {bentMax}
          </label>
          <button
            type="button"
            onClick={simulateRep}
            className="rounded-lg border border-[#4A3015] py-2 font-body text-sm"
          >
            Simulate one rep
          </button>
        </div>
      )}
    </div>
  );
}
