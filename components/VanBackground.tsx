// ============================================================
// VanBackground.tsx — Looping geometric van background
//
// Two vans drive left → right in an infinite loop, at slightly
// different speeds and vertical positions for depth.
// Sits behind all page content via z-0 + pointer-events-none.
//
// HOW TO USE:
//   Add <VanBackground /> as the FIRST child inside <main>
//   in page.tsx. The main already has position:relative so
//   the absolute children here will be contained correctly.
//
// TUNING:
//   • Opacity of each van → change opacity on <g> elements
//   • Speed             → change animationDuration values
//   • Vertical position → change the `top` style values
//   • Van size          → change the width on the wrappers
// ============================================================

export default function VanBackground() {
  return (
    // Full-page fixed layer — always behind content
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >

      {/* ── Van 1 — main lane, slower ─────────────────────────
          Positioned at roughly 1/3 height (near the hero card).
          Lower opacity — feels distant, background depth.      */}
      <div
        className="absolute"
        style={{
          top: "28%",
          // Start fully off-screen left, end fully off-screen right
          animation: "vanDrive 14s linear infinite",
          width: "180px",
        }}
      >
        <GeometricVan opacity={0.13} glowColor="#1F5A52" />
      </div>

      {/* ── Van 2 — lower lane, faster, slightly larger ────────
          Gives a parallax feel — closer van moves faster.
          Delayed start so the two vans aren't always together. */}
      <div
        className="absolute"
        style={{
          top: "62%",
          animation: "vanDrive 9s linear infinite",
          animationDelay: "-4s", // offset so they don't enter together
          width: "140px",
        }}
      >
        <GeometricVan opacity={0.08} glowColor="#F26A5B" />
      </div>

      {/* ── Keyframes ─────────────────────────────────────────
          translateX drives the van from -width (off left)
          to 100vw (off right). Using vw so it works at any
          screen width without JS measurement.                 */}
      <style>{`
        @keyframes vanDrive {
          from { transform: translateX(-220px); }
          to   { transform: translateX(100vw);  }
        }
      `}</style>

    </div>
  );
}


// ============================================================
// GeometricVan — the SVG van silhouette
//
// Design language: sharp angles, flat planes, no curves except
// the wheels. Inspired by side-view technical drawings.
//
// Structure:
//   • Main body — two rectangular volumes (cab + cargo)
//   • Windshield — angled parallelogram cutout
//   • Headlight + tail light — small filled rectangles
//   • Wheels — clean circles with hub dot
//   • Speed trail — horizontal lines fading left (motion blur)
//   • Glow filter — very soft bloom on the whole van
// ============================================================
function GeometricVan({
  opacity,
  glowColor,
}: {
  opacity: number;
  glowColor: string;
}) {
  const id = glowColor === "#F26A5B" ? "glow-coral" : "glow-teal";

  return (
    <svg
      viewBox="0 0 200 90"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      className="w-full h-auto"
    >
      <defs>
        {/* Subtle bloom filter applied to the whole van group */}
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Speed trail lines (drawn BEHIND the van) ──────────
          Horizontal dashes that stream off the rear of the van.
          They fade via opacity to suggest motion blur.         */}
      <line x1="0"  y1="44" x2="28" y2="44" stroke="#2F3A33" strokeWidth="0.8" opacity="0.5" />
      <line x1="4"  y1="50" x2="22" y2="50" stroke="#2F3A33" strokeWidth="0.5" opacity="0.3" />
      <line x1="0"  y1="56" x2="18" y2="56" stroke="#2F3A33" strokeWidth="0.4" opacity="0.2" />
      <line x1="8"  y1="38" x2="24" y2="38" stroke="#2F3A33" strokeWidth="0.4" opacity="0.2" />

      {/* ── Van body group (filter applied here) ──────────────*/}
      <g filter={`url(#${id})`}>

        {/* CARGO BOX — the large rear rectangle */}
        <rect x="18" y="20" width="110" height="50" fill="#2F3A33" />

        {/* CAB — slightly taller front section */}
        <rect x="128" y="28" width="48" height="42" fill="#2F3A33" />

        {/* CAB ROOF SLOPE — the angled transition between
            cargo roof and cab roof (geometric, no curves)     */}
        <polygon
          points="128,20 128,28 176,28 176,20"
          fill="#2F3A33"
        />

        {/* WINDSHIELD — angled cutout in off-white
            The angle (parallelogram) is what makes it feel
            purposefully geometric and futuristic.             */}
        <polygon
          points="136,30 170,30 166,50 140,50"
          fill="#EDEBE7"
          opacity="0.18"
        />

        {/* WINDSHIELD FRAME — thin line tracing the glass */}
        <polygon
          points="136,30 170,30 166,50 140,50"
          fill="none"
          stroke="#EDEBE7"
          strokeWidth="0.6"
          opacity="0.4"
        />

        {/* CARGO SIDE PANEL LINE — horizontal rule that
            separates upper and lower body like a real van     */}
        <line
          x1="18" y1="48" x2="128" y2="48"
          stroke="#EDEBE7"
          strokeWidth="0.5"
          opacity="0.15"
        />

        {/* HEADLIGHT — sharp rectangle, glowColor accent */}
        <rect x="172" y="38" width="8" height="6" fill={glowColor} opacity="0.9" />

        {/* TAIL LIGHT — smaller, rear */}
        <rect x="18" y="40" width="5" height="8" fill="#F26A5B" opacity="0.7" />

        {/* REAR DOOR LINE — vertical split on cargo box */}
        <line
          x1="30" y1="20" x2="30" y2="70"
          stroke="#EDEBE7"
          strokeWidth="0.4"
          opacity="0.12"
        />

        {/* WHEEL ARCH CUTOUTS — rectangular, geometric */}
        <rect x="38"  y="62" width="32" height="12" fill="#EDEBE7" rx="1" opacity="0.06" />
        <rect x="128" y="62" width="32" height="12" fill="#EDEBE7" rx="1" opacity="0.06" />

        {/* WHEELS — the only circular elements.
            Two concentric circles per wheel: tyre + hub.     */}
        {/* Rear wheel */}
        <circle cx="54"  cy="72" r="14" fill="#1a1a1a" />
        <circle cx="54"  cy="72" r="10" fill="#2F3A33" />
        <circle cx="54"  cy="72" r="3"  fill={glowColor} opacity="0.7" />

        {/* Front wheel */}
        <circle cx="144" cy="72" r="14" fill="#1a1a1a" />
        <circle cx="144" cy="72" r="10" fill="#2F3A33" />
        <circle cx="144" cy="72" r="3"  fill={glowColor} opacity="0.7" />

        {/* GROUND SHADOW — thin ellipse under the van
            Grounds the vehicle so it doesn't float.          */}
        <ellipse cx="99" cy="86" rx="85" ry="3" fill="#2F3A33" opacity="0.2" />

      </g>
    </svg>
  );
}