// ============================================================
// emails/OwnerAlert.tsx
//
// Internal alert — owner-facing, optimised for quick scanning
// on mobile. Critical info hierarchy:
//   1. Date + time (can't miss it)
//   2. Tap-to-call phone button
//   3. Route
//   4. Load + checklist
//
// Brand palette + contrast rules same as CustomerConfirmation.
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

function formatDate(raw: string): string {
  const [y, m, d] = raw.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

export default function OwnerAlert({
  customerName, customerEmail, customerPhone,
  pickupAddress, dropoffAddress, pickupDate, pickupTime,
  itemCount, heavyItems, distanceMiles, totalPrice, bookingId,
}: Props) {
  return (
    <div style={s.wrapper}>
      <div style={s.preheader}>
        NEW BOOKING · {customerName} · {pickupTime} {formatDate(pickupDate)} · ${totalPrice}
      </div>

      <div style={s.container}>

        {/* ── Alert bar */}
        <div style={s.alertBar}>
          <span style={s.alertDot} />
          <span style={s.alertText}>NEW BOOKING — PAYMENT CONFIRMED</span>
          <span style={s.alertDot} />
        </div>

        {/* ── Header */}
        <div style={s.header}>
          <p style={s.brandTag}>[ INTERNAL ALERT ]</p>
          <h1 style={s.headline}>New Order In</h1>
          <div style={s.pricePill}>
            <span style={s.priceValue}>${totalPrice}</span>
            <span style={s.priceLabel}>COLLECTED</span>
          </div>
          <p style={s.bookingRef}>REF #{bookingId.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* ── Mission block: date + time + distance */}
        <div style={s.missionBlock}>
          <div style={s.missionItem}>
            <p style={s.missionLabel}>DATE</p>
            <p style={s.missionValue}>{formatDate(pickupDate)}</p>
          </div>
          <div style={s.missionDivider} />
          <div style={s.missionItem}>
            <p style={s.missionLabel}>PICKUP TIME</p>
            <p style={s.missionTime}>{pickupTime}</p>
          </div>
          {distanceMiles !== null && (
            <>
              <div style={s.missionDivider} />
              <div style={s.missionItem}>
                <p style={s.missionLabel}>DISTANCE</p>
                <p style={s.missionValue}>{distanceMiles} mi</p>
              </div>
            </>
          )}
        </div>

        {/* ── Customer — tap-to-call is the hero */}
        <div style={s.section}>
          <p style={s.sectionLabel}>[ CUSTOMER ]</p>
          <p style={s.customerName}>{customerName}</p>

          <a href={`tel:${customerPhone.replace(/\s/g, "")}`} style={s.callButton}>
            <span style={s.callIcon}>📞</span>
            <span style={s.callNumber}>{customerPhone}</span>
            <span style={s.callCta}>TAP TO CALL</span>
          </a>

          <a href={`mailto:${customerEmail}`} style={s.emailLink}>{customerEmail}</a>
        </div>

        {/* ── Route */}
        <div style={s.section}>
          <p style={s.sectionLabel}>[ THE JOB ]</p>
          <div style={s.routeWrap}>
            <div style={s.routeRow}>
              <div style={s.iconCol}>
                <div style={s.dotTeal} />
                <div style={s.routeLine} />
              </div>
              <div style={s.routeTextCol}>
                <p style={s.routeTag}>PICKUP FROM</p>
                <p style={s.routeAddress}>{pickupAddress}</p>
              </div>
            </div>
            <div style={s.routeRow}>
              <div style={s.iconCol}>
                <div style={s.dotCoral} />
              </div>
              <div style={s.routeTextCol}>
                <p style={s.routeTag}>DELIVER TO</p>
                <p style={s.routeAddress}>{dropoffAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Load */}
        <div style={s.section}>
          <p style={s.sectionLabel}>[ LOAD ]</p>
          <div style={s.loadGrid}>
            <div style={s.loadCard}>
              <p style={s.loadNumber}>{itemCount}</p>
              <p style={s.loadCardLabel}>ITEM{itemCount !== 1 ? "S" : ""}</p>
            </div>
            <div style={heavyItems ? s.loadCardAlert : s.loadCard}>
              <p style={heavyItems ? s.loadNumberAlert : s.loadNumber}>
                {heavyItems ? "⚠" : "✓"}
              </p>
              <p style={heavyItems ? s.loadCardLabelAlert : s.loadCardLabel}>
                {heavyItems ? "HEAVY ITEMS" : "NO HEAVY ITEMS"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Checklist — dark olive bg */}
        <div style={s.checklistSection}>
          <p style={s.checklistLabel}>[ BEFORE YOU GO ]</p>
          <CheckItem text="Call customer 30 min before arrival" />
          <CheckItem
            text={heavyItems ? "Arrange extra help — heavy items confirmed" : "Standard load — no extra help needed"}
            urgent={heavyItems}
          />
          <CheckItem text="Confirm dropoff access before leaving pickup" />
          {distanceMiles !== null && distanceMiles > 20 && (
            <CheckItem text={`Long-range job (${distanceMiles} mi) — check fuel & traffic`} urgent />
          )}
        </div>

        {/* ── Footer */}
        <div style={s.footer}>
          <p style={{ margin: "0 0 10px 0" }}>
            <span style={{ 
              color: '#C62828', 
              textDecoration: 'none', 
              fontFamily: "monospace",
              fontSize: "9px",
              letterSpacing: "0.3em",
              textTransform: "uppercase"
            }}>
              URGENT DELIVERY CO. · INTERNAL
            </span>
          </p>
          <div style={s.footerDivider} />
          <p style={s.footerMeta}>Booking ID: {bookingId}</p>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function CheckItem({ text, urgent }: { text: string; urgent?: boolean }) {
  return (
    <div style={s.checkRow}>
      <div style={urgent ? s.checkBadgeUrgent : s.checkBadge}>
        <span style={{ fontSize: "10px", lineHeight: 1 }}>{urgent ? "!" : "·"}</span>
      </div>
      <p style={urgent ? s.checkTextUrgent : s.checkText}>{text}</p>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {

  preheader: {
    display: "none", fontSize: "1px", color: "#EDEBE7", maxHeight: 0, overflow: "hidden",
  },

  wrapper: {
    backgroundColor: "#1A2320",
    padding:         "40px 16px 60px",
    fontFamily:      "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },

  container: {
    maxWidth:     "560px",
    margin:       "0 auto",
    borderRadius: "4px",
    overflow:     "hidden",
    boxShadow:    "0 8px 60px rgba(0,0,0,0.5)",
  },

  // Coral alert bar — draws the eye immediately
  alertBar: {
    backgroundColor: "#F26A5B",
    padding:         "10px 24px",
    textAlign:       "center",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             "12px",
  },

  alertDot: {
    display:         "inline-block",
    width:           "5px",
    height:          "5px",
    borderRadius:    "50%",
    backgroundColor: "rgba(255,255,255,0.65)",
  },

  alertText: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.3em",
    color:         "#FFFFFF",        // white on coral — contrast ~3.5:1 (bold ✓)
    fontWeight:    "700",
  },

  // ── Header: olive dark
  header: {
    backgroundColor: "#2F3A33",
    padding:         "40px 40px 36px",
    textAlign:       "center",
  },

  brandTag: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.35em",
    color:         "#F26A5B",
    textTransform: "uppercase",
    margin:        "0 0 20px 0",
  },

  headline: {
    fontFamily:  "'Georgia', 'Times New Roman', serif",
    fontSize:    "30px",
    fontWeight:  "700",
    color:       "#EDEBE7",          // offwhite on olive — ~10:1 ✓
    margin:      "0 0 20px 0",
    lineHeight:  1.15,
  },

  pricePill: {
    display:         "inline-flex",
    alignItems:      "center",
    gap:             "8px",
    backgroundColor: "#F26A5B",
    borderRadius:    "2px",
    padding:         "10px 24px",
    margin:          "0 0 14px 0",
  },

  priceValue: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "26px",
    fontWeight:  "700",
    color:       "#FFFFFF",          // white on coral ✓
    lineHeight:  1,
  },

  priceLabel: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.2em",
    color:         "rgba(255,255,255,0.75)",
    fontWeight:    "400",
  },

  bookingRef: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.2em",
    color:         "rgba(237,235,231,0.35)",  // decorative
    display:       "inline-block",
    border:        "1px solid rgba(237,235,231,0.12)",
    padding:       "4px 12px",
    margin:        0,
  },

  // ── Mission block: offwhite bg
  missionBlock: {
    backgroundColor: "#EDEBE7",
    padding:         "22px 40px",
    display:         "flex",
    alignItems:      "center",
    borderTop:       "3px solid #F26A5B",
  },

  missionItem: { flex: 1, textAlign: "center" },

  missionLabel: {
    fontFamily:    "monospace",
    fontSize:      "7px",
    letterSpacing: "0.3em",
    color:         "#1F5A52",        // teal on offwhite — contrast ~5:1 ✓
    textTransform: "uppercase",
    margin:        "0 0 6px 0",
  },

  missionValue: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    fontWeight:  "700",
    color:       "#2F3A33",          // olive on offwhite — ~9:1 ✓
    margin:      0,
    lineHeight:  1.35,
  },

  missionTime: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "22px",
    fontWeight:  "700",
    color:       "#F26A5B",          // coral on offwhite — large text ✓
    margin:      0,
  },

  missionDivider: {
    width:           "1px",
    height:          "40px",
    backgroundColor: "rgba(47,58,51,0.2)",
    flexShrink:      0,
  },

  // ── White sections
  section: {
    backgroundColor: "#FFFFFF",
    padding:         "28px 40px",
    borderTop:       "1px solid #EDEBE7",
  },

  sectionLabel: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.3em",
    color:         "#1F5A52",        // teal on white — ~5:1 ✓
    textTransform: "uppercase",
    margin:        "0 0 18px 0",
  },

  // Customer block
  customerName: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "20px",
    fontWeight:  "700",
    color:       "#2F3A33",
    margin:      "0 0 16px 0",
  },

  callButton: {
    display:         "block",
    backgroundColor: "#2F3A33",
    borderRadius:    "4px",
    padding:         "18px 24px",
    textDecoration:  "none",
    marginBottom:    "12px",
    textAlign:       "left",
  },

  callIcon: {
    fontSize: "16px",
    display:  "block",
    marginBottom: "6px",
  },

  callNumber: {
    display:       "block",
    fontFamily:    "'Georgia', serif",
    fontSize:      "24px",
    fontWeight:    "700",
    color:         "#F26A5B",        // coral on olive ✓
    letterSpacing: "0.02em",
  },

  callCta: {
    display:       "block",
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.25em",
    color:         "rgba(237,235,231,0.50)",
    marginTop:     "6px",
    textTransform: "uppercase",
  },

  emailLink: {
    fontFamily:     "'Helvetica Neue', sans-serif",
    fontSize:       "13px",
    color:          "#1F5A52",       // teal on white ✓
    textDecoration: "underline",
  },

  // Route
  routeWrap: { padding: "4px 0" },
  routeRow:  { display: "flex", gap: "16px" },

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
    color:         "#999999",
    textTransform: "uppercase",
    margin:        "0 0 4px 0",
  },

  routeAddress: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "14px",
    fontWeight:  "600",
    color:       "#2F3A33",
    margin:      0,
    lineHeight:  1.45,
  },

  // Load grid
  loadGrid: {
    display: "flex",
    gap:     "12px",
  },

  loadCard: {
    flex:            1,
    backgroundColor: "#F7F5F2",
    borderRadius:    "4px",
    padding:         "18px 16px",
    textAlign:       "center",
    border:          "1px solid #EDEBE7",
  },

  loadCardAlert: {
    flex:            1,
    backgroundColor: "#FFF6F5",
    borderRadius:    "4px",
    padding:         "18px 16px",
    textAlign:       "center",
    border:          "2px solid #F26A5B",
  },

  loadNumber: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "30px",
    fontWeight:  "700",
    color:       "#2F3A33",          // olive on light ✓
    margin:      "0 0 6px 0",
    lineHeight:  1,
  },

  loadNumberAlert: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "30px",
    fontWeight:  "700",
    color:       "#F26A5B",          // coral on very light ✓
    margin:      "0 0 6px 0",
    lineHeight:  1,
  },

  loadCardLabel: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.2em",
    color:         "#888888",
    textTransform: "uppercase",
    margin:        0,
  },

  loadCardLabelAlert: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.15em",
    color:         "#F26A5B",        // coral on near-white ✓
    textTransform: "uppercase",
    fontWeight:    "700",
    margin:        0,
  },

  // ── Checklist — dark olive
  checklistSection: {
    backgroundColor: "#2F3A33",
    padding:         "28px 40px",
    borderTop:       "3px solid #1F5A52",
  },

  checklistLabel: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.3em",
    color:         "#F26A5B",        // coral on olive ✓
    textTransform: "uppercase",
    margin:        "0 0 20px 0",
  },

  checkRow: {
    display:      "flex",
    gap:          "12px",
    alignItems:   "flex-start",
    marginBottom: "14px",
  },

  checkBadge: {
    width:           "22px",
    height:          "22px",
    borderRadius:    "2px",
    border:          "1px solid rgba(237,235,231,0.25)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
    color:           "rgba(237,235,231,0.55)",
    marginTop:       "1px",
  },

  checkBadgeUrgent: {
    width:           "22px",
    height:          "22px",
    borderRadius:    "2px",
    backgroundColor: "#F26A5B",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
    color:           "#FFFFFF",
    fontWeight:      "700",
    marginTop:       "1px",
  },

  checkText: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    color:       "rgba(237,235,231,0.75)",  // 75% offwhite on olive — readable ✓
    lineHeight:  1.55,
    margin:      0,
  },

  checkTextUrgent: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    color:       "#F26A5B",          // coral on olive ✓
    lineHeight:  1.55,
    margin:      0,
    fontWeight:  "600",
  },

  // ── Footer
  footer: {
    backgroundColor: "#1A2320",
    padding:         "20px 40px",
    textAlign:       "center",
  },

  footerBrand: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.3em",
    color:         "#F26A5B",        // coral on very dark ✓
    textTransform: "uppercase",
    margin:        "0 0 10px 0",
  },

  footerDivider: {
    height:          "1px",
    backgroundColor: "rgba(237,235,231,0.08)",
    margin:          "0 0 10px 0",
  },

  footerMeta: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.1em",
    color:         "rgba(237,235,231,0.30)",
    margin:        0,
  },
};