import type { ReactNode } from "react";

export type SiteIconName =
  | "motion"
  | "barcode"
  | "voice"
  | "puzzle"
  | "swipe"
  | "snooze"
  | "mascot-sleepy"
  | "mascot-awake"
  | "mascot-focused"
  | "mascot-pumped"
  | "mascot-legendary"
  | "alarm-bell"
  | "camera"
  | "figure";

type SiteIconProps = {
  name: SiteIconName;
  className?: string;
  stroke?: string;
};

export function SiteIcon({
  name,
  className = "w-8 h-8",
  stroke = "currentColor",
}: SiteIconProps) {
  const paths = ICONS[name];
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths}
    </svg>
  );
}

const ICONS: Record<SiteIconName, ReactNode> = {
  motion: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M8 11l4-2 4 2v3l-4 2-4-2v-3z" />
      <path d="M6 20l3-4h6l3 4" />
    </>
  ),
  barcode: (
    <>
      <path d="M4 6v12M7 6v12M10 6v12M13 6v12M16 6v12M20 6v12" />
      <path d="M3 6h18M3 18h18" strokeWidth={1.25} />
    </>
  ),
  voice: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 10a6 6 0 0 0 12 0" />
      <path d="M12 17v3M9 20h6" />
    </>
  ),
  puzzle: (
    <>
      <path d="M8 4h3a1.5 1.5 0 0 1 3 0h3v3a1.5 1.5 0 0 1 0 3v3a1.5 1.5 0 0 1-3 0H8v-3a1.5 1.5 0 0 1 0-3V4z" />
    </>
  ),
  swipe: (
    <>
      <path d="M5 12h11" />
      <path d="M13 8l4 4-4 4" />
      <path d="M5 8v8" strokeWidth={2} />
    </>
  ),
  snooze: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v4l2.5 2" />
      <path d="M9 4l-1.5-2M15 4l1.5-2" />
    </>
  ),
  "mascot-sleepy": (
    <>
      <circle cx="12" cy="11" r="6" />
      <path d="M9 10h1M14 10h1" />
      <path d="M10 14h4" />
      <path d="M8 5l-2-1M16 5l2-1" />
    </>
  ),
  "mascot-awake": (
    <>
      <circle cx="12" cy="11" r="6" />
      <circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M10 14h4" />
    </>
  ),
  "mascot-focused": (
    <>
      <circle cx="12" cy="11" r="6" />
      <path d="M8.5 9.5h2M13.5 9.5h2" strokeWidth={2} />
      <path d="M10 14h4" />
    </>
  ),
  "mascot-pumped": (
    <>
      <circle cx="12" cy="11" r="6" />
      <path d="M8 9l2 1 2-2 2 2 2-1" />
      <path d="M9 15h6" strokeWidth={2} />
    </>
  ),
  "mascot-legendary": (
    <>
      <circle cx="12" cy="11" r="6" />
      <path d="M12 5l1 2h2l-1.5 1.5.5 2L12 9.5 9.5 10.5l.5-2L8.5 7h2L12 5z" fill="currentColor" stroke="none" />
      <path d="M10 14h4" />
    </>
  ),
  "alarm-bell": (
    <>
      <path d="M12 4a5 5 0 0 0-5 5v3l-2 2h14l-2-2V9a5 5 0 0 0-5-5z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <circle cx="12" cy="13" r="3" />
      <path d="M8 7V5h8v2" />
    </>
  ),
  figure: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 8v5" />
      <path d="M8 20l4-7 4 7" />
      <path d="M9 14h6" />
    </>
  ),
};

export const MASCOT_ICONS: SiteIconName[] = [
  "mascot-sleepy",
  "mascot-awake",
  "mascot-focused",
  "mascot-pumped",
  "mascot-legendary",
];
