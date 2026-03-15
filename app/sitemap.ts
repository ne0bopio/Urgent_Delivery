// ============================================================
// app/sitemap.ts — Dynamic XML sitemap
//
// Next.js auto-serves this as /sitemap.xml at build time.
// Add new pages here as you build them.
// ============================================================

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://www.urgentdelivery.xyz"; // ← match your real domain
  const now = new Date().toISOString();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/book`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Add more pages as your site grows:
    // {
    //   url: `${siteUrl}/about`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.7,
    // },
  ];
}