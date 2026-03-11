"use client";

// ============================================================
// components/book/TimeSlotPicker.tsx
//
// Visual time slot grid for Step 1.
// - Blocked slots (from /api/availability) are grayed out
//   and unclickable — user sees what's available before
//   filling any other details.
// - Selected slot gets the coral highlight.
// - Refreshes availability when date changes.
// ============================================================

import { useEffect } from "react";
import { useAvailability } from "@/hooks/useAvailability";
import { TIME_SLOTS, isOffHours } from "@/lib/availability";

type Props = {
  date:         string;        // "YYYY-MM-DD" — controlled by parent
  time:         string;        // currently selected time slot
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
};

export default function TimeSlotPicker({
  date, time, onDateChange, onTimeChange,
}: Props) {
  const { blockedSlots, loading, error, fetch: fetchAvailability, reset } = useAvailability();

  // Fetch availability whenever the date changes
  useEffect(() => {
    if (date) {
      fetchAvailability(date);
      // Clear selected time if it becomes blocked for the new date
      onTimeChange("");
    } else {
      reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // ── Today's local date string for min= attribute ──────────
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6 mt-4 w-full">

      {/* ── Date picker ──────────────────────────────────── */}
      <div>
        <label className="font-mono text-[10px] text-[#EDEBE7]/40 tracking-widest uppercase block mb-2">
          Date (Sat / Sun only)
        </label>
        <input
          type="date"
          value={date}
          min={todayStr}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) { onDateChange(""); return; }
            // Only allow weekends
            const day = new Date(val).getUTCDay();
            if (day === 0 || day === 6) {
              onDateChange(val);
            }
            // Silently reject weekday picks
          }}
          className="
            w-full max-w-xs
            bg-[#EDEBE7]/5 border border-[#EDEBE7]/20
            text-[#EDEBE7] rounded-lg px-4 py-3
            font-body text-sm
            focus:outline-none focus:border-[#F26A5B]
            transition-colors
          "
        />
        {date && (() => {
          const d = new Date(date).getUTCDay();
          if (d !== 0 && d !== 6) {
            return (
              <p className="font-mono text-[10px] text-[#F26A5B] mt-1 tracking-wide">
                ⚠ We only operate on weekends.
              </p>
            );
          }
        })()}
      </div>

      {/* ── Slot grid ────────────────────────────────────── */}
      {date && (new Date(date).getUTCDay() === 0 || new Date(date).getUTCDay() === 6) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="font-mono text-[10px] text-[#EDEBE7]/40 tracking-widest uppercase">
              Available times
            </label>
            {loading && (
              <span className="font-mono text-[9px] text-[#1F5A52] tracking-widest animate-pulse">
                CHECKING...
              </span>
            )}
          </div>

          {error ? (
            <p className="font-mono text-[10px] text-[#F26A5B] tracking-wide">
              ⚠ {error}
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isBlocked  = blockedSlots.has(slot);
                const isSelected = slot === time;
                const offHours   = isOffHours(slot);

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBlocked || loading}
                    onClick={() => onTimeChange(isSelected ? "" : slot)}
                    className={`
                      relative py-3 px-2 rounded-xl
                      font-mono text-xs tracking-wide
                      transition-all duration-200
                      ${isSelected
                        ? "bg-[#F26A5B] text-white border-2 border-[#F26A5B] scale-105"
                        : isBlocked
                          ? "bg-[#EDEBE7]/3 text-[#EDEBE7]/15 border border-[#EDEBE7]/8 cursor-not-allowed"
                          : offHours
                            ? "bg-[#F26A5B]/5 text-[#EDEBE7]/70 border border-[#F26A5B]/25 hover:border-[#F26A5B]/60 hover:text-[#EDEBE7]"
                            : "bg-[#EDEBE7]/5 text-[#EDEBE7]/70 border border-[#EDEBE7]/20 hover:border-[#F26A5B]/60 hover:text-[#EDEBE7]"
                      }
                    `}
                  >
                    {slot}
                    {isBlocked && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-xl">
                        <span className="font-mono text-[8px] text-[#EDEBE7]/20 tracking-widest">TAKEN</span>
                      </span>
                    )}
                    {!isBlocked && offHours && !isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#F26A5B] text-white font-mono text-[7px] px-1 rounded-full leading-tight py-0.5">
                        +$25
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#F26A5B]" />
              <span className="font-mono text-[8px] text-[#EDEBE7]/30 tracking-widest">SELECTED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#EDEBE7]/5 border border-[#EDEBE7]/8" />
              <span className="font-mono text-[8px] text-[#EDEBE7]/30 tracking-widest">TAKEN</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#F26A5B]/5 border border-[#F26A5B]/25" />
              <span className="font-mono text-[8px] text-[#EDEBE7]/30 tracking-widest">OFF-HOURS +$25</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#EDEBE7]/5 border border-[#EDEBE7]/20" />
              <span className="font-mono text-[8px] text-[#EDEBE7]/30 tracking-widest">AVAILABLE</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}