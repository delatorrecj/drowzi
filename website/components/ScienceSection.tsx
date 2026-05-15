import { COPY } from "@/lib/constants";

export default function ScienceSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#2E1F0A]">
      <div className="max-w-6xl mx-auto flex flex-col gap-14">
        {/* Header */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <p
            className="font-body font-medium text-sm uppercase tracking-widest"
            style={{ color: "#F4C430" }}
          >
            {COPY.science.eyebrow}
          </p>
          <h2
            className="font-display font-extrabold text-4xl md:text-5xl leading-tight"
            style={{ color: "#F5E6C8" }}
          >
            {COPY.science.headline.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        {/* Proof blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x"
          style={{ borderColor: "#4A3015" }}
        >
          {COPY.science.proofs.map((proof, i) => (
            <div
              key={proof.title}
              className="flex flex-col gap-4 py-8 md:px-10 first:pl-0 last:pr-0"
            >
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: "#F4C430" }}
              />
              <h3
                className="font-display font-bold text-xl"
                style={{ color: "#F5E6C8" }}
              >
                {proof.title}
              </h3>
              <p
                className="font-body text-base leading-relaxed"
                style={{ color: "#9A7A50" }}
              >
                {proof.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
