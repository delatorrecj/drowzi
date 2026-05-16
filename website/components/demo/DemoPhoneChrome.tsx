"use client";

type DemoPhoneChromeProps = {
  children: React.ReactNode;
};

export default function DemoPhoneChrome({ children }: DemoPhoneChromeProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-bg text-text">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-3 pb-1 text-text-muted">
        <span className="font-display text-[11px] font-bold">6:30</span>
        <div className="absolute left-1/2 top-2.5 h-[26px] w-[90px] -translate-x-1/2 rounded-full bg-black/80" />
        <div className="flex items-center gap-1 text-[10px]">
          <SignalIcon />
          <span className="font-body font-medium">100%</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col pt-9">{children}</div>

      <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 h-1 w-28 -translate-x-1/2 rounded-full bg-white/30" />
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor" aria-hidden>
      <rect x="0" y="6" width="2" height="4" rx="0.5" opacity="0.4" />
      <rect x="3" y="4" width="2" height="6" rx="0.5" opacity="0.6" />
      <rect x="6" y="2" width="2" height="8" rx="0.5" opacity="0.8" />
      <rect x="9" y="0" width="2" height="10" rx="0.5" />
    </svg>
  );
}
