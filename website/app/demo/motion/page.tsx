import { Suspense } from "react";

import DemoMotionGate from "@/components/demo/DemoMotionGate";

export default function DemoMotionPage() {
  return (
    <Suspense fallback={<p className="font-body text-[#9A7A50]">Loading…</p>}>
      <DemoMotionGate standalone />
    </Suspense>
  );
}
