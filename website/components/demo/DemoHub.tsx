"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteIcon, type SiteIconName } from "@/components/SiteIcons";
import { COPY } from "@/lib/constants";
import { DEFAULT_REP_TARGET, DEMO_ALARMS } from "@/lib/demo/demoDefaults";
import { demoTheme } from "@/lib/demo/demoTheme";
import { ensureDemoSeed, getConsecutiveDayStreak } from "@/lib/demo/storage/db";

const GATES: {
  href: string;
  title: string;
  desc: string;
  icon: SiteIconName;
  meta: string;
}[] = [
  {
    href: "/demo/motion",
    title: "Motion gate",
    desc: "Camera counts push-up reps",
    icon: "motion",
    meta: `${DEFAULT_REP_TARGET} reps`,
  },
  {
    href: "/demo/barcode",
    title: "Barcode gate",
    desc: "Scan a registered item",
    icon: "barcode",
    meta: "Walk & scan",
  },
  {
    href: "/demo/voice",
    title: "Voice gate",
    desc: "Read your passage aloud",
    icon: "voice",
    meta: "Speech match",
  },
  {
    href: "/demo/alarm",
    title: "Alarm tester",
    desc: "Schedule a one-shot web alarm",
    icon: "alarm-bell",
    meta: "Service worker",
  },
];

export default function DemoHub() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    void ensureDemoSeed().then(() => getConsecutiveDayStreak().then(setStreak));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-wider text-text-muted">
          Web demo
        </p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-text">{COPY.demo.hubTitle}</h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-text-muted">
          {COPY.demo.permissionsNote}
        </p>
      </div>

      {streak > 0 && (
        <div
          className="flex items-center gap-3 rounded-2xl border px-4 py-3"
          style={{ borderColor: demoTheme.border, backgroundColor: demoTheme.surface }}
        >
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/images/mascot/mascot-excited.png"
              alt=""
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-primary">{streak}</p>
            <p className="font-body text-xs font-medium uppercase tracking-wide text-text-muted">
              Day streak
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold text-text">Habit gates</h3>
        </div>
        {GATES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-primary"
            style={{ borderColor: demoTheme.border, backgroundColor: demoTheme.surface }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg"
              style={{ border: `1px solid ${demoTheme.border}` }}
            >
              <SiteIcon name={g.icon} className="h-6 w-6" stroke={demoTheme.primary} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-bold text-text">{g.title}</span>
                <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-display text-[10px] font-bold text-primary">
                  {g.meta}
                </span>
              </span>
              <span className="mt-0.5 block font-body text-sm text-text-muted">{g.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <div
        className="rounded-2xl border border-dashed p-4"
        style={{ borderColor: demoTheme.border }}
      >
        <h3 className="font-display text-sm font-extrabold text-text">End-to-end wake-up</h3>
        <p className="mt-1 font-body text-sm text-text-muted">
          Alarm fires → complete your habit gate to dismiss.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ALARMS.map((a) => (
            <Link
              key={a.id}
              href={`/demo/gate?alarmId=${encodeURIComponent(a.id)}`}
              className="rounded-xl px-3 py-2 font-display text-xs font-bold"
              style={{ backgroundColor: demoTheme.primary, color: demoTheme.textOnPrimary }}
            >
              {a.habitType} gate
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/demo/motion?debug=1"
        className="font-body text-xs text-text-muted underline underline-offset-2"
      >
        Developer: motion tuning (?debug=1)
      </Link>
    </div>
  );
}
