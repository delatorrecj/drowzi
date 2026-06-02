"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  playAlarmSound,
  scheduleAlarmInPage,
  scheduleAlarmInServiceWorker,
} from "@/lib/demo/alarm/scheduleAlarm";
import { DEMO_ALARMS } from "@/lib/demo/demoDefaults";
import { demoTheme } from "@/lib/demo/demoTheme";
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
    <div className="flex flex-col gap-5">
      <p className="font-body text-sm leading-relaxed text-text-muted">
        Schedule a one-shot alarm. On Android Chrome, background tabs may still fire via the service
        worker.
      </p>

      <div
        className="rounded-2xl border p-4 font-body text-sm text-text-muted"
        style={{ borderColor: demoTheme.border, backgroundColor: demoTheme.surface }}
      >
        <strong className="text-primary">Platform note:</strong> iOS Safari limits background alarms.
        Keep the tab open or add to Home Screen for best results.
      </div>

      <label className="flex flex-col gap-2 font-body text-sm text-text-muted">
        Fire in (seconds)
        <input
          type="number"
          min={5}
          max={120}
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
          className="rounded-lg border bg-bg px-3 py-2 text-text"
          style={{ borderColor: demoTheme.border }}
        />
      </label>

      <button
        type="button"
        disabled={armed}
        onClick={() => void arm()}
        className="rounded-xl py-3 font-display text-sm font-bold disabled:opacity-50"
        style={{ backgroundColor: demoTheme.primary, color: demoTheme.textOnPrimary }}
      >
        {armed ? `Armed — fires in ${seconds}s` : "Arm alarm"}
      </button>

      {fired && (
        <div
          className="flex flex-col gap-3 rounded-2xl border p-5 animate-alarm-glow"
          style={{ borderColor: demoTheme.alarm, backgroundColor: `${demoTheme.alarm}18` }}
        >
          <p className="font-display text-xl font-extrabold text-alarm">Alarm ringing!</p>
          <Link
            href={`/demo/gate?alarmId=${DEMO_ALARMS[0].id}&fired=1`}
            className="rounded-xl py-3 text-center font-display text-sm font-bold text-white"
            style={{ backgroundColor: demoTheme.alarm }}
          >
            Open habit gate
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border py-2 font-body text-xs text-text-muted"
            style={{ borderColor: demoTheme.border }}
          >
            Stop sound (dev)
          </button>
        </div>
      )}
    </div>
  );
}
