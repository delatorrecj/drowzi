"use client";

import { useState } from "react";

import { DEMO_VOICE_PASSAGE } from "@/lib/demo/demoDefaults";
import { todayLocalDate } from "@/lib/demo/date";
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#F4C430]">Voice gate</h1>
        <p className="mt-2 font-body text-[#9A7A50]">Read this passage aloud clearly:</p>
      </div>

      <blockquote className="rounded-2xl border border-[#4A3015] bg-[#2E1F0A] p-6 font-body text-lg leading-relaxed text-[#F5E6C8]">
        {passage}
      </blockquote>

      {!supported && (
        <p className="text-sm text-[#E63946]">
          Speech recognition is not available in this browser. Try Chrome on Android or Safari on iOS.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={!supported || listening}
          onClick={start}
          className="flex-1 rounded-xl bg-[#F4C430] py-3 font-display font-bold text-[#654321] disabled:opacity-50"
        >
          {listening ? "Listening…" : "Start listening"}
        </button>
        <button
          type="button"
          onClick={stop}
          className="rounded-xl border border-[#4A3015] px-4 py-3 font-body text-sm"
        >
          Stop
        </button>
      </div>

      {transcript && (
        <p className="font-body text-sm text-[#9A7A50]">
          Heard: <span className="text-[#F5E6C8]">{transcript}</span>
        </p>
      )}

      {error && <p className="text-sm text-[#E63946]">{error}</p>}

      {matched && !done && (
        <button
          type="button"
          onClick={() => void handleVerify()}
          className="rounded-xl bg-[#E63946] py-3 font-display font-bold text-white"
        >
          Confirm verification
        </button>
      )}

      {done && (
        <p className="rounded-xl bg-[#F4C430]/20 px-4 py-3 text-center font-display font-bold text-[#F4C430]">
          Voice verified!
        </p>
      )}
    </div>
  );
}
