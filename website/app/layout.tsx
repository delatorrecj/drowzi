import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import { SITE } from "@/lib/constants";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Drowzi — The habit-gated alarm app",
  description:
    "Drowzi is the habit-gated alarm app that uses your phone's camera, mic, and sensors to verify your morning routine. Not a puzzle. The habit is the off-switch.",
  openGraph: {
    title: "Drowzi — Your alarm won't stop. Until you do.",
    description:
      "Habit-gated alarms that enforce real morning routines. Motion, barcode, and voice verification.",
    url: "/",
    siteName: "Drowzi",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Drowzi — Your alarm won't stop. Until you do." }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drowzi — Your alarm won't stop. Until you do.",
    description:
      "The alarm app that won't shut up until you do your morning habit.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1209",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
