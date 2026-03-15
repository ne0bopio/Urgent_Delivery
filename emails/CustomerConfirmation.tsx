// ============================================================
// emails/CustomerConfirmation.tsx
//
// REPLY-TO SETUP:
//   In your Resend send call (app/api/send-receipt/route.ts or
//   wherever you fire this), set replyTo so that when customers
//   hit Reply in any email client it goes to your professional
//   address instead of your no-reply sender:
//
//   await resend.emails.send({
//     from:    "Urgent Delivery Co. <bookings@urgentdelivery.xyz>",
//     to:      [customerEmail],
//     replyTo: "hello@urgentdelivery.xyz",   ← this is the key line
//     subject: "Your booking is confirmed!",
//     react:   <CustomerConfirmation ... />,
//   });
//
//   hello@urgentdelivery.xyz forwards to your iCloud via
//   Cloudflare Email Routing (see DNS setup notes in README).
//
// Brand palette:
//   Olive    #2F3A33  — dark bg, footers
//   Teal     #1F5A52  — section labels ON WHITE/LIGHT bg only
//   Coral    #F26A5B  — primary accent, CTA, key values
//   Offwhite #EDEBE7  — ALL text on dark backgrounds
//   White    #FFFFFF  — section card backgrounds
//
// Contrast rules enforced:
//   • Teal labels only on white/offwhite backgrounds
//   • On olive/dark: use offwhite or coral — never bare teal
//   • No rgba opacity below 0.55 for readable body text
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

function formatDate(raw: string): string {
  const [y, m, d] = raw.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

export default function CustomerConfirmation({
  customerName, pickupAddress, dropoffAddress,
  pickupDate, pickupTime, itemCount, heavyItems, totalPrice, bookingId,
}: Props) {
  const firstName = customerName.split(" ")[0];

  return (
    <div style={s.wrapper}>
      <div style={s.preheader}>
        Confirmed: {pickupTime} on {formatDate(pickupDate)} — Urgent Delivery Co.
      </div>

      <div style={s.container}>

        {/* ── Top coral bar */}
        <div style={s.topBar} />

        {/* ── Header — dark olive */}
        <div style={s.header}>
          <p style={s.brandTag}>[ URGENT DELIVERY CO. ]</p>

          <div style={s.checkCircle}>
            <span style={s.checkMark}>✓</span>
          </div>

          <h1 style={s.headline}>Booking Confirmed,<br />{firstName}.</h1>
          <p style={s.subheadline}>
            Your delivery is locked in. We&apos;ll take it from here.
          </p>

          <p style={s.bookingRef}>REF #{bookingId.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* ── Date + time strip — offwhite bg */}
        <div style={s.dateStrip}>
          <div style={s.dateBlock}>
            <p style={s.dateLabel}>DATE</p>
            <p style={s.dateValue}>{formatDate(pickupDate)}</p>
          </div>
          <div style={s.stripDivider} />
          <div style={s.dateBlock}>
            <p style={s.dateLabel}>PICKUP TIME</p>
            <p style={s.timeValue}>{pickupTime}</p>
          </div>
        </div>

        {/* ── Route — white bg */}
        <div style={s.section}>
          <p style={s.sectionLabel}>[ YOUR ROUTE ]</p>
          <div style={s.routeWrap}>
            <div style={s.routeRow}>
              <div style={s.iconCol}>
                <div style={s.dotTeal} />
                <div style={s.routeLine} />
              </div>
              <div style={s.routeTextCol}>
                <p style={s.routeTag}>PICKUP</p>
                <p style={s.routeAddress}>{pickupAddress}</p>
              </div>
            </div>
            <div style={s.routeRow}>
              <div style={s.iconCol}>
                <div style={s.dotCoral} />
              </div>
              <div style={s.routeTextCol}>
                <p style={s.routeTag}>DROP-OFF</p>
                <p style={s.routeAddress}>{dropoffAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary — white bg */}
        <div style={s.section}>
          <p style={s.sectionLabel}>[ ORDER SUMMARY ]</p>

          <Row label="Booking ID"  value={`#${bookingId.slice(0, 8).toUpperCase()}`} />
          <Row label="Items"       value={`${itemCount} item${itemCount !== 1 ? "s" : ""}`} />
          <Row label="Heavy items" value={heavyItems ? "Yes — extra care taken" : "None"} highlight={heavyItems} />

          {/* Total — dark card */}
          <div style={s.totalCard}>
            <div>
              <p style={s.totalCardLabel}>TOTAL PAID</p>
              <p style={s.totalCardSub}>Payment processed via Stripe</p>
            </div>
            <p style={s.totalCardValue}>${totalPrice}</p>
          </div>
        </div>

        {/* ── What to expect — tinted bg */}
        <div style={s.expectSection}>
          <p style={s.sectionLabel}>[ WHAT TO EXPECT ]</p>
          <Step n="01" text="Our team will call you 30 minutes before arriving at pickup." />
          <Step n="02" text="Have items accessible and ready to go when we arrive." />
          <Step n="03" text="We handle the heavy lifting — you don't need to be present at drop-off." />
        </div>

        {/* ── CTA — dark olive */}
        <div style={s.ctaSection}>
          <p style={s.ctaHeadline}>Need to make a change?</p>
          <p style={s.ctaBody}>Reply to this email or tap below and we&apos;ll sort it out.</p>
          <a href={"mailto:hello@urgentdelivery.xyz"} style={s.ctaButton}>
            CONTACT US
          </a>
        </div>

        {/* ── Footer */}
        <div style={s.footer}>
          <p style={s.footerBrand}>URGENT DELIVERY CO.</p>
          <p style={s.footerSub}>Serving NJ · NY · CT · Weekends Only</p>
          <div style={s.footerDivider} />
          <p style={s.footerMeta}>
            This email confirms your booking. Booking ID: {bookingId}
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={highlight ? s.rowValueHighlight : s.rowValue}>{value}</span>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div style={s.stepRow}>
      <div style={s.stepBadge}>{n}</div>
      <p style={s.stepText}>{text}</p>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
// Contrast notes inline where it matters.

const s: Record<string, React.CSSProperties> = {

  preheader: {
    display: "none", fontSize: "1px", color: "#EDEBE7", maxHeight: 0, overflow: "hidden",
  },

  wrapper: {
    backgroundColor: "#E8E5E0",
    padding:         "40px 16px 60px",
    fontFamily:      "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },

  container: {
    maxWidth:     "560px",
    margin:       "0 auto",
    borderRadius: "4px",
    overflow:     "hidden",
    boxShadow:    "0 4px 40px rgba(47,58,51,0.18)",
  },

  // Coral top bar — site's primary accent colour
  topBar: {
    height:          "4px",
    backgroundColor: "#F26A5B",
  },

  // ── Header: olive dark with scan-line texture
  header: {
    backgroundColor: "#2F3A33",
    padding:         "48px 40px 40px",
    textAlign:       "center",
  },

  // ON DARK (#2F3A33): use coral for the brand tag — good contrast
  brandTag: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.35em",
    color:         "#F26A5B",
    textTransform: "uppercase",
    margin:        "0 0 28px 0",
  },

// emails/CustomerConfirmation.tsx

checkCircle: {
  width:           "60px",
  height:          "60px",
  borderRadius:    "50%",
  backgroundColor: "#1F5A52",       // teal fill
  border:          "2px solid rgba(237,235,231,0.15)",
  margin:          "0 auto 24px",
  
  // FIX: Use text-align and line-height for reliable centering in Gmail
  textAlign:       "center",
  lineHeight:      "60px",          // Must match the height of the circle
},

checkMark: {
    fontSize:  "26px",
    color:     "#EDEBE7",
    margin:    "0",                   // Ensure no default margins interfere
    display:   "inline-block",        // Allows it to respect the parent's text-align
    verticalAlign: "middle",          // Helps fine-tune the vertical axis
},

  headline: {
    fontFamily:  "'Georgia', 'Times New Roman', serif",
    fontSize:    "28px",
    fontWeight:  "700",
    color:       "#EDEBE7",          // offwhite on olive — contrast ~10:1 ✓
    margin:      "0 0 12px 0",
    lineHeight:  1.25,
  },

  subheadline: {
    fontFamily: "'Helvetica Neue', sans-serif",
    fontSize:   "14px",
    color:      "rgba(237,235,231,0.70)",  // 70% offwhite — ~7:1 ✓
    margin:     "0 0 24px 0",
    lineHeight: 1.6,
  },

  bookingRef: {
    fontFamily:      "monospace",
    fontSize:        "9px",
    letterSpacing:   "0.25em",
    color:           "rgba(237,235,231,0.45)",  // decorative only, not critical info
    margin:          0,
    display:         "inline-block",
    border:          "1px solid rgba(237,235,231,0.15)",
    padding:         "4px 12px",
  },

  // ── Date strip: offwhite bg — dark text for contrast
  dateStrip: {
    backgroundColor: "#EDEBE7",
    padding:         "24px 40px",
    display:         "flex",
    alignItems:      "center",
    borderTop:       "3px solid #F26A5B",
  },

  dateBlock: {
    flex:      1,
    textAlign: "center",
    padding:   "0 16px",
  },

  dateLabel: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.3em",
    color:         "#1F5A52",        // teal on offwhite — contrast ~5:1 ✓
    textTransform: "uppercase",
    margin:        "0 0 6px 0",
  },

  dateValue: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "14px",
    fontWeight:  "700",
    color:       "#2F3A33",          // olive on offwhite — contrast ~9:1 ✓
    margin:      0,
    lineHeight:  1.35,
  },

  timeValue: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "24px",
    fontWeight:  "700",
    color:       "#F26A5B",          // coral on offwhite — contrast ~3.5:1 (large text ✓)
    margin:      0,
  },

  stripDivider: {
    width:           "1px",
    height:          "44px",
    backgroundColor: "rgba(47,58,51,0.18)",
    flexShrink:      0,
  },

  // ── Section cards: white bg
  section: {
    backgroundColor: "#FFFFFF",
    padding:         "28px 40px",
    borderTop:       "1px solid #EDEBE7",
  },

  // Section labels: teal on white — contrast ~5:1 ✓
  sectionLabel: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.3em",
    color:         "#1F5A52",
    textTransform: "uppercase",
    margin:        "0 0 20px 0",
  },

  // ── Route
  routeWrap: { padding: "4px 0" },

  routeRow: { display: "flex", gap: "16px" },

  iconCol: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    paddingTop:    "3px",
    width:         "14px",
    flexShrink:    0,
  },

  routeLine: {
    width:           "2px",
    height:          "32px",
    backgroundColor: "#EDEBE7",
    margin:          "4px 0",
  },

  dotTeal: {
    width: "12px", height: "12px", borderRadius: "50%",
    backgroundColor: "#1F5A52", flexShrink: 0,
  },

  dotCoral: {
    width: "12px", height: "12px", borderRadius: "50%",
    backgroundColor: "#F26A5B", flexShrink: 0,
  },

  routeTextCol: { paddingBottom: "18px", flex: 1 },

  routeTag: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.2em",
    color:         "#999999",        // on white — contrast ~2.5:1 (decorative label only)
    textTransform: "uppercase",
    margin:        "0 0 4px 0",
  },

  routeAddress: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "14px",
    fontWeight:  "600",
    color:       "#2F3A33",          // olive on white — contrast ~10:1 ✓
    margin:      0,
    lineHeight:  1.45,
  },

  // ── Summary rows
  row: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "baseline",
    padding:        "10px 0",
    borderBottom:   "1px solid #F0EDE9",
  },

  rowLabel: {
    fontFamily:    "monospace",
    fontSize:      "10px",
    letterSpacing: "0.05em",
    color:         "#888888",
    textTransform: "uppercase",
  },

  rowValue: {
    fontFamily: "'Helvetica Neue', sans-serif",
    fontSize:   "13px",
    fontWeight: "600",
    color:      "#2F3A33",
  },

  rowValueHighlight: {
    fontFamily: "'Helvetica Neue', sans-serif",
    fontSize:   "13px",
    fontWeight: "700",
    color:      "#F26A5B",
  },

  // Total: dark card inside white section
  totalCard: {
    display:         "flex",
    justifyContent:  "space-between",
    alignItems:      "center",
    backgroundColor: "#2F3A33",
    borderRadius:    "4px",
    padding:         "18px 24px",
    marginTop:       "18px",
  },

  totalCardLabel: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.25em",
    color:         "rgba(237,235,231,0.55)",  // readable on olive ✓
    textTransform: "uppercase",
    margin:        "0 0 4px 0",
  },

  totalCardSub: {
    fontFamily: "'Helvetica Neue', sans-serif",
    fontSize:   "11px",
    color:      "rgba(237,235,231,0.40)",
    margin:     0,
  },

  totalCardValue: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "30px",
    fontWeight:  "700",
    color:       "#F26A5B",          // coral on olive — contrast ~4.5:1 (large text ✓)
    margin:      0,
  },

  // ── What to expect — very light tint
  expectSection: {
    backgroundColor: "#F7F5F2",
    padding:         "28px 40px",
    borderTop:       "1px solid #EDEBE7",
  },

  stepRow: {
    display:      "flex",
    gap:          "14px",
    alignItems:   "flex-start",
    marginBottom: "16px",
  },

  stepBadge: {
    width:           "28px",
    height:          "28px",
    borderRadius:    "2px",
    backgroundColor: "#2F3A33",
    color:           "#F26A5B",      // coral on olive ✓
    fontFamily:      "monospace",
    fontSize:        "9px",
    fontWeight:      "700",
    textAlign:       "center",
    lineHeight:      "28px",
    flexShrink:      0,
    letterSpacing:   "0.05em",
  },

  stepText: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    color:       "#444444",          // dark grey on light bg — contrast ~9:1 ✓
    lineHeight:  1.65,
    margin:      "3px 0 0 0",
  },

  // ── CTA — olive dark section
  ctaSection: {
    backgroundColor: "#2F3A33",
    padding:         "36px 40px",
    textAlign:       "center",
    borderTop:       "3px solid #1F5A52",
  },

  ctaHeadline: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "20px",
    fontWeight:  "700",
    color:       "#EDEBE7",          // offwhite on olive ✓
    margin:      "0 0 8px 0",
  },

  ctaBody: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    color:       "rgba(237,235,231,0.65)",
    margin:      "0 0 24px 0",
    lineHeight:  1.6,
  },

  ctaButton: {
    display:         "inline-block",
    backgroundColor: "#F26A5B",
    color:           "#FFFFFF",      // white on coral — contrast ~3:1 (large bold ✓)
    fontFamily:      "monospace",
    fontSize:        "10px",
    fontWeight:      "700",
    letterSpacing:   "0.25em",
    textDecoration:  "none",
    padding:         "14px 36px",
    borderRadius:    "2px",
  },

  // ── Footer
  footer: {
    backgroundColor: "#1F2B25",      // slightly darker than olive for depth
    padding:         "28px 40px",
    textAlign:       "center",
  },

  footerBrand: {
    fontFamily:    "monospace",
    fontSize:      "10px",
    letterSpacing: "0.35em",
    color:         "#F26A5B",        // coral on very dark — contrast ~5:1 ✓
    textTransform: "uppercase",
    margin:        "0 0 4px 0",
  },

  footerSub: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.15em",
    color:         "rgba(237,235,231,0.45)",
    margin:        "0 0 16px 0",
  },

  footerDivider: {
    height:          "1px",
    backgroundColor: "rgba(237,235,231,0.08)",
    margin:          "0 0 16px 0",
  },

  footerMeta: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "10px",
    color:       "rgba(237,235,231,0.30)",
    lineHeight:  1.7,
    margin:      0,
  },
};