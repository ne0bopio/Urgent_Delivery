// ============================================================
// lib/stripe.ts — Stripe client (server-side only)
//
// Never import this from a "use client" component.
// We use Stripe Checkout (hosted page) so no Stripe.js needed
// in the browser — just a server-side redirect to checkoutUrl.
// ============================================================

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
}

export const stripe = new Stripe(key, {
  // Pin the API version so Stripe's types match the runtime behavior.
  // Upgrade this deliberately when you're ready to review the changelog.
  apiVersion: "2026-02-25.clover",
  typescript: true,
});