import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function SpinningArc() {
  return (
    <motion.div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: "1.5px solid rgba(1,180,175,0.18)",
        borderTopColor: "#01B4AF",
        boxSizing: "border-box",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
    />
  );
}

function CheckCircle() {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "rgba(1,180,175,0.10)",
        border: "1px solid rgba(1,180,175,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      >
        <motion.path
          d="M4 11.5L9 16.5L18 6"
          stroke="#01B4AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}

export default function CompleteScreen({ identity, onRestart }) {
  const [stage, setStage] = useState("processing"); // "processing" | "success"

  useEffect(() => {
    const t = setTimeout(() => setStage("success"), 2600);
    return () => clearTimeout(t);
  }, []);

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
        "radial-gradient(ellipse at 30% 60%, rgba(1,180,175,0.06) 0%, transparent 55%)",
        "radial-gradient(ellipse at 70% 30%, rgba(255,177,0,0.04) 0%, transparent 50%)",
        "#031119",
      ].join(", "),
    }}>
      {/* Grain */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
        opacity: 0.04,
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* Logo */}
      <div style={{ position: "absolute", top: 28, left: 32, zIndex: 2 }}>
        <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
      </div>

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: 380,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}>
        <AnimatePresence mode="wait">
          {stage === "processing" ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}
            >
              <SpinningArc />
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(247,247,247,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
                  Uploading Route
                </div>
                <div style={{ fontSize: 18, fontWeight: 500, color: "#F7F7F7", letterSpacing: "-0.01em" }}>
                  Processing your submission…
                </div>
              </div>
              {/* Pulse dots */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "rgba(1,180,175,0.6)",
                    }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}
            >
              <CheckCircle />
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(247,247,247,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
                  Route Uploaded
                </div>
                <div style={{ fontSize: 28, fontWeight: 500, color: "#F7F7F7", marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                  {identity?.routeName
                    ? <><span style={{ color: "#01B4AF" }}>{identity.routeName}</span><br />is live.</>
                    : "Route submitted."}
                </div>
                <div style={{ fontSize: 14, color: "rgba(247,247,247,0.5)", lineHeight: 1.8, maxWidth: 320 }}>
                  Check your mail for when your route<br />is available in the app.
                </div>
              </div>

              <button
                onClick={onRestart}
                style={{
                  marginTop: 8,
                  padding: "10px 28px",
                  background: "transparent",
                  color: "rgba(247,247,247,0.5)",
                  border: "0.5px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  fontWeight: 500,
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  letterSpacing: 0.3,
                  transition: "color 150ms ease, border-color 150ms ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#F7F7F7"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(247,247,247,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                Submit another route →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
