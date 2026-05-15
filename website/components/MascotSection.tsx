import Image from "next/image";
import { COPY } from "@/lib/constants";

const MASCOT_EVOLUTION = [
  "/images/mascot/mascot-thinking.png",
  "/images/mascot/mascot-surprised.png",
  "/images/mascot/mascot-idle.png",
  "/images/mascot/mascot-thinking-2.png",
  "/images/mascot/Gemini_Generated_Image_hx0oyxhx0oyxhx0o.png",
] as const;

const MASCOT_SIZES = ["40px", "48px", "56px", "64px", "80px"] as const;

export default function MascotSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#1A1209]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div className="flex flex-col gap-6">
          <h2
            className="font-display font-extrabold text-4xl md:text-5xl leading-tight"
            style={{ color: "#F5E6C8" }}
          >
            {COPY.mascot.headline}
          </h2>
          <p
            className="font-body text-lg leading-relaxed"
            style={{ color: "#9A7A50" }}
          >
            {COPY.mascot.body}
          </p>
          <p
            className="font-display font-bold text-sm"
            style={{ color: "#F4C430" }}
          >
            {COPY.mascot.caption}
          </p>
        </div>

        {/* Evolution strip */}
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-2">
            {COPY.mascot.states.map((s, i) => {
              const sizes = ["w-10 h-10", "w-12 h-12", "w-14 h-14", "w-16 h-16", "w-20 h-20"];
              const opacities = ["opacity-40", "opacity-55", "opacity-70", "opacity-85", "opacity-100"];
              return (
                <div key={s.label} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`relative ${sizes[i]} ${opacities[i]} rounded-xl overflow-hidden`}
                    style={{
                      backgroundColor: "#2E1F0A",
                      border: "1px solid #4A3015",
                    }}
                  >
                    <Image
                      src={MASCOT_EVOLUTION[i]}
                      alt={`Drowzi mascot — ${s.state}`}
                      fill
                      sizes={MASCOT_SIZES[i]}
                      className="object-contain p-0.5"
                    />
                  </div>
                  <p
                    className="font-display font-bold text-xs text-center"
                    style={{ color: "#F4C430" }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="font-body text-xs text-center"
                    style={{ color: "#9A7A50" }}
                  >
                    {s.state}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: "#4A3015" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: "100%",
                background: "linear-gradient(to right, #4A3015, #F4C430)",
              }}
            />
          </div>
          <p className="font-body text-xs text-center" style={{ color: "#4A3015" }}>
            Day 0 → Day 30
          </p>
        </div>
      </div>
    </section>
  );
}
