// ============================================================
// app/api/bookings/route.ts — Create booking + Stripe Checkout
//
// REQUEST:  POST /api/bookings
// BODY:     { contact, pickup, dropoff, date, time,
//             itemCount, heavyItems, totalPrice, distanceMiles }
//
// FLOW:
//   1. Validate body
//   2. Double-check availability (server-side conflict guard)
//   3. Create Stripe Checkout Session (exact dollar amount)
//   4. Save booking to Supabase with status = "pending_payment"
//   5. Return { checkoutUrl }
//
// Browser → window.location.href = checkoutUrl → Stripe page
// After payment → Stripe fires webhook → /api/webhooks/stripe
//              → status updated to "confirmed"
//              → emails sent via Resend
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { hasConflict } from "@/lib/availability";

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
};

function toISO(date: string, time: string): string {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error("Invalid time");
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3].toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  const [yr, mo, dy] = date.split("-").map(Number);
  return new Date(yr, mo - 1, dy, h, min, 0).toISOString();
}

export async function POST(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  const body = await req.json().catch(() => null) as BookingRequest | null;

  if (
    !body?.contact?.name  ||
    !body?.contact?.email ||
    !body?.contact?.phone ||
    !body?.pickup  || !body?.dropoff ||
    !body?.date    || !body?.time    ||
    typeof body?.totalPrice !== "number"
  ) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // ── Server-side conflict check ────────────────────────────
  const now = new Date().toISOString();
  const { data: existing, error: dbReadError } = await supabase
    .from("bookings")
    .select("pickup_time")
    .eq("pickup_date", body.date)
    .or(`status.eq.confirmed,and(status.eq.pending_payment,expires_at.gt.${now})`);

  if (dbReadError) {
    console.error("[/api/bookings] DB read error:", dbReadError);
    return NextResponse.json(
      { error: "Could not verify availability. Please try again." },
      { status: 500 },
    );
  }

  const bookedTimes = (existing ?? []).map((r) => r.pickup_time as string);
  if (hasConflict(body.time, bookedTimes)) {
    return NextResponse.json(
      { error: "This time slot was just taken. Please go back and choose a different time." },
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
  const startAt   = toISO(body.date, body.time);
  const endAt     = new Date(new Date(startAt).getTime() + 4 * 60 * 60 * 1000).toISOString();
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
    // Non-fatal: metadata in Stripe session allows the webhook to recover
    console.error("[/api/bookings] DB write error (non-fatal):", dbWriteError);
  }

  return NextResponse.json({ checkoutUrl: session.url });
}