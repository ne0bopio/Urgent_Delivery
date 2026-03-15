// ============================================================
// app/robots.ts — Search engine crawl rules
//
// Next.js auto-serves this as /robots.txt at build time.
// No need for a static robots.txt file in /public.
// ============================================================

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://www.urgentdelivery.xyz"; // ← match your real domain

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"], // block internal API routes from indexing
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}