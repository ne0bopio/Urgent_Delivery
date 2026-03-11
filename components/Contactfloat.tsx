"use client";

// ============================================================
// components/Contactfloat.tsx
//
// Props:
//   hidden — pass true to slide the button away (e.g. when a
//             payment modal is open and you don't want distractions).
//             Defaults to false so all other pages are unaffected.
// ============================================================

import { useEffect, useState } from "react";

type Props = { hidden?: boolean };

export default function ContactFloat({ hidden = false }: Props) {
  const [mounted, setMounted] = useState(false);

  // Slide in shortly after page load
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(t);
  }, []);

  // visible = mounted AND not explicitly hidden
  const visible = mounted && !hidden;

  return (
    <div
      aria-live="polite"
      aria-hidden={!visible}
      className={`
        fixed bottom-4 right-4 sm:bottom-6 sm:right-6
        z-50 flex flex-col items-end gap-2
        transition-all duration-500
        ${visible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-[120%] opacity-0 pointer-events-none"}
      `}
      style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >

      {/* Label chip */}
      <div
        className="bg-[#1F5A52] text-[#EDEBE7] px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs tracking-widest uppercase font-mono shadow-lg"
        style={{ clipPath: "polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12px)" }}
      >
        Large loads?
      </div>

      {/* Main contact card */}
      <div
        className="flex items-center gap-2.5 sm:gap-3 bg-[#2F3A33] pl-3 sm:pl-4 pr-1.5 sm:pr-2 py-1.5 sm:py-2 shadow-[0_0_20px_rgba(31,90,82,0.5)]"
        style={{ clipPath: "polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)" }}
      >
        <div className="flex flex-col">
          <span className="text-[#EDEBE7] font-heading font-bold text-xs sm:text-sm leading-tight">
            Contact us
          </span>
          <span className="text-[#F26A5B] font-mono text-[10px] sm:text-xs tracking-wider">
            for large loads
          </span>
        </div>

        {/* Phone button with pulse ring */}
        <a
          href="tel:+12017903994"
          aria-label="Call us for large delivery load enquiries"
          className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1F5A52] flex items-center justify-center text-[#EDEBE7] hover:bg-[#F26A5B] hover:text-white transition-colors duration-200 flex-shrink-0"
        >
          <span
            className="absolute inset-0 rounded-full border-2 border-[#1F5A52] animate-[contactPulse_2s_ease-out_infinite]"
            aria-hidden="true"
          />
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </a>
      </div>

      <style>{`
        @keyframes contactPulse {
          0%   { transform: scale(1);    opacity: 0.8; }
          60%  { transform: scale(1.55); opacity: 0;   }
          100% { transform: scale(1.55); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}