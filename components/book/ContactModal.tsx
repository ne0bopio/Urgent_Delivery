"use client";

// ============================================================
// components/book/ContactModal.tsx
//
// Slides up after quote is ready. Sends to /api/bookings → Stripe Checkout.
// the quote is ready. Collects name, email, phone — all required
// by Bookla to create the client record and send confirmation emails.
//
// On submit:
//   1. POSTs to /api/bookings
//   2. On success → redirects to Bookla's Stripe Checkout URL
//   3. On error   → shows inline error, lets user retry
// ============================================================

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ContactInfo = {
  name:  string;
  email: string;
  phone: string;
};

type BookingPayload = {
  contact:       ContactInfo;
  pickup:        string;
  dropoff:       string;
  date:          string;
  time:          string;
  itemCount:     number;
  heavyItems:    boolean | null;
  totalPrice:    number;
  distanceMiles: number | null;
  durationMins:  number;           // ← total calendar block (delivery + buffer + return)
};

type Props = {
  isOpen:  boolean;
  onClose: () => void;
  payload: Omit<BookingPayload, "contact">;  // everything except contact info
};

// ── Validation ────────────────────────────────────────────────

function validateContact(c: ContactInfo): string | null {
  if (!c.name.trim())                         return "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return "Please enter a valid email address.";
  if (!/^\+?[\d\s\-().]{7,}$/.test(c.phone)) return "Please enter a valid phone number.";
  return null;
}

// ── Component ─────────────────────────────────────────────────

export default function ContactModal({ isOpen, onClose, payload }: Props) {
  const [contact,    setContact]    = useState<ContactInfo>({ name: "", email: "", phone: "" });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);

  const setField = (k: keyof ContactInfo, v: string) => {
    setContact((prev) => ({ ...prev, [k]: v }));
    setFieldError(null);  // clear error as user types
    setApiError(null);
  };

  const handleSubmit = async () => {
    const validationError = validateContact(contact);
    if (validationError) { setFieldError(validationError); return; }

    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/bookings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ contact, ...payload }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // ── Redirect to Stripe Checkout (hosted by Bookla) ────
      window.location.href = data.checkoutUrl;

    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="modal-panel"
            className="
              fixed bottom-0 left-0 right-0 z-50
              md:inset-0 md:flex md:items-center md:justify-center
              pointer-events-none
            "
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div
              className="
                pointer-events-auto w-full md:max-w-md
                bg-[#2F3A33]
                rounded-t-2xl md:rounded-2xl
                p-8 flex flex-col gap-6
                shadow-[0_-20px_60px_rgba(0,0,0,0.5)]
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] text-[#1F5A52] tracking-[0.3em] uppercase mb-1">
                    [ ALMOST THERE ]
                  </p>
                  <h2 className="font-heading font-black text-2xl text-[#EDEBE7] leading-tight">
                    Your details
                  </h2>
                  <p className="font-body text-sm text-[#EDEBE7]/45 mt-1">
                    Used to confirm your booking and send your receipt.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="text-[#EDEBE7]/30 hover:text-[#EDEBE7] transition-colors text-xl leading-none mt-1"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-4">
                <ContactField
                  label="Full name"
                  type="text"
                  value={contact.name}
                  onChange={(v) => setField("name", v)}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  disabled={loading}
                />
                <ContactField
                  label="Email address"
                  type="email"
                  value={contact.email}
                  onChange={(v) => setField("email", v)}
                  placeholder="jane@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
                <ContactField
                  label="Phone number"
                  type="tel"
                  value={contact.phone}
                  onChange={(v) => setField("phone", v)}
                  placeholder="+1 (555) 000-0000"
                  autoComplete="tel"
                  disabled={loading}
                />
              </div>

              {/* Validation / API error */}
              <AnimatePresence>
                {(fieldError || apiError) && (
                  <motion.p
                    key="modal-error"
                    className="font-mono text-[10px] text-[#F26A5B] tracking-wide leading-relaxed -mt-2"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    ⚠ {fieldError ?? apiError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`
                  w-full py-4 rounded-full
                  font-heading font-black text-sm tracking-widest uppercase
                  transition-all duration-300
                  ${loading
                    ? "bg-[#EDEBE7]/10 text-[#EDEBE7]/30 cursor-not-allowed"
                    : "bg-[#F26A5B] text-white hover:bg-[#e05a4a] hover:scale-105 active:scale-95 shadow-lg shadow-[#F26A5B]/20"
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating booking...
                  </span>
                ) : (
                  "Confirm & Pay →"
                )}
              </button>

              <p className="font-mono text-[9px] text-center text-[#EDEBE7]/20 tracking-widest -mt-2">
                SECURE CHECKOUT · STRIPE ENCRYPTED · NO CARD STORED
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Field sub-component ───────────────────────────────────────

function ContactField({
  label, type, value, onChange, placeholder, autoComplete, disabled,
}: {
  label:        string;
  type:         string;
  value:        string;
  onChange:     (v: string) => void;
  placeholder:  string;
  autoComplete: string;
  disabled:     boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] text-[#EDEBE7]/40 tracking-widest uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="
          w-full bg-[#EDEBE7]/5 border border-[#EDEBE7]/20
          text-[#EDEBE7] placeholder-[#EDEBE7]/20
          rounded-lg px-4 py-3 font-body text-sm
          focus:outline-none focus:border-[#F26A5B]
          disabled:opacity-40
          transition-colors duration-200
        "
      />
    </div>
  );
}