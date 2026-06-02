import type { Metadata } from "next";

import DemoLayoutShell from "@/components/demo/DemoLayoutShell";

export const metadata: Metadata = {
  title: "Drowzi — App Preview",
  description:
    "Preview the Drowzi habit-gated alarm: onboarding, dashboard, and on-device habit gates in your browser.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-demo-app
      className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden supports-[height:100dvh]:h-dvh supports-[max-height:100dvh]:max-h-dvh md:min-h-dvh md:max-h-none"
    >
      <DemoLayoutShell>{children}</DemoLayoutShell>
    </div>
  );
}
