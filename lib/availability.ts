// ============================================================
// lib/availability.ts — Conflict detection (pure functions)
//
// Blocking rule (asymmetric):
//   Each confirmed booking blocks:
//     • 1 hour BEFORE  — driver needs to leave to reach pickup in time
//     • 3 hours AFTER  — estimated delivery window
//
//   So a booking at 2:00 PM blocks: 1:00 PM, 2:00 PM, 3:00 PM, 4:00 PM
//   And a new booking at 1:30 PM would be blocked by the 2:00 PM booking.
//
// Off-hours:
//   Slots before 8:00 AM or after 6:00 PM carry an extra surcharge.
//   The surcharge amount lives in lib/pricing.ts (OFF_HOURS_SURCHARGE).
//   This file just exports the detection helper.
// ============================================================

// Hours blocked before a booked pickup (driver travel/prep time)
export const BLOCK_BEFORE_HOURS = 1;
// Hours blocked after a booked pickup (estimated delivery duration)
export const BLOCK_AFTER_HOURS  = 3;

// Standard business hours — slots outside this range get a surcharge
export const OFF_HOURS_START = 8;   // before 8:00 AM
export const OFF_HOURS_END   = 18;  // after  6:00 PM (18:00)

// All bookable time slots — 6 AM to 10 PM, 1-hour intervals.
export const TIME_SLOTS = [
  "6:00 AM",  "7:00 AM",  "8:00 AM",  "9:00 AM",  "10:00 AM",
  "11:00 AM", "12:00 PM", "1:00 PM",  "2:00 PM",  "3:00 PM",
  "4:00 PM",  "5:00 PM",  "6:00 PM",  "7:00 PM",  "8:00 PM",
  "9:00 PM",  "10:00 PM",
];

// ── Helpers ───────────────────────────────────────────────────

/**
 * Parse "h:mm AM/PM" → decimal hours since midnight.
 * e.g. "2:30 PM" → 14.5
 */
export function timeToHours(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Cannot parse time: "${t}"`);
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3].toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return h + min / 60;
}

/**
 * Returns true if the candidate slot falls within the blocked window
 * of an existing booking.
 *
 * Window: [bookedTime - BLOCK_BEFORE_HOURS, bookedTime + BLOCK_AFTER_HOURS)
 * e.g. booked at 2:00 PM → blocks 1:00 PM through 4:59 PM
 */
export function isConflict(candidateTime: string, bookedTime: string): boolean {
  const candidate = timeToHours(candidateTime);
  const booked    = timeToHours(bookedTime);
  const diff      = candidate - booked; // positive = candidate is later
  return diff > -BLOCK_BEFORE_HOURS && diff < BLOCK_AFTER_HOURS;
}

/**
 * Returns true if the given time slot is outside business hours
 * (before OFF_HOURS_START or at/after OFF_HOURS_END).
 */
export function isOffHours(time: string): boolean {
  const h = timeToHours(time);
  return h < OFF_HOURS_START || h >= OFF_HOURS_END;
}

/**
 * Given confirmed pickup_times on a date, return blocked slots.
 */
export function getBlockedSlots(bookedTimes: string[]): Set<string> {
  const blocked = new Set<string>();

  for (const slot of TIME_SLOTS) {
    for (const booked of bookedTimes) {
      if (isConflict(slot, booked)) {
        blocked.add(slot);
        break;
      }
    }
  }

  return blocked;
}

/**
 * Server-side conflict check before creating a booking.
 */
export function hasConflict(candidateTime: string, bookedTimes: string[]): boolean {
  return bookedTimes.some((bt) => isConflict(candidateTime, bt));
}