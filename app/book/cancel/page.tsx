// ============================================================
// app/book/cancel/page.tsx — Payment cancelled or failed
//
// Bookla redirects here on payment cancel OR failure.
// Set BOTH URLs in Bookla Dashboard → Plugins → Stripe:
//   Cancel URL:  https://yourdomain.com/book/cancel
//   Failure URL: https://yourdomain.com/book/cancel
// ============================================================

import Link  from "next/link";
import Navbar from "@/components/NavBar";

export default function BookCancelPage() {
  return (
    // overflow-x-hidden lives on body in globals.css — not here.
    <main className="min-h-screen flex flex-col bg-brand-offwhite">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-8 pt-20 pb-24">

        {/* ── X icon ────────────────────────────────────────── */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F26A5B]/10 flex items-center justify-center">
          <svg
            width="36" height="36" viewBox="0 0 24 24"
            fill="none" stroke="#F26A5B" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <line x1="18" y1="6"  x2="6"  y2="18" />
            <line x1="6"  y1="6"  x2="18" y2="18" />
          </svg>
        </div>

        {/* ── Headline ──────────────────────────────────────── */}
        <div className="max-w-md flex flex-col gap-3">
          <p className="font-mono text-[10px] text-[#F26A5B] tracking-[0.35em] uppercase">
            [ PAYMENT CANCELLED ]
          </p>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#2F3A33] tracking-tight leading-tight">
            No charge<br />
            <span className="text-[#2F3A33]/40">was made.</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-[#2F3A33]/60 leading-relaxed">
            Your payment was cancelled or did not go through. No money was
            taken. You can try again or contact us directly.
          </p>
        </div>

        {/* ── Action buttons ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
          <Link
            href="/book"
            className="
              px-8 py-3 rounded-full text-center
              bg-[#F26A5B] text-white
              font-heading font-black text-sm tracking-widest uppercase
              hover:bg-[#e05a4a] hover:scale-105 active:scale-95
              transition-all duration-300
              shadow-lg shadow-[#F26A5B]/20
            "
          >
            Try again →
          </Link>
          <a
            href="tel:+12017903994"
            className="
              px-8 py-3 rounded-full text-center
              border-2 border-[#2F3A33]/20
              text-[#2F3A33] font-heading font-black text-sm tracking-widest uppercase
              hover:border-[#2F3A33]/50 transition-colors
            "
          >
            Call us instead
          </a>
        </div>

        {/* ── Back to home ──────────────────────────────────── */}
        <Link
          href="/"
          className="font-mono text-xs text-[#2F3A33]/40 hover:text-[#F26A5B] transition-colors tracking-widest uppercase"
        >
          ← Back to home
        </Link>

      </div>
    </main>
  );
}