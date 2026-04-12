import { useState } from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function WelcomeScreen({ onContinue, exiting }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>

      {/* Aurora background */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundColor: "#031119",
          background: [
            "radial-gradient(ellipse at 20% 50%, rgba(1,180,175,0.55) 0%, transparent 60%)",
            "radial-gradient(ellipse at 80% 30%, rgba(255,177,0,0.40) 0%, transparent 55%)",
            "radial-gradient(ellipse at 50% 90%, rgba(27,53,79,0.60) 0%, transparent 70%)",
          ].join(", "),
        }}
        animate={exiting ? { y: "-105%" } : { y: 0 }}
        transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      {/* Grain */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
        opacity: 0.05,
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* Content */}
      <motion.div
        style={{
          position: "relative", zIndex: 2,
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
        animate={exiting ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeIn" }}
      >
        {/* Logo */}
        <div style={{ position: "absolute", top: 28, left: 32 }}>
          <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
        </div>

        {/* Heading — subtle glow shimmer every 5s */}
        <motion.h1
          animate={{
            textShadow: [
              "0 0 0px transparent",
              "0 0 18px rgba(255,255,255,0.25), 0 0 40px rgba(1,180,175,0.15)",
              "0 0 0px transparent",
            ],
          }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
          style={{
            fontSize: "clamp(28px, 4.5vw, 52px)",
            fontWeight: 500,
            color: "#F7F7F7",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            textAlign: "center",
            margin: 0,
            marginBottom: 18,
            maxWidth: 620,
          }}>
          Welcome to the Instructor Studio
        </motion.h1>

        {/* Sub-headline */}
        <p style={{
          fontSize: 15,
          color: "rgba(247,247,247,0.50)",
          textAlign: "center",
          lineHeight: 1.7,
          maxWidth: 400,
          margin: "0 0 48px",
          fontWeight: 400,
        }}>
          Create custom Tiera routes for your community<br />and upload in minutes.
        </p>

        <button
          onClick={onContinue}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            padding: "13px 36px",
            background: hovered ? "rgba(255,255,255,0.10)" : "transparent",
            color: "#F7F7F7",
            border: `0.5px solid ${hovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)"}`,
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "background 150ms ease, border-color 150ms ease",
          }}
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
