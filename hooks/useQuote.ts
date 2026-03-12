"use client";

// ============================================================
// hooks/useQuote.ts — Async quote calculation
//
// FIX: durationMins was returned by getDistancePrice() but
// never stored in state or exposed. It was silently dropped,
// so ContactModal had no value to send to /api/bookings,
// which then rejected the request with 400.
// ============================================================

import { useState, useCallback } from "react";
import { FormData, QuoteBreakdown, PRICING } from "@/lib/pricing";
import { getDistancePrice } from "@/lib/distance";
import { isOffHours } from "@/lib/availability";

export type QuoteState = {
  quote:        QuoteBreakdown | null;
  isPremium:    boolean;
  durationMins: number | null;   // ← NEW: total calendar block for this job
  calculating:  boolean;
  calculate:    (form: FormData) => Promise<void>;
};

export const EMPTY_QUOTE: QuoteBreakdown = {
  base:       PRICING.BASE_RATE,
  items:      0,
  heavy:      0,
  distance:   0,
  weekendFee: PRICING.WEEKEND_FEE,
  offHours:   0,
  total:      PRICING.BASE_RATE + PRICING.WEEKEND_FEE,
};

export function useQuote(): QuoteState {
  const [quote,        setQuote]        = useState<QuoteBreakdown | null>(null);
  const [isPremium,    setIsPremium]    = useState(false);
  const [durationMins, setDurationMins] = useState<number | null>(null); // ← NEW
  const [calculating,  setCalculating]  = useState(false);

  const calculate = useCallback(async (form: FormData) => {
    setCalculating(true);

    try {
      const [distanceResult] = await Promise.all([
        getDistancePrice(form.pickup, form.dropoff),
        new Promise<void>((res) => setTimeout(res, 1500)),
      ]);

      const base       = PRICING.BASE_RATE;
      const items      = form.itemCount * PRICING.PER_ITEM;
      const heavy      = form.heavyItems ? PRICING.HEAVY_SURCHARGE : 0;
      const weekendFee = PRICING.WEEKEND_FEE;
      const offHours   = form.time && isOffHours(form.time) ? PRICING.OFF_HOURS_SURCHARGE : 0;
      const total      = base + items + heavy + distanceResult.price + weekendFee + offHours;

      setIsPremium(distanceResult.isPremium);
      setDurationMins(distanceResult.durationMins);  // ← FIX: was never stored
      setQuote({ base, items, heavy, distance: distanceResult.price, weekendFee, offHours, total });
    } finally {
      setCalculating(false);
    }
  }, []);

  return { quote, isPremium, durationMins, calculating, calculate };
}