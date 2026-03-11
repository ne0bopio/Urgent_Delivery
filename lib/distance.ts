// ============================================================
// lib/distance.ts — Distance price calculation
//
// Tier structure:
//   0–5 mi    → $0
//   5–15 mi   → $15
//   15–30 mi  → $30
//   30–140 mi → $55
//   140–200mi → 2.5× the base tier price (PREMIUM)
//   200+ mi   → HARD BLOCK (route.ts returns 400 + TOO_FAR)
//
// DISTANCE_TIERS and DISTANCE_LIMITS are exported so
// app/api/distance/route.ts uses the exact same constants.
// ============================================================

export type DistanceTier = { maxMiles: number; price: number };

export const DISTANCE_TIERS: DistanceTier[] = [
  { maxMiles: 5,   price: 0  },
  { maxMiles: 15,  price: 15 },
  { maxMiles: 30,  price: 30 },
  { maxMiles: 80,  price: 55 }, // Reduced from 140 to 80 (Our 2-hour max)
];

export const DISTANCE_LIMITS = {
  LOCAL_ZONE_MILES:   20,    // No deadhead fee under 20 miles
  HARD_BLOCK_MILES:   80,    // Strict 2-hour/80-mile cap
  DEADHEAD_FEE_PER_MILE: 1.00, // Fee for the "return trip" on long hauls
  MAX_DRIVE_MINUTES:  120,   // 2 Hour cap from Google Traffic
} as const;

export type DistanceResult = {
  price:         number;
  isPremium:     boolean;
  distanceMiles: number;
  durationMins:  number; // Added so the UI can show "Estimated Travel Time"
};


export async function getDistancePrice(
  pickup:  string,
  dropoff: string,
): Promise<DistanceResult> {
  const res = await fetch("/api/distance", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ pickup, dropoff }),
  });

  const json = await res.json().catch(() => ({ error: "Unknown error" }));

  if (!res.ok) {
    // Surface the server's message directly — route.ts crafts
    // user-readable strings for TOO_FAR and other cases.
    throw new Error(json.error ?? "Distance calculation failed");
  }

  return json as DistanceResult;
}