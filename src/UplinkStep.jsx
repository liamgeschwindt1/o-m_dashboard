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

export default function UplinkStep({ identity, onRestart }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

      {/* Step indicator top-right */}
      <div style={{
        position: "absolute",
        top: 28,
        right: 32,
        fontSize: 11,
        color: "#ccc",
        letterSpacing: 2,
        textTransform: "uppercase",
      }}>
        Uplink
      </div>

      {!submitted ? (
        <div style={{ width: 340, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 12 }}>
            End of Workflow
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1c1c1e", marginBottom: 10, textAlign: "center", lineHeight: 1.2 }}>
            Submit Your Route
          </div>
          <div style={{ fontSize: 14, color: "#aaa", textAlign: "center", lineHeight: 1.7, marginBottom: 48 }}>
            {identity?.routeName
              ? <>Your route <strong style={{ color: "#1c1c1e" }}>{identity.routeName}</strong> is ready for the Tiera community.</>
              : "Your custom O&M training route is ready to be submitted to the Tiera community."
            }
          </div>

          <div style={{ width: "100%", marginBottom: 32 }}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            onClick={() => email && setSubmitted(true)}
            disabled={!email}
            style={{
              width: "100%",
              padding: "14px 0",
              background: email ? "#1c1c1e" : "#e8e8e8",
              color: email ? "#fff" : "#aaa",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "Inter, sans-serif",
              cursor: email ? "pointer" : "default",
              letterSpacing: 0.5,
            }}
          >
            Submit custom route
          </button>
        </div>
      ) : (
        <div style={{ width: 380, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* Checkmark */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#1c1c1e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11.5L9 16.5L18 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, color: "#1c1c1e", marginBottom: 16 }}>
            Route Submitted
          </div>
          <div style={{ fontSize: 14, color: "#777", lineHeight: 1.8, marginBottom: 48 }}>
            Your custom route has been submitted successfully and will be reviewed.
            You will receive a confirmation once this is available in the app.
          </div>

          <button
            onClick={onRestart}
            style={{
              padding: "12px 32px",
              background: "#1c1c1e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              letterSpacing: 0.3,
            }}
          >
            Create Another Route
          </button>
        </div>
      )}
    </div>
  );
}
