"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import DemoMascot, { type DemoMascotMood } from "@/components/demo/DemoMascot";
import { SiteIcon, type SiteIconName } from "@/components/SiteIcons";
import { DEFAULT_REP_TARGET, DEMO_ALARMS } from "@/lib/demo/demoDefaults";
import { demoTheme } from "@/lib/demo/demoTheme";
import { getDemoDisplayName, resetDemoOnboarding } from "@/lib/demo/onboardingStorage";
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
    title: "Schedule alarm",
    desc: "One-shot web notification test",
    icon: "alarm-bell",
    meta: "On-device",
  },
];

type DemoDashboardProps = {
  onRestartOnboarding: () => void;
};

function mascotMoodFromStreak(streak: number): DemoMascotMood {
  if (streak >= 30) return "pumped";
  if (streak >= 14) return "thinking2";
  if (streak >= 7) return "excited";
  return "idle";
}

export default function DemoDashboard({ onRestartOnboarding }: DemoDashboardProps) {
  const [streak, setStreak] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    setName(getDemoDisplayName());
    void ensureDemoSeed().then(() => getConsecutiveDayStreak().then(setStreak));
  }, []);

  const mood = mascotMoodFromStreak(streak);
  const greeting = name ? `Morning, ${name}` : "Morning accountability";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6">
      <div className="flex flex-col gap-4 pb-4">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-wider text-text-muted">
            Your accountability hub
          </p>
          <h2 className="mt-1 font-display text-[1.35rem] font-extrabold leading-tight text-text">{greeting}</h2>
        </div>

        <DemoMascot mood={mood} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard value={streak} label="Day streak" />
          <StatCard value={DEMO_ALARMS.length} label="Alarms" />
        </div>
      </div>

      <section className="space-y-3 pb-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold text-text">Alarms</h3>
          <span
            className="rounded-full border px-3 py-1 font-display text-xs font-bold"
            style={{ borderColor: demoTheme.primary, color: demoTheme.primary }}
          >
            + Add
          </span>
        </div>
        {DEMO_ALARMS.map((alarm) => (
          <div
            key={alarm.id}
            className="rounded-2xl border p-4"
            style={{ borderColor: demoTheme.border, backgroundColor: demoTheme.surface }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-3xl font-extrabold tracking-tight text-text">{alarm.time}</span>
              <span className="rounded-lg border px-2 py-0.5 font-display text-[10px] font-bold uppercase text-primary"
                style={{ borderColor: demoTheme.primary, backgroundColor: "rgba(244,196,48,0.12)" }}
              >
                {alarm.habitType}
              </span>
            </div>
            <p className="mt-1 font-body text-xs text-text-muted capitalize">{alarm.recurrence.type} · next ring tomorrow</p>
            <Link
              href={`/demo/gate?alarmId=${encodeURIComponent(alarm.id)}`}
              className="mt-3 inline-flex rounded-xl px-4 py-2 font-display text-xs font-extrabold"
              style={{ backgroundColor: demoTheme.primary, color: demoTheme.textOnPrimary }}
            >
              Simulate alarm
            </Link>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-extrabold text-text">Practice habit gates</h3>
        <p className="font-body text-xs leading-relaxed text-text-muted">
          Try each verification mode in your browser. Camera and mic stay on your device.
        </p>
        {GATES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="flex items-center gap-3 rounded-2xl border p-3.5 transition-colors hover:border-primary"
            style={{ borderColor: demoTheme.border, backgroundColor: demoTheme.surface }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg"
              style={{ border: `1px solid ${demoTheme.border}` }}
            >
              <SiteIcon name={g.icon} className="h-5 w-5" stroke={demoTheme.primary} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-text">{g.title}</span>
                <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-display text-[9px] font-bold text-primary">
                  {g.meta}
                </span>
              </span>
              <span className="mt-0.5 block font-body text-xs text-text-muted">{g.desc}</span>
            </span>
          </Link>
        ))}
      </section>

      <button
        type="button"
        className="mt-6 w-full py-2 font-body text-[11px] text-text-muted underline underline-offset-2"
        onClick={() => {
          resetDemoOnboarding();
          onRestartOnboarding();
        }}
      >
        Replay onboarding
      </button>
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl border py-3"
      style={{ borderColor: demoTheme.border, backgroundColor: demoTheme.surface }}
    >
      <span className="font-display text-3xl font-extrabold text-primary">{value}</span>
      <span className="font-display text-[10px] font-bold uppercase tracking-wide text-text-muted">{label}</span>
    </div>
  );
}
