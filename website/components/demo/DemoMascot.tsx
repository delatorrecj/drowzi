"use client";

import Image from "next/image";

import { demoTheme } from "@/lib/demo/demoTheme";

export type DemoMascotMood =
  | "idle"
  | "excited"
  | "surprised"
  | "thinking"
  | "thinking2"
  | "pumped";

const MOOD_SRC: Record<DemoMascotMood, string> = {
  idle: "/images/mascot/mascot-idle.png",
  excited: "/images/mascot/mascot-excited.png",
  surprised: "/images/mascot/mascot-surprised.png",
  thinking: "/images/mascot/mascot-thinking.png",
  thinking2: "/images/mascot/mascot-thinking-2.png",
  pumped: "/images/mascot/mascot-pumped.png",
};

type DemoMascotProps = {
  mood?: DemoMascotMood;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
};

const FRAME = {
  sm: "h-20 w-20",
  md: "h-28 w-28",
  lg: "h-36 w-36",
};

export default function DemoMascot({ mood = "idle", size = "lg", showBadge = true }: DemoMascotProps) {
  const label = mood === "thinking2" ? "FOCUSED" : mood.toUpperCase();

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${FRAME[size]} overflow-hidden rounded-full border-4 shadow-[0_8px_24px_rgba(244,196,48,0.25)]`}
        style={{ borderColor: demoTheme.primary, backgroundColor: demoTheme.surface }}
      >
        <Image
          src={MOOD_SRC[mood]}
          alt="Drowzi mascot"
          fill
          sizes={size === "lg" ? "144px" : size === "md" ? "112px" : "80px"}
          className="object-contain p-1.5"
        />
      </div>
      {showBadge ? (
        <span
          className="-mt-2 z-10 rounded-xl border-2 px-3 py-0.5 font-display text-[10px] font-black tracking-wider"
          style={{
            borderColor: demoTheme.textOnPrimary,
            backgroundColor: demoTheme.primary,
            color: demoTheme.textOnPrimary,
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
