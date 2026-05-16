"use client";

import Link from "next/link";
import { useEffect } from "react";

import { COPY, SITE } from "@/lib/constants";

export default function DemoChrome({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* optional */
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1209] text-[#F5E6C8]">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#4A3015] bg-[#1A1209]/95 px-6 backdrop-blur-sm">
        <Link href="/" className="font-display text-sm font-bold text-[#9A7A50] hover:text-[#F4C430]">
          ← Home
        </Link>
        <span className="font-display text-lg font-extrabold text-[#F4C430]">Drowzi Demo</span>
        <Link
          href={SITE.demoUrl}
          className="font-display text-sm font-bold text-[#F4C430] hover:underline"
        >
          Hub
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">{children}</main>
      <p className="pb-8 text-center font-body text-xs text-[#9A7A50]">{COPY.demo.permissionsNote}</p>
    </div>
  );
}
