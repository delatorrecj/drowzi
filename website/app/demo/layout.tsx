import type { Metadata } from "next";

import DemoLayoutShell from "@/components/demo/DemoLayoutShell";

export const metadata: Metadata = {
  title: "Drowzi — App Preview",
  description:
    "Preview the Drowzi habit-gated alarm: onboarding, dashboard, and on-device habit gates in your browser.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoLayoutShell>{children}</DemoLayoutShell>;
}
