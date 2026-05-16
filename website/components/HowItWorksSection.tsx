import Link from "next/link";

import PhoneMockup from "@/components/PhoneMockup";
import { SiteIcon } from "@/components/SiteIcons";
import { COPY } from "@/lib/constants";

const GATE_VARIANTS = ["motion", "barcode", "voice"] as const;
const GATE_DEMO_PATHS = ["/demo/motion", "/demo/barcode", "/demo/voice"] as const;

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#1A1209]">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <p
            className="font-body font-medium text-sm uppercase tracking-widest"
            style={{ color: "#F4C430" }}
          >
            {COPY.howItWorks.eyebrow}
          </p>
          <h2
            className="font-display font-extrabold text-4xl md:text-5xl leading-tight"
            style={{ color: "#F5E6C8" }}
          >
            {COPY.howItWorks.headline}
          </h2>
          <p
            className="font-body text-lg"
            style={{ color: "#9A7A50" }}
          >
            {COPY.howItWorks.sub}
          </p>
        </div>

        {/* Gate cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COPY.howItWorks.gates.map((gate, i) => (
            <div
              key={gate.title}
              className="flex flex-col gap-5 p-7 rounded-3xl"
              style={{
                backgroundColor: "#2E1F0A",
                border: "1px solid #4A3015",
                borderTopWidth: "3px",
                borderTopColor: "#F4C430",
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-[#F4C430]"
                style={{ backgroundColor: "rgba(244, 196, 48, 0.1)" }}
              >
                <SiteIcon name={gate.icon} className="w-7 h-7" />
              </div>
              <h3
                className="font-display font-bold text-xl"
                style={{ color: "#F5E6C8" }}
              >
                {gate.title}
              </h3>
              <p
                className="font-body text-base leading-relaxed"
                style={{ color: "#9A7A50" }}
              >
                {gate.body}
              </p>

              <Link
                href={GATE_DEMO_PATHS[i]}
                className="font-display text-sm font-bold text-[#F4C430] hover:underline"
              >
                {COPY.demo.gateTryLabel} →
              </Link>

              <div
                className="mt-auto w-full rounded-2xl overflow-hidden py-4"
                style={{ backgroundColor: "#1A1209", border: "1px solid #4A3015" }}
              >
                <PhoneMockup
                  variant={GATE_VARIANTS[i]}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
