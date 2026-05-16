import type { Metadata } from "next";

import DemoChrome from "@/components/demo/DemoChrome";

export const metadata: Metadata = {
  title: "Try Drowzi — Web Demo",
  description:
    "Experience Drowzi habit gates in your browser. Motion, barcode, and voice verification — all on-device.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoChrome>{children}</DemoChrome>;
}
