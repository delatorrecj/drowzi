"use client";

import { useEffect } from "react";

import DemoAppShell from "@/components/demo/DemoAppShell";
import DemoPhoneChrome from "@/components/demo/DemoPhoneChrome";
import PhoneFrame from "@/components/demo/PhoneFrame";

type DemoLayoutShellProps = {
  children: React.ReactNode;
};

export default function DemoLayoutShell({ children }: DemoLayoutShellProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* optional */
    });
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <PhoneFrame>
        <DemoPhoneChrome>
          <DemoAppShell>{children}</DemoAppShell>
        </DemoPhoneChrome>
      </PhoneFrame>
    </div>
  );
}
