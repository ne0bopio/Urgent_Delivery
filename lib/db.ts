// ============================================================
// lib/db.ts — Supabase client (server-side only)
//
// Uses the service_role key so it bypasses RLS and can
// read/write all rows. Never import this from a "use client"
// component — it would expose the key to the browser.
//
// Usage:
//   import { supabase } from "@/lib/db";
//   const { data, error } = await supabase.from("bookings").select("*");
// ============================================================

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

export const supabase = createClient(url, key, {
  auth: {
    // Disable auto session management — we're using this purely
    // as a server-side DB client, not for auth
    persistSession:    false,
    autoRefreshToken:  false,
    detectSessionInUrl: false,
  },
});

// ── Booking row type (matches the SQL schema) ─────────────────
export type BookingRow = {
  id:                 string;
  created_at:         string;
  customer_name:      string;
  customer_email:     string;
  customer_phone:     string;
  pickup_address:     string;
  dropoff_address:    string;
  item_count:         number;
  heavy_items:        boolean;
  distance_miles:     number | null;
  pickup_date:        string;       // "YYYY-MM-DD"
  pickup_time:        string;       // "h:mm AM/PM"
  start_at:           string;       // ISO timestamp
  end_at:             string;       // ISO timestamp (start + 4h)
  total_price_cents:  number;
  stripe_session_id:  string | null;
  status:             "pending_payment" | "confirmed" | "cancelled" | "expired";
  expires_at:         string | null;
};