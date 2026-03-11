// ============================================================
// lib/pricing.ts — Pricing constants & shared types
//
// This is the single source of truth for all pricing logic.
// Edit the PRICING object to change rates across the entire app.
// ============================================================

// ── TYPES ─────────────────────────────────────────────────────

export type FormData = {
  itemCount:  number;
  heavyItems: boolean | null; // null = not yet answered
  pickup:     string;
  dropoff:    string;
  date:       string;
  time:       string;
};

export type QuoteBreakdown = {
  base:       number;
  items:      number;
  heavy:      number;
  distance:   number;
  weekendFee: number;
  offHours:   number;
  total:      number;
};

// ── CONSTANTS ─────────────────────────────────────────────────

export const PRICING = {
  BASE_RATE:          45,  // $ flat base fee per delivery
  PER_ITEM:            4,  // $ per item
  HEAVY_SURCHARGE:    20,  // $ added if any item is over 50 lbs
  WEEKEND_FEE:        15,  // $ weekend service fee (always applied)
  OFF_HOURS_SURCHARGE: 25, // $ added for slots before 8AM or after 6PM
} as const;

export const TOTAL_STEPS = 5;

// ── DEFAULT FORM STATE ────────────────────────────────────────

export const DEFAULT_FORM: FormData = {
  itemCount:  1,
  heavyItems: null,
  pickup:     "",
  dropoff:    "",
  date:       "",
  time:       "",
};