// ============================================================
// app/api/distance/route.ts — Distance Matrix API proxy
//
// REQUEST:  POST /api/distance
//           Body: { pickup: string, dropoff: string }
//
// RESPONSE: 200 { distanceMiles, price, isPremium, durationMins }
//           400 { error }   — bad addresses or too-far block
//           500 { error }   — missing key or Google failure
//
// durationMins = delivery drive + return drive (pessimistic traffic).
// This is the total calendar block that gets saved to the DB and
// used by hasConflict() to prevent double bookings.
// ============================================================

import { NextRequest, NextResponse }                        from "next/server";
import { Client, TravelMode, UnitSystem, TrafficModel }     from "@googlemaps/google-maps-services-js";
import { DISTANCE_TIERS, DISTANCE_LIMITS }                  from "@/lib/distance";

const mapsClient   = new Client({});
const BASE_ADDRESS = "361 Jersey Avenue, Fairview, NJ";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.pickup || !body?.dropoff) {
    return NextResponse.json({ error: "Addresses required" }, { status: 400 });
  }

  const { pickup, dropoff } = body;
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;

  if (!apiKey) {
    console.error("[/api/distance] GOOGLE_MAPS_SERVER_KEY is not set");
    return NextResponse.json(
      { error: "Server configuration error. Please try again later." },
      { status: 500 },
    );
  }

  try {
    // ── Distance Matrix: 2 origins × 2 destinations ────────────
    //
    // FIX: The previous version used:
    //   origins:      [pickup, BASE_ADDRESS]
    //   destinations: [dropoff, pickup]
    //   → rows[1][0] = BASE → dropoff  ✗  (wrong direction)
    //
    // Corrected layout:
    //   origins:      [pickup, dropoff]
    //   destinations: [dropoff, BASE_ADDRESS]
    //   → rows[0][0] = pickup → dropoff     ✓ (delivery leg)
    //   → rows[1][0] = dropoff → BASE       ✓ (return leg)
    //
    // Traffic direction matters in NJ — measuring the wrong
    // direction gives a different (inaccurate) return time.
    const response = await mapsClient.distancematrix({
      params: {
        origins:        [pickup, dropoff],
        destinations:   [dropoff, BASE_ADDRESS],
        mode:           TravelMode.driving,
        traffic_model:  TrafficModel.pessimistic,  // guard against NJ traffic
        departure_time: new Date(),                // required for traffic_model
        units:          UnitSystem.imperial,
        key:            apiKey,
      },
    });

    // Leg 1: pickup → dropoff (the delivery)
    const deliveryElement = response.data.rows[0].elements[0];
    // Leg 2: dropoff → BASE  (the return trip)
    const returnElement   = response.data.rows[1].elements[0];

    if (deliveryElement.status !== "OK" || returnElement.status !== "OK") {
      return NextResponse.json(
        { error: "One or both addresses could not be reached. Please check and try again." },
        { status: 400 },
      );
    }

    const distanceMiles   = Math.round((deliveryElement.distance.value / 1609.34) * 10) / 10;
    const deliveryTimeMins = Math.round(deliveryElement.duration_in_traffic.value / 60);
    const returnTimeMins   = Math.round(returnElement.duration_in_traffic.value / 60);

    // Total calendar block = drive there + drive back.
    // We add a 15-min buffer for loading/unloading at destination.
    const UNLOAD_BUFFER_MINS = 15;
    const durationMins = deliveryTimeMins + UNLOAD_BUFFER_MINS + returnTimeMins;

    // ── Hard block: > 2-hour one-way drive ─────────────────────
    if (
      distanceMiles   > DISTANCE_LIMITS.HARD_BLOCK_MILES ||
      deliveryTimeMins > DISTANCE_LIMITS.MAX_DRIVE_MINUTES
    ) {
      return NextResponse.json(
        {
          error:
            `Delivery exceeds our maximum range ` +
            `(${deliveryTimeMins} min · ${distanceMiles} mi). ` +
            `We currently serve NJ, NY, and CT only.`,
        },
        { status: 400 },
      );
    }

    // ── Tiered pricing + deadhead surcharge ────────────────────
    const tier  = DISTANCE_TIERS.find((t) => distanceMiles <= t.maxMiles);
    let   price = tier?.price ?? 55;

    const isPremium = distanceMiles > DISTANCE_LIMITS.LOCAL_ZONE_MILES;
    if (isPremium) {
      const extraMiles = distanceMiles - DISTANCE_LIMITS.LOCAL_ZONE_MILES;
      price += Math.round(extraMiles * DISTANCE_LIMITS.DEADHEAD_FEE_PER_MILE);
    }

    return NextResponse.json({
      distanceMiles,
      price,
      isPremium,
      durationMins,   // ← total calendar block (delivery + buffer + return)
    });

  } catch (err) {
    console.error("[/api/distance] Unexpected error:", err);
    return NextResponse.json(
      { error: "Distance calculation failed. Please try again." },
      { status: 500 },
    );
  }
}