"use client";

import { useMemo, useState } from "react";

import { DEMO_VOICE_PASSAGE } from "@/lib/demo/demoDefaults";
import { todayLocalDate } from "@/lib/demo/date";
import { demoTheme } from "@/lib/demo/demoTheme";
import { passageMatches, useSpeechRecognition } from "@/lib/demo/speech/useSpeechRecognition";
import { recordHabitCompletion } from "@/lib/demo/storage/db";
import type { Alarm, VoiceHabitConfig } from "@/lib/demo/types";

type Props = {
  alarm?: Alarm;
  onVerified?: () => void;
};

export default function DemoVoiceGate({ alarm, onVerified }: Props) {
  const passage =
    (alarm?.habitConfig as VoiceHabitConfig | undefined)?.passageText ?? DEMO_VOICE_PASSAGE;

  const { supported, listening, transcript, error, start, stop } = useSpeechRecognition();
  const [done, setDone] = useState(false);

  const matched = passageMatches(transcript, passage);
  const matchPct = useMemo(() => {
    if (!transcript.trim()) return 0;
    return matched ? 100 : Math.min(85, Math.round((transcript.length / passage.length) * 100));
  }, [transcript, passage, matched]);

  const handleVerify = async () => {
    if (!matched) return;
    setDone(true);
    if (alarm) {
      await recordHabitCompletion({
        alarmId: alarm.id,
        habitType: "voice",
        success: true,
        method: "verified",
        localDate: todayLocalDate(),
      });
    }
    onVerified?.();
  };

  const bars = 14;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-bg">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-4 py-6">
        <div className="flex h-16 items-end justify-center gap-0.5">
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-primary ${listening ? "animate-waveform-bar" : "opacity-40"}`}
              style={{
                height: `${28 + ((i * 7) % 24)}%`,
                animationDelay: `${(i % 5) * 0.12}s`,
              }}
            />
          ))}
        </div>

        <blockquote
          className="w-full rounded-2xl border p-4 font-body text-sm leading-relaxed text-text"
          style={{ borderColor: demoTheme.border, backgroundColor: demoTheme.surface }}
        >
          &ldquo;{passage}&rdquo;
        </blockquote>

        {!supported && (
          <p className="text-center text-xs text-alarm">
            Speech recognition is not available in this browser. Try Chrome on Android or Safari on
            iOS.
          </p>
        )}

        <div className="flex w-full gap-2">
          <button
            type="button"
            disabled={!supported || listening}
            onClick={start}
            className="flex-1 rounded-xl py-3 font-display text-sm font-bold disabled:opacity-50"
            style={{ backgroundColor: demoTheme.primary, color: demoTheme.textOnPrimary }}
          >
            {listening ? "Listening…" : "Start listening"}
          </button>
          <button
            type="button"
            onClick={stop}
            className="rounded-xl border px-4 py-3 font-body text-xs text-text-muted"
            style={{ borderColor: demoTheme.border }}
          >
            Stop
          </button>
        </div>

        {transcript && (
          <p className="w-full font-body text-xs text-text-muted">
            Heard: <span className="text-text">{transcript}</span>
          </p>
        )}

        {error && <p className="text-xs text-alarm">{error}</p>}

        {matched && !done && (
          <button
            type="button"
            onClick={() => void handleVerify()}
            className="w-full rounded-xl py-3 font-display text-sm font-bold text-white"
            style={{ backgroundColor: demoTheme.alarm }}
          >
            Confirm verification
          </button>
        )}

        {done && (
          <p className="w-full rounded-xl bg-primary/20 px-4 py-3 text-center font-display text-sm font-bold text-primary">
            Voice verified!
          </p>
        )}
      </div>

      <div
        className="shrink-0 border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{ borderColor: demoTheme.border, backgroundColor: "#0F0A05" }}
      >
        <p className="font-display text-sm font-bold text-text">Read aloud to dismiss</p>
        <p className="mt-0.5 font-body text-[10px] text-text-muted">
          Voice gate · {matchPct}% matched
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${matchPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
