import { COPY } from "@/lib/constants";

export default function ProblemSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#2E1F0A]">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        {/* Eyebrow */}
        <p
          className="font-body font-medium text-sm uppercase tracking-widest"
          style={{ color: "#F4C430" }}
        >
          {COPY.problem.eyebrow}
        </p>

        {/* Headline */}
        <h2
          className="font-display font-extrabold text-4xl md:text-5xl leading-tight"
          style={{ color: "#F5E6C8" }}
        >
          {COPY.problem.headline}
        </h2>

        {/* Body paragraphs */}
        <div className="flex flex-col gap-4">
          {COPY.problem.body.map((para, i) => (
            <p
              key={i}
              className="font-body text-lg leading-relaxed"
              style={{ color: "#9A7A50" }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Failure cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {COPY.problem.failures.map((f) => (
            <div
              key={f.label}
              className="flex flex-col gap-3 p-5 rounded-2xl border-l-4"
              style={{
                backgroundColor: "#1A1209",
                borderLeftColor: "#E63946",
                border: "1px solid #4A3015",
                borderLeftWidth: "4px",
              }}
            >
              <span className="text-3xl">{f.icon}</span>
              <p
                className="font-display font-bold text-base"
                style={{ color: "#F5E6C8" }}
              >
                {f.label}
              </p>
              <p
                className="font-body text-sm leading-snug"
                style={{ color: "#9A7A50" }}
              >
                {f.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
