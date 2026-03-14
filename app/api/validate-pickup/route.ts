// ============================================================
// app/api/validate-pickup/route.ts
//
// Server-side proxy for Google Distance Matrix API.
// Keeps GOOGLE_MAPS_API_KEY out of the browser entirely.
//
// REQUEST:  POST /api/validate-pickup
//           Body: { address: string }
//
// RESPONSE: { ok: boolean, driveMinutes: number, error?: string }
//
// SETUP:
//   1. Add to your .env.local:
//        GOOGLE_MAPS_API_KEY=your_key_here
//   2. Enable "Distance Matrix API" in Google Cloud Console
//      (same project as your Maps JS / Places key for Phase 2)
// ============================================================

import { NextRequest, NextResponse } from "next/server";

// ── Constants ────────────────────────────────────────────────
const BASE_ADDRESS   = "361 Jersey Ave, Fairview, NJ 07022";
const MAX_DRIVE_SECS = 60 * 60; // 1 hour in seconds

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const { address } = await req.json();

    if (!address || typeof address !== "string" || address.trim().length < 5) {
      return NextResponse.json(
        { ok: false, error: "Invalid address provided." },
        { status: 400 }
      );
    }

    // 2. Make sure the API key is configured
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { ok: false, error: "Server configuration error." },
        { status: 500 }
      );
    }

    // 3. Call Google Distance Matrix API
    //    We use driving mode + departure_now for realistic current traffic.
    const params = new URLSearchParams({
      origins:        BASE_ADDRESS,
      destinations:   address.trim(),
      mode:           "driving",
      departure_time: "now",   // enables live traffic estimates
      key:            apiKey,
    });

    const googleUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`;
    const googleRes = await fetch(googleUrl, { next: { revalidate: 0 } });

    if (!googleRes.ok) {
      throw new Error(`Google API returned status ${googleRes.status}`);
    }

    const data = await googleRes.json();

    // 4. Parse the response
    //    data.rows[0].elements[0] is the origin→destination result
    const element = data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") {
      // Common statuses: ZERO_RESULTS (no route), NOT_FOUND (bad address)
      const status = element?.status ?? "UNKNOWN";
      return NextResponse.json({
        ok:    false,
        error: status === "NOT_FOUND"
          ? "Address not found. Please check and try again."
          : "Could not calculate a route to this address.",
      });
    }

    // duration_in_traffic is available when departure_time=now
    // Fall back to duration if traffic data isn't available
    const driveSecs    = element.duration_in_traffic?.value ?? element.duration?.value;
    const driveMinutes = Math.round(driveSecs / 60);
    const withinRange  = driveSecs <= MAX_DRIVE_SECS;

    return NextResponse.json({
      ok:           withinRange,
      driveMinutes,
      distanceText: element.distance?.text,  // e.g. "28.4 mi" — useful for display
      durationText: element.duration_in_traffic?.text ?? element.duration?.text,
      error: withinRange
        ? undefined
        : `That address is about ${driveMinutes} minutes from our base — we only service pickups within 1 hour of Fairview, NJ.`,
    });

  } catch (err) {
    console.error("validate-pickup error:", err);
    return NextResponse.json(
      { ok: false, error: "Validation failed. Please try again." },
      { status: 500 }
    );
  }
}