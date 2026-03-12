// ============================================================
// emails/OwnerAlert.tsx
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

// ── Helpers ───────────────────────────────────────────────────

function formatDate(raw: string): string {
  const [y, m, d] = raw.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────

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
    <div style={s.wrapper}>

      {/* Pre-header hidden text */}
      <div style={s.preheader}>
        NEW BOOKING · {customerName} · {pickupTime} on {formatDate(pickupDate)} · ${totalPrice} collected
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
          <p style={s.brandTag}>URGENT DELIVERY CO.</p>
          <h1 style={s.headline}>New Order In</h1>
          <div style={s.priceBadge}>${totalPrice} <span style={s.priceLabel}>COLLECTED</span></div>
          <p style={s.bookingRef}>Booking #{bookingId.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* ── CRITICAL: Date + Time */}
        <div style={s.missionBlock}>
          <div style={s.missionItem}>
            <p style={s.missionLabel}>DATE</p>
            <p style={s.missionValue}>{formatDate(pickupDate)}</p>
          </div>
          <div style={s.missionDivider} />
          <div style={s.missionItem}>
            <p style={s.missionLabel}>PICKUP TIME</p>
            <p style={s.missionValueLarge}>{pickupTime}</p>
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

        {/* ── Customer — phone is the hero here */}
        <div style={s.section}>
          <p style={s.sectionLabel}>CUSTOMER</p>

          <p style={s.customerName}>{customerName}</p>

          {/* Big tap-to-call phone button */}
          <a href={`tel:${customerPhone.replace(/\s/g, "")}`} style={s.phoneButton}>
            <span style={s.phoneIcon}>📞</span>
            <span style={s.phoneNumber}>{customerPhone}</span>
            <span style={s.phoneTap}>TAP TO CALL</span>
          </a>

          <div style={s.contactRow}>
            <a href={`mailto:${customerEmail}`} style={s.emailLink}>{customerEmail}</a>
          </div>
        </div>

        {/* ── Route */}
        <div style={s.section}>
          <p style={s.sectionLabel}>THE JOB</p>

          <div style={s.routeWrap}>
            <div style={s.routeRow}>
              <div style={s.routeIconCol}>
                <div style={s.dotGreen} />
                <div style={s.routeLine} />
              </div>
              <div style={s.routeTextCol}>
                <p style={s.routeTag}>PICKUP FROM</p>
                <p style={s.routeAddress}>{pickupAddress}</p>
              </div>
            </div>
            <div style={s.routeRow}>
              <div style={s.routeIconCol}>
                <div style={s.dotCoral} />
              </div>
              <div style={s.routeTextCol}>
                <p style={s.routeTag}>DELIVER TO</p>
                <p style={s.routeAddress}>{dropoffAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Load details */}
        <div style={s.section}>
          <p style={s.sectionLabel}>LOAD</p>

          <div style={s.loadGrid}>
            <div style={s.loadCard}>
              <p style={s.loadNum}>{itemCount}</p>
              <p style={s.loadCardLabel}>ITEM{itemCount !== 1 ? "S" : ""}</p>
            </div>
            <div style={heavyItems ? s.loadCardAlert : s.loadCard}>
              <p style={heavyItems ? s.loadNumAlert : s.loadNum}>
                {heavyItems ? "⚠" : "✓"}
              </p>
              <p style={heavyItems ? s.loadCardLabelAlert : s.loadCardLabel}>
                {heavyItems ? "HEAVY — EXTRA HANDS" : "NO HEAVY ITEMS"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Checklist */}
        <div style={s.checklistSection}>
          <p style={s.sectionLabel}>BEFORE YOU GO</p>
          <CheckItem text="Call customer 30 min before arrival" />
          <CheckItem text={heavyItems ? "Arrange extra help — heavy items confirmed" : "Standard load — no extra help needed"} urgent={heavyItems} />
          <CheckItem text="Confirm dropoff access before leaving" />
          {distanceMiles !== null && distanceMiles > 20 && (
            <CheckItem text={`Long-range job (${distanceMiles} mi) — check fuel & traffic`} urgent />
          )}
        </div>

        {/* ── Footer */}
        <div style={s.footer}>
          <p style={s.footerBrand}>URGENT DELIVERY CO. · INTERNAL ALERT</p>
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
      <div style={urgent ? s.checkBoxUrgent : s.checkBox}>
        <span style={{ fontSize: "9px", lineHeight: 1 }}>{urgent ? "!" : "□"}</span>
      </div>
      <p style={urgent ? s.checkTextUrgent : s.checkText}>{text}</p>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {

  preheader: {
    display:   "none",
    fontSize:  "1px",
    color:     "#F5F3EF",
    maxHeight: 0,
    overflow:  "hidden",
  },

  wrapper: {
    backgroundColor: "#1A2320",
    padding:         "40px 16px 60px",
    fontFamily:      "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },

  container: {
    maxWidth:     "560px",
    margin:       "0 auto",
    borderRadius: "16px",
    overflow:     "hidden",
    boxShadow:    "0 8px 60px rgba(0,0,0,0.5)",
  },

  // ── Alert bar
  alertBar: {
    backgroundColor: "#F26A5B",
    padding:         "10px 24px",
    textAlign:       "center",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             "10px",
  },

  alertDot: {
    display:         "inline-block",
    width:           "6px",
    height:          "6px",
    borderRadius:    "50%",
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  alertText: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.3em",
    color:         "#FFFFFF",
    fontWeight:    "700",
  },

  // ── Header
  header: {
    backgroundColor: "#2F3A33",
    padding:         "40px 40px 36px",
    textAlign:       "center",
  },

  brandTag: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.35em",
    color:         "#1F5A52",
    textTransform: "uppercase",
    margin:        "0 0 20px 0",
  },

  headline: {
    fontFamily:  "'Georgia', 'Times New Roman', serif",
    fontSize:    "32px",
    fontWeight:  "700",
    color:       "#EDEBE7",
    margin:      "0 0 20px 0",
    lineHeight:  1.1,
  },

  priceBadge: {
    display:         "inline-block",
    backgroundColor: "#F26A5B",
    color:           "#FFFFFF",
    fontFamily:      "'Georgia', serif",
    fontSize:        "28px",
    fontWeight:      "700",
    padding:         "10px 28px",
    borderRadius:    "999px",
    margin:          "0 0 12px 0",
  },

  priceLabel: {
    fontFamily:    "monospace",
    fontSize:      "10px",
    fontWeight:    "400",
    letterSpacing: "0.15em",
    opacity:       0.7,
    verticalAlign: "middle",
    marginLeft:    "6px",
  },

  bookingRef: {
    fontFamily:    "monospace",
    fontSize:      "9px",
    letterSpacing: "0.2em",
    color:         "rgba(237,235,231,0.25)",
    margin:        0,
  },

  // ── Mission block
  missionBlock: {
    backgroundColor: "#EDEBE7",
    padding:         "24px 40px",
    display:         "flex",
    alignItems:      "center",
  },

  missionItem: {
    flex:      1,
    textAlign: "center",
  },

  missionLabel: {
    fontFamily:    "monospace",
    fontSize:      "7px",
    letterSpacing: "0.3em",
    color:         "#999",
    textTransform: "uppercase",
    margin:        "0 0 6px 0",
  },

  missionValue: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "14px",
    fontWeight:  "700",
    color:       "#2F3A33",
    margin:      0,
    lineHeight:  1.3,
  },

  missionValueLarge: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "22px",
    fontWeight:  "700",
    color:       "#F26A5B",
    margin:      0,
  },

  missionDivider: {
    width:           "1px",
    height:          "40px",
    backgroundColor: "rgba(47,58,51,0.2)",
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
    margin:        "0 0 18px 0",
  },

  // ── Customer
  customerName: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "20px",
    fontWeight:  "700",
    color:       "#2F3A33",
    margin:      "0 0 16px 0",
  },

  phoneButton: {
    display:         "block",
    backgroundColor: "#2F3A33",
    borderRadius:    "12px",
    padding:         "16px 24px",
    textDecoration:  "none",
    marginBottom:    "10px",
    position:        "relative",
  },

  phoneIcon: {
    fontSize: "18px",
    display:  "block",
    marginBottom: "4px",
  },

  phoneNumber: {
    display:       "block",
    fontFamily:    "'Georgia', serif",
    fontSize:      "22px",
    fontWeight:    "700",
    color:         "#F26A5B",
    letterSpacing: "0.02em",
  },

  phoneTap: {
    display:       "block",
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.25em",
    color:         "rgba(237,235,231,0.35)",
    marginTop:     "4px",
    textTransform: "uppercase",
  },

  contactRow: {
    marginTop: "8px",
  },

  emailLink: {
    fontFamily:     "'Helvetica Neue', sans-serif",
    fontSize:       "13px",
    color:          "#1F5A52",
    textDecoration: "underline",
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
    backgroundColor: "rgba(47,58,51,0.12)",
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
    paddingBottom: "18px",
    flex:          1,
  },

  routeTag: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.2em",
    color:         "#AAA",
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

  // ── Load grid
  loadGrid: {
    display: "flex",
    gap:     "12px",
  },

  loadCard: {
    flex:            1,
    backgroundColor: "#F5F3EF",
    borderRadius:    "10px",
    padding:         "16px",
    textAlign:       "center",
    border:          "1px solid #EAE7E3",
  },

  loadCardAlert: {
    flex:            1,
    backgroundColor: "rgba(242,106,91,0.06)",
    borderRadius:    "10px",
    padding:         "16px",
    textAlign:       "center",
    border:          "2px solid rgba(242,106,91,0.3)",
  },

  loadNum: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "28px",
    fontWeight:  "700",
    color:       "#2F3A33",
    margin:      "0 0 4px 0",
    lineHeight:  1,
  },

  loadNumAlert: {
    fontFamily:  "'Georgia', serif",
    fontSize:    "28px",
    fontWeight:  "700",
    color:       "#F26A5B",
    margin:      "0 0 4px 0",
    lineHeight:  1,
  },

  loadCardLabel: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.2em",
    color:         "#AAA",
    textTransform: "uppercase",
    margin:        0,
  },

  loadCardLabelAlert: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    letterSpacing: "0.15em",
    color:         "#F26A5B",
    textTransform: "uppercase",
    margin:        0,
    fontWeight:    "700",
  },

  // ── Checklist
  checklistSection: {
    backgroundColor: "#2F3A33",
    padding:         "28px 40px",
    borderTop:       "2px solid #1A2320",
  },

  checkRow: {
    display:      "flex",
    gap:          "12px",
    alignItems:   "flex-start",
    marginBottom: "12px",
  },

  checkBox: {
    width:           "20px",
    height:          "20px",
    borderRadius:    "4px",
    border:          "1px solid rgba(237,235,231,0.2)",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
    color:           "rgba(237,235,231,0.4)",
    marginTop:       "1px",
  },

  checkBoxUrgent: {
    width:           "20px",
    height:          "20px",
    borderRadius:    "4px",
    backgroundColor: "#F26A5B",
    border:          "1px solid #F26A5B",
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
    color:       "rgba(237,235,231,0.6)",
    lineHeight:  1.5,
    margin:      0,
  },

  checkTextUrgent: {
    fontFamily:  "'Helvetica Neue', sans-serif",
    fontSize:    "13px",
    color:       "#F26A5B",
    lineHeight:  1.5,
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
    fontSize:      "8px",
    letterSpacing: "0.3em",
    color:         "#1F5A52",
    textTransform: "uppercase",
    margin:        "0 0 6px 0",
  },

  footerMeta: {
    fontFamily:    "monospace",
    fontSize:      "8px",
    color:         "rgba(237,235,231,0.15)",
    letterSpacing: "0.1em",
    margin:        0,
  },
};