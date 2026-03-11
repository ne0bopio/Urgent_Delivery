// ============================================================
// app/book/success/page.tsx — Post-payment confirmation
//
// Bookla redirects here after a successful Stripe payment.
// Set in Bookla Dashboard → Plugins → Stripe → Success URL:
//   https://yourdomain.com/book/success
// ============================================================

import Link  from "next/link";
import Navbar from "@/components/NavBar";

export default function BookSuccessPage() {
  return (
    // overflow-x-hidden lives on body in globals.css — not here.
    <main className="min-h-screen flex flex-col bg-brand-offwhite">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-8 pt-20 pb-24">

        {/* ── Check icon with pulse ring ─────────────────────── */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#1F5A52]/10 flex items-center justify-center">
            <svg
              width="36" height="36" viewBox="0 0 24 24"
              fill="none" stroke="#1F5A52" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-[#1F5A52]/30 animate-ping" />
        </div>

        {/* ── Headline ──────────────────────────────────────── */}
        <div className="max-w-md flex flex-col gap-3">
          <p className="font-mono text-[10px] text-[#1F5A52] tracking-[0.35em] uppercase">
            [ PAYMENT CONFIRMED ]
          </p>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#2F3A33] tracking-tight leading-tight">
            Booking<br />
            <span className="text-[#1F5A52]">Confirmed.</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-[#2F3A33]/60 leading-relaxed">
            Your delivery is scheduled. Check your email for the booking
            confirmation and our team will be in touch shortly.
          </p>
        </div>

        {/* ── What happens next ─────────────────────────────── */}
        <div className="w-full max-w-sm bg-[#2F3A33]/5 border border-[#2F3A33]/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 text-left">
          <p className="font-mono text-[9px] text-[#1F5A52] tracking-[0.3em] uppercase">
            What happens next
          </p>
          {([
            ["📧", "Confirmation email sent to your inbox"],
            ["📞", "We may call to confirm details"],
            ["🚐", "Van arrives at your pickup time"],
          ] as [string, string][]).map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-lg flex-shrink-0">{icon}</span>
              <span className="font-body text-sm text-[#2F3A33]/70">{text}</span>
            </div>
          ))}
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