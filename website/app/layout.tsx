import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
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
  title: "Drowzi — The alarm that won't stop until you do.",
  description:
    "Drowzi is the habit-gated alarm app that uses your phone's camera, mic, and sensors to verify your morning routine. Not a puzzle. The habit is the off-switch.",
  openGraph: {
    title: "Drowzi — Your alarm won't stop. Until you do.",
    description:
      "Habit-gated alarms that enforce real morning routines. Motion, barcode, and voice verification.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drowzi — Your alarm won't stop. Until you do.",
    description:
      "The alarm app that won't shut up until you do your morning habit.",
  },
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
