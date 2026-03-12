// ============================================================
// app/api/check-availability/route.ts
//
// POST /api/check-availability
// BODY: { date, time, durationMins }
//
// Runs the full hasConflict() overlap check server-side with
// the real durationMins of the new job — the same logic that
// /api/bookings uses, but without creating anything.
//
// Called from page.tsx immediately after calculate() resolves
// so the user sees a conflict before the ContactModal opens.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabase }      from "@/lib/db";
import { hasConflict }   from "@/lib/availability";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    date:         string;
    time:         string;
    durationMins: number;
  } | null;

  if (!body?.date || !body?.time || typeof body?.durationMins !== "number") {
    return NextResponse.json(
      { error: "date, time, and durationMins are required." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("bookings")
    .select("pickup_time, duration_mins")
    .eq("pickup_date", body.date)
    .or(`status.eq.confirmed,and(status.eq.pending_payment,expires_at.gt.${now})`);

  if (error) {
    console.error("[/api/check-availability] DB error:", error);
    // Fail open — /api/bookings is the hard gate
    return NextResponse.json({ available: true });
  }

  const existing = (data ?? []).map((r) => ({
    pickup_time:   r.pickup_time   as string,
    duration_mins: r.duration_mins as number,
  }));

  if (hasConflict(body.time, body.durationMins, existing)) {
    return NextResponse.json({
      available: false,
      reason:
        "This time slot conflicts with an existing booking once your travel time is included. " +
        "Please go back and choose a different time.",
    });
  }

  return NextResponse.json({ available: true });
}