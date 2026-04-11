import { useState } from "react";
import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function UplinkStep({ identity, onComplete }) {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
      backgroundColor: "#031119",
      background: [
        "radial-gradient(ellipse at 20% 50%, rgba(1,180,175,0.55) 0%, transparent 60%)",
        "radial-gradient(ellipse at 80% 30%, rgba(255,177,0,0.40) 0%, transparent 55%)",
        "radial-gradient(ellipse at 50% 90%, rgba(27,53,79,0.60) 0%, transparent 70%)",
      ].join(", "),
    }}>
      {/* Grain overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
        opacity: 0.05,
        pointerEvents: "none",
        zIndex: 1,
      }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#031119", zIndex: -1 }} />
      <div style={{ position: "absolute", top: 28, left: 32, zIndex: 2 }}>
        <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
      </div>
      <div style={{
        position: "absolute", top: 28, right: 32,
        fontSize: 11, color: "rgba(247,247,247,0.35)",
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        Uplink
      </div>

      <div style={{ width: 360, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
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

        <button
          onClick={onComplete}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            width: "100%",
            padding: "13px 0",
            background: btnHovered ? "rgba(255,177,0,0.12)" : "transparent",
            color: "#FFB100",
            border: "1px solid #FFB100",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            letterSpacing: 0.3,
            transition: "background 150ms ease",
          }}
        >
          Submit custom route ↗
        </button>
      </div>
    </div>
  );
}

