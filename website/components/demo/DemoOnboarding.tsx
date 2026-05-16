"use client";

import { useEffect, useState } from "react";

import DemoMascot, { type DemoMascotMood } from "@/components/demo/DemoMascot";
import { demoTheme } from "@/lib/demo/demoTheme";
import {
  clearDemoOnboardingStep,
  getDemoOnboardingStep,
  setDemoDisplayName,
  setDemoOnboardingComplete,
  setDemoOnboardingStep,
} from "@/lib/demo/onboardingStorage";

type Tone = "supportive" | "challenger";
type RootCause = "physical" | "mental" | "environmental";

type DemoOnboardingProps = {
  onComplete: () => void;
};

const STEP_MASCOT: DemoMascotMood[] = ["thinking", "surprised", "thinking", "excited", "thinking2"];

export default function DemoOnboarding({ onComplete }: DemoOnboardingProps) {
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState<Tone>("challenger");
  const [rootCause, setRootCause] = useState<RootCause>("physical");
  const [nameInput, setNameInput] = useState("");
  const [timeInput, setTimeInput] = useState("06:30");
  const [repInput, setRepInput] = useState("10");

  useEffect(() => {
    setStep(getDemoOnboardingStep());
  }, []);

  function persistStep(next: number) {
    setStep(next);
    setDemoOnboardingStep(next);
  }

  function goBack() {
    persistStep(Math.max(0, step - 1));
  }

  function goNext() {
    persistStep(Math.min(4, step + 1));
  }

  function finish(skipAlarm = false) {
    void skipAlarm;
    setDemoDisplayName(nameInput || "Friend");
    clearDemoOnboardingStep();
    setDemoOnboardingComplete(true);
    onComplete();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 gap-1.5 px-4 pb-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor: i <= step ? demoTheme.primary : demoTheme.border,
              opacity: i <= step ? 1 : 0.45,
            }}
          />
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {step === 0 && (
          <StepBlock kicker="Meet Drowzi" title="Grogginess loses. Your habit wins.">
            <DemoMascot mood={STEP_MASCOT[0]} showBadge={false} />
            <p className="font-body text-sm leading-relaxed text-text-muted">
              Drowzi is the only alarm that doesn&apos;t stop until you do your habit. Verified by your
              phone&apos;s sensors — camera, mic, and motion.
            </p>
            <p className="font-body text-xs text-text-muted">Let&apos;s calibrate your experience.</p>
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock kicker="Question 1 of 3" title="How should we handle your mornings?">
            <DemoMascot mood={STEP_MASCOT[1]} showBadge={false} size="md" />
            <OptionCard
              selected={tone === "supportive"}
              title="The Supportive Companion"
              desc="Empathetic productivity. Soft animations and gentle nudges."
              onSelect={() => setTone("supportive")}
            />
            <OptionCard
              selected={tone === "challenger"}
              title="The Challenger"
              desc="The personal trainer. High-contrast UI and firm demands."
              onSelect={() => setTone("challenger")}
            />
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock kicker="Question 2 of 3" title="What keeps you in bed the longest?">
            <DemoMascot mood={STEP_MASCOT[2]} showBadge={false} size="md" />
            <OptionCard
              selected={rootCause === "physical"}
              title="Physical Heaviness"
              desc="Targets biological sleep inertia with movement."
              onSelect={() => setRootCause("physical")}
            />
            <OptionCard
              selected={rootCause === "mental"}
              title="Mental Fog"
              desc="Targets cognitive alertness with mindfulness."
              onSelect={() => setRootCause("mental")}
            />
            <OptionCard
              selected={rootCause === "environmental"}
              title={'The "One More Minute" Loop'}
              desc="Targets environmental comfort. Get out of the room!"
              onSelect={() => setRootCause("environmental")}
            />
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock kicker="Question 3 of 3" title="Let's set your first anchor">
            <DemoMascot mood={STEP_MASCOT[3]} showBadge={false} size="md" />
            <Field label="Your name" value={nameInput} onChange={setNameInput} placeholder="Alex" />
            <Field
              label="First alarm time (24h)"
              value={timeInput}
              onChange={setTimeInput}
              placeholder="06:30"
            />
            {rootCause === "physical" ? (
              <Field label="Push-up reps" value={repInput} onChange={setRepInput} placeholder="10" />
            ) : null}
            {rootCause === "mental" ? (
              <p className="font-body text-sm text-text-muted">
                You&apos;ll read a motivational passage aloud to dismiss the alarm.
              </p>
            ) : null}
            {rootCause === "environmental" ? (
              <p className="font-body text-sm text-text-muted">
                You&apos;ll scan a barcode in another room — e.g. your coffee maker.
              </p>
            ) : null}
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock kicker="Ready to start" title="Toll set.">
            <DemoMascot mood={STEP_MASCOT[4]} showBadge={false} />
            <p className="font-body text-sm leading-relaxed text-text">
              To stop tomorrow&apos;s alarm at <span className="font-bold text-primary">{timeInput}</span>,
              you must meet Drowzi and complete your habit.
            </p>
            <p className="font-body text-xs text-text-muted">
              Consistency evolves your mascot. Don&apos;t break the streak.
            </p>
          </StepBlock>
        )}
      </div>

      <div
        className="shrink-0 space-y-2 border-t px-4 py-3"
        style={{ borderColor: demoTheme.border }}
      >
        <div className="flex gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className={btnSecondary}
              style={{ borderColor: demoTheme.border }}
            >
              Back
            </button>
          ) : null}
          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className={btnPrimary}
              style={{ backgroundColor: demoTheme.primary }}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => finish()}
              className={btnPrimary}
              style={{ backgroundColor: demoTheme.primary }}
            >
              Commit to morning
            </button>
          )}
        </div>
        {step === 0 ? (
          <button type="button" onClick={() => finish(true)} className={btnGhost}>
            Skip for now
          </button>
        ) : null}
      </div>
    </div>
  );
}

function StepBlock({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-[10px] font-bold uppercase tracking-widest text-primary">{kicker}</p>
      <h2 className="font-display text-xl font-extrabold leading-tight text-text">{title}</h2>
      {children}
    </div>
  );
}

function OptionCard({
  selected,
  title,
  desc,
  onSelect,
}: {
  selected: boolean;
  title: string;
  desc: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-2xl border p-4 text-left transition-colors"
      style={{
        borderColor: selected ? demoTheme.primary : demoTheme.border,
        backgroundColor: selected ? "rgba(244, 196, 48, 0.1)" : demoTheme.surface,
      }}
    >
      <p className="font-display text-base font-extrabold text-text">{title}</p>
      <p className="mt-1 font-body text-sm leading-relaxed text-text-muted">{desc}</p>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-display text-xs font-bold uppercase tracking-wide text-text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border px-3 py-2.5 font-body text-sm text-text outline-none focus:border-primary"
        style={{ borderColor: demoTheme.border, backgroundColor: demoTheme.surface }}
      />
    </label>
  );
}

const btnPrimary =
  "flex-1 rounded-xl py-3 font-display text-sm font-extrabold text-[#654321] transition-opacity hover:opacity-90";
const btnSecondary =
  "rounded-xl border px-4 py-3 font-display text-sm font-bold text-text-muted transition-colors hover:text-primary";
const btnGhost = "w-full py-2 font-body text-xs text-text-muted underline underline-offset-2";
