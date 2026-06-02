"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SiteIcon } from "@/components/SiteIcons";
import { createPushUpRepMachine } from "@/lib/demo/core/pushUpRepStateMachine";
import {
  DEFAULT_BENT_MAX,
  DEFAULT_EXTENDED_MIN,
  DEFAULT_REP_TARGET,
} from "@/lib/demo/demoDefaults";
import { todayLocalDate } from "@/lib/demo/date";
import { demoTheme } from "@/lib/demo/demoTheme";
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

  const progress = Math.min(100, (reps / config.repTarget) * 100);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
          playsInline
          muted
        />

        <Viewfinder />

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 px-6">
            <SiteIcon name="figure" className="h-14 w-14" stroke={demoTheme.primary} />
            <p className="text-center font-body text-sm text-text-muted">
              Do {config.repTarget} push-ups. Camera counts reps from your elbow angle.
            </p>
            <button
              type="button"
              onClick={() => setActive(true)}
              className="rounded-xl px-6 py-3 font-display text-sm font-bold"
              style={{ backgroundColor: demoTheme.primary, color: demoTheme.textOnPrimary }}
            >
              Start camera
            </button>
          </div>
        )}

        {active && (
          <div className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2">
            <p className="rounded-full bg-primary/20 px-3 py-1 font-display text-[10px] font-bold text-primary">
              {phase === "bottom" ? "Push up" : "Lower down"}
            </p>
          </div>
        )}
      </div>

      <div
        className="shrink-0 border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{
          borderColor: demoTheme.border,
          background: "linear-gradient(180deg, #0F0A05 0%, #1A1209 100%)",
        }}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-4xl font-extrabold text-text">
              {reps}
              <span className="text-primary">/{config.repTarget}</span>
            </p>
            <p className="mt-1 font-body text-xs text-text-muted">
              Push-ups · elbow {angle ?? "—"}°
            </p>
          </div>
          {done && (
            <p className="rounded-lg bg-primary/20 px-3 py-1.5 font-display text-xs font-bold text-primary">
              Verified
            </p>
          )}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 font-body text-[10px] text-text-muted">
          Pose: {poseStatus} · Camera: {camStatus}
        </p>
      </div>

      {(camError || poseError) && (
        <p className="shrink-0 px-4 pb-2 text-center text-xs text-alarm">{camError ?? poseError}</p>
      )}

      {debug && (
        <div
          className="shrink-0 flex flex-col gap-3 border-t px-4 py-3"
          style={{ borderColor: demoTheme.border }}
        >
          <label className="flex flex-col gap-1 font-body text-xs text-text-muted">
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
          <label className="flex flex-col gap-1 font-body text-xs text-text-muted">
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
            className="rounded-lg border py-2 font-body text-xs text-text-muted"
            style={{ borderColor: demoTheme.border }}
          >
            Simulate one rep
          </button>
        </div>
      )}
    </div>
  );
}

function Viewfinder() {
  return (
    <div className="pointer-events-none absolute inset-8">
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute h-5 w-5 border-2 border-primary ${
            pos === "tl"
              ? "left-0 top-0 border-b-0 border-r-0 rounded-tl-md"
              : pos === "tr"
                ? "right-0 top-0 border-b-0 border-l-0 rounded-tr-md"
                : pos === "bl"
                  ? "bottom-0 left-0 border-r-0 border-t-0 rounded-bl-md"
                  : "bottom-0 right-0 border-l-0 border-t-0 rounded-br-md"
          }`}
        />
      ))}
    </div>
  );
}
