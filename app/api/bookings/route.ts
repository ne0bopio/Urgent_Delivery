// ============================================================
// app/api/bookings/route.ts — Create booking + Stripe Checkout
//
// REQUEST:  POST /api/bookings
// BODY:     { contact, pickup, dropoff, date, time,
//             itemCount, heavyItems, totalPrice,
//             distanceMiles, durationMins }   ← durationMins is NEW
//
// FLOW:
//   1. Validate body
//   2. Server-side conflict guard (full overlap check)
//   3. Create Stripe Checkout Session
//   4. Save booking to Supabase with status = "pending_payment"
//   5. Return { checkoutUrl }
//
// FIXES vs old version:
//   1. durationMins added to BookingRequest type (was silently dropped)
//   2. end_at now uses real durationMins (was hardcoded to +4 hrs)
//   3. duration_mins stored in DB (new column — add via migration)
//   4. hasConflict() now receives full booking objects with duration
//      so it can do a proper overlap check (was start-time match only)
//   5. toISO() replaced with toISOEastern() which respects ET timezone
//      (old version created dates in server local time then called
//       .toISOString() which converts to UTC — off by 4-5 hours)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabase }   from "@/lib/db";
import { stripe }     from "@/lib/stripe";
import { hasConflict } from "@/lib/availability";

// ── Types ─────────────────────────────────────────────────────
type BookingRequest = {
  contact: {
    name:  string;
    email: string;
    phone: string;
  };
  pickup:        string;
  dropoff:       string;
  date:          string;
  time:          string;
  itemCount:     number;
  heavyItems:    boolean | null;
  totalPrice:    number;
  distanceMiles: number | null;
  durationMins:  number;   // ← FIX: was missing entirely
};

// ── toISOEastern ──────────────────────────────────────────────
// Converts a "YYYY-MM-DD" date + "H:MM AM/PM" time string into
// an ISO-8601 string anchored to US Eastern Time.
//
// FIX vs old toISO():
//   Old: new Date(yr, mo-1, dy, h, min, 0).toISOString()
//   This builds a date in the SERVER's local timezone (UTC on
//   Vercel), then converts to UTC string. A 6:00 AM ET booking
//   would be stored as "06:00 UTC" = 01:00 AM ET — 5 hours off.
//
//   New: explicitly appends the Eastern offset string so the
//   Date constructor receives a timezone-aware input.
//   Handles DST automatically via Intl.DateTimeFormat.
function toISOEastern(date: string, time: string): string {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Invalid time format: "${time}"`);

  let h         = parseInt(m[1], 10);
  const min     = parseInt(m[2], 10);
  const mer     = m[3].toUpperCase();

  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;

  // Build a UTC date first at midnight of the given date
  const [yr, mo, dy] = date.split("-").map(Number);

  // Determine Eastern offset for that specific date (handles DST)
  // We create a probe date and ask Intl what the UTC offset is
  const probe        = new Date(Date.UTC(yr, mo - 1, dy, 12, 0, 0)); // noon UTC
  const etParts      = new Intl.DateTimeFormat("en-US", {
    timeZone:     "America/New_York",
    timeZoneName: "shortOffset",
  }).formatToParts(probe);
  const offsetPart   = etParts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  // offsetPart is like "GMT-4" or "GMT-5"
  const offsetMatch  = offsetPart.match(/GMT([+-]\d+)/);
  const offsetHours  = offsetMatch ? parseInt(offsetMatch[1], 10) : -5;
  const offsetMins   = -(offsetHours * 60); // convert to minutes behind UTC

  // Build the final UTC timestamp
  const utcMs = Date.UTC(yr, mo - 1, dy, h, min, 0) + offsetMins * 60 * 1000;
  return new Date(utcMs).toISOString();
}

// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  const body = await req.json().catch(() => null) as BookingRequest | null;

  // ── Validation ────────────────────────────────────────────
  if (
    !body?.contact?.name  ||
    !body?.contact?.email ||
    !body?.contact?.phone ||
    !body?.pickup  || !body?.dropoff ||
    !body?.date    || !body?.time    ||
    typeof body?.totalPrice    !== "number" ||
    typeof body?.durationMins  !== "number" || body.durationMins <= 0
  ) {
    return NextResponse.json({ error: "Missing or invalid required fields." }, { status: 400 });
  }

  // ── Server-side conflict check ────────────────────────────
  // FIX: old version only fetched pickup_time and did exact-match.
  // New version fetches pickup_time + duration_mins, then runs
  // a full overlap check: does [newStart, newStart+newDuration)
  // intersect any [existingStart, existingStart+existingDuration)?
  const now = new Date().toISOString();
  const { data: existing, error: dbReadError } = await supabase
    .from("bookings")
    .select("pickup_time, duration_mins")   // ← FIX: was select("pickup_time") only
    .eq("pickup_date", body.date)
    .or(`status.eq.confirmed,and(status.eq.pending_payment,expires_at.gt.${now})`);

  if (dbReadError) {
    console.error("[/api/bookings] DB read error:", dbReadError);
    return NextResponse.json(
      { error: "Could not verify availability. Please try again." },
      { status: 500 },
    );
  }

  const bookedJobs = (existing ?? []).map((r) => ({
    pickup_time:   r.pickup_time   as string,
    duration_mins: r.duration_mins as number,
  }));

  // ← FIX: was hasConflict(body.time, stringArray)
  if (hasConflict(body.time, body.durationMins, bookedJobs)) {
    return NextResponse.json(
      {
        error:
          "This time slot was just taken. " +
          "Please go back and choose a different time.",
      },
      { status: 409 },
    );
  }

  // ── Create Stripe Checkout Session ────────────────────────
  const amountCents = Math.round(body.totalPrice * 100);

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode:                 "payment",
      line_items: [{
        quantity:   1,
        price_data: {
          currency:    "usd",
          unit_amount: amountCents,
          product_data: {
            name:        "Weekend Delivery",
            description: `${body.date} at ${body.time} · Pickup: ${body.pickup}`,
          },
        },
      }],
      customer_email: body.contact.email,
      success_url: `${appUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/book/cancel`,
      metadata: {
        pickup:         body.pickup,
        dropoff:        body.dropoff,
        date:           body.date,
        time:           body.time,
        item_count:     String(body.itemCount),
        heavy_items:    body.heavyItems ? "true" : "false",
        distance_miles: body.distanceMiles !== null ? String(body.distanceMiles) : "",
        duration_mins:  String(body.durationMins),
        customer_name:  body.contact.name,
        customer_phone: body.contact.phone,
      },
    });
  } catch (err) {
    console.error("[/api/bookings] Stripe error:", err);
    return NextResponse.json(
      { error: "Payment session could not be created. Please try again." },
      { status: 500 },
    );
  }

  // ── Save pending booking ──────────────────────────────────
  const startAt   = toISOEastern(body.date, body.time);
  // FIX: end_at now uses real durationMins (was hardcoded to +4 hrs)
  const endAt     = new Date(
    new Date(startAt).getTime() + body.durationMins * 60 * 1000,
  ).toISOString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { error: dbWriteError } = await supabase
    .from("bookings")
    .insert({
      customer_name:     body.contact.name,
      customer_email:    body.contact.email,
      customer_phone:    body.contact.phone,
      pickup_address:    body.pickup,
      dropoff_address:   body.dropoff,
      item_count:        body.itemCount,
      heavy_items:       body.heavyItems ?? false,
      distance_miles:    body.distanceMiles,
      duration_mins:     body.durationMins,   // ← FIX: new column (add via migration)
      pickup_date:       body.date,
      pickup_time:       body.time,
      start_at:          startAt,
      end_at:            endAt,               // ← FIX: now accurate
      total_price_cents: amountCents,
      stripe_session_id: session.id,
      status:            "pending_payment",
      expires_at:        expiresAt,
    });

  if (dbWriteError) {
    // Non-fatal: Stripe metadata lets the webhook recover the booking
    console.error("[/api/bookings] DB write error (non-fatal):", dbWriteError);
  }

  return NextResponse.json({ checkoutUrl: session.url });
}