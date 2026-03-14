// ============================================================
// Footer.tsx — Retro-futuristic site footer
//
// Design anatomy (top → bottom):
//   1. Curved SVG top edge    → mirrors the navbar curve, bookends the page
//   2. Large ghost text       → "UD" watermark behind all content for depth
//   3. Scan line overlay      → CSS repeating-gradient for CRT/HUD texture
//   4. Editorial tagline row  → bold full-width statement
//   5. Three-column data grid → navigation | hours | contact (HUD style)
//   6. Coral divider          → one horizontal accent line
//   7. System status bar      → copyright + status indicators at the bottom
//
// DROP INTO: src/components/Footer.tsx
// USE IN:    layout.tsx (so it appears on every page) or each page.tsx
// ============================================================

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full">

      {/* ── 1. CURVED TOP EDGE ────────────────────────────────────
          Mirrors the navbar's curved bottom exactly.
          Creates a visual "container" around the page content —
          the off-white body is sandwiched between two olive arcs. */}
      <div className="w-full overflow-hidden leading-[0]" aria-hidden="true">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-[48px] md:h-[60px]"
        >
          {/* Upward arc — the inverse of the navbar downward arc */}
          <path d="M0,60 L1440,60 L1440,40 Q720,0 0,40 Z" fill="#2F3A33" />
        </svg>
      </div>

      {/* ── 2–7. FOOTER BODY ──────────────────────────────────────*/}
      <div className="relative bg-[#2F3A33] overflow-hidden">

        {/* ── SCAN LINE TEXTURE ──────────────────────────────────
            Repeating 1px lines at low opacity give the CRT/HUD
            depth without adding any visual weight.             */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
          }}
          aria-hidden="true"
        />

        {/* ── GHOST WATERMARK ────────────────────────────────────
            Massive "UD" behind everything — texture, not text.
            Absolutely positioned, low opacity, clipped by overflow-hidden. */}
        <div
          className="absolute -bottom-8 -right-4 font-heading font-black text-[22rem] leading-none text-[#EDEBE7] select-none pointer-events-none"
          style={{ opacity: 0.025, letterSpacing: "-0.05em" }}
          aria-hidden="true"
        >
          UD
        </div>

        {/* ── CONTENT WRAPPER ─────────────────────────────────── */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-12 pb-6">

          {/* ── EDITORIAL TAGLINE ────────────────────────────────
              Full-width bold statement. The most memorable thing
              in the footer — reads before anything else.        */}
          <div className="mb-10 border-l-2 border-[#F26A5B] pl-5">
            <p className="font-mono text-[10px] text-[#1F5A52] tracking-[0.35em] uppercase mb-2">
              [ Weekend Delivery · Est. {year} ]
            </p>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-[#EDEBE7] leading-tight tracking-tight">
              When it can&apos;t wait<br />
              <span className="text-[#F26A5B]">until Monday.</span>
            </h2>
          </div>

          {/* ── THREE-COLUMN GRID ────────────────────────────────
              Each column reads like a data panel / HUD readout. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 py-8 border-t border-b border-[#EDEBE7]/8">

            {/* ── COL 1: Navigation ───────────────────────────── */}
            <div className="relative flex flex-col">
              <DataPanelHeader label="NAV.LINKS" />
              <ul className="flex flex-col gap-3 mt-4">
                {[
                  { label: "Home",         href: "/"        },
                  { label: "Book a Pickup", href: "/book"   },
                  { label: "Contact Us",   href: "tel:+12017903994" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="
                        group flex items-center gap-3
                        font-body text-sm text-[#EDEBE7]/60
                        hover:text-[#EDEBE7] transition-colors duration-200
                      "
                    >
                      {/* Coral tick mark — appears on hover */}
                      <span className="
                        w-4 h-px bg-[#EDEBE7]/20
                        group-hover:w-6 group-hover:bg-[#F26A5B]
                        transition-all duration-300
                      " aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Add your logo here under the nav links */}
              <div className="mt-auto flex justify-start">
                <Image
                  src="/delivery_logo.svg" // Replace with your logo path
                  alt="Your Logo"
                  width={100}
                  height={50}
                  className="w-auto h-25"
                />
              </div>
            </div>

            {/* ── COL 2: Operating hours ──────────────────────── */}
            <div>
              <DataPanelHeader label="OPS.SCHEDULE" />
              <div className="flex flex-col gap-4 mt-4">

                {/* Live status badge */}
                <div className="inline-flex items-center gap-2 self-start">
                  <OperatingDot />
                  <span className="font-mono text-[10px] tracking-widest text-[#1F5A52] uppercase">
                    Weekend Service Active
                  </span>
                </div>

                {/* Day/hour rows */}
                {[
                  { day: "Saturday",  hours: "ALL DAY" },
                  { day: "Sunday",    hours: "ALL DAY" },
                  { day: "Mon — Fri", hours: "Closed" },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between items-baseline gap-4 border-b border-[#EDEBE7]/6 pb-3">
                    <span className="font-mono text-xs text-[#EDEBE7]/40 tracking-wide uppercase">
                      {day}
                    </span>
                    <span className={`font-body text-sm font-semibold ${hours === "Closed" ? "text-[#EDEBE7]/20" : "text-[#EDEBE7]"}`}>
                      {hours}
                    </span>
                  </div>
                ))}

                <p className="font-mono text-[9px] text-[#EDEBE7]/25 tracking-widest leading-relaxed">
                  MIN. 1 HR NOTICE REQUIRED
                </p>
              </div>
            </div>

            {/* ── COL 3: Service area + contact ───────────────── */}
            <div>
              <DataPanelHeader label="SVC.ZONE" />
              <div className="mt-4 flex flex-col gap-5">

                {/* States as coordinate-style data */}
                <div className="flex flex-col gap-2">
                  {[
                    { code: "NJ", name: "New Jersey"   },
                    { code: "NY", name: "New York"     },
                    { code: "CT", name: "Connecticut"  },
                  ].map(({ code, name }) => (
                    <div key={code} className="flex items-center gap-3">
                      <span className="font-heading font-black text-xl text-[#F26A5B] w-10 leading-none">
                        {code}
                      </span>
                      <span className="font-mono text-xs text-[#EDEBE7]/35 tracking-widest uppercase">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Contact block */}
                <div className="border-t border-[#EDEBE7]/8 pt-4 flex flex-col gap-2">
                  <DataPanelHeader label="CONTACT" />
                  <a
                    href="tel:+12017903994" // ← replace with real number
                    className="
                      mt-2 font-heading font-bold text-lg text-[#EDEBE7]
                      hover:text-[#F26A5B] transition-colors duration-200
                      tracking-wide
                    "
                  >
                    (201) 790-3994
                  </a>
                  <a
                    href="mailto:pablo.moncada31@gmail.com" // ← replace
                    className="
                      font-body text-xs text-[#EDEBE7]/40
                      hover:text-[#EDEBE7]/70 transition-colors duration-200
                      tracking-wide
                    "
                  >
                    pablo.moncada31@gmail.com
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* ── SYSTEM STATUS BAR ────────────────────────────────
              Bottom micro-bar: copyright left, status right.
              The "SYS v1.0" detail is the retro-futurist signature —
              like firmware version on a piece of hardware.          */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">

            {/* Copyright */}
            <p className="font-mono text-[10px] text-[#EDEBE7]/20 tracking-widest">
              © {year} URGENT DELIVERY CO. — ALL RIGHTS RESERVED
            </p>

            {/* Status indicators */}
            <div className="flex items-center gap-5">
              {/* Pulsing system online dot */}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F5A52] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1F5A52]" />
                </span>
                <span className="font-mono text-[9px] text-[#1F5A52]/60 tracking-widest uppercase">
                  Sys.Online
                </span>
              </div>

              {/* Divider tick */}
              <span className="text-[#EDEBE7]/10 text-xs" aria-hidden="true">|</span>

              {/* Version number — the signature detail */}
              <span className="font-mono text-[9px] text-[#EDEBE7]/15 tracking-widest">
                SYS v1.0
              </span>

              {/* Divider tick */}
              <span className="text-[#EDEBE7]/10 text-xs" aria-hidden="true">|</span>

              {/* Corner bracket decoration */}
              <span className="font-mono text-[9px] text-[#EDEBE7]/15 tracking-widest">
                NJ · NY · CT
              </span>
            </div>
          </div>

        </div>{/* end content wrapper */}
      </div>{/* end footer body */}
    </footer>
  );
}


// ── SUB-COMPONENTS ────────────────────────────────────────────

// HUD-style section label — used above each data column
function DataPanelHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      {/* Small coral square — the panel "indicator light" */}
      <span className="w-1.5 h-1.5 bg-[#F26A5B] flex-shrink-0" aria-hidden="true" />
      <span className="font-mono text-[9px] text-[#EDEBE7]/30 tracking-[0.3em] uppercase">
        {label}
      </span>
    </div>
  );
}

// Animated operating status dot
function OperatingDot() {
  // Returns teal pulsing if today is Sat/Sun, dim grey otherwise
  const today = new Date().getDay(); // 0=Sun, 6=Sat
  const isOperating = today === 0 || today === 6;

  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      {isOperating && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F5A52] opacity-60" />
      )}
      <span className={`
        relative inline-flex rounded-full h-2 w-2
        ${isOperating ? "bg-[#1F5A52]" : "bg-[#EDEBE7]/15"}
      `} />
    </span>
  );
}