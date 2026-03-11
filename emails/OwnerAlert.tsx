// ============================================================
// emails/OwnerAlert.tsx
//
// React Email template sent to YOU when a new booking is paid.
// Contains all the operational info you need at a glance.
// ============================================================

import * as React from "react";

type Props = {
  customerName:   string;
  customerEmail:  string;
  customerPhone:  string;
  pickupAddress:  string;
  dropoffAddress: string;
  pickupDate:     string;
  pickupTime:     string;
  itemCount:      number;
  heavyItems:     boolean;
  distanceMiles:  number | null;
  totalPrice:     number;
  bookingId:      string;
};

export default function OwnerAlert({
  customerName,
  customerEmail,
  customerPhone,
  pickupAddress,
  dropoffAddress,
  pickupDate,
  pickupTime,
  itemCount,
  heavyItems,
  distanceMiles,
  totalPrice,
  bookingId,
}: Props) {
  return (
    <div style={wrapper}>
      {/* Alert header */}
      <div style={header}>
        <p style={mono}>NEW BOOKING — PAYMENT CONFIRMED</p>
        <h1 style={heading}>🚐 New Delivery Order</h1>
        <p style={priceBadge}>${totalPrice} COLLECTED</p>
      </div>

      {/* Customer */}
      <div style={card}>
        <p style={sectionLabel}>CUSTOMER</p>
        <Row label="Name"  value={customerName} />
        <Row label="Email" value={customerEmail} />
        <Row label="Phone" value={customerPhone} accent />
      </div>

      {/* Delivery */}
      <div style={card}>
        <p style={sectionLabel}>DELIVERY</p>
        <Row label="Date"     value={pickupDate} />
        <Row label="Time"     value={pickupTime} accent />
        <Row label="Pickup"   value={pickupAddress} />
        <Row label="Drop-off" value={dropoffAddress} />
        {distanceMiles !== null && (
          <Row label="Distance" value={`${distanceMiles} mi`} />
        )}
        <div style={divider} />
        <Row label="Items"       value={`${itemCount} item${itemCount > 1 ? "s" : ""}`} />
        <Row label="Heavy items" value={heavyItems ? "⚠ YES — bring extra help" : "No"} />
      </div>

      {/* Footer */}
      <div style={footer}>
        <p style={footerText}>Booking ID: {bookingId}</p>
        <p style={footerText}>Urgent Delivery Co. · Internal Alert</p>
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
  color:         "#F26A5B",
  textTransform: "uppercase",
  margin:        "0 0 12px 0",
};

const heading: React.CSSProperties = {
  fontSize:   "28px",
  fontWeight: "900",
  color:      "#EDEBE7",
  margin:     "0 0 12px 0",
};

const priceBadge: React.CSSProperties = {
  display:         "inline-block",
  backgroundColor: "#F26A5B",
  color:           "#fff",
  fontWeight:      "900",
  fontSize:        "22px",
  padding:         "6px 20px",
  borderRadius:    "999px",
  margin:          0,
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
  color: "#F26A5B",
};

const divider: React.CSSProperties = {
  borderTop: "2px solid #F0EDE9",
  margin:    "8px 0",
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