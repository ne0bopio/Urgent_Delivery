"use client";

// ============================================================
// hooks/useAvailability.ts
//
// Fetches blocked time slots for a given date from
// /api/availability. Called from TimeSlotPicker whenever
// the user selects a new date.
// ============================================================

import { useState, useCallback } from "react";

type AvailabilityState = {
  blockedSlots: Set<string>;
  loading:      boolean;
  error:        string | null;
  fetch:        (date: string) => Promise<void>;
  reset:        () => void;
};

export function useAvailability(): AvailabilityState {
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const fetch = useCallback(async (date: string) => {
    if (!date) return;
    setLoading(true);
    setError(null);

    try {
      const res  = await window.fetch(`/api/availability?date=${date}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not load availability.");
        setBlockedSlots(new Set());
        return;
      }

      setBlockedSlots(new Set<string>(data.blockedSlots ?? []));
    } catch {
      setError("Network error. Please try again.");
      setBlockedSlots(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBlockedSlots(new Set());
    setError(null);
    setLoading(false);
  }, []);

  return { blockedSlots, loading, error, fetch, reset };
}