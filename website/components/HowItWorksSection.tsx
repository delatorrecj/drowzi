import { COPY } from "@/lib/constants";

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
              <span className="text-4xl">{gate.icon}</span>
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

              {/* Phone mockup placeholder — swap with real screenshot */}
              <div
                className="mt-auto w-full h-40 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#1A1209", border: "1px solid #4A3015" }}
              >
                <span className="text-4xl opacity-40">{gate.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
