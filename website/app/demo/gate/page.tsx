import { Suspense } from "react";

import DemoGatePageClient from "@/components/demo/DemoGatePageClient";

export default function DemoGatePage() {
  return (
    <Suspense fallback={<p className="font-body text-[#9A7A50]">Loading gate…</p>}>
      <DemoGatePageClient />
    </Suspense>
  );
}
