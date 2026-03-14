// ============================================================
// VanBackground.tsx — Looping geometric van background
//
// PERF CHANGES:
// ──────────────────────────────────────────────────────────────
// 1. REMOVED broken SVG <filter>. The <feMerge> referenced
//    an input called "blur" that didn't exist (the original
//    feGaussianBlur was deleted earlier). The browser was
//    still compositing a filter layer per van per frame — for
//    nothing. Removing it eliminates two unnecessary composite
//    layers from the paint pipeline.
//
// 2. ADDED will-change:transform on the animated wrappers.
//    This tells the browser to promote them to their own GPU
//    layer ONCE, rather than re-rasterizing on every frame of
//    the translateX animation. Standard practice for infinite
//    CSS transform animations.
//
// 3. REMOVED redundant SVG elements: wheel arch "cutouts"
//    (opacity 0.06 — invisible at the van's own 0.08–0.13
//    opacity), and reduced speed trail lines from 4 to 2.
//    Fewer SVG nodes = less paint work per frame.
//
// WHY CSS OVER FRAMER MOTION:
//    This is a simple infinite translateX loop. CSS animations
//    run on the compositor thread with zero JS per frame.
//    Framer Motion would add ~30KB to the bundle and run the
//    animation on the main thread — worse in every way for
//    this use case. Use Framer Motion for spring physics,
//    gestures, layout animations, and orchestrated sequences.
// ============================================================

export default function VanBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Van 1 — upper lane, slower, distant feel */}
      <div
        className="absolute"
        style={{
          top: "28%",
          width: "180px",
          animation: "vanDrive 14s linear infinite",
          willChange: "transform",
        }}
      >
        <GeometricVan opacity={0.13} glowColor="#1F5A52" />
      </div>

      {/* Van 2 — lower lane, faster, parallax depth */}
      <div
        className="absolute"
        style={{
          top: "62%",
          width: "140px",
          animation: "vanDrive 9s linear infinite",
          animationDelay: "-4s",
          willChange: "transform",
        }}
      >
        <GeometricVan opacity={0.08} glowColor="#F26A5B" />
      </div>

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
// GeometricVan — lightweight SVG van silhouette
//
// Stripped to the essential shapes that read at 8–13% opacity.
// No SVG filters, no invisible sub-6% opacity details.
// ============================================================
function GeometricVan({
  opacity,
  glowColor,
}: {
  opacity: number;
  glowColor: string;
}) {
  return (
    <svg
      viewBox="0 0 200 90"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      className="w-full h-auto"
    >
      {/* Speed trail lines — motion blur effect */}
      <line x1="0" y1="44" x2="28" y2="44" stroke="#2F3A33" strokeWidth="0.8" opacity="0.5" />
      <line x1="4" y1="50" x2="22" y2="50" stroke="#2F3A33" strokeWidth="0.5" opacity="0.3" />

      {/* Van body — no filter wrapper, just a plain <g> */}
      <g>
        {/* Cargo box */}
        <rect x="18" y="20" width="110" height="50" fill="#2F3A33" />

        {/* Cab */}
        <rect x="128" y="28" width="48" height="42" fill="#2F3A33" />

        {/* Cab roof slope */}
        <polygon points="128,20 128,28 176,28 176,20" fill="#2F3A33" />

        {/* Windshield */}
        <polygon points="136,30 170,30 166,50 140,50" fill="#EDEBE7" opacity="0.18" />
        <polygon points="136,30 170,30 166,50 140,50" fill="none" stroke="#EDEBE7" strokeWidth="0.6" opacity="0.4" />

        {/* Cargo side panel line */}
        <line x1="18" y1="48" x2="128" y2="48" stroke="#EDEBE7" strokeWidth="0.5" opacity="0.15" />

        {/* Headlight */}
        <rect x="172" y="38" width="8" height="6" fill={glowColor} opacity="0.9" />

        {/* Tail light */}
        <rect x="18" y="40" width="5" height="8" fill="#F26A5B" opacity="0.7" />

        {/* Rear door line */}
        <line x1="30" y1="20" x2="30" y2="70" stroke="#EDEBE7" strokeWidth="0.4" opacity="0.12" />

        {/* Rear wheel */}
        <circle cx="54" cy="72" r="14" fill="#1a1a1a" />
        <circle cx="54" cy="72" r="10" fill="#2F3A33" />
        <circle cx="54" cy="72" r="3" fill={glowColor} opacity="0.7" />

        {/* Front wheel */}
        <circle cx="144" cy="72" r="14" fill="#1a1a1a" />
        <circle cx="144" cy="72" r="10" fill="#2F3A33" />
        <circle cx="144" cy="72" r="3" fill={glowColor} opacity="0.7" />

        {/* Ground shadow */}
        <ellipse cx="99" cy="86" rx="85" ry="3" fill="#2F3A33" opacity="0.2" />
      </g>
    </svg>
  );
}