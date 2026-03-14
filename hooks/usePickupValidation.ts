// ============================================================
// hooks/usePickupValidation.ts
//
// Watches the pickup address field and validates it against
// /api/validate-pickup (Google Distance Matrix → 1hr limit).
//
// Returns a `pickupStatus` object the UI can render directly,
// and an `isPickupValid` boolean for gating canAdvance.
//
// USAGE in page.tsx:
//   const { pickupStatus, isPickupValid } = usePickupValidation(form.pickup, step);
// ============================================================

import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────
export type PickupStatus =
  | { state: "idle"       }
  | { state: "validating" }
  | { state: "valid";   driveMinutes: number; distanceText?: string }
  | { state: "invalid"; driveMinutes: number; error: string }
  | { state: "error";   error: string };

const PICKUP_STEP       = 4;
const DEBOUNCE_MS       = 800;
const MIN_INPUT_LENGTH  = 6;

export function usePickupValidation(pickup: string, step: number) {
  const [pickupStatus, setPickupStatus] = useState<PickupStatus>({ state: "idle" });

  // Debounced value — only fires after user pauses typing
  const [debouncedPickup, setDebouncedPickup] = useState(pickup);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPickup(pickup), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [pickup]);

  // Reset to idle immediately when user starts typing again
  useEffect(() => {
    if (pickupStatus.state !== "idle") {
      setPickupStatus({ state: "idle" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup]);

  // Validate once the debounced value settles
  useEffect(() => {
    // Only run on step 3 with enough input
    if (step !== PICKUP_STEP) return;
    if (debouncedPickup.trim().length < MIN_INPUT_LENGTH) {
      setPickupStatus({ state: "idle" });
      return;
    }

    let cancelled = false;

    async function validate() {
      setPickupStatus({ state: "validating" });

      try {
        const res  = await fetch("/api/validate-pickup", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ address: debouncedPickup }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (data.ok) {
          setPickupStatus({
            state:        "valid",
            driveMinutes: data.driveMinutes,
            distanceText: data.distanceText,
          });
        } else if (typeof data.driveMinutes === "number") {
          // Route found but out of range
          setPickupStatus({
            state:        "invalid",
            driveMinutes: data.driveMinutes,
            error:        data.error ?? "Address is outside our service range.",
          });
        } else {
          // Address not found or network/server error
          setPickupStatus({
            state: "error",
            error: data.error ?? "Could not validate this address.",
          });
        }
      } catch {
        if (!cancelled) {
          setPickupStatus({
            state: "error",
            error: "Validation failed. Check your connection and try again.",
          });
        }
      }
    }

    validate();
    return () => { cancelled = true; };
  }, [debouncedPickup, step]);

  // Reset when leaving step 3 (e.g. user goes back then forward)
  useEffect(() => {
    if (step !== PICKUP_STEP) {
      setPickupStatus({ state: "idle" });
    }
  }, [step]);

  const isPickupValid = pickupStatus.state === "valid";

  return { pickupStatus, isPickupValid };
}