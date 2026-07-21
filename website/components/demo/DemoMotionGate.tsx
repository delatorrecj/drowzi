"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SiteIcon } from "@/components/SiteIcons";
import { createPushUpRepMachine } from "@/lib/demo/core/pushUpRepStateMachine";
import { createSquatRepMachine } from "@/lib/demo/core/squatRepStateMachine";
import type { LegChains, PosePoint } from "@/lib/demo/core/poseTypes";
import {
  DEFAULT_BENT_MAX,
  DEFAULT_EXTENDED_MIN,
  DEFAULT_REP_TARGET,
} from "@/lib/demo/demoDefaults";
import { demoTheme } from "@/lib/demo/demoTheme";
import { useDemoGateCompletion } from "@/lib/demo/hooks/useDemoGateCompletion";
import { leftArmFromBlazePoseLandmarks } from "@/lib/demo/pose/blazePoseToLeftArm";
import { legsFromBlazePoseLandmarks } from "@/lib/demo/pose/blazePoseToLegs";
import { useCameraStream } from "@/lib/demo/pose/useCameraStream";
import { usePoseLandmarker } from "@/lib/demo/pose/usePoseLandmarker";
import type { Alarm, MotionHabitConfig } from "@/lib/demo/types";

type Exercise = "pushup" | "squat";

// Squat knee-angle thresholds (calibration knobs).
const SQUAT_STAND_MIN = 160; // ponytail: tune per testing; standing knee angle
const SQUAT_DOWN_MAX = 110; // count real-depth squats, not only deep ATG

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

  const [exercise, setExercise] = useState<Exercise>("pushup");
  const [extendedMin, setExtendedMin] = useState(DEFAULT_EXTENDED_MIN);
  const [bentMax, setBentMax] = useState(DEFAULT_BENT_MAX);
  const [standMin, setStandMin] = useState(SQUAT_STAND_MIN);
  const [downMax, setDownMax] = useState(SQUAT_DOWN_MAX);
  const [angle, setAngle] = useState<number | null>(null);
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState<"top" | "bottom">("top");
  const [active, setActive] = useState(false);
  const [coachTip, setCoachTip] = useState<string | null>(null);
  const { done, finish: recordVerified } = useDemoGateCompletion(alarm, "motion", onVerified);

  const pushMachine = useMemo(
    () =>
      createPushUpRepMachine({
        targetReps: config.repTarget,
        extendedMinDeg: extendedMin,
        bentMaxDeg: bentMax,
      }),
    [config.repTarget, extendedMin, bentMax],
  );
  const squatMachine = useMemo(
    () =>
      createSquatRepMachine({
        targetReps: config.repTarget,
        standMinDeg: standMin,
        squatMaxDeg: downMax,
      }),
    [config.repTarget, standMin, downMax],
  );

  const { videoRef, status: camStatus, error: camError } = useCameraStream(active);
  const { status: poseStatus, error: poseError, landmarker } = usePoseLandmarker();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef(-1);

  const finish = useCallback(
    async (metrics: { minAngleDeg: number | null; targetAngleDeg: number }) => {
      await recordVerified();
      // Best-effort coaching line; never blocks verification.
      try {
        const r = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise,
            reps: config.repTarget,
            target: config.repTarget,
            minAngleDeg: metrics.minAngleDeg,
            targetAngleDeg: metrics.targetAngleDeg,
          }),
        });
        if (r.ok) setCoachTip((await r.json()).tip ?? null);
      } catch {
        /* offline — skip coaching */
      }
    },
    [recordVerified, exercise, config.repTarget],
  );

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
            if (exercise === "squat") {
              const legs = legsFromBlazePoseLandmarks(landmarks);
              const a = squatMachine.kneeAngleFromLegs(legs);
              if (a !== null) setAngle(Math.round(a));
              const complete = squatMachine.feedLegs(legs, ts);
              const snap = squatMachine.snapshot();
              setReps(snap.reps);
              setPhase(snap.phase === "squat" ? "bottom" : "top");
              if (complete && !done)
                void finish({ minAngleDeg: snap.minAngleThisRep, targetAngleDeg: downMax });
              drawOverlay(canvasRef.current, video, [legs.left, legs.right]);
            } else {
              const arm = leftArmFromBlazePoseLandmarks(landmarks);
              if (arm) {
                const a = pushMachine.elbowAngleDeg(arm);
                setAngle(Math.round(a));
                const complete = pushMachine.feedLandmarks(arm, ts);
                const snap = pushMachine.snapshot();
                setReps(snap.reps);
                setPhase(snap.phase);
                if (complete && !done)
                  void finish({ minAngleDeg: null, targetAngleDeg: bentMax });
                drawOverlay(canvasRef.current, video, [
                  { hip: arm.leftShoulder, knee: arm.leftElbow, ankle: arm.leftWrist },
                ]);
              }
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, poseStatus, camStatus, landmarker, pushMachine, squatMachine, exercise, done, finish, videoRef, downMax, bentMax]);

  const simulateRep = () => {
    if (exercise === "squat") {
      squatMachine.feedKneeAngleDeg(170, 0);
      squatMachine.feedKneeAngleDeg(95, 500);
      squatMachine.feedKneeAngleDeg(165, 1000);
      const snap = squatMachine.snapshot();
      setReps(snap.reps);
      setPhase(snap.phase === "squat" ? "bottom" : "top");
      if (snap.reps >= config.repTarget && !done)
        void finish({ minAngleDeg: snap.minAngleThisRep, targetAngleDeg: downMax });
    } else {
      pushMachine.feedElbowAngleDeg(170);
      pushMachine.feedElbowAngleDeg(75);
      pushMachine.feedElbowAngleDeg(165);
      const snap = pushMachine.snapshot();
      setReps(snap.reps);
      setPhase(snap.phase);
      if (snap.reps >= config.repTarget && !done)
        void finish({ minAngleDeg: null, targetAngleDeg: bentMax });
    }
  };

  const progress = Math.min(100, (reps / config.repTarget) * 100);
  const label = exercise === "squat" ? "Squats" : "Push-ups";
  const jointLabel = exercise === "squat" ? "knee" : "elbow";
  const cueText =
    exercise === "squat"
      ? phase === "bottom"
        ? "Stand up"
        : "Go down"
      : phase === "bottom"
        ? "Push up"
        : "Lower down";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1]"
        />

        <Viewfinder />

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 px-6">
            <SiteIcon name="figure" className="h-14 w-14" stroke={demoTheme.primary} />
            <p className="text-center font-body text-sm text-text-muted">
              Do {config.repTarget} {exercise === "squat" ? "squats" : "push-ups"}. Camera counts
              reps from your {jointLabel} angle.
            </p>
            <div className="flex gap-2">
              {(["pushup", "squat"] as const).map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setExercise(ex)}
                  className="rounded-lg px-4 py-2 font-display text-xs font-bold"
                  style={{
                    backgroundColor: exercise === ex ? demoTheme.primary : "transparent",
                    color: exercise === ex ? demoTheme.textOnPrimary : demoTheme.textMuted,
                    border: `1px solid ${demoTheme.border}`,
                  }}
                >
                  {ex === "squat" ? "Squats" : "Push-ups"}
                </button>
              ))}
            </div>
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
              {cueText}
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
              {label} · {jointLabel} {angle ?? "—"}°
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
        {coachTip && (
          <p className="mt-3 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 font-body text-xs text-text">
            <span className="font-display font-bold text-primary">Coach: </span>
            {coachTip}
          </p>
        )}
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
          {exercise === "squat" ? (
            <>
              <label className="flex flex-col gap-1 font-body text-xs text-text-muted">
                Stand min (°)
                <input
                  type="range"
                  min={140}
                  max={175}
                  value={standMin}
                  onChange={(e) => setStandMin(Number(e.target.value))}
                />
                {standMin}
              </label>
              <label className="flex flex-col gap-1 font-body text-xs text-text-muted">
                Squat depth max (°)
                <input
                  type="range"
                  min={80}
                  max={130}
                  value={downMax}
                  onChange={(e) => setDownMax(Number(e.target.value))}
                />
                {downMax}
              </label>
            </>
          ) : (
            <>
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
            </>
          )}
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

type OverlayChain = { hip: PosePoint; knee: PosePoint; ankle: PosePoint } | null;

/** Draw active hip-knee-ankle (or shoulder-elbow-wrist) chains green over video. */
function drawOverlay(
  canvas: HTMLCanvasElement | null,
  video: HTMLVideoElement,
  chains: OverlayChain[],
) {
  if (!canvas) return;
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  if (canvas.width !== cw) canvas.width = cw;
  if (canvas.height !== ch) canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, cw, ch);

  // Map normalized (0..1) landmarks through the video's object-cover transform.
  const vw = video.videoWidth || cw;
  const vh = video.videoHeight || ch;
  const scale = Math.max(cw / vw, ch / vh);
  const dispW = vw * scale;
  const dispH = vh * scale;
  const offX = (cw - dispW) / 2;
  const offY = (ch - dispH) / 2;
  const px = (x: number) => offX + x * dispW;
  const py = (y: number) => offY + y * dispH;

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#3BE37A";
  ctx.fillStyle = "#3BE37A";
  for (const chain of chains) {
    if (!chain) continue;
    const pts = [chain.hip, chain.knee, chain.ankle];
    ctx.beginPath();
    ctx.moveTo(px(pts[0].x), py(pts[0].y));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(px(pts[i].x), py(pts[i].y));
    ctx.stroke();
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(px(p.x), py(p.y), 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
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
