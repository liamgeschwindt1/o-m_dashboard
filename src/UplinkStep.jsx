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

export default function UplinkStep({ identity, onRestart }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

      {/* Step indicator top-right */}
      <div style={{
        position: "absolute",
        top: 28,
        right: 32,
        fontSize: 11,
        color: "rgba(247,247,247,0.35)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        Uplink
      </div>

      {!submitted ? (
        <div style={{ width: 360, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "rgba(247,247,247,0.45)", textTransform: "uppercase", marginBottom: 12 }}>
            End of Workflow
          </div>
          <div style={{ fontSize: 32, fontWeight: 500, color: "#F7F7F7", marginBottom: 10, textAlign: "center", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Submit Your Route
          </div>
          <div style={{ fontSize: 14, color: "rgba(247,247,247,0.55)", textAlign: "center", lineHeight: 1.7, marginBottom: 48, maxWidth: 320 }}>
            {identity?.routeName
              ? <>Your route <strong style={{ color: "#F7F7F7" }}>{identity.routeName}</strong> is ready for the Touchpulse community.</>
              : "Your custom O&M training route is ready to be submitted to the Touchpulse community."
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
              padding: "13px 0",
              background: "transparent",
              color: email ? "#FFB100" : "rgba(247,247,247,0.2)",
              border: email ? "0.5px solid rgba(255,177,0,0.45)" : "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              fontWeight: 500,
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              cursor: email ? "pointer" : "default",
              letterSpacing: 0.3,
              transition: "border-color 200ms ease, color 200ms ease",
            }}
          >
            Submit custom route →
          </button>
        </div>
      ) : (
        <div style={{ width: 380, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* Checkmark — teal circle */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(1,180,175,0.15)",
            border: "0.5px solid rgba(1,180,175,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M4 11.5L9 16.5L18 6" stroke="#01B4AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{ fontSize: 28, fontWeight: 500, color: "#F7F7F7", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Route submitted.
          </div>
          <div style={{ fontSize: 14, color: "rgba(247,247,247,0.55)", lineHeight: 1.8, marginBottom: 48, maxWidth: 340 }}>
            Your custom route has been submitted successfully and will be reviewed.
            You will receive a confirmation once this is available in the app.
          </div>

          <button
            onClick={onRestart}
            style={{
              padding: "12px 32px",
              background: "transparent",
              color: "rgba(247,247,247,0.7)",
              border: "0.5px solid rgba(255,255,255,0.2)",
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
            Create another route →
          </button>
        </div>
      )}
    </div>
  );
}

