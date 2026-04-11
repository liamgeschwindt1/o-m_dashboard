import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function Row({ label, value }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "13px 0",
      borderBottom: "0.5px solid rgba(255,255,255,0.07)",
    }}>
      <span style={{ fontSize: 11, color: "rgba(247,247,247,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 400 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: "#F7F7F7", fontWeight: 500, textAlign: "right", maxWidth: 200, wordBreak: "break-word" }}>
        {value || <span style={{ color: "rgba(247,247,247,0.2)" }}>—</span>}
      </span>
    </div>
  );
}

export default function SubmitSheet({ identity, route, nodes, onConfirm }) {
  const [flying, setFlying] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const distKm = route?.path
    ? (() => {
        let d = 0;
        for (let i = 1; i < route.path.length; i++) {
          const [la1, lo1] = route.path[i - 1];
          const [la2, lo2] = route.path[i];
          const R = 6371;
          const dLat = ((la2 - la1) * Math.PI) / 180;
          const dLon = ((lo2 - lo1) * Math.PI) / 180;
          const a = Math.sin(dLat / 2) ** 2 + Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
          d += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
        return d.toFixed(2);
      })()
    : null;

  function handleConfirm() {
    setFlying(true);
    setTimeout(() => onConfirm(), 700);
  }

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
        "radial-gradient(ellipse at 25% 55%, rgba(1,180,175,0.07) 0%, transparent 55%)",
        "radial-gradient(ellipse at 75% 35%, rgba(255,177,0,0.05) 0%, transparent 50%)",
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

      {/* Step label */}
      <div style={{
        position: "absolute", top: 28, right: 32,
        fontSize: 11, color: "rgba(247,247,247,0.30)",
        letterSpacing: "0.08em", textTransform: "uppercase", zIndex: 2,
      }}>
        Submit
      </div>

      {/* The sheet card */}
      <AnimatePresence>
        {!flying && (
          <motion.div
            key="sheet"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-110vh", opacity: 0.6, rotate: -1.5 }}
            transition={flying
              ? { duration: 0.55, ease: [0.55, 0, 0.8, 0.2] }
              : { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
            }
            style={{
              position: "relative",
              zIndex: 2,
              width: 400,
              background: "rgba(255,255,255,0.035)",
              border: "0.5px solid rgba(255,255,255,0.10)",
              borderRadius: 12,
              padding: "28px 28px 24px",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {/* Sheet header */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(247,247,247,0.30)", textTransform: "uppercase", marginBottom: 8 }}>
                Route Summary
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, color: "#F7F7F7", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {identity?.routeName || "Unnamed Route"}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "0.5px", background: "rgba(255,255,255,0.09)", marginBottom: 4 }} />

            {/* Rows */}
            <Row label="Creator" value={identity?.ownerName} />
            <Row label="Contact" value={identity?.email} />
            <Row label="Date" value={dateStr} />
            {distKm && <Row label="Distance" value={`${distKm} km`} />}
            {nodes?.length > 0 && <Row label="Instructions" value={`${nodes.length} turn point${nodes.length !== 1 ? "s" : ""}`} />}
            {route?.waypoints?.length > 2 && (
              <Row label="Via stops" value={`${route.waypoints.length - 2}`} />
            )}

            {/* Bottom — submit */}
            <div style={{ marginTop: 28 }}>
              <button
                onClick={handleConfirm}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  background: btnHovered ? "rgba(255,177,0,0.12)" : "transparent",
                  color: "#FFB100",
                  border: "1px solid rgba(255,177,0,0.6)",
                  borderRadius: 6,
                  fontWeight: 500,
                  fontSize: 13,
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  letterSpacing: 0.3,
                  transition: "background 150ms ease",
                }}
              >
                Confirm &amp; submit ↗
              </button>
              <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "rgba(247,247,247,0.22)", lineHeight: 1.6 }}>
                This route will be uploaded and reviewed before going live.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
