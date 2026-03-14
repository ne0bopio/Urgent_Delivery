"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "HOME",       href: "/"               },
  { label: "CONTACT US", href: "tel:+12017903994" },
  { label: "BOOK",       href: "/book"            },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="relative z-10 flex flex-col"
      style={{ animation: "navFadeDown 0.5s ease both" }}
    >
      {/* ── Main bar ─────────────────────────────────────────── */}
      <nav className="bg-brand-olive px-5 pt-4 pb-2 flex items-center justify-between relative z-20 md:grid md:grid-cols-3 md:px-6 md:pt-5">

        {/* Col 1: Logo */}
        <div className="flex justify-start">
          <Link
            href="/"
            aria-label="Home"
            className="group relative inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full shadow-sm transition-all hover:scale-105"
          >
            <div className="absolute inset-[-4px] rounded-full border  border-brand-teal/20 transition-all group-hover:border-brand-teal/60" />
            <Image
              src="/delivery_logo.svg"
              alt="Urgent Delivery logo"
              width={96}
              height={96}
              className="h-12 md:h-18 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Col 2: Desktop nav links */}
        <ul className="hidden md:flex items-center justify-center gap-10 list-none m-0 p-0">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="group relative text-brand-offwhite/70 font-heading font-black text-[11px] tracking-[0.2em] transition-colors duration-300 hover:text-brand-offwhite hover:drop-shadow-[0_0_5px_rgba(237,235,231,0.5)]"
              >
                {label}
                <span className="absolute -bottom-2 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-brand-coral transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_8px_rgba(242,106,91,0.8)]" />
              </a>
            </li>
          ))}
        </ul>

        {/* Col 3: Retro call button (desktop only) */}
        <div className="hidden md:flex justify-end items-center pr-1">
          <a
            href="/book"
            aria-label="Call us now"
            className="
              group relative flex items-center gap-2.5
              px-4 py-2
              bg-brand-coral/10 hover:bg-brand-coral
              border border-brand-coral/50 hover:border-brand-coral
              text-brand-coral hover:text-white
              font-mono font-bold text-[10px] tracking-[0.2em] uppercase
              transition-all duration-300
              overflow-hidden
            "
            style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
          >
            {/* Scan-line sweep on hover */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              aria-hidden="true"
            />

            {/* Pulsing dot */}
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-coral opacity-60 group-hover:bg-white" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-coral group-hover:bg-white transition-colors" />
            </span>



            <span className="relative">Book a delivery</span>
          </a>
        </div>

        {/* Mobile: Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden flex flex-col justify-center gap-[5px] p-2 -mr-1"
        >
          <span className={`block h-[2px] bg-brand-offwhite transition-all duration-300 origin-center ${open ? "w-6 rotate-45 translate-y-[7px]" : "w-6"}`} />
          <span className={`block h-[2px] bg-brand-offwhite transition-all duration-300 ${open ? "w-0 opacity-0" : "w-4 opacity-100"}`} />
          <span className={`block h-[2px] bg-brand-offwhite transition-all duration-300 origin-center ${open ? "w-6 -rotate-45 -translate-y-[7px]" : "w-6"}`} />
        </button>
      </nav>

      {/* ── Mobile dropdown ──────────────────────────────────── */}
      <div
        className={`md:hidden bg-[#2F3A33] relative z-20 overflow-hidden transition-all duration-500 ${open ? "max-h-72 border-b border-brand-teal/15" : "max-h-0"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.2, 0.64, 1)" }}
        aria-hidden={!open}
      >
        <ul className="flex flex-col px-5 py-3 gap-0 list-none">
          {NAV_LINKS.map(({ label, href }, i) => (
            <li key={label}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 py-4 border-b border-brand-teal/10 last:border-0 text-brand-offwhite/60 hover:text-brand-offwhite transition-colors duration-200"
              >
                <span className="font-mono text-[9px] text-brand-coral tracking-widest tabular-nums">0{i + 1}</span>
                <span className="font-heading font-black text-sm tracking-[0.22em]">{label}</span>
                <span className="ml-auto font-mono text-[9px] text-brand-teal/40">→</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile call button */}
        <div className="px-5 pb-4">
          <a
            href="tel:+12017903994"
            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-coral/10 border border-brand-coral/40 text-brand-coral font-mono font-bold text-[10px] tracking-[0.2em] uppercase rounded"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Book a delivery
          </a>
        </div>
      </div>

      {/* ── Aerodynamic curve ───────────────────────────────── */}
      <div className="w-full overflow-hidden leading-[0] relative z-10 -mt-[1px]" aria-hidden="true">
        <svg viewBox="0 0 1440 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[16px] md:h-[24px]">
          <path d="M0,0 L1440,0 L1440,0 Q720,24 0,0 Z" fill="#2F3A33" />
          <path d="M1440,0 Q720,24 0,0" fill="none" stroke="#1F5A52" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      <style>{`
        @keyframes navFadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}