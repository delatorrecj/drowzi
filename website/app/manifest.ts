import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Drowzi",
    short_name: "Drowzi",
    description: "A habit-gated alarm demo that keeps ringing until you complete your morning routine.",
    start_url: "/demo",
    display: "standalone",
    background_color: "#1A1209",
    theme_color: "#1A1209",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
