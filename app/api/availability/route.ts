// ============================================================
// app/api/availability/route.ts
//
// GET /api/availability?date=YYYY-MM-DD
//
// Returns the list of TIME_SLOTS that are blocked on that date.
// The TimeSlotPicker calls this whenever the user picks a date.
//
// Blocked = any confirmed booking whose active window
// (pickup_time → pickup_time + duration_mins) covers that slot.
//
// FIX vs old version:
//   Old: only fetched pickup_time, passed string[] to getBlockedSlots.
//        getBlockedSlots did exact-match only → slots adjacent to a
//        booking were never grayed out, only the exact start time was.
//
//   New: fetches pickup_time + duration_mins, passes the full object
//        array to getBlockedSlots, which now does a proper window check.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabase }                  from "@/lib/db";
import { getBlockedSlots }           from "@/lib/availability";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");

  // Validate date format
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date query param required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  // ── Fetch confirmed bookings for this date ────────────────
  // We fetch pickup_time AND duration_mins so getBlockedSlots
  // can check the full [start, start+duration) window.
  //
  // pending_payment bookings are intentionally excluded here —
  // they only hold for 30 min and the server-side conflict check
  // in /api/bookings handles that race condition properly.
  const { data, error } = await supabase
    .from("bookings")
    .select("pickup_time, duration_mins")   // ← FIX: was select("pickup_time") only
    .eq("pickup_date", date)
    .eq("status", "confirmed");

  if (error) {
    console.error("[/api/availability] Supabase error:", error);
    return NextResponse.json(
      { error: "Could not load availability. Please try again." },
      { status: 500 },
    );
  }

  // getBlockedSlots now receives objects with both fields
  const bookings = (data ?? []).map((r) => ({
    pickup_time:   r.pickup_time   as string,
    duration_mins: r.duration_mins as number,
  }));

  const blocked = getBlockedSlots(bookings);   // ← FIX: was getBlockedSlots(stringArray)

  return NextResponse.json({
    date,
    blockedSlots: Array.from(blocked),
  });
}