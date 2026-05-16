"use client";

type PhoneFrameProps = {
  children: React.ReactNode;
};

const PHONE_W = 280;
const PHONE_H = 580;

/** Portrait phone chassis — screen area is a flex column for app UI. */
export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#0F0A05] p-4 md:p-8">
      <div
        className="relative mx-auto hidden md:block"
        style={{
          width: `min(${PHONE_W}px, calc(85vh * ${PHONE_W} / ${PHONE_H}))`,
          height: "min(85vh, 680px)",
        }}
      >
        <div
          className="relative h-full w-full rounded-[3rem] p-[11px] shadow-[0_28px_80px_rgba(0,0,0,0.65),0_0_0_1px_#4A3015,inset_0_1px_0_rgba(244,196,48,0.12)]"
          style={{
            background: "linear-gradient(145deg, #3D2810 0%, #1A1209 55%, #0F0A05 100%)",
          }}
        >
          <div className="absolute -left-[3px] top-[28%] h-10 w-[3px] rounded-l-sm bg-[#4A3015]" />
          <div className="absolute -left-[3px] top-[38%] h-14 w-[3px] rounded-l-sm bg-[#4A3015]" />
          <div className="absolute -right-[3px] top-[32%] h-16 w-[3px] rounded-r-sm bg-[#4A3015]" />

          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.35rem] bg-bg">
            {children}
          </div>
        </div>
      </div>

      <div className="flex min-h-dvh w-full max-w-lg flex-col bg-bg md:hidden">{children}</div>
    </div>
  );
}
