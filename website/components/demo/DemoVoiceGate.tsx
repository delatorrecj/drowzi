"use client";

import { useMemo, useState } from "react";

import { DEMO_VOICE_PASSAGE } from "@/lib/demo/demoDefaults";
import { demoTheme } from "@/lib/demo/demoTheme";
import { useDemoGateCompletion } from "@/lib/demo/hooks/useDemoGateCompletion";
import { passageMatches, useSpeechRecognition } from "@/lib/demo/speech/useSpeechRecognition";
import type { Alarm, VoiceHabitConfig } from "@/lib/demo/types";

type Props = {
  alarm?: Alarm;
  onVerified?: () => void;
};

export default function DemoVoiceGate({ alarm, onVerified }: Props) {
  const initialPassage =
    (alarm?.habitConfig as VoiceHabitConfig | undefined)?.passageText ?? DEMO_VOICE_PASSAGE;

  const [passage, setPassage] = useState(initialPassage);
  const [generating, setGenerating] = useState(false);
  const [aiChecking, setAiChecking] = useState(false);
  const [aiReason, setAiReason] = useState<string | null>(null);

  const { supported, listening, transcript, error, start, stop } = useSpeechRecognition();
  const { done, finish: complete } = useDemoGateCompletion(alarm, "voice", onVerified);

  const newPassage = async () => {
    setGenerating(true);
    setAiReason(null);
    try {
      const r = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });
      if (r.ok) {
        const { passage: p } = await r.json();
        if (p) setPassage(p);
      }
    } catch {
      /* keep current passage */
    } finally {
      setGenerating(false);
    }
  };

  const matched = passageMatches(transcript, passage);
  const matchPct = useMemo(() => {
    if (!transcript.trim()) return 0;
    return matched ? 100 : Math.min(85, Math.round((transcript.length / passage.length) * 100));
  }, [transcript, passage, matched]);

  const handleVerify = async () => {
    if (!matched) return;
    await complete();
  };

  // Fallback when exact match fails: let the LLM judge if it's close enough.
  const checkWithAi = async () => {
    setAiChecking(true);
    setAiReason(null);
    try {
      const r = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "grade", passage, transcript }),
      });
      const { pass, reason } = await r.json();
      if (pass) await complete();
      else setAiReason(reason || "Not quite — try reading it again.");
    } catch {
      setAiReason("Could not reach the grader.");
    } finally {
      setAiChecking(false);
    }
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

        <button
          type="button"
          disabled={generating || listening}
          onClick={() => void newPassage()}
          className="self-start rounded-lg border px-3 py-1.5 font-body text-xs text-text-muted disabled:opacity-50"
          style={{ borderColor: demoTheme.border }}
        >
          {generating ? "Generating…" : "✨ New passage"}
        </button>

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

        {!matched && !done && transcript.trim().length > 8 && (
          <button
            type="button"
            disabled={aiChecking}
            onClick={() => void checkWithAi()}
            className="w-full rounded-xl border py-3 font-display text-sm font-bold text-text disabled:opacity-50"
            style={{ borderColor: demoTheme.primary }}
          >
            {aiChecking ? "Checking…" : "Close enough? Check with AI"}
          </button>
        )}

        {aiReason && <p className="w-full text-xs text-text-muted">{aiReason}</p>}

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
