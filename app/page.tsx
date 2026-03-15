// ============================================================
// app/page.tsx — Landing page (SEO-enhanced)
//
// SEO changes from original:
//   • Added page-specific metadata export (title + description)
//   • Wrapped hero section in <article> for semantic meaning
//   • Added aria-label on <section> for accessibility
//   • Heading hierarchy preserved: H1 is in HeroCard
// ============================================================

import type { Metadata } from "next";
import Navbar from "@/components/NavBar";
import CTAButton from "@/components/Ctabutton";
import ContactFloat from "@/components/Contactfloat";
import HeroCard from "@/components/Herocard";
import VanBackground from "@/components/VanBackground";

// ── Page-specific metadata ────────────────────────────────────
// Overrides the layout defaults for this page only.
// The template in layout.tsx will append " | Urgent Delivery Co."
export const metadata: Metadata = {
  title: "Weekend Delivery Service in NJ, NY & CT",
  description:
    "Need something delivered this weekend? Urgent Delivery Co. picks up and delivers Saturdays & Sundays across New Jersey, New York, and Connecticut — with as little as 1 hour notice.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col bg-[#EDEBE7]">

      {/* 1 ── Navigation */}
      <Navbar />

      {/* ── Background Scenery Layer */}
      <VanBackground />

      {/* 3 ── Main content column */}
      <section
        className="flex-1 flex flex-col items-center px-4 pt-8 pb-24"
        aria-label="Weekend delivery service overview"
      >

        {/* Hero card — contains the H1 */}
        <article>
          <HeroCard />
        </article>

        {/* ── Connector arrow */}
        <div className="flex flex-col items-center my-5" aria-hidden="true">
          <div className="w-px h-12 bg-[#2F3A33] opacity-25" />
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
            <path d="M7 9L0 0H14L7 9Z" fill="#2F3A33" opacity="0.3" />
          </svg>
        </div>

        {/* ── CTA button */}
        <CTAButton />

      </section>

      {/* 4 ── Floating contact button */}
      <ContactFloat />

    </main>
  );
}