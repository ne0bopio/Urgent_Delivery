// ============================================================
// components/book/AddressAutocomplete.tsx
//
// Controlled input — form state is always in sync whether the
// user picks from the Places dropdown OR types manually.
//
// Two sync paths:
//   1. User selects a suggestion → place_changed fires → onChange(formatted_address)
//   2. User types manually       → onChange fires on every keystroke
//
// The input is controlled via `value` so the parent's state
// is always the source of truth. A ref keeps the Autocomplete
// instance from being re-created on every render.
// ============================================================

"use client";

import { useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

type Props = {
  value:       string;
  onChange:    (address: string) => void;
  placeholder: string;
  label:       string;
};

export default function AddressAutocomplete({ value, onChange, placeholder, label }: Props) {
  const inputRef       = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const placesLib = useMapsLibrary("places");

  // ── Create Autocomplete once when library is ready ────────
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    autocompleteRef.current = new placesLib.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      fields: ["formatted_address"],
      types:  ["address"],
    });

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    });

    return () => google.maps.event.removeListener(listener);
    // onChange is intentionally excluded — we only want this to
    // run once when the library loads, not re-attach on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib]);

  return (
    <div className="mt-6 w-full">
      <label className="font-mono text-[10px] text-[#EDEBE7]/40 tracking-widest uppercase block mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full bg-[#EDEBE7]/5 border-b-2 border-[#EDEBE7]/20
            text-[#EDEBE7] placeholder-[#EDEBE7]/20
            px-0 py-4 text-lg font-body
            focus:outline-none focus:border-[#F26A5B]
            transition-colors duration-200
            rounded-none
          "
        />

        {/* Spinner — shown while Places library is loading */}
        {!placesLib && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2">
            <span className="block w-3 h-3 border border-[#1F5A52] border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </div>

      <p className="font-mono text-[9px] text-[#EDEBE7]/20 mt-2 tracking-widest uppercase">
        Start typing · Select from suggestions · NJ / NY / CT only
      </p>
    </div>
  );
}