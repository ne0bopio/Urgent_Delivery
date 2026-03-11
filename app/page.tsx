// ============================================================
// page.tsx — Landing page
// ============================================================

import Navbar       from "@/components/NavBar";
import CTAButton    from "@/components/Ctabutton";
import ContactFloat from "@/components/Contactfloat";
import HeroCard     from "@/components/Herocard";
import VanBackground from "@/components/VanBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col bg-[#EDEBE7]">

      {/* 1 ── Navigation */}
      <Navbar />

      {/* 2 ── Background Scenery Layer */}
      <VanBackground />

      {/* 3 ── Main content column */}
      <section className="flex-1 flex flex-col items-center px-4 pt-4 md:pt-8 pb-20 md:pb-24">

        {/* Hero card */}
        <HeroCard />

        {/* ── Connector arrow ─────────────────────────────────────
            Thin vertical line + triangle head linking card to CTA. */}
        <div
          className="flex flex-col items-center my-4 md:my-5"
          aria-hidden="true"
          style={{ animation: "arrowFadeIn 0.5s 0.65s ease both" }}
        >
          <div className="w-px h-10 md:h-12 bg-[#2F3A33] opacity-25" />
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
            <path d="M7 9L0 0H14L7 9Z" fill="#2F3A33" opacity="0.3" />
          </svg>
        </div>

        {/* ── CTA wheel button ─────────────────────────────────── */}
        <CTAButton />

      </section>

      {/* 4 ── Floating contact button */}
      <ContactFloat />

      <style>{`
        @keyframes arrowFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}