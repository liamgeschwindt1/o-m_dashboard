import { useState } from "react";
import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function WelcomeScreen({ onContinue }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#031119",
        background: [
          "radial-gradient(ellipse at 20% 50%, rgba(1,180,175,0.55) 0%, transparent 60%)",
          "radial-gradient(ellipse at 80% 30%, rgba(255,177,0,0.40) 0%, transparent 55%)",
          "radial-gradient(ellipse at 50% 90%, rgba(27,53,79,0.60) 0%, transparent 70%)",
        ].join(", "),
      }}
    >
      {/* Noise grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          opacity: 0.05,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Base color layer underneath gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#031119",
          zIndex: -1,
        }}
      />

      {/* Top-left logo */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 32,
          zIndex: 2,
        }}
      >
        <img
          src={logo}
          alt="Touchpulse"
          style={{ height: 32, display: "block" }}
        />
      </div>

      {/* Centered content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "rgba(247,247,247,0.40)",
            textTransform: "uppercase",
            marginBottom: 20,
            fontWeight: 400,
          }}
        >
          O&amp;M Training Studio
        </div>

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 500,
            color: "#F7F7F7",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            textAlign: "center",
            margin: 0,
            marginBottom: 48,
            maxWidth: 640,
          }}
        >
          Welcome to Touchpulse Studio
        </h1>

        <button
          onClick={onContinue}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            padding: "13px 36px",
            background: hovered ? "rgba(255,255,255,0.10)" : "transparent",
            color: "#F7F7F7",
            border: "0.5px solid rgba(255,255,255,0.55)",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "background 150ms ease, border-color 150ms ease",
            borderColor: hovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
