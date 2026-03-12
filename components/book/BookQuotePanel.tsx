"use client";

// ============================================================
// components/book/BookQuotePanel.tsx — Right panel
//
// Owns: scanline lock overlay, all quote line items,
//       premium badge, animated total, payment CTA.
//
// FIX vs old version:
//   Premium badge copy said "2.5× distance rate for routes over
//   140 mi" — neither figure is accurate. The actual logic in
//   /api/distance/route.ts applies a $1.00/mile deadhead surcharge
//   for every mile past DISTANCE_LIMITS.LOCAL_ZONE_MILES.
//   Badge now reflects what the code actually does.
// ============================================================

import { AnimatePresence, motion } from "framer-motion";

import type { QuoteBreakdown, FormData } from "@/lib/pricing";
import { PRICING }                       from "@/lib/pricing";
import { DISTANCE_LIMITS }               from "@/lib/distance";

// ── Props ─────────────────────────────────────────────────────
export type BookQuotePanelProps = {
  step:         number;
  form: Pick<FormData, "itemCount" | "heavyItems">;
  quote:        QuoteBreakdown | null;
  displayQuote: QuoteBreakdown;
  quoteReady:   boolean;
  isPremium:    boolean;
  onPayment:    () => void;
};

// ─────────────────────────────────────────────────────────────
export default function BookQuotePanel({
  step, form, quote, displayQuote, quoteReady, isPremium, onPayment,
}: BookQuotePanelProps) {
  return (
    <div className="lg:w-80 xl:w-96 flex flex-col">
      <div className="
        relative bg-[#2F3A33]/5 border border-[#2F3A33]/15 rounded-2xl
        p-5 sm:p-6 md:p-8
        flex flex-col gap-4 sm:gap-5
        lg:sticky lg:top-8
        overflow-hidden
      ">

        {/* ── Scanline lock overlay ──────────────────────────────
            Covers the panel until quoteReady = true.
            Exits with a glitch wipe via AnimatePresence.        */}
        <AnimatePresence>
          {!quoteReady && (
            <motion.div
              key="lock-overlay"
              className="absolute inset-0 z-20 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-4"
              style={{
                background: "repeating-linear-gradient(0deg, rgba(47,58,51,0.97) 0px, rgba(47,58,51,0.97) 3px, rgba(31,90,82,0.08) 3px, rgba(31,90,82,0.08) 4px)",
              }}
              initial={{ opacity: 1 }}
              exit={{
                opacity:  [1, 1, 0.85, 0.6, 0.2, 0],
                clipPath: [
                  "inset(0% 0% 0% 0%)",
                  "inset(20% 0% 35% 0%)",
                  "inset(55% 0% 15% 0%)",
                  "inset(10% 0% 65% 0%)",
                  "inset(0%  0% 88% 0%)",
                  "inset(0%  0% 100% 0%)",
                ],
                x: [0, -5, 5, -3, 1, 0],
                transition: { duration: 0.55, ease: "easeOut" },
              }}
            >
              {/* Scanning sweep line */}
              <motion.div
                className="absolute inset-x-0 h-10 bg-[#1F5A52]/10 pointer-events-none"
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              />

              {/* Lock icon */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <svg
                  width="28" height="28" viewBox="0 0 24 24"
                  fill="none" stroke="#1F5A52" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </motion.div>

              {/* Label */}
              <motion.div
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <p className="font-mono text-[10px] text-[#1F5A52] tracking-[0.3em] uppercase">
                  [ QUOTE LOCKED ]
                </p>
                <p className="font-mono text-[9px] text-[#EDEBE7]/20 tracking-widest text-center px-6">
                  Complete all steps to unlock
                </p>
              </motion.div>

              {/* Step progress dots */}
              <div className="flex items-center gap-2 mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    animate={{ backgroundColor: i < step ? "#1F5A52" : "rgba(237,235,231,0.1)" }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Panel header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] text-[#1F5A52] tracking-[0.3em] uppercase">
            Quote Estimate
          </p>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${quoteReady ? "bg-[#1F5A52] animate-pulse" : "bg-[#2F3A33]/20"}`} />
            <span className="font-mono text-[9px] text-[#2F3A33]/40 tracking-widest">
              {quoteReady ? "CONFIRMED" : "PENDING"}
            </span>
          </div>
        </div>

        <hr className="border-[#2F3A33]/10" />

        {/* ── Line items ────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <QuoteLine
            label="Base rate"
            value={`$${PRICING.BASE_RATE}`}
            accent={false}
          />
          <QuoteLine
            label={`Items (×${form.itemCount})`}
            value={`$${form.itemCount * PRICING.PER_ITEM}`}
            accent={false}
          />
          <QuoteLine
            label="Weekend service fee"
            value={`$${PRICING.WEEKEND_FEE}`}
            accent={false}
          />
          <QuoteLine
            label="Heavy item surcharge"
            value={form.heavyItems ? `+$${PRICING.HEAVY_SURCHARGE}` : "—"}
            accent={!!form.heavyItems}
          />
          <QuoteLine
            label="Off-hours fee"
            value={displayQuote.offHours > 0 ? `+$${PRICING.OFF_HOURS_SURCHARGE}` : "—"}
            accent={displayQuote.offHours > 0}
            note={displayQuote.offHours > 0 ? "Before 8 AM or after 6 PM" : undefined}
          />
          <QuoteLine
            label="Distance"
            value={quoteReady && quote ? `$${quote.distance}` : "—"}
            accent={false}
            note={!quoteReady ? "Calculated at final step" : undefined}
          />
        </div>

        <hr className="border-[#2F3A33]/10" />

        {/* ── Premium distance badge ────────────────────────────── */}
        {/* FIX: old copy said "2.5× rate / over 140 mi" — both wrong.
            Actual logic: +$1.00 per mile past LOCAL_ZONE_MILES.       */}
        <AnimatePresence>
          {quoteReady && isPremium && (
            <motion.div
              key="premium-badge"
              className="flex items-start gap-2 bg-[#F26A5B]/8 border border-[#F26A5B]/20 rounded-lg px-3 py-2.5"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <span className="text-[#F26A5B] text-xs mt-0.5">⚠</span>
              <p className="font-mono text-[9px] text-[#F26A5B]/80 tracking-wide leading-relaxed">
                {/* Reads directly from the constant so it stays in sync if you change it */}
                LONG-RANGE SURCHARGE APPLIED · +${DISTANCE_LIMITS.DEADHEAD_FEE_PER_MILE.toFixed(2)}/mi
                over {DISTANCE_LIMITS.LOCAL_ZONE_MILES} mi
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Animated total ────────────────────────────────────── */}
        <div className="flex items-baseline justify-between">
          <span className="font-heading font-bold text-sm text-[#2F3A33] tracking-widest uppercase">
            Est. Total
          </span>
          <motion.span
            className="font-heading font-black text-3xl"
            animate={{ color: quoteReady ? "#F26A5B" : "rgba(47,58,51,0.3)" }}
            transition={{ duration: 0.5 }}
          >
            ${displayQuote.total}
          </motion.span>
        </div>

        <p className="font-mono text-[9px] text-[#2F3A33]/30 leading-relaxed tracking-wide">
          * ESTIMATE ONLY. Final price confirmed after address verification.
        </p>

        {/* ── CTA ───────────────────────────────────────────────── */}
        {quoteReady ? (
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <button
              onClick={onPayment}
              className="
                w-full py-4 rounded-full
                bg-[#F26A5B] text-white
                font-heading font-black text-sm tracking-widest uppercase
                hover:bg-[#e05a4a] hover:scale-105 active:scale-95
                transition-all duration-300
                shadow-lg shadow-[#F26A5B]/20
              "
            >
              Proceed to Payment →
            </button>
            <p className="font-mono text-[9px] text-center text-[#2F3A33]/30 tracking-widest">
              SECURE CHECKOUT · STRIPE ENCRYPTED
            </p>
          </motion.div>
        ) : (
          <div className="
            w-full py-4 rounded-full
            bg-[#2F3A33]/10 text-[#2F3A33]/25
            font-heading font-black text-xs sm:text-sm tracking-widest uppercase
            text-center cursor-not-allowed select-none
          ">
            Complete form to unlock
          </div>
        )}

      </div>
    </div>
  );
}

// ── Private sub-component ─────────────────────────────────────

function QuoteLine({ label, value, accent, note }: {
  label:  string;
  value:  string;
  accent: boolean;
  note?:  string;
}) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <span className="font-mono text-xs text-[#2F3A33]/50 tracking-wide">{label}</span>
        {note && (
          <p className="font-mono text-[9px] text-[#1F5A52]/60 mt-0.5">{note}</p>
        )}
      </div>
      <span className={`font-body font-semibold text-sm ${accent ? "text-[#F26A5B]" : "text-[#2F3A33]"}`}>
        {value}
      </span>
    </div>
  );
}