// ============================================================
// app/api/bookings/route.ts — Create booking + Stripe Checkout
//
// REQUEST:  POST /api/bookings
// BODY:     { contact, pickup, dropoff, date, time,
//             itemCount, heavyItems, totalPrice,
//             distanceMiles, durationMins }
//
// FLOW:
//   1. Validate body
//   2. Expire stale pending bookings
//   3. Remove same-customer pending duplicates (retry-safe)
//   4. Server-side conflict guard (full overlap check)
//   5. Create Stripe Checkout Session
//   6. Save booking to Supabase with status = "pending_payment"
//   7. Return { checkoutUrl }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabase }    from "@/lib/db";
import { stripe }      from "@/lib/stripe";
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
  durationMins:  number;
};

// ── toISOEastern ──────────────────────────────────────────────
// Converts "YYYY-MM-DD" + "H:MM AM/PM" into ISO-8601 anchored
// to US Eastern Time. Handles DST automatically via Intl.
function toISOEastern(date: string, time: string): string {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Invalid time format: "${time}"`);

  let h         = parseInt(m[1], 10);
  const min     = parseInt(m[2], 10);
  const mer     = m[3].toUpperCase();

  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;

  const [yr, mo, dy] = date.split("-").map(Number);

  // Determine Eastern offset for that specific date (handles DST)
  const probe       = new Date(Date.UTC(yr, mo - 1, dy, 12, 0, 0));
  const etParts     = new Intl.DateTimeFormat("en-US", {
    timeZone:     "America/New_York",
    timeZoneName: "shortOffset",
  }).formatToParts(probe);
  const offsetPart  = etParts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  const offsetMatch = offsetPart.match(/GMT([+-]\d+)/);
  const offsetHours = offsetMatch ? parseInt(offsetMatch[1], 10) : -5;
  const offsetMins  = -(offsetHours * 60);

  const utcMs = Date.UTC(yr, mo - 1, dy, h, min, 0) + offsetMins * 60 * 1000;
  return new Date(utcMs).toISOString();
}

// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  const body = await req.json().catch(() => null) as BookingRequest | null;

  // ── 1. Validation ─────────────────────────────────────────
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

  const now = new Date().toISOString();

  // ── 2. Expire stale pending bookings ──────────────────────
  // Any pending_payment booking past its 30-min window gets
  // marked expired so it no longer blocks any time slot.
  const { error: expireError } = await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "pending_payment")
    .lt("expires_at", now);

  if (expireError) {
    console.error("[/api/bookings] Expire cleanup error (non-fatal):", expireError);
  }

  // ── 3. Remove same-customer pending duplicates ────────────
  // When a customer cancels checkout and retries, their old
  // pending booking would block the same time slot. Delete it
  // so the retry goes through cleanly. Only deletes pending
  // rows — confirmed bookings are never touched.
  const { error: dedupeError } = await supabase
    .from("bookings")
    .delete()
    .eq("status", "pending_payment")
    .eq("customer_email", body.contact.email)
    .eq("pickup_date", body.date);

  if (dedupeError) {
    console.error("[/api/bookings] Dedupe cleanup error (non-fatal):", dedupeError);
  }

  // ── 4. Server-side conflict check ─────────────────────────
  // Only considers:
  //   • confirmed bookings (paid)
  //   • pending_payment bookings that haven't expired yet
  //     (someone else is actively in checkout right now)
  const { data: existing, error: dbReadError } = await supabase
    .from("bookings")
    .select("pickup_time, duration_mins")
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

  // ── 5. Create Stripe Checkout Session ─────────────────────
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

  // ── 6. Save pending booking ───────────────────────────────
  const startAt   = toISOEastern(body.date, body.time);
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
      duration_mins:     body.durationMins,
      pickup_date:       body.date,
      pickup_time:       body.time,
      start_at:          startAt,
      end_at:            endAt,
      total_price_cents: amountCents,
      stripe_session_id: session.id,
      status:            "pending_payment",
      expires_at:        expiresAt,
    });

  if (dbWriteError) {
    // Non-fatal: Stripe metadata lets the webhook recover the booking
    console.error("[/api/bookings] DB write error (non-fatal):", dbWriteError);
  }

  // ── 7. Return checkout URL ────────────────────────────────
  return NextResponse.json({ checkoutUrl: session.url });
}