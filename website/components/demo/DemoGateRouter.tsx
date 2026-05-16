"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import DemoBarcodeGate from "@/components/demo/DemoBarcodeGate";
import DemoMotionGate from "@/components/demo/DemoMotionGate";
import DemoVoiceGate from "@/components/demo/DemoVoiceGate";
import type { Alarm } from "@/lib/demo/types";

type Props = {
  alarm: Alarm;
};

export default function DemoGateRouter({ alarm }: Props) {
  const router = useRouter();

  const onVerified = useCallback(() => {
    router.push("/demo?verified=1");
  }, [router]);

  switch (alarm.habitType) {
    case "motion":
      return <DemoMotionGate alarm={alarm} onVerified={onVerified} />;
    case "barcode":
      return <DemoBarcodeGate alarm={alarm} onVerified={onVerified} />;
    case "voice":
      return <DemoVoiceGate alarm={alarm} onVerified={onVerified} />;
    default:
      return (
        <p className="font-body text-[#9A7A50]">
          Habit type &quot;{alarm.habitType}&quot; is not available in the web demo yet.
        </p>
      );
  }
}
