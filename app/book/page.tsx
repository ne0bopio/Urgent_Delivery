"use client";

// ============================================================
// app/book/page.tsx — Booking & Quote Page (orchestrator)
//
// FIX: durationMins was not in the ContactModal payload.
// Now pulled from useQuote() and forwarded so /api/bookings
// receives it and can pass the 400 validation check.
// ============================================================

import { useState }    from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

import Navbar         from "@/components/NavBar";
import ContactFloat   from "@/components/Contactfloat";
import ContactModal   from "@/components/book/ContactModal";
import BookStepForm   from "@/components/book/BookStepForm";
import BookQuotePanel from "@/components/book/BookQuotePanel";

import { useBookingForm }        from "@/hooks/useBookingForm";
import { useQuote, EMPTY_QUOTE } from "@/hooks/useQuote";
import { PRICING, TOTAL_STEPS } from "@/lib/pricing";
import { isOffHours }            from "@/lib/availability";

// ─────────────────────────────────────────────────────────────
export default function BookPage() {

  // ── Page-level state ──────────────────────────────────────
  const [quoteReady, setQuoteReady] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [modalOpen,  setModalOpen]  = useState(false);

  // ── Hooks ─────────────────────────────────────────────────
  // FIX: destructure durationMins from useQuote
  const { quote, isPremium, durationMins, calculating, calculate } = useQuote();

  const { step, form, canAdvance, dateTimeError, setField, goNext, goBack, resetForm } =
    useBookingForm(async (currentForm) => {
      setQuoteError(null);
      try {
        // calculate() now returns durationMins so we can use it immediately
        const { durationMins: mins } = await calculate(currentForm);

        // Run the real hasConflict check server-side with the actual job duration.
        // This is the earliest possible moment we can do an accurate check —
        // durationMins isn't known until the distance/route is calculated.
        const avRes = await fetch("/api/check-availability", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            date:         currentForm.date,
            time:         currentForm.time,
            durationMins: mins,
          }),
        });
        const avData = await avRes.json() as { available: boolean; reason?: string };

        if (!avData.available) {
          setQuoteError(avData.reason ?? "This time slot is not available. Please go back and choose a different time.");
          return; // don't setQuoteReady — stay on the form
        }

        setQuoteReady(true);
      } catch (err) {
        setQuoteError(
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        );
      }
    });

  // ── Live estimate (updates while the form is being filled) ─
  const displayQuote = quote ?? {
    ...EMPTY_QUOTE,
    items:    form.itemCount * PRICING.PER_ITEM,
    heavy:    form.heavyItems ? PRICING.HEAVY_SURCHARGE : 0,
    offHours: form.time && isOffHours(form.time) ? PRICING.OFF_HOURS_SURCHARGE : 0,
    total:
      EMPTY_QUOTE.total
      + form.itemCount * PRICING.PER_ITEM
      + (form.heavyItems ? PRICING.HEAVY_SURCHARGE : 0)
      + (form.time && isOffHours(form.time) ? PRICING.OFF_HOURS_SURCHARGE : 0),
  };

  // ── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    setQuoteReady(false);
    resetForm();
  };

  // ─────────────────────────────────────────────────────────
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}>
      <main className="min-h-screen flex flex-col bg-brand-offwhite">

        <Navbar />

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="relative z-10 pt-16 md:pt-24 pb-10 md:pb-24 text-center px-4">
          <p className="font-mono text-xs tracking-[0.3em] text-[#1F5A52] uppercase mb-1">
            [ Step {quoteReady ? "Complete" : `${step} of ${TOTAL_STEPS}`} ]
          </p>
          <h1 className="font-heading font-extrabold text-2xl md:text-4xl text-[#2F3A33] tracking-tight">
            {quoteReady ? "Your Quote is Ready" : "Generate Your Quote"}
          </h1>
        </div>

        {/* ── Two-column layout ───────────────────────────────── */}
        <div className="
          relative z-10 flex-1
          flex flex-col lg:flex-row
          gap-5 md:gap-6
          px-3 sm:px-4 md:px-10
          pb-20 md:pb-32
          max-w-6xl mx-auto w-full
        ">

          {/* Left — multi-step form */}
          <BookStepForm
            step={step}
            form={form}
            canAdvance={canAdvance}
            dateTimeError={dateTimeError}
            setField={setField}
            goNext={goNext}
            goBack={goBack}
            resetForm={handleReset}
            quoteReady={quoteReady}
            calculating={calculating}
            quoteError={quoteError}
            clearError={() => setQuoteError(null)}
          />

          {/* Right — live quote panel */}
          <BookQuotePanel
            step={step}
            form={form}
            quote={quote}
            displayQuote={displayQuote}
            quoteReady={quoteReady}
            isPremium={isPremium}
            onPayment={() => setModalOpen(true)}
          />

        </div>

        {/* ── Contact + payment modal ─────────────────────────── */}
        <ContactModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          payload={{
            pickup:        form.pickup,
            dropoff:       form.dropoff,
            date:          form.date,
            time:          form.time,
            itemCount:     form.itemCount,
            heavyItems:    form.heavyItems,
            totalPrice:    displayQuote.total,
            distanceMiles: quote?.distance ?? null,
            durationMins:  durationMins ?? 0,   // ← FIX: was missing entirely
          }}
        />

        <ContactFloat hidden={modalOpen} />

      </main>
    </APIProvider>
  );
}