"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { demoTheme } from "@/lib/demo/demoTheme";

const TITLES: Record<string, string> = {
  "/demo": "Drowzi",
  "/demo/motion": "Motion gate",
  "/demo/barcode": "Barcode gate",
  "/demo/voice": "Voice gate",
  "/demo/alarm": "Alarm",
  "/demo/gate": "Wake habit",
};

const FULL_BLEED_PREFIXES = ["/demo/motion", "/demo/barcode", "/demo/voice", "/demo/gate"];

function screenTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  return "Drowzi";
}

function isFullBleed(pathname: string): boolean {
  return FULL_BLEED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}?`));
}

function backHref(pathname: string): string {
  if (pathname === "/demo" || pathname.startsWith("/demo?")) return "/";
  return "/demo";
}

function ChevronBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type DemoAppShellProps = {
  children: React.ReactNode;
};

export default function DemoAppShell({ children }: DemoAppShellProps) {
  const pathname = usePathname() ?? "/demo";
  const path = pathname.split("?")[0] ?? pathname;
  const title = screenTitle(path);
  const hub = path === "/demo";
  const fullBleed = isFullBleed(path);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col text-text">
      {!hub ? (
        <header
          className="flex h-11 shrink-0 items-center gap-2 border-b px-3"
          style={{ borderColor: demoTheme.border }}
        >
          <Link
            href={backHref(path)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-primary"
            aria-label="Back"
          >
            <ChevronBack />
          </Link>
          <h1 className="min-w-0 flex-1 truncate font-display text-base font-extrabold text-primary">{title}</h1>
        </header>
      ) : (
        <header className="flex h-11 shrink-0 items-center justify-center px-3">
          <span className="font-display text-lg font-extrabold tracking-tight text-primary">Drowzi</span>
        </header>
      )}

      <main
        className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
          fullBleed ? "" : hub ? "" : "overflow-y-auto px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
        }`}
      >
        {children}
      </main>

      {hub ? (
        <p className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-0.5 text-center font-body text-[9px] text-text-muted">
          <Link href="/" className="underline decoration-border underline-offset-2 hover:text-primary">
            Marketing site
          </Link>
        </p>
      ) : null}
    </div>
  );
}
