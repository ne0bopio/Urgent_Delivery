// ============================================================
// emails/CustomerConfirmation.tsx
//
// React Email template sent to the customer after payment.
// Resend renders this server-side to HTML before sending.
// ============================================================

import * as React from "react";

type Props = {
  customerName:   string;
  pickupAddress:  string;
  dropoffAddress: string;
  pickupDate:     string;   // "2025-03-15"
  pickupTime:     string;   // "2:00 PM"
  itemCount:      number;
  heavyItems:     boolean;
  totalPrice:     number;   // in dollars
  bookingId:      string;
};

export default function CustomerConfirmation({
  customerName,
  pickupAddress,
  dropoffAddress,
  pickupDate,
  pickupTime,
  itemCount,
  heavyItems,
  totalPrice,
  bookingId,
}: Props) {
  return (
    <div style={wrapper}>
      {/* Header */}
      <div style={header}>
        <p style={mono}>URGENT DELIVERY CO.</p>
        <h1 style={heading}>Booking Confirmed ✓</h1>
        <p style={subtext}>Hi {customerName}, your delivery is scheduled. We&apos;ll be there.</p>
      </div>

      {/* Details */}
      <div style={card}>
        <p style={sectionLabel}>BOOKING DETAILS</p>

        <Row label="Booking ID"   value={`#${bookingId.slice(0, 8).toUpperCase()}`} />
        <Row label="Date"         value={pickupDate} />
        <Row label="Pickup time"  value={pickupTime} />
        <Row label="Pickup"       value={pickupAddress} />
        <Row label="Drop-off"     value={dropoffAddress} />
        <Row label="Items"        value={`${itemCount} item${itemCount > 1 ? "s" : ""}`} />
        <Row label="Heavy items"  value={heavyItems ? "Yes" : "No"} />
        <div style={divider} />
        <Row label="Total paid"   value={`$${totalPrice}`} accent />
      </div>

      {/* What next */}
      <div style={card}>
        <p style={sectionLabel}>WHAT HAPPENS NEXT</p>
        <p style={bodyText}>
          Our team will call you at least 30 minutes before arriving at your pickup location.
          If you need to reach us, reply to this email or call us directly.
        </p>
      </div>

      {/* Footer */}
      <div style={footer}>
        <p style={footerText}>Urgent Delivery Co. · NJ / NY / CT</p>
        <p style={footerText}>This is an automated confirmation. Do not reply.</p>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={row}>
      <span style={rowLabel}>{label}</span>
      <span style={accent ? rowValueAccent : rowValue}>{value}</span>
    </div>
  );
}

// ── Styles (inline — required for email clients) ──────────────

const wrapper: React.CSSProperties = {
  fontFamily:      "'Helvetica Neue', Helvetica, Arial, sans-serif",
  backgroundColor: "#F5F3EF",
  padding:         "32px 16px",
  maxWidth:        "560px",
  margin:          "0 auto",
};

const header: React.CSSProperties = {
  backgroundColor: "#2F3A33",
  borderRadius:    "12px 12px 0 0",
  padding:         "32px",
  textAlign:       "center",
};

const mono: React.CSSProperties = {
  fontFamily:    "monospace",
  fontSize:      "10px",
  letterSpacing: "0.3em",
  color:         "#1F5A52",
  textTransform: "uppercase",
  margin:        "0 0 12px 0",
};

const heading: React.CSSProperties = {
  fontSize:    "28px",
  fontWeight:  "900",
  color:       "#EDEBE7",
  margin:      "0 0 8px 0",
  lineHeight:  1.2,
};

const subtext: React.CSSProperties = {
  fontSize: "14px",
  color:    "rgba(237,235,231,0.5)",
  margin:   0,
};

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding:         "24px 32px",
  marginTop:       "2px",
};

const sectionLabel: React.CSSProperties = {
  fontFamily:    "monospace",
  fontSize:      "9px",
  letterSpacing: "0.3em",
  color:         "#1F5A52",
  textTransform: "uppercase",
  margin:        "0 0 16px 0",
};

const row: React.CSSProperties = {
  display:        "flex",
  justifyContent: "space-between",
  alignItems:     "baseline",
  padding:        "8px 0",
  borderBottom:   "1px solid #F0EDE9",
};

const rowLabel: React.CSSProperties = {
  fontFamily:    "monospace",
  fontSize:      "11px",
  color:         "#999",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const rowValue: React.CSSProperties = {
  fontSize:   "13px",
  fontWeight: "600",
  color:      "#2F3A33",
  textAlign:  "right",
  maxWidth:   "60%",
};

const rowValueAccent: React.CSSProperties = {
  ...rowValue,
  color:    "#F26A5B",
  fontSize: "18px",
};

const divider: React.CSSProperties = {
  borderTop: "2px solid #F0EDE9",
  margin:    "8px 0",
};

const bodyText: React.CSSProperties = {
  fontSize:   "14px",
  color:      "#555",
  lineHeight: 1.6,
  margin:     0,
};

const footer: React.CSSProperties = {
  backgroundColor: "#2F3A33",
  borderRadius:    "0 0 12px 12px",
  padding:         "20px 32px",
  textAlign:       "center",
  marginTop:       "2px",
};

const footerText: React.CSSProperties = {
  fontFamily:    "monospace",
  fontSize:      "9px",
  color:         "rgba(237,235,231,0.3)",
  letterSpacing: "0.1em",
  margin:        "4px 0",
};