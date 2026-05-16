"use client";

import { useCallback, useEffect, useState } from "react";

import DemoDashboard from "@/components/demo/DemoDashboard";
import DemoOnboarding from "@/components/demo/DemoOnboarding";
import { isDemoOnboardingComplete } from "@/lib/demo/onboardingStorage";

export default function DemoHome() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(true);

  useEffect(() => {
    setOnboarded(isDemoOnboardingComplete());
    setReady(true);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setOnboarded(true);
  }, []);

  const handleRestartOnboarding = useCallback(() => {
    setOnboarded(false);
  }, []);

  if (!ready) {
    return <div className="min-h-[40vh] flex-1 bg-bg" aria-hidden />;
  }

  if (!onboarded) {
    return <DemoOnboarding onComplete={handleOnboardingComplete} />;
  }

  return <DemoDashboard onRestartOnboarding={handleRestartOnboarding} />;
}
