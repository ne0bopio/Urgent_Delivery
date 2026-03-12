// ============================================================
// lib/availability.ts
//
// Central source of truth for:
//   • TIME_SLOTS  — the bookable time grid
//   • isOffHours  — before 8 AM or after 6 PM
//   • timeToMinutes — "6:00 AM" → 360
//   • getBlockedSlots — which slots to grey out in the UI
//   • hasConflict     — server-side overlap guard
//
// KEY DESIGN DECISION:
//   All conflict logic works in "minutes since midnight" so it
//   never touches timezones, UTC conversion, or ISO strings.
//   The DB columns pickup_time + duration_mins are the source
//   of truth. start_at / end_at are calendar-display only.
// ============================================================

// ── Time slot grid ────────────────────────────────────────────
// Every slot a customer can book. Edit here to add/remove hours.
export const TIME_SLOTS = [
  "6:00 AM",  "7:00 AM",  "8:00 AM",  "9:00 AM",
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
  "2:00 PM",  "3:00 PM",  "4:00 PM",  "5:00 PM",
  "6:00 PM",  "7:00 PM",  "8:00 PM",
] as const;

export type TimeSlot = typeof TIME_SLOTS[number];

// ── Off-hours definition ──────────────────────────────────────
// Before 8 AM or at/after 6 PM triggers the +$25 surcharge.
export function isOffHours(time: string): boolean {
  const mins = timeToMinutes(time);
  return mins < 8 * 60 || mins >= 18 * 60;
}

// ── timeToMinutes ─────────────────────────────────────────────
// "6:00 AM"  → 360
// "12:00 PM" → 720
// "8:00 PM"  → 1200
// Throws on malformed input so callers surface the bug early.
export function timeToMinutes(time: string): number {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Invalid time format: "${time}"`);

  let h         = parseInt(m[1], 10);
  const min     = parseInt(m[2], 10);
  const meridiem = m[3].toUpperCase();

  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;

  return h * 60 + min;
}

// ── getBlockedSlots ───────────────────────────────────────────
// Called by GET /api/availability to build the grey-out set
// shown in the TimeSlotPicker.
//
// A slot S is blocked if picking it would start during an
// existing booking's active window.
//
// FIX vs old version:
//   Old: received string[] of start times, did exact match only.
//   New: receives { pickup_time, duration_mins }[] and checks
//        whether S falls inside [bookingStart, bookingEnd).
//
// NOTE: This conservatively blocks any slot that STARTS inside
// an existing window. It does NOT try to estimate how long the
// new job would take (we don't know that yet at browse time).
// The server-side hasConflict() does the full overlap check.
export function getBlockedSlots(
  bookings: Array<{ pickup_time: string; duration_mins: number }>,
): Set<string> {
  const blocked = new Set<string>();

  for (const slot of TIME_SLOTS) {
    const slotMins = timeToMinutes(slot);

    for (const booking of bookings) {
      const bookingStart = timeToMinutes(booking.pickup_time);
      const bookingEnd   = bookingStart + booking.duration_mins;

      // Block the slot if it starts inside an existing booking window
      if (slotMins >= bookingStart && slotMins < bookingEnd) {
        blocked.add(slot);
        break; // no need to check more bookings for this slot
      }
    }
  }

  return blocked;
}

// ── hasConflict ───────────────────────────────────────────────
// Called by POST /api/bookings as the server-side race-condition
// guard right before inserting.
//
// FIX vs old version:
//   Old: hasConflict(newTime, bookedTimes[]) — exact match only,
//        no awareness of how long any job takes.
//   New: hasConflict(newTime, newDurationMins, existing[]) —
//        full overlap check: does [newStart, newEnd) intersect
//        any [existingStart, existingEnd)?
//
// Standard interval overlap:  A.start < B.end  AND  A.end > B.start
export function hasConflict(
  newTime:         string,
  newDurationMins: number,
  existing:        Array<{ pickup_time: string; duration_mins: number }>,
): boolean {
  const newStart = timeToMinutes(newTime);
  const newEnd   = newStart + newDurationMins;

  for (const booking of existing) {
    const existingStart = timeToMinutes(booking.pickup_time);
    const existingEnd   = existingStart + booking.duration_mins;

    if (newStart < existingEnd && newEnd > existingStart) {
      return true; // overlap found
    }
  }

  return false;
}