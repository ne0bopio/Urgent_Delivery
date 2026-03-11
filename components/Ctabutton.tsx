"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

type Props = { onClick?: () => void };

export default function CTAButton({ onClick }: Props) {
  const ref    = useRef<HTMLDivElement>(null);
  // once: true — animation fires exactly once when it enters the viewport.
  // This is what prevents the re-trigger glitch on scroll.
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref}>
      <Link href="/book">
        <motion.button
          onClick={onClick}
          aria-label="Generate a delivery quote"
          // Roll-in: rises from below while spinning like a wheel landing
          initial={{ y: 90, rotate: -300, opacity: 0 }}
          animate={inView ? { y: 0, rotate: 0, opacity: 1 } : {}}
          transition={{
            type:      "spring",
            stiffness: 90,
            damping:   14,
            mass:      1.1,
            // Opacity resolves faster than the spring so it doesn't lag
            opacity: { duration: 0.35, ease: "easeOut" },
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            group relative flex
            h-52 w-52 md:h-64 md:w-64
            cursor-pointer items-center justify-center rounded-full
            bg-brand-olive
            shadow-[0_0_30px_rgba(31,90,82,0.15)]
            hover:shadow-[0_0_40px_rgba(242,106,91,0.25)]
            border border-brand-teal/40
            transition-shadow duration-500
          "
        >
          {/* Spinning HUD reticle */}
          <div className="absolute inset-3 rounded-full border-[2px] border-dashed border-brand-coral opacity-30 transition-all duration-700 group-hover:opacity-80 group-hover:animate-[spin_10s_linear_infinite]" />

          {/* Inner precision core */}
          <div className="absolute inset-5 rounded-full bg-brand-olive border border-brand-teal/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-brand-teal/10 -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-brand-teal/10 -translate-x-1/2" />
          </div>

          {/* Text content */}
          <div className="z-20 flex flex-col items-center gap-1">
            <span className="font-heading text-lg md:text-xl font-black tracking-[0.2em] text-brand-offwhite transition-all group-hover:drop-shadow-[0_0_8px_rgba(237,235,231,0.5)]">
              GENERATE
            </span>
            <span className="my-1 h-[2px] w-10 md:w-12 bg-brand-coral transition-all duration-500 group-hover:w-16 md:group-hover:w-20 group-hover:shadow-[0_0_10px_rgba(242,106,91,0.8)]" />
            <span className="font-heading text-lg md:text-xl font-black tracking-[0.2em] text-brand-offwhite transition-all group-hover:drop-shadow-[0_0_8px_rgba(237,235,231,0.5)]">
              QUOTE
            </span>
          </div>

          {/* Top status indicator */}
          <div className="absolute top-[42px] md:top-12 z-20 flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-brand-coral animate-pulse shadow-[0_0_5px_rgba(242,106,91,1)]" />
            <span className="font-body text-[8px] md:text-[9px] font-bold tracking-[0.2em] text-brand-teal">
              SYS.ONLINE
            </span>
          </div>

          {/* Bottom load label */}
          <div className="absolute bottom-[42px] md:bottom-12 z-20">
            <span className="font-body text-[8px] md:text-[9px] font-bold tracking-[0.2em] text-brand-offwhite/40 group-hover:text-brand-offwhite/70 transition-colors">
              [ LOW / MED LOAD ]
            </span>
          </div>

          {/* Mechanical notches */}
          <div className="absolute left-0   h-4 w-1 bg-brand-teal/40" />
          <div className="absolute right-0  h-4 w-1 bg-brand-teal/40" />
          <div className="absolute top-0   h-1 w-4 bg-brand-teal/40" />
          <div className="absolute bottom-0 h-1 w-4 bg-brand-teal/40" />
        </motion.button>
      </Link>
    </div>
  );
}