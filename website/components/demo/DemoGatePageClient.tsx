"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import DemoGateRouter from "@/components/demo/DemoGateRouter";
import { playAlarmSound } from "@/lib/demo/alarm/scheduleAlarm";
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
    return <p className="font-body text-[#9A7A50]">Loading…</p>;
  }

  if (!alarmId || !alarm) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-body text-[#9A7A50]">No alarm selected.</p>
        <Link href="/demo" className="font-display font-bold text-[#F4C430]">
          Back to demo hub
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {fired && (
        <p className="rounded-xl bg-[#E63946]/20 px-4 py-3 font-display font-bold text-[#E63946]">
          Wake up! Complete your habit to stop the alarm.
        </p>
      )}
      <DemoGateRouter alarm={alarm} />
    </div>
  );
}
