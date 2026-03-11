// ============================================================
// app/api/distance/route.ts — Distance Matrix API proxy
//
// REQUEST:  POST /api/distance
//           Body: { pickup: string, dropoff: string }
//
// RESPONSE: 200 { distanceMiles, price, isPremium }
//           400 { error }   — bad addresses or TOO_FAR block
//           500 { error }   — missing key or Google failure
// ============================================================

// app/api/distance/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Client, TravelMode, UnitSystem, TrafficModel } from "@googlemaps/google-maps-services-js";
import { DISTANCE_TIERS, DISTANCE_LIMITS } from "@/lib/distance";

const mapsClient = new Client({});
const BASE_ADDRESS = "361 Jersey Avenue, Fairview, NJ";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.pickup || !body?.dropoff) {
    return NextResponse.json({ error: "Addresses required" }, { status: 400 });
  }

  const { pickup, dropoff } = body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const response = await mapsClient.distancematrix({
      params: {
        origins:      [pickup, BASE_ADDRESS], // Added Base to check return trip
        destinations: [dropoff, pickup],
        mode:         TravelMode.driving,
        traffic_model: TrafficModel.pessimistic, // Guard against NJ traffic
        departure_time: new Date(), // Required for traffic_model to work
        units:        UnitSystem.imperial,
        key:          apiKey!,
      },
    });

    // Leg 1: Pickup to Dropoff (The Delivery)
    const deliveryElement = response.data.rows[0].elements[0];
    // Leg 2: Dropoff back to Base (The Return Trip)
    const returnElement = response.data.rows[1].elements[0];

    if (deliveryElement.status !== "OK" || returnElement.status !== "OK") {
      return NextResponse.json({ error: "Location unreachable" }, { status: 400 });
    }

    const distanceMiles = Math.round((deliveryElement.distance.value / 1609.34) * 10) / 10;
    const driveTimeMins = Math.round(deliveryElement.duration_in_traffic.value / 60);
    const returnTimeMins = Math.round(returnElement.duration_in_traffic.value / 60);

    // ── 1. The 2-Hour Hard Block (Check Distance AND Time) ──
    if (distanceMiles > DISTANCE_LIMITS.HARD_BLOCK_MILES || driveTimeMins > DISTANCE_LIMITS.MAX_DRIVE_MINUTES) {
      return NextResponse.json({
        error: `Delivery exceeds our 2-hour safety limit. (${driveTimeMins} mins / ${distanceMiles} mi).`
      }, { status: 400 });
    }

    // ── 2. Tiered Pricing + Deadhead Surcharge ──
    const tier = DISTANCE_TIERS.find((t) => distanceMiles <= t.maxMiles);
    let price = tier?.price ?? 55;

    const isPremium = distanceMiles > DISTANCE_LIMITS.LOCAL_ZONE_MILES;
    if (isPremium) {
      // Add $1.00 for every mile past the 20-mile local zone
      const extraMiles = distanceMiles - DISTANCE_LIMITS.LOCAL_ZONE_MILES;
      price += Math.round(extraMiles * DISTANCE_LIMITS.DEADHEAD_FEE_PER_MILE);
    }

    return NextResponse.json({ 
      distanceMiles, 
      price, 
      isPremium, 
      durationMins: driveTimeMins + returnTimeMins // Total time block for your calendar
    });

  } catch (err) {
    return NextResponse.json({ error: `Calculation failed ${ err }` }, { status: 500 });
  }
}