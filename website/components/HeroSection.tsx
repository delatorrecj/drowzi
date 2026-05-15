import Image from "next/image";
import { COPY, SITE } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] flex items-center px-6 md:px-12 py-24 bg-[#1A1209]">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div className="flex flex-col gap-6">
          <h1
            className="font-display font-extrabold leading-none text-5xl md:text-7xl"
            style={{ color: "#F5E6C8" }}
          >
            {COPY.hero.headline.map((line, i) => (
              <span key={i} className="block">
                {i === 0 ? (
                  line
                ) : (
                  <span style={{ color: "#F4C430" }}>{line}</span>
                )}
              </span>
            ))}
          </h1>

          <p
            className="font-body text-lg leading-relaxed max-w-lg"
            style={{ color: "#9A7A50" }}
          >
            {COPY.hero.sub}
          </p>

          {/* Download badges */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href={SITE.appStoreUrl}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-display font-bold text-sm transition-colors"
              style={{ backgroundColor: "#2E1F0A", color: "#F5E6C8", border: "1px solid #4A3015" }}
            >
              <AppleIcon />
              App Store
            </a>
            <a
              href={SITE.playStoreUrl}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-display font-bold text-sm transition-colors"
              style={{ backgroundColor: "#2E1F0A", color: "#F5E6C8", border: "1px solid #4A3015" }}
            >
              <GooglePlayIcon />
              Google Play
            </a>
          </div>

          <p className="font-body text-sm" style={{ color: "#9A7A50" }}>
            {COPY.hero.badge}
          </p>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center animate-float">
          <div
            className="w-64 h-[520px] rounded-[2.5rem] flex items-center justify-center text-center p-6"
            style={{
              backgroundColor: "#F4C430",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Placeholder — replace with real phone-hero.png */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-7xl">⏰</span>
              <p
                className="font-display font-extrabold text-4xl leading-none"
                style={{ color: "#654321" }}
              >
                6:30
              </p>
              <p
                className="font-display font-bold text-sm"
                style={{ color: "#654321" }}
              >
                DO YOUR PUSH-UPS
              </p>
              <div
                className="mt-4 w-full py-3 rounded-xl font-display font-bold text-sm"
                style={{ backgroundColor: "#E63946", color: "#fff" }}
              >
                ALARM ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5L20 12l-15.5 8.5c-.5.33-1.5.33-1.5-.5z" />
    </svg>
  );
}
