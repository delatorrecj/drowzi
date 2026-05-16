"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import DemoGateRouter from "@/components/demo/DemoGateRouter";
import { playAlarmSound } from "@/lib/demo/alarm/scheduleAlarm";
import { demoTheme } from "@/lib/demo/demoTheme";
import { ensureDemoSeed, getAlarm } from "@/lib/demo/storage/db";
import type { Alarm } from "@/lib/demo/types";

export default function DemoGatePageClient() {
  const searchParams = useSearchParams();
  const alarmId = searchParams.get("alarmId");
  const fired = searchParams.get("fired") === "1";

  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void ensureDemoSeed().then(async () => {
      if (!alarmId) {
        setLoading(false);
        return;
      }
      const a = await getAlarm(alarmId);
      setAlarm(a ?? null);
      setLoading(false);
    });
  }, [alarmId]);

  useEffect(() => {
    if (!fired) return;
    const stop = playAlarmSound();
    return () => stop();
  }, [fired]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="font-body text-sm text-text-muted">Loading…</p>
      </div>
    );
  }

  if (!alarmId || !alarm) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="font-body text-sm text-text-muted">No alarm selected.</p>
        <Link href="/demo" className="font-display text-sm font-bold text-primary">
          Back to demo hub
        </Link>
      </div>
    );
  }

  if (fired) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col bg-[#F4C430] text-[#654321]">
        <div className="flex shrink-0 items-start justify-between gap-2 px-4 pb-2 pt-3">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wider opacity-85">
              Wake habit
            </p>
            <p className="font-display text-5xl font-extrabold leading-none">{alarm.time}</p>
            <p className="mt-1 font-body text-xs font-semibold opacity-80">
              {alarm.habitType} · alarm ringing
            </p>
          </div>
          <div className="relative h-20 w-20 shrink-0">
            <Image
              src="/images/mascot/mascot-excited.png"
              alt=""
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
        </div>

        <div
          className="mx-4 mb-2 shrink-0 rounded-xl px-4 py-3 text-center font-display text-sm font-extrabold uppercase tracking-wide text-white animate-alarm-pulse"
          style={{ backgroundColor: demoTheme.alarm }}
        >
          Complete your habit to stop the alarm
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-t-3xl bg-bg">
          <DemoGateRouter alarm={alarm} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <DemoGateRouter alarm={alarm} />
    </div>
  );
}
