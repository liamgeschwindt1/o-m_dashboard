import { useState } from "react";

const inputStyle = {
  width: "100%",
  border: "none",
  borderBottom: "0.5px solid rgba(255,255,255,0.15)",
  outline: "none",
  fontSize: 16,
  fontFamily: "Inter, sans-serif",
  padding: "12px 0",
  background: "transparent",
  color: "#F7F7F7",
};

export default function IdentityStep({ onComplete }) {
  const [fields, setFields] = useState({
    routeName: "",
    orgCode: "",
    ownerName: "",
    contact: "",
  });

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#031119",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Top-left logo */}
      <div style={{ position: "absolute", top: 24, left: 24 }}>
        <div style={{ fontWeight: 500, fontSize: 18, letterSpacing: 1, color: "#F7F7F7" }}>TOUCHPULSE</div>
        <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)", marginTop: 3 }}>O&amp;M Training Studio</div>
      </div>

      {/* Centered form */}
      <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "rgba(247,247,247,0.45)", textTransform: "uppercase", marginBottom: 16 }}>
          Route Setup
        </div>
        <div style={{ fontSize: 32, fontWeight: 500, color: "#F7F7F7", marginBottom: 48, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Let's start with the basics.
        </div>

        <input
          style={inputStyle}
          placeholder="Route Name"
          value={fields.routeName}
          onChange={e => setFields(f => ({ ...f, routeName: e.target.value }))}
        />
        <input
          style={{ ...inputStyle, marginTop: 28 }}
          placeholder="Organization Code"
          value={fields.orgCode}
          onChange={e => setFields(f => ({ ...f, orgCode: e.target.value }))}
        />
        <input
          style={{ ...inputStyle, marginTop: 28 }}
          placeholder="Owner Name"
          value={fields.ownerName}
          onChange={e => setFields(f => ({ ...f, ownerName: e.target.value }))}
        />
        <input
          style={{ ...inputStyle, marginTop: 28 }}
          placeholder="Contact Details"
          value={fields.contact}
          onChange={e => setFields(f => ({ ...f, contact: e.target.value }))}
        />

        <button
          onClick={() => onComplete(fields)}
          style={{
            marginTop: 48,
            width: "100%",
            padding: "13px 0",
            background: "transparent",
            color: "#F7F7F7",
            border: "0.5px solid rgba(255,255,255,0.7)",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            letterSpacing: 0.3,
            transition: "background 150ms ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          Begin →
        </button>

        <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)", textAlign: "center", marginTop: 12 }}>
          All fields are optional
        </div>
      </div>
    </div>
  );
}
