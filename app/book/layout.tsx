// ============================================================
// SEO METADATA FOR app/book/page.tsx
//
// IMPORTANT: Because this page uses "use client", you CANNOT
// export metadata directly from it. Instead, create a separate
// layout or use generateMetadata in a parent. The cleanest
// approach: create app/book/layout.tsx with JUST the metadata.
// ============================================================

// ── FILE: app/book/layout.tsx ─────────────────────────────────
// Create this file alongside your book/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Delivery Quote",
  description:
    "Get an instant quote for weekend delivery in NJ, NY, and CT. Tell us what you're moving, where it's going, and when — we'll give you a price in seconds.",
  alternates: {
    canonical: "/book",
  },
  openGraph: {
    title: "Get a Delivery Quote | Urgent Delivery Co.",
    description:
      "Instant weekend delivery quotes for the tri-state area. Furniture, appliances, boxes — we move it Saturday & Sunday.",
    url: "https://www.urgentdelivery.xyz/book",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}