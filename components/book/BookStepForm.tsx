"use client";

// ============================================================
// components/book/BookStepForm.tsx — Left panel
//
// Owns: progress bar, all 5 step panels, booking summary,
//       nav buttons, calculating spinner, quote error.
//
// Purely controlled — all state lives in BookPage.
// ============================================================

import { AnimatePresence, motion } from "framer-motion";

import AddressAutocomplete from "@/components/book/AddressAutocomplete";
import TimeSlotPicker      from "@/components/book/TimeSlotPicker";

import type { BookingFormReturn }  from "@/hooks/useBookingForm";
import type { PickupStatus }       from "@/hooks/usePickupValidation";
import { TOTAL_STEPS }            from "@/lib/pricing";

// ── Props ─────────────────────────────────────────────────────
export type BookStepFormProps = {
  // From useBookingForm
  step:          BookingFormReturn["step"];
  form:          BookingFormReturn["form"];
  canAdvance:    BookingFormReturn["canAdvance"];
  dateTimeError: BookingFormReturn["dateTimeError"];
  setField:      BookingFormReturn["setField"];
  goNext:        BookingFormReturn["goNext"];
  goBack:        BookingFormReturn["goBack"];
  resetForm:     () => void;       // parent wraps this to also clear quoteReady
  // From BookPage state
  quoteReady:    boolean;
  calculating:   boolean;
  quoteError:    string | null;
  clearError:    () => void;
  pickupStatus:  PickupStatus;   // ← NEW: drives validation badge in step 4
};

// ─────────────────────────────────────────────────────────────
export default function BookStepForm({
  step, form, canAdvance, dateTimeError, setField, goNext, goBack,
  resetForm, quoteReady, calculating, quoteError, clearError, pickupStatus,
}: BookStepFormProps) {
  return (
    <div className="flex-1 flex flex-col">

      {/* ── Progress bar ──────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 md:mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n        = i + 1;
          const isActive = n === step && !quoteReady;
          const isDone   = n < step || quoteReady;
          return (
            <div key={n} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className={`
                w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0
                flex items-center justify-center
                font-mono text-[10px] sm:text-xs font-bold transition-all duration-300
                ${isDone   ? "bg-[#1F5A52] text-[#EDEBE7]"                       : ""}
                ${isActive ? "bg-[#2F3A33] text-[#F26A5B] ring-2 ring-[#F26A5B]" : ""}
                ${!isDone && !isActive ? "bg-[#2F3A33]/20 text-[#2F3A33]/40"     : ""}
              `}>
                {isDone ? "✓" : n}
              </div>
              {n < TOTAL_STEPS && (
                <div className={`
                  h-px flex-1 min-w-[8px] sm:min-w-[16px] transition-all duration-500
                  ${isDone ? "bg-[#1F5A52]" : "bg-[#2F3A33]/20"}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step card ─────────────────────────────────────────── */}
      <div className="
        bg-[#2F3A33] rounded-2xl
        p-5 sm:p-6 md:p-8
        flex-1 flex flex-col justify-between
        min-h-[300px] sm:min-h-[360px] md:min-h-[420px]
      ">

        {/* STEP 1 — Date + time */}
        {step === 1 && !quoteReady && (
          <StepShell
            label="01 / WHEN"
            title="Pick your date & time"
            hint="Weekends only. Select a date to see available time slots."
          >
            <TimeSlotPicker
              date={form.date}
              time={form.time}
              onDateChange={(d) => setField("date", d)}
              onTimeChange={(t) => setField("time", t)}
            />
            <AnimatePresence>
              {dateTimeError && (
                <motion.p
                  key="dt-error"
                  className="font-mono text-[10px] text-[#F26A5B] mt-3 tracking-wide"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ⚠ {dateTimeError}
                </motion.p>
              )}
            </AnimatePresence>
          </StepShell>
        )}

        {/* STEP 2 — Item count */}
        {step === 2 && !quoteReady && (
          <StepShell
            label="02 / ITEMS"
            title="How many items?"
            hint="Count every box, bag, piece of furniture, or appliance."
          >
            <div className="flex items-center gap-4 sm:gap-6 mt-6 md:mt-8">
              <StepperButton onClick={() => setField("itemCount", Math.max(1, form.itemCount - 1))}>
                −
              </StepperButton>
              <span className="font-heading font-black text-5xl sm:text-6xl text-[#F26A5B] w-16 sm:w-20 text-center tabular-nums">
                {form.itemCount}
              </span>
              <StepperButton onClick={() => setField("itemCount", form.itemCount + 1)}>
                +
              </StepperButton>
            </div>
            <p className="font-mono text-xs text-[#EDEBE7]/30 mt-4 tracking-widest">
              {form.itemCount === 1 ? "1 ITEM" : `${form.itemCount} ITEMS`}
            </p>
          </StepShell>
        )}

        {/* STEP 3 — Heavy items */}
        {step === 3 && !quoteReady && (
          <StepShell
            label="03 / WEIGHT"
            title="Any item over 50 lbs?"
            hint="This helps us send the right crew. Honest answers = accurate quotes."
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 md:mt-8">
              {([
                { label: "YES — some are heavy",  value: true  },
                { label: "NO — all under 50 lbs", value: false },
              ] as const).map(({ label, value }) => (
                <button
                  key={String(value)}
                  onClick={() => setField("heavyItems", value)}
                  className={`
                    flex-1 py-4 sm:py-5 px-4 rounded-xl border-2
                    font-body font-semibold text-xs sm:text-sm
                    transition-all duration-200
                    ${form.heavyItems === value
                      ? "border-[#F26A5B] bg-[#F26A5B]/10 text-[#F26A5B]"
                      : "border-[#EDEBE7]/20 text-[#EDEBE7]/60 hover:border-[#EDEBE7]/50"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {/* STEP 4 — Pickup */}
        {step === 4 && !quoteReady && (
          <StepShell
            label="04 / PICKUP"
            title="Where are we picking up?"
            hint="Enter the full street address. We serve within 1 hour of Fairview, NJ."
          >
            <AddressAutocomplete
              value={form.pickup}
              onChange={(v) => setField("pickup", v)}
              placeholder="123 Main St, Newark, NJ"
              label="Pickup address"
            />

            {/* ── Range validation badge ─────────────────────────
                Driven by pickupStatus from usePickupValidation.
                idle       → subtle hint text
                validating → spinner
                valid      → green confirmation with drive time
                invalid    → red block with reason + call prompt
                error      → neutral warning (bad address / network)
            ─────────────────────────────────────────────────── */}
            <div className="mt-3 min-h-[24px]">

              {pickupStatus.state === "idle" && form.pickup.trim().length > 0 && (
                <p className="font-mono text-[9px] text-[#EDEBE7]/20 tracking-widest uppercase">
                  Checking service area once you stop typing...
                </p>
              )}

              {pickupStatus.state === "validating" && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-[#1F5A52] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span className="font-mono text-[10px] text-[#EDEBE7]/40 tracking-widest uppercase">
                    Checking range...
                  </span>
                </div>
              )}

              {pickupStatus.state === "valid" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#1F5A52] flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2 2 4-4" stroke="#EDEBE7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-mono text-[10px] text-[#1F5A52] tracking-widest uppercase">
                    In range · {pickupStatus.driveMinutes} min drive
                    {pickupStatus.distanceText ? ` · ${pickupStatus.distanceText}` : ""}
                  </span>
                </div>
              )}

              {pickupStatus.state === "invalid" && (
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-[#F26A5B]/20 border border-[#F26A5B]/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <path d="M1 1l5 5M6 1L1 6" stroke="#F26A5B" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-[#F26A5B] tracking-widest uppercase">
                      Out of range · {pickupStatus.driveMinutes} min drive
                    </p>
                    <p className="font-mono text-[9px] text-[#EDEBE7]/30 mt-0.5 leading-relaxed">
                      We only service pickups within 1 hr of Fairview, NJ.
                      Call us for distant jobs.
                    </p>
                  </div>
                </div>
              )}

              {pickupStatus.state === "error" && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#EDEBE7]/30 tracking-widest">
                    ⚠ {pickupStatus.error}
                  </span>
                </div>
              )}

            </div>
          </StepShell>
        )}

        {/* STEP 5 — Dropoff */}
        {step === 5 && !quoteReady && (
          <StepShell
            label="05 / DROP-OFF"
            title="Where are we delivering?"
            hint="The destination address."
          >
            <AddressAutocomplete
              value={form.dropoff}
              onChange={(v) => setField("dropoff", v)}
              placeholder="456 Oak Ave, Brooklyn, NY"
              label="Drop-off address"
            />
          </StepShell>
        )}

        {/* Booking summary (post-quote) */}
        {quoteReady && (
          <div className="flex flex-col gap-3 sm:gap-4">
            <p className="font-mono text-xs text-[#1F5A52] tracking-widest">[ BOOKING SUMMARY ]</p>
            {([
              ["Date",     form.date],
              ["Time",     form.time],
              ["Items",    `${form.itemCount} item${form.itemCount > 1 ? "s" : ""}`],
              ["Weight",   form.heavyItems ? "Includes heavy items" : "All under 50 lbs"],
              ["Pickup",   form.pickup],
              ["Drop-off", form.dropoff],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[#EDEBE7]/10 pb-2 sm:pb-3 gap-4">
                <span className="font-mono text-[10px] sm:text-xs text-[#EDEBE7]/40 uppercase tracking-widest flex-shrink-0">
                  {k}
                </span>
                <span className="font-body text-xs sm:text-sm text-[#EDEBE7] font-medium text-right">
                  {v}
                </span>
              </div>
            ))}
            <button
              onClick={resetForm}
              className="mt-3 font-mono text-xs text-[#EDEBE7]/30 hover:text-[#F26A5B] transition-colors tracking-widest uppercase"
            >
              ← Edit details
            </button>
          </div>
        )}

        {/* Nav buttons */}
        {!quoteReady && !calculating && !quoteError && (
          <div className="flex justify-between items-center mt-6 md:mt-8">
            {step > 1
              ? (
                <button
                  onClick={goBack}
                  className="font-mono text-xs text-[#EDEBE7]/40 hover:text-[#EDEBE7] transition-colors tracking-widest uppercase"
                >
                  ← Back
                </button>
              )
              : <div />
            }
            <button
              onClick={goNext}
              disabled={!canAdvance}
              className={`
                px-6 sm:px-8 py-3 rounded-full
                font-heading font-bold text-xs sm:text-sm tracking-widest uppercase
                transition-all duration-300
                ${canAdvance
                  ? "bg-[#F26A5B] text-white hover:bg-[#e05a4a] hover:scale-105 active:scale-95"
                  : "bg-[#EDEBE7]/10 text-[#EDEBE7]/20 cursor-not-allowed"
                }
              `}
            >
              {step === TOTAL_STEPS ? "Calculate →" : "Next →"}
            </button>
          </div>
        )}

        {/* Calculating spinner */}
        {calculating && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
            <div className="w-8 h-8 border-2 border-[#F26A5B] border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-xs text-[#EDEBE7]/40 tracking-widest animate-pulse">
              CALCULATING ROUTE...
            </p>
          </div>
        )}

        {/* Quote error */}
        {quoteError && !calculating && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <p className="font-mono text-xs text-[#F26A5B] tracking-widest text-center">
              {quoteError}
            </p>
            <button
              onClick={clearError}
              className="font-mono text-xs text-[#EDEBE7]/40 hover:text-[#EDEBE7] transition-colors tracking-widest uppercase"
            >
              ← Try again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Private sub-components ─────────────────────────────────────

function StepShell({ label, title, hint, children }: {
  label:    string;
  title:    string;
  hint:     string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <p className="font-mono text-[10px] text-[#1F5A52] tracking-[0.3em] uppercase mb-2 sm:mb-3">
        {label}
      </p>
      <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#EDEBE7] leading-tight">
        {title}
      </h2>
      <p className="font-body text-xs sm:text-sm text-[#EDEBE7]/45 mt-2 leading-relaxed">
        {hint}
      </p>
      {children}
    </div>
  );
}

function StepperButton({ onClick, children }: {
  onClick:  () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#EDEBE7]/30 text-[#EDEBE7] text-2xl font-bold hover:border-[#F26A5B] hover:text-[#F26A5B] transition-all flex items-center justify-center"
    >
      {children}
    </button>
  );
}