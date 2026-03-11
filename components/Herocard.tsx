import FuturisticVan from "./VanBackground";

export default function HeroCard() {
  return (
    <div
      className="relative max-w-lg w-full mt-10 md:mt-20 group"
      style={{ animation: "heroFadeUp 0.7s 0.15s ease both" }}
    >

      {/* ── Background Vans ──────────────────────────────────────── */}
      <div className="absolute -top-16 -left-24 z-0 opacity-20 scale-75 hidden md:block pointer-events-none">
        <FuturisticVan />
      </div>
      <div className="absolute -bottom-16 -right-24 z-0 opacity-20 scale-x-[-1] scale-75 hidden md:block pointer-events-none">
        <FuturisticVan />
      </div>

      {/* ── Scanner Frame — corner brackets ──────────────────────── */}
      <div className="absolute -inset-3 md:-inset-4 border-l-2 border-t-2 border-brand-teal/20 w-10 h-10 md:w-12 md:h-12 transition-all group-hover:border-brand-coral/40" />
      <div className="absolute -inset-3 md:-inset-4 border-r-2 border-b-2 border-brand-teal/20 w-10 h-10 md:w-12 md:h-12 ml-auto mt-auto transition-all group-hover:border-brand-coral/40" />

      {/* ── Main Terminal Body ────────────────────────────────────── */}
      <div
        className="
          relative overflow-hidden
          bg-brand-olive text-brand-offwhite
          shadow-[0_0_50px_rgba(0,0,0,0.4)]
          px-6 py-10 md:px-10 md:py-16
          text-center flex flex-col items-center
          gap-4 md:gap-6
          border-x border-brand-teal/10
        "
        style={{
          clipPath: "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)"
        }}
      >
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_4px,3px_100%]" />

        {/* Status Bar */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="h-[1px] w-6 md:w-8 bg-brand-teal/30" />
          <span className="font-body text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-brand-teal font-bold uppercase">
            Priority_Dispatch_Active
          </span>
          <span className="h-[1px] w-6 md:w-8 bg-brand-teal/30" />
        </div>

        {/* Headline */}
        <h1 className="font-heading font-black text-[2.6rem] leading-none md:text-5xl lg:text-6xl tracking-tighter text-brand-coral uppercase drop-shadow-[0_0_15px_rgba(242,106,91,0.3)]">
          URGENT<br />DELIVERY?
        </h1>

        {/* Availability Window */}
        <div className="bg-brand-offwhite/[0.03] border-y border-brand-teal/20 py-3 md:py-4 w-full">
          <p className="font-heading font-bold text-xl md:text-2xl lg:text-3xl text-brand-offwhite tracking-wide">
            Sat &amp; Sun <span className="text-brand-coral">ONLY</span>
          </p>
        </div>

        {/* Tagline */}
        <p className="font-body text-base md:text-lg text-brand-offwhite/90 leading-relaxed">
          We can deliver as soon as{" "}
          <span className="font-bold text-brand-offwhite">1 hour</span> notice.
        </p>

        {/* Bottom Sector Readout */}
        <div className="mt-1 md:mt-4 flex flex-col items-center">
          <div className="flex items-center gap-3 md:gap-4 text-brand-teal/60">
            <span className="text-[10px]">◢</span>
            <p className="font-heading text-sm font-black tracking-[0.35em] md:tracking-[0.4em] text-brand-offwhite uppercase">
              NJ / CT / NY
            </p>
            <span className="text-[10px]">◣</span>
          </div>
          <div className="mt-2 h-1 w-1 bg-brand-coral animate-pulse" />
        </div>
      </div>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}