import { COPY, SITE } from "@/lib/constants";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 border-b border-[#4A3015] bg-[#1A1209]/95 backdrop-blur-sm">
      <span
        className="font-display font-extrabold text-xl tracking-tight"
        style={{ color: "#F4C430" }}
      >
        {COPY.nav.brand}
      </span>
      <a
        href="#download"
        className="px-5 py-2 rounded-xl font-display font-bold text-sm transition-colors"
        style={{
          backgroundColor: "#F4C430",
          color: "#654321",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "#D9AC1E")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "#F4C430")
        }
      >
        {COPY.nav.cta}
      </a>
    </nav>
  );
}
