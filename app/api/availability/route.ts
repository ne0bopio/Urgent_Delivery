// ============================================================
// app/api/availability/route.ts
//
// GET /api/availability?date=YYYY-MM-DD
//
// Returns the list of TIME_SLOTS that are blocked on that date.
// The TimeSlotPicker component calls this whenever the user
// picks a date, so they see unavailable slots before filling
// the rest of the form.
//
// Blocked = any confirmed booking, OR any pending_payment
// booking whose expires_at is still in the future (holds the
// slot for 30 min while someone is in the Stripe checkout flow).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getBlockedSlots } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");

  // Validate date format
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date query param required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  // Only confirmed bookings block slots in the UI.
  // pending_payment bookings are NOT shown as blocked — the server-side
  // conflict check in /api/bookings handles the actual race condition.
  const { data, error } = await supabase
    .from("bookings")
    .select("pickup_time")
    .eq("pickup_date", date)
    .eq("status", "confirmed");

  if (error) {
    console.error("[/api/availability] Supabase error:", error);
    return NextResponse.json(
      { error: "Could not load availability. Please try again." },
      { status: 500 },
    );
  }

  const bookedTimes = (data ?? []).map((r) => r.pickup_time as string);
  const blocked     = getBlockedSlots(bookedTimes);

  return NextResponse.json({
    date,
    blockedSlots: Array.from(blocked),
  });
}