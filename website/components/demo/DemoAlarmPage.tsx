"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  playAlarmSound,
  scheduleAlarmInPage,
  scheduleAlarmInServiceWorker,
} from "@/lib/demo/alarm/scheduleAlarm";
import { DEMO_ALARMS } from "@/lib/demo/demoDefaults";
import { ensureDemoSeed, saveAlarm } from "@/lib/demo/storage/db";

export default function DemoAlarmPage() {
  const [seconds, setSeconds] = useState(10);
  const [armed, setArmed] = useState(false);
  const [fired, setFired] = useState(false);
  const stopSoundRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    void ensureDemoSeed();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handler = (ev: MessageEvent) => {
      if (ev.data?.type === "ALARM_FIRE") {
        setFired(true);
        stopSoundRef.current = playAlarmSound();
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  const arm = async () => {
    const alarm = DEMO_ALARMS[0];
    await saveAlarm(alarm);
    const fireAt = Date.now() + seconds * 1000;
    setArmed(true);
    setFired(false);
    await scheduleAlarmInServiceWorker(alarm.id, fireAt);
    scheduleAlarmInPage(fireAt, () => {
      setFired(true);
      stopSoundRef.current = playAlarmSound();
    });
  };

  const dismiss = () => {
    stopSoundRef.current?.();
    stopSoundRef.current = null;
    setFired(false);
    setArmed(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#F4C430]">Alarm demo</h1>
        <p className="mt-2 font-body text-[#9A7A50]">
          Schedule a one-shot alarm. On Android Chrome, background tabs may still fire via the service
          worker.
        </p>
      </div>

      <div className="rounded-2xl border border-[#4A3015] bg-[#2E1F0A] p-4 font-body text-sm text-[#9A7A50]">
        <strong className="text-[#F4C430]">Platform note:</strong> iOS Safari limits background
        alarms. Keep the tab open or add to Home Screen for best results.
      </div>

      <label className="flex flex-col gap-2 font-body text-sm">
        Fire in (seconds)
        <input
          type="number"
          min={5}
          max={120}
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
          className="rounded-lg border border-[#4A3015] bg-[#1A1209] px-3 py-2"
        />
      </label>

      <button
        type="button"
        disabled={armed}
        onClick={() => void arm()}
        className="rounded-xl bg-[#F4C430] py-3 font-display font-bold text-[#654321] disabled:opacity-50"
      >
        {armed ? `Armed — fires in ${seconds}s` : "Arm alarm"}
      </button>

      {fired && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E63946] bg-[#E63946]/10 p-5">
          <p className="font-display text-xl font-bold text-[#E63946]">Alarm ringing!</p>
          <Link
            href={`/demo/gate?alarmId=${DEMO_ALARMS[0].id}&fired=1`}
            className="rounded-xl bg-[#E63946] py-3 text-center font-display font-bold text-white"
          >
            Open habit gate
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border border-[#4A3015] py-2 font-body text-sm"
          >
            Stop sound (dev)
          </button>
        </div>
      )}
    </div>
  );
}
