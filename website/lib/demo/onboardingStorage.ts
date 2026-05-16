const ONBOARDING_KEY = "drowzi-demo-onboarding-complete";
const STEP_KEY = "drowzi-demo-onboarding-step";
const NAME_KEY = "drowzi-demo-display-name";

export function isDemoOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function setDemoOnboardingComplete(value: boolean): void {
  localStorage.setItem(ONBOARDING_KEY, value ? "1" : "0");
}

export function getDemoOnboardingStep(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(STEP_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? Math.min(4, Math.max(0, n)) : 0;
}

export function setDemoOnboardingStep(step: number): void {
  localStorage.setItem(STEP_KEY, String(Math.min(4, Math.max(0, step))));
}

export function clearDemoOnboardingStep(): void {
  localStorage.removeItem(STEP_KEY);
}

export function getDemoDisplayName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function setDemoDisplayName(name: string): void {
  localStorage.setItem(NAME_KEY, name.trim());
}

export function resetDemoOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem(STEP_KEY);
  localStorage.removeItem(NAME_KEY);
}
