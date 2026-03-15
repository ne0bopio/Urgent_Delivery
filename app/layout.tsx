import Footer from "@/components/Footer";
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Poppins, Outfit } from "next/font/google";

// ── FONT OPTIMIZATION ────────────────────────────────────────
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

// ── SEO: Centralized site info ────────────────────────────────
const SITE_URL = "https://www.urgentdelivery.xyz"; // ← replace with your real domain
const SITE_NAME = "Urgent Delivery Co.";
const SITE_DESCRIPTION =
  "Same-day weekend delivery service in New Jersey, New York, and Connecticut. Pickup and delivery available Saturdays & Sundays with as little as 1 hour notice.";

// ── SEO: Full metadata export ─────────────────────────────────
export const metadata: Metadata = {
  // ── Core tags ──────────────────────────────────────────────
  title: {
    default: "Urgent Delivery Co. | Weekend Delivery in NJ, NY & CT",
    template: "%s | Urgent Delivery Co.",

  },
  verification: {
      google: "g950ndh6ZK74MhQSrYwij7z7q0z8Y84RQ7FKK_ZnjSU",
    },
  
  description: SITE_DESCRIPTION,

  // ── Favicons (preserved from your existing config) ─────────
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  // ── Canonical & alternate ──────────────────────────────────
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  // ── Crawling hints ─────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Open Graph (Facebook, LinkedIn, iMessage, etc.) ────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Urgent Delivery Co. | Weekend Delivery in NJ, NY & CT",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png", // ← create a 1200×630 image in /public
        width: 1200,
        height: 630,
        alt: "Urgent Delivery Co. — Weekend delivery service in the tri-state area",
      },
    ],
  },

  // ── Twitter card ───────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Urgent Delivery Co. | Weekend Delivery in NJ, NY & CT",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    // creator: "@yourTwitterHandle", // ← uncomment when you have one
  },

  // ── Other useful meta ──────────────────────────────────────
  keywords: [
    "weekend delivery",
    "same day delivery",
    "Saturday delivery",
    "Sunday delivery",
    "NJ delivery service",
    "NY delivery service",
    "CT delivery service",
    "furniture delivery",
    "appliance delivery",
    "tri-state delivery",
    "last mile delivery weekend",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,

  // ── Geo targeting (helps local search) ─────────────────────
  other: {
    "geo.region": "US-NJ",
    "geo.placename": "New Jersey",
  },
};

// ── SEO: JSON-LD Structured Data ──────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  telephone: "+12017903994",
  email: "hello@urgentdelivery.xyz",
  image: `${SITE_URL}/og-image.png`,
  priceRange: "$$",
  areaServed: [
    { "@type": "State", name: "New Jersey" },
    { "@type": "State", name: "New York" },
    { "@type": "State", name: "Connecticut" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "06:00",
      closes: "20:00",
    },
  ],
  // Uncomment and fill when you have a physical address:
  address: {
     "@type": "PostalAddress",
     streetAddress: "361 Jersey Ave",
     addressLocality: "Fairview",
     addressRegion: "NJ",
     postalCode: "07022",
     addressCountry: "US",
  },
  sameAs: [
    // "https://www.facebook.com/urgentdeliveryco",
    // "https://www.instagram.com/urgentdeliveryco",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
  
      <body className={`${outfit.variable} ${poppins.variable}`}>
        {/* JSON-LD structured data — invisible to users, gold for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}