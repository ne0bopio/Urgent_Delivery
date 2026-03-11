import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Test endpoint is working!",
    stripe_secret_loaded: !!process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret_loaded: !!process.env.STRIPE_WEBHOOK_SECRET,
    resend_key_loaded: !!process.env.RESEND_API_KEY,
  });
}