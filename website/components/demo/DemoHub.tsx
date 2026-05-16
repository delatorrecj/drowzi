"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { COPY, SITE } from "@/lib/constants";
import { DEMO_ALARMS } from "@/lib/demo/demoDefaults";
import { ensureDemoSeed, getConsecutiveDayStreak } from "@/lib/demo/storage/db";

const GATES = [
  { href: "/demo/motion", title: "Motion gate", desc: "Push-up rep counter with pose detection" },
  { href: "/demo/barcode", title: "Barcode gate", desc: "Scan a registered item to dismiss" },
  { href: "/demo/voice", title: "Voice gate", desc: "Read a passage aloud to verify" },
  { href: "/demo/alarm", title: "Alarm tester", desc: "Schedule a one-shot web alarm" },
] as const;

export default function DemoHub() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    void ensureDemoSeed().then(() => getConsecutiveDayStreak().then(setStreak));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl font-extrabold text-[#F4C430]">{COPY.demo.hubTitle}</h1>
        <p className="mt-3 font-body text-lg text-[#9A7A50]">{COPY.demo.permissionsNote}</p>
        {streak > 0 && (
          <p className="mt-2 font-display text-sm font-bold text-[#F4C430]">
            Current streak: {streak} day{streak === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {GATES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="block rounded-2xl border border-[#4A3015] bg-[#2E1F0A] p-6 transition-colors hover:border-[#F4C430]"
          >
            <h2 className="font-display text-xl font-bold text-[#F5E6C8]">{g.title}</h2>
            <p className="mt-1 font-body text-sm text-[#9A7A50]">{g.desc}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-[#4A3015] p-5">
        <h3 className="font-display font-bold text-[#F5E6C8]">End-to-end wake-up</h3>
        <p className="mt-2 font-body text-sm text-[#9A7A50]">
          Simulate the full flow: alarm fires → complete your habit gate.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {DEMO_ALARMS.map((a) => (
            <Link
              key={a.id}
              href={`/demo/gate?alarmId=${encodeURIComponent(a.id)}`}
              className="rounded-xl bg-[#F4C430] px-4 py-2 font-display text-sm font-bold text-[#654321]"
            >
              {a.habitType} gate
            </Link>
          ))}
        </div>
      </div>

      <Link href={SITE.demoUrl + "/motion?debug=1"} className="font-body text-xs text-[#9A7A50] underline">
        Developer: motion tuning (?debug=1)
      </Link>
    </div>
  );
}
