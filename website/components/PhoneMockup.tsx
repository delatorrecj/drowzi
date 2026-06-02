import Image from "next/image";
import { SiteIcon } from "@/components/SiteIcons";

const MASCOT_EXCITED = "/images/mascot/mascot-excited.png";

type Variant = "hero" | "motion" | "barcode" | "voice";
type Size = "lg" | "sm";

type PhoneMockupProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

const FRAME = {
  lg: "w-[280px] h-[580px] rounded-[3rem] p-[10px]",
  sm: "w-full max-w-[200px] mx-auto h-[360px] rounded-[2.25rem] p-[7px]",
};

const SCREEN = {
  lg: "rounded-[2.35rem]",
  sm: "rounded-[1.85rem]",
};

export default function PhoneMockup({
  variant = "hero",
  size = "lg",
  className = "",
}: PhoneMockupProps) {
  return (
    <div className={className}>
      <div
        className={`relative ${FRAME[size]} shadow-[0_28px_80px_rgba(0,0,0,0.65),0_0_0_1px_#4A3015,inset_0_1px_0_rgba(244,196,48,0.12)]`}
        style={{
          background: "linear-gradient(145deg, #3D2810 0%, #1A1209 55%, #0F0A05 100%)",
        }}
      >
        <div className="absolute -left-[3px] top-[28%] w-[3px] h-10 rounded-l-sm bg-[#4A3015]" />
        <div className="absolute -left-[3px] top-[38%] w-[3px] h-14 rounded-l-sm bg-[#4A3015]" />
        <div className="absolute -right-[3px] top-[32%] w-[3px] h-16 rounded-r-sm bg-[#4A3015]" />

        <div
          className={`relative h-full w-full overflow-hidden ${SCREEN[size]} bg-[#0F0A05]`}
        >
          <StatusBar size={size} variant={variant} />
          {variant === "hero" && <HeroScreen size={size} />}
          {variant === "motion" && <MotionScreen size={size} />}
          {variant === "barcode" && <BarcodeScreen size={size} />}
          {variant === "voice" && <VoiceScreen size={size} />}
          <HomeIndicator size={size} />
        </div>
      </div>
    </div>
  );
}

function StatusBar({ size, variant }: { size: Size; variant: Variant }) {
  const isAlarm = variant === "hero";
  return (
    <div
      className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 ${
        size === "lg" ? "pt-3 pb-1" : "pt-2 pb-0.5"
      } ${isAlarm ? "text-[#654321]/80" : "text-[#9A7A50]"}`}
    >
      <span className={`font-display font-bold ${size === "lg" ? "text-[11px]" : "text-[9px]"}`}>
        6:30
      </span>
      <DynamicIsland size={size} alarm={isAlarm} />
      <div className={`flex items-center gap-1 ${size === "lg" ? "text-[10px]" : "text-[8px]"}`}>
        <SignalIcon />
        <span className="font-body font-medium">100%</span>
      </div>
    </div>
  );
}

function DynamicIsland({ size, alarm }: { size: Size; alarm?: boolean }) {
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-30 rounded-full ${
        size === "lg" ? "top-2.5 w-[90px] h-[26px]" : "top-2 w-[68px] h-[20px]"
      } ${alarm ? "bg-[#654321]/25" : "bg-black/80"}`}
    />
  );
}

function HomeIndicator({ size }: { size: Size }) {
  return (
    <div
      className={`absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/30 ${
        size === "lg" ? "w-28 h-1" : "w-20 h-[3px]"
      }`}
    />
  );
}

function HeroScreen({ size }: { size: Size }) {
  const compact = size === "sm";
  return (
    <div className="relative h-full w-full bg-[#F4C430] animate-alarm-glow">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, #fff 0%, transparent 70%)",
        }}
      />

      <div
        className={`relative flex h-full flex-col items-center justify-between ${
          compact ? "px-4 pt-10 pb-8" : "px-5 pt-12 pb-10"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className={`relative overflow-hidden rounded-2xl ${
              compact ? "h-14 w-14" : "h-20 w-20"
            }`}
          >
            <Image
              src={MASCOT_EXCITED}
              alt="Drowzi mascot"
              fill
              sizes={compact ? "56px" : "80px"}
              className="object-contain p-1"
              priority
            />
          </div>
          <p
            className={`font-display font-extrabold leading-none text-[#654321] ${
              compact ? "text-3xl" : "text-5xl"
            }`}
          >
            6:30
          </p>
          <p
            className={`font-display font-bold uppercase tracking-wide text-[#654321] ${
              compact ? "text-[10px]" : "text-xs"
            }`}
          >
            Morning Alarm
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <p
            className={`text-center font-display font-extrabold uppercase leading-tight text-[#654321] ${
              compact ? "text-sm" : "text-lg"
            }`}
          >
            Do your push-ups
          </p>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span
                className={`font-display font-bold text-[#654321] ${
                  compact ? "text-[10px]" : "text-xs"
                }`}
              >
                Reps
              </span>
              <span
                className={`font-display font-extrabold text-[#654321] ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
                3 / 10
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#654321]/20">
              <div className="h-full w-[30%] rounded-full bg-[#654321]" />
            </div>
          </div>

          <div
            className={`w-full rounded-xl text-center font-display font-bold uppercase tracking-wider text-white animate-alarm-pulse ${
              compact ? "py-2 text-[10px]" : "py-3 text-xs"
            }`}
            style={{ backgroundColor: "#E63946" }}
          >
            Alarm active
          </div>
        </div>

        <div
          className={`w-full overflow-hidden rounded-xl border border-[#654321]/25 bg-[#654321]/10 ${
            compact ? "p-2" : "p-2.5"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-[#1A1209]/40">
              <div className="absolute inset-0 flex items-center justify-center text-[#F4C430]">
                <SiteIcon name="camera" className="h-4 w-4" stroke="#F4C430" />
              </div>
              <div className="absolute inset-0 rounded-lg border border-[#F4C430]/50 animate-viewfinder-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`font-display font-bold text-[#654321] ${
                  compact ? "text-[9px]" : "text-[10px]"
                }`}
              >
                Camera verifying
              </p>
              <p
                className={`font-body text-[#654321]/70 truncate ${
                  compact ? "text-[8px]" : "text-[9px]"
                }`}
              >
                Motion gate · counting reps
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MotionScreen({ size }: { size: Size }) {
  const compact = size === "sm";
  return (
    <div className="relative h-full w-full bg-[#0F0A05]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #1A1209 0%, #0a0704 40%, #1A1209 100%)",
        }}
      />
      <Viewfinder size={size} />

      <div
        className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center ${
          compact ? "top-[38%]" : "top-[36%]"
        }`}
      >
        <SiteIcon
          name="figure"
          className={compact ? "h-12 w-12" : "h-14 w-14"}
          stroke="#9A7A50"
        />
        <p
          className={`mt-1 rounded-full bg-[#F4C430]/20 px-2 py-0.5 font-display font-bold text-[#F4C430] ${
            compact ? "text-[8px]" : "text-[9px]"
          }`}
        >
          Detecting form
        </p>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent ${
          compact ? "px-3 pb-8 pt-10" : "px-4 pb-10 pt-12"
        }`}
      >
        <p
          className={`mb-2 font-display font-extrabold text-[#F5E6C8] ${
            compact ? "text-2xl" : "text-3xl"
          }`}
        >
          7<span className="text-[#F4C430]">/10</span>
        </p>
        <p
          className={`font-body text-[#9A7A50] ${compact ? "text-[9px]" : "text-[10px]"}`}
        >
          Push-ups · keep going
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#4A3015]">
          <div className="h-full w-[70%] rounded-full bg-[#F4C430]" />
        </div>
      </div>
    </div>
  );
}

function BarcodeScreen({ size }: { size: Size }) {
  const compact = size === "sm";
  return (
    <div className="relative h-full w-full bg-[#0F0A05]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #2E1F0A 0%, #0F0A05 70%)",
        }}
      />
      <Viewfinder size={size} />

      <div
        className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ${
          compact ? "top-[40%]" : "top-[38%]"
        }`}
      >
        <BarcodeGraphic compact={compact} />
        <p
          className={`font-body text-center text-[#9A7A50] ${
            compact ? "text-[8px] max-w-[120px]" : "text-[9px] max-w-[140px]"
          }`}
        >
          Aim at registered item
        </p>
      </div>

      <div className="absolute inset-x-4 top-[32%] h-px animate-scan-line bg-[#F4C430]/80 shadow-[0_0_8px_#F4C430]" />

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent ${
          compact ? "px-3 pb-8 pt-8" : "px-4 pb-10 pt-10"
        }`}
      >
        <p
          className={`font-display font-bold text-[#F5E6C8] ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          Coffee bag
        </p>
        <p
          className={`font-body text-[#F4C430] ${compact ? "text-[9px]" : "text-[10px]"}`}
        >
          Walk to kitchen · scan to dismiss
        </p>
      </div>
    </div>
  );
}

function VoiceScreen({ size }: { size: Size }) {
  const compact = size === "sm";
  const bars = compact ? 12 : 16;
  return (
    <div className="relative flex h-full w-full flex-col bg-[#1A1209]">
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-4 ${
          compact ? "px-3 pt-10" : "px-4 pt-12"
        }`}
      >
        <div
          className={`flex items-end justify-center gap-0.5 ${
            compact ? "h-12" : "h-16"
          }`}
        >
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-[#F4C430] animate-waveform-bar"
              style={{
                height: `${28 + ((i * 7) % 24)}%`,
                animationDelay: `${(i % 5) * 0.12}s`,
              }}
            />
          ))}
        </div>

        <div
          className={`w-full rounded-xl border border-[#4A3015] bg-[#2E1F0A] ${
            compact ? "p-2.5" : "p-3"
          }`}
        >
          <p
            className={`font-body italic leading-relaxed text-[#F5E6C8] ${
              compact ? "text-[9px]" : "text-[10px]"
            }`}
          >
            &ldquo;Today I choose discipline over comfort.&rdquo;
          </p>
        </div>

        <p
          className={`rounded-full px-3 py-1 font-display font-bold text-[#F4C430] bg-[#F4C430]/10 ${
            compact ? "text-[8px]" : "text-[9px]"
          }`}
        >
          Listening…
        </p>
      </div>

      <div
        className={`border-t border-[#4A3015] bg-[#0F0A05] ${
          compact ? "px-3 py-3" : "px-4 py-4"
        }`}
      >
        <p
          className={`font-display font-bold text-[#F5E6C8] ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          Read aloud to dismiss
        </p>
        <p
          className={`mt-0.5 font-body text-[#9A7A50] ${
            compact ? "text-[8px]" : "text-[9px]"
          }`}
        >
          Voice gate · 68% matched
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#4A3015]">
          <div className="h-full w-[68%] rounded-full bg-[#F4C430]" />
        </div>
      </div>
    </div>
  );
}

function Viewfinder({ size }: { size: Size }) {
  const inset = size === "lg" ? "inset-8" : "inset-5";
  const corner = size === "lg" ? "w-5 h-5 border-2" : "w-3.5 h-3.5 border-[1.5px]";
  return (
    <div className={`absolute ${inset} pointer-events-none`}>
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute ${corner} border-[#F4C430] ${
            pos === "tl"
              ? "top-0 left-0 border-r-0 border-b-0 rounded-tl-md"
              : pos === "tr"
                ? "top-0 right-0 border-l-0 border-b-0 rounded-tr-md"
                : pos === "bl"
                  ? "bottom-0 left-0 border-r-0 border-t-0 rounded-bl-md"
                  : "bottom-0 right-0 border-l-0 border-t-0 rounded-br-md"
          }`}
        />
      ))}
    </div>
  );
}

function BarcodeGraphic({ compact }: { compact: boolean }) {
  const w = compact ? "w-20" : "w-24";
  return (
    <div className={`${w} flex flex-col gap-0.5 rounded-lg bg-white/95 p-2 shadow-lg`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-1 rounded-sm bg-[#1A1209]"
          style={{ width: `${40 + ((i * 13) % 55)}%`, opacity: 0.7 + (i % 3) * 0.1 }}
        />
      ))}
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
