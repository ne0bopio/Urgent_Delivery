"use client";

// ============================================================
// hooks/useQuote.ts — Async quote calculation
// ============================================================

import { useState, useCallback } from "react";
import { FormData, QuoteBreakdown, PRICING } from "@/lib/pricing";
import { getDistancePrice } from "@/lib/distance";
import { isOffHours } from "@/lib/availability";

export type QuoteState = {
  quote:       QuoteBreakdown | null;
  isPremium:   boolean;
  calculating: boolean;
  calculate:   (form: FormData) => Promise<void>;
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
  const [quote,       setQuote]       = useState<QuoteBreakdown | null>(null);
  const [isPremium,   setIsPremium]   = useState(false);
  const [calculating, setCalculating] = useState(false);

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
      setQuote({ base, items, heavy, distance: distanceResult.price, weekendFee, offHours, total });
    } finally {
      setCalculating(false);
    }
  }, []);

  return { quote, isPremium, calculating, calculate };
}