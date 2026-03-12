// ============================================================
// emails/CustomerConfirmation.tsx
// ============================================================

import * as React from "react";

type Props = {
  customerName:   string;
  pickupAddress:  string;
  dropoffAddress: string;
  pickupDate:     string;
  pickupTime:     string;
  itemCount:      number;
  heavyItems:     boolean;
  totalPrice:     number;
  bookingId:      string;
};

// ── Helpers ───────────────────────────────────────────────────

function formatDate(raw: string): string {
  const [y, m, d] = raw.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────

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
  const firstName = customerName.split(" ")[0];

  return (
    <div style={s.wrapper}>

      {/* ── Pre-header (hidden preview text in inbox) */}
      <div style={s.preheader}>
        Your delivery is confirmed for {pickupTime} on {formatDate(pickupDate)}. We&apos;ll be there.
      </div>

      <div style={s.container}>

        {/* ── Top accent bar */}
        <div style={s.accentBar} />

        {/* ── Header */}
        <div style={s.header}>
          <p style={s.brandTag}>URGENT DELIVERY CO.</p>

          {/* Big checkmark circle */}
          <div style={s.checkCircle}>
            <span style={s.checkMark}>✓</span>
          </div>

          <h1 style={s.headline}>You&apos;re booked, {firstName}.</h1>
          <p style={s.subheadline}>
            Your delivery is confirmed and locked in. We&apos;ll take it from here.
          </p>
        </div>

        {/* ── Date + time hero card */}
        <div style={s.dateHero}>
          <div style={s.dateBlock}>
            <p style={s.dateLabel}>DATE</p>
            <p style={s.dateValue}>{formatDate(pickupDate)}</p>
          </div>
          <div style={s.dateDivider} />
          <div style={s.dateBlock}>
            <p style={s.dateLabel}>PICKUP TIME</p>
            <p style={s.timeValue}>{pickupTime}</p>
          </div>
        </div>

        {/* ── Route visualization */}
        <div style={s.section}>
          <p style={s.sectionLabel}>YOUR ROUTE</p>

          <div style={s.routeWrap}>
            {/* Pickup */}
            <div style={s.routeRow}>
              <div style={s.routeIconCol}>
                <div style={s.dotGreen} />
                <div style={s.routeLine} />
              </div>
              <div style={s.routeTextCol}>
                <p style={s.routeTag}>PICKUP</p>
                <p style={s.routeAddress}>{pickupAddress}</p>
              </div>
            </div>

            {/* Dropoff */}
            <div style={s.routeRow}>
              <div style={s.routeIconCol}>
                <div style={s.dotCoral} />
              </div>
              <div style={s.routeTextCol}>
                <p style={s.routeTag}>DROP-OFF</p>
                <p style={s.routeAddress}>{dropoffAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Order summary */}
        <div style={s.section}>
          <p style={s.sectionLabel}>ORDER SUMMARY</p>

          <DetailRow label="Booking ID"  value={`#${bookingId.slice(0, 8).toUpperCase()}`} />
          <DetailRow label="Items"       value={`${itemCount} item${itemCount !== 1 ? "s" : ""}`} />
          {heavyItems && (
            <DetailRow label="Heavy items" value="Yes — extra care taken" highlight />
          )}
          <div style={s.totalRow}>
            <span style={s.totalLabel}>TOTAL PAID</span>
            <span style={s.totalValue}>${totalPrice}</span>
          </div>
        </div>

        {/* ── What to expect */}
        <div style={s.expectSection}>
          <p style={s.sectionLabel}>WHAT TO EXPECT</p>

          <Step num="1" text="Our team will call you 30 minutes before arriving at your pickup." />
          <Step num="2" text="Make sure items are accessible and ready to go when we arrive." />
          <Step num="3" text="We handle the heavy lifting — you don't need to be present at drop-off." />
        </div>

        {/* ── Support CTA */}
        <div style={s.ctaSection}>
          <p style={s.ctaText}>
            Questions or need to make a change?
          </p>
          <a href="mailto:hello@urgentdelivery.co" style={s.ctaButton}>
            Contact Us
          </a>
        </div>

        {/* ── Footer */}
        <div style={s.footer}>
          <p style={s.footerBrand}>URGENT DELIVERY CO.</p>
          <p style={s.footerSub}>Serving NJ · NY · CT</p>
          <p style={s.footerMeta}>
            This confirmation was sent to you because you completed a booking.
            <br />Booking ID: {bookingId}
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={s.detailRow}>
      <span style={s.detailLabel}>{label}</span>
      <span style={highlight ? s.detailValueHighlight : s.detailValue}>{value}</span>
    </div>
  );
}

function Step({ num, text }: { num: string; text: string }) {
  return (
    <div style={s.stepRow}>
      <div style={s.stepNum}>{num}</div>
      <p style={s.stepText}>{text}</p>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {

  preheader: {
    display:  "none",
    fontSize: "1px",
    color:    "#F5F3EF",
    maxHeight: 0,
    overflow:  "hidden",
  },

  wrapper: {
    backgroundColor: "#F0EDE9",
    padding:         "40px 16px 60px",
    fontFamily:      "'Georgia', 'Times New Roman', serif",
  },

  container: {
    maxWidth:     "560px",
    margin:       "0 auto",
    borderRadius: "16px",
    overflow:     "hidden",
    boxShadow:    "0 4px 40px rgba(47,58,51,0.12)",
  },

  accentBar: {
    height:          "5px",
    backgroundColor: "#F26A5B",
  },

  header: {
    backgroundColor: "#2F3A33",
    padding:         "48px 40px 40px",
    textAlign:       "center",
  },

  brandTag: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.35em",
    color:         "#1F5A52",
    textTransform: "uppercase",
    margin:        "0 0 28px 0",
  },

  checkCircle: {
    width:           "64px",
    height:          "64px",
    borderRadius:    "50%",
    backgroundColor: "#1F5A52",
    margin:          "0 auto 24px",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    border:          "2px solid rgba(255,255,255,0.1)",
  },

  checkMark: {
    fontSize:   "28px",
    color:      "#EDEBE7",
    lineHeight: 1,
  },

  headline: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "30px",
    fontWeight:  "700",
    color:       "#EDEBE7",
    margin:      "0 0 12px 0",
    lineHeight:  1.2,
  },

  subheadline: {
    fontFamily: "'Helvetica Neue', sans-serif",
    fontSize:   "15px",
    color:      "rgba(237,235,231,0.55)",
    margin:     0,
    lineHeight: 1.6,
  },

  // ── Date hero
  dateHero: {
    backgroundColor: "#EDEBE7",
    padding:         "28px 40px",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             "0",
  },

  dateBlock: {
    flex:      1,
    textAlign: "center",
    padding:   "0 20px",
  },

  dateLabel: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.3em",
    color:         "#999",
    textTransform: "uppercase",
    margin:        "0 0 6px 0",
  },

  dateValue: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "15px",
    fontWeight:  "700",
    color:       "#2F3A33",
    margin:      0,
    lineHeight:  1.3,
  },

  timeValue: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "22px",
    fontWeight:  "700",
    color:       "#F26A5B",
    margin:      0,
  },

  dateDivider: {
    width:           "1px",
    height:          "40px",
    backgroundColor: "rgba(47,58,51,0.15)",
    flexShrink:      0,
  },

  // ── Section
  section: {
    backgroundColor: "#FFFFFF",
    padding:         "28px 40px",
    borderTop:       "1px solid #F0EDE9",
  },

  sectionLabel: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.3em",
    color:         "#1F5A52",
    textTransform: "uppercase",
    margin:        "0 0 20px 0",
  },

  // ── Route
  routeWrap: {
    padding: "4px 0",
  },

  routeRow: {
    display: "flex",
    gap:     "16px",
  },

  routeIconCol: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    paddingTop:     "3px",
    width:          "16px",
    flexShrink:     0,
  },

  routeLine: {
    width:           "2px",
    height:          "36px",
    backgroundColor: "rgba(47,58,51,0.15)",
    margin:          "4px 0",
  },

  dotGreen: {
    width:           "12px",
    height:          "12px",
    borderRadius:    "50%",
    backgroundColor: "#1F5A52",
    flexShrink:      0,
  },

  dotCoral: {
    width:           "12px",
    height:          "12px",
    borderRadius:    "50%",
    backgroundColor: "#F26A5B",
    flexShrink:      0,
  },

  routeTextCol: {
    paddingBottom: "20px",
    flex:          1,
  },

  routeTag: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.2em",
    color:         "#999",
    textTransform: "uppercase",
    margin:        "0 0 4px 0",
  },

  routeAddress: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "14px",
    fontWeight:  "600",
    color:       "#2F3A33",
    margin:      0,
    lineHeight:  1.4,
  },

  // ── Detail rows
  detailRow: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "baseline",
    padding:        "10px 0",
    borderBottom:   "1px solid #F5F3EF",
  },

  detailLabel: {
    fontFamily:    "monospace",
    fontSize:      "10px",
    letterSpacing: "0.05em",
    color:         "#AAA",
    textTransform: "uppercase",
  },

  detailValue: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    fontWeight:  "600",
    color:       "#2F3A33",
  },

  detailValueHighlight: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    fontWeight:  "600",
    color:       "#F26A5B",
  },

  totalRow: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    marginTop:      "16px",
    padding:        "16px 20px",
    backgroundColor: "#2F3A33",
    borderRadius:   "10px",
  },

  totalLabel: {
    fontFamily:    "monospace",
    fontSize:      "10px",
    letterSpacing: "0.2em",
    color:         "rgba(237,235,231,0.5)",
    textTransform: "uppercase",
  },

  totalValue: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "26px",
    fontWeight:  "700",
    color:       "#F26A5B",
  },

  // ── What to expect
  expectSection: {
    backgroundColor: "#FAFAF8",
    padding:         "28px 40px",
    borderTop:       "1px solid #F0EDE9",
  },

  stepRow: {
    display:     "flex",
    gap:         "14px",
    marginBottom: "14px",
    alignItems:  "flex-start",
  },

  stepNum: {
    width:           "24px",
    height:          "24px",
    borderRadius:    "50%",
    backgroundColor: "#2F3A33",
    color:           "#EDEBE7",
    fontFamily:      "monospace",
    fontSize:        "10px",
    fontWeight:      "700",
    textAlign:       "center",
    lineHeight:      "24px",
    flexShrink:      0,
    marginTop:       "1px",
  },

  stepText: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    color:       "#555",
    lineHeight:  1.6,
    margin:      0,
  },

  // ── CTA
  ctaSection: {
    backgroundColor: "#FFFFFF",
    padding:         "32px 40px",
    textAlign:       "center",
    borderTop:       "1px solid #F0EDE9",
  },

  ctaText: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "14px",
    color:       "#888",
    margin:      "0 0 16px 0",
  },

  ctaButton: {
    display:         "inline-block",
    backgroundColor: "#2F3A33",
    color:           "#EDEBE7",
    fontFamily:      "monospace",
    fontSize:        "10px",
    letterSpacing:   "0.2em",
    textTransform:   "uppercase",
    textDecoration:  "none",
    padding:         "12px 32px",
    borderRadius:    "999px",
  },

  // ── Footer
  footer: {
    backgroundColor: "#2F3A33",
    padding:         "32px 40px",
    textAlign:       "center",
  },

  footerBrand: {
    fontFamily:    "monospace",
    fontSize:      "10px",
    letterSpacing: "0.35em",
    color:         "#1F5A52",
    textTransform: "uppercase",
    margin:        "0 0 6px 0",
  },

  footerSub: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.15em",
    color:         "rgba(237,235,231,0.3)",
    margin:        "0 0 16px 0",
  },

  footerMeta: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "10px",
    color:       "rgba(237,235,231,0.2)",
    lineHeight:  1.7,
    margin:      0,
  },
};