import { useState } from "react";

const inputStyle = {
  width: "100%",
  border: "none",
  borderBottom: "1px solid #EDEDED",
  outline: "none",
  fontSize: 16,
  fontFamily: "Inter, sans-serif",
  padding: "10px 0",
  background: "transparent",
  color: "#1c1c1e",
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
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Top-left logo */}
      <div style={{ position: "absolute", top: 24, left: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "#1c1c1e" }}>TIERA</div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>powered by Touchpulse</div>
      </div>

      {/* Centered form */}
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 16 }}>
          Route Setup
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1c1c1e", marginBottom: 40, lineHeight: 1.2 }}>
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
            padding: "14px 0",
            background: "#1c1c1e",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          Begin →
        </button>

        <div style={{ fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 12 }}>
          All fields are optional
        </div>
      </div>
    </div>
  );
}
