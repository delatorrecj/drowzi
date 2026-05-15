import { COPY, SITE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer
      className="py-8 px-6 md:px-12 border-t flex flex-col md:flex-row items-center justify-between gap-4"
      style={{ backgroundColor: "#1A1209", borderColor: "#4A3015" }}
    >
      <span
        className="font-display font-extrabold text-lg"
        style={{ color: "#F4C430" }}
      >
        Drowzi
      </span>

      <div className="flex items-center gap-6">
        <a
          href={SITE.privacyUrl}
          className="font-body text-sm transition-colors hover:text-[#F5E6C8]"
          style={{ color: "#9A7A50" }}
        >
          Privacy Policy
        </a>
        <a
          href={SITE.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm transition-colors hover:text-[#F5E6C8]"
          style={{ color: "#9A7A50" }}
        >
          GitHub
        </a>
      </div>

      <p className="font-body text-xs" style={{ color: "#4A3015" }}>
        {COPY.footer.copyright}
      </p>
    </footer>
  );
}
