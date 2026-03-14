// ============================================================
// app/api/webhooks/stripe/route.ts — Stripe webhook handler
//
// Fires on: checkout.session.completed
//   1. Verify Stripe signature
//   2. Find booking by stripe_session_id → update to "confirmed"
//   3. Send customer confirmation + owner alert via Resend
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/db";
import { Resend } from "resend";
import CustomerConfirmation from "@/emails/CustomerConfirmation";
import OwnerAlert from "@/emails/OwnerAlert";
import React from "react";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook/stripe] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // ── 1. Verify Stripe signature ────────────────────────────
  // Must read raw body BEFORE any other parsing
  const rawBody = await req.text();
  const sig     = req.headers.get("stripe-signature") ?? "";

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook/stripe] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── 2. Only handle checkout.session.completed ─────────────
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  console.log("[webhook/stripe] Processing session:", session.id);

  // ── 3. Find booking in Supabase ───────────────────────────
  const { data: bookings, error: findError } = await supabase
    .from("bookings")
    .select("*")
    .eq("stripe_session_id", session.id)
    .limit(1);

  if (findError) {
    console.error("[webhook/stripe] DB find error:", findError);
    // Return 200 so Stripe doesn't keep retrying a DB error
    return NextResponse.json({ received: true });
  }

  if (!bookings?.length) {
    // Edge case: DB write in /api/bookings failed — reconstruct from metadata
    console.warn("[webhook/stripe] Booking not found, inserting from metadata. Session:", session.id);

    const meta    = session.metadata ?? {};
    const startAt = parseTimeToISO(meta.date ?? "", meta.time ?? "");
    const endAt   = new Date(new Date(startAt).getTime() + 3 * 60 * 60 * 1000).toISOString();

    await supabase.from("bookings").insert({
      customer_name:     meta.customer_name    ?? session.customer_details?.name ?? "",
      customer_email:    session.customer_email ?? "",
      customer_phone:    meta.customer_phone    ?? "",
      pickup_address:    meta.pickup            ?? "",
      dropoff_address:   meta.dropoff           ?? "",
      item_count:        parseInt(meta.item_count   ?? "1", 10),
      heavy_items:       meta.heavy_items === "true",
      distance_miles:    meta.distance_miles ? parseFloat(meta.distance_miles) : null,
      pickup_date:       meta.date              ?? "",
      pickup_time:       meta.time              ?? "",
      start_at:          startAt,
      end_at:            endAt,
      total_price_cents: session.amount_total   ?? 0,
      stripe_session_id: session.id,
      status:            "confirmed",
      expires_at:        null,
    });
  } else {
    // Normal path — update pending_payment → confirmed
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "confirmed", expires_at: null })
      .eq("stripe_session_id", session.id);

    if (updateError) {
      console.error("[webhook/stripe] DB update error:", updateError);
    } else {
      console.log("[webhook/stripe] Booking confirmed:", bookings[0].id);
    }
  }

  // ── 4. Assemble email data ────────────────────────────────
  const bk   = bookings?.[0];
  const meta = session.metadata ?? {};

  const emailData = {
    bookingId:      bk?.id              ?? session.id,
    customerName:   bk?.customer_name   ?? meta.customer_name  ?? session.customer_details?.name ?? "Customer",
    customerEmail:  bk?.customer_email  ?? session.customer_email ?? "",
    customerPhone:  bk?.customer_phone  ?? meta.customer_phone  ?? "",
    pickupAddress:  bk?.pickup_address  ?? meta.pickup          ?? "",
    dropoffAddress: bk?.dropoff_address ?? meta.dropoff         ?? "",
    pickupDate:     bk?.pickup_date     ?? meta.date            ?? "",
    pickupTime:     bk?.pickup_time     ?? meta.time            ?? "",
    itemCount:      bk?.item_count      ?? parseInt(meta.item_count ?? "1", 10),
    heavyItems:     bk?.heavy_items     ?? meta.heavy_items === "true",
    distanceMiles:  bk?.distance_miles  ?? (meta.distance_miles ? parseFloat(meta.distance_miles) : null),
    totalPrice:     Math.round((bk?.total_price_cents ?? session.amount_total ?? 0) / 100),
  };

  // ── 5. Send emails ────────────────────────────────────────
  // FROM address rules:
  //   • Testing (domain not verified): use "onboarding@resend.dev"
  //   • Production (domain verified):  use "no-reply@yourdomain.com"
  //
  // Switch the FROM_EMAIL line when you verify your domain in Resend.
  const FROM_EMAIL = "Urgent Delivery Co. <onboarding@urgentdelivery.xyz>"; // Placeholder — replace with your verified domain email
  const ownerEmail = process.env.OWNER_EMAIL;

  const emailResults = await Promise.allSettled([
    resend.emails.send({
      from:    FROM_EMAIL,
      to:      emailData.customerEmail,
      subject: `Booking Confirmed — ${emailData.pickupDate} at ${emailData.pickupTime}`,
      html:    await render(React.createElement(CustomerConfirmation, emailData)),
    }),
    ownerEmail
      ? resend.emails.send({
          from:    FROM_EMAIL,
          to:      ownerEmail,
          subject: `🚐 New Booking — ${emailData.pickupDate} ${emailData.pickupTime} · $${emailData.totalPrice}`,
          html:    await render(React.createElement(OwnerAlert, emailData)),
        })
      : Promise.resolve(null),
  ]);

  emailResults.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[webhook/stripe] Email ${i} failed:`, r.reason);
    } else {
      console.log(`[webhook/stripe] Email ${i} sent`);
    }
  });

  return NextResponse.json({ received: true });
}

// ── Helper ────────────────────────────────────────────────────

function parseTimeToISO(date: string, time: string): string {
  try {
    const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return new Date().toISOString();
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
    const [yr, mo, dy] = date.split("-").map(Number);
    return new Date(yr, mo - 1, dy, h, min, 0).toISOString();
  } catch {
    return new Date().toISOString();
  }
}