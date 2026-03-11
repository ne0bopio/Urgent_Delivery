// ============================================================
// hooks/useBookingForm.ts — Multi-step booking form state
//
// STEP ORDER (date/time first so user sees availability before
// investing time filling out the rest):
//
//   Step 1 — Date + time   (TimeSlotPicker)
//   Step 2 — Item count
//   Step 3 — Heavy items?
//   Step 4 — Pickup address
//   Step 5 — Dropoff address
//   → Quote calculated
// ============================================================

"use client";

import { useState } from "react";
import { FormData, DEFAULT_FORM, TOTAL_STEPS } from "@/lib/pricing";

export type BookingFormReturn = {
  step:          number;
  form:          FormData;
  canAdvance:    boolean;
  dateTimeError: string | null;
  setField:      <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  goNext:        () => void;
  goBack:        () => void;
  resetForm:     () => void;
};

// ── Date/time validation ──────────────────────────────────────

function parseTime(t: string): { hours: number; minutes: number } | null {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const mer = m[3].toUpperCase();
  if (mer === "PM" && hours !== 12) hours += 12;
  if (mer === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

function validateDateTime(date: string, time: string): string | null {
  if (!date || !time) return null;

  const parsed = parseTime(time);
  if (!parsed) return "Invalid time format.";

  const now      = new Date();
  const selected = new Date(
    parseInt(date.slice(0, 4), 10),
    parseInt(date.slice(5, 7), 10) - 1,
    parseInt(date.slice(8, 10), 10),
    parsed.hours,
    parsed.minutes,
    0,
  );

  if (selected < now) {
    return "This date and time is in the past. Please choose a future slot.";
  }

  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  if (selected < oneHourFromNow) {
    return "Minimum 1 hour notice required. Please pick a later time.";
  }

  return null;
}

// ── Hook ──────────────────────────────────────────────────────

export function useBookingForm(
  onFinalStep: (form: FormData) => void,
): BookingFormReturn {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Only validate date/time on step 1
  const dateTimeError = step === 1
    ? validateDateTime(form.date, form.time)
    : null;

  const canAdvance = (() => {
    switch (step) {
      case 1: return (
        form.date !== "" &&
        form.time !== "" &&
        dateTimeError === null
      );
      case 2: return form.itemCount >= 1;
      case 3: return form.heavyItems !== null;
      case 4: return form.pickup.trim().length > 3;
      case 5: return form.dropoff.trim().length > 3;
      default: return false;
    }
  })();

  const goNext = () => {
    if (!canAdvance) return;
    if (step === TOTAL_STEPS) {
      onFinalStep(form);
    } else {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const resetForm = () => {
    setStep(1);
    setForm(DEFAULT_FORM);
  };

  return {
    step,
    form,
    canAdvance,
    dateTimeError,
    setField,
    goNext,
    goBack,
    resetForm,
  };
}