import Footer from "@/components/Footer";
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Poppins, Outfit } from "next/font/google";

// ── FONT OPTIMIZATION ────────────────────────────────────────
// Outfit: only load the variable font (default — no weight array needed).
// next/font/google already tree-shakes to only the subsets you use.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true, // explicit — ensures <link rel="preload"> is emitted
});

// Poppins: dropped 500 & 700 — you only use 400 (body) and 600 (semibold).
// Every extra weight is a separate font file (~15-25 KB each).
// If you later need 700 for a specific element, add it back selectively.
const poppins = Poppins({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Urgent Delivery Company",
  description:
    "We offer fast and reliable delivery services on the weekends",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${poppins.variable}`}>
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}