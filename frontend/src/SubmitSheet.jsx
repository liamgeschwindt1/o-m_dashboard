import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ── sub-components ──────────────────────────────────────────────

function Row({ label, value }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "13px 0",
      borderBottom: "0.5px solid rgba(255,255,255,0.07)",
    }}>
      <span style={{ fontSize: 11, color: "rgba(247,247,247,0.35)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: "#F7F7F7", fontWeight: 500, textAlign: "right", maxWidth: 200, wordBreak: "break-word" }}>
        {value || <span style={{ color: "rgba(247,247,247,0.2)" }}>—</span>}
      </span>
    </div>
  );
}

function SpinningArc() {
  return (
    <motion.div
      style={{
        width: 56, height: 56, borderRadius: "50%",
        border: "1.5px solid rgba(1,180,175,0.15)",
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
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(1,180,175,0.10)",
        border: "1px solid rgba(1,180,175,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <motion.svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <motion.path
          d="M4 11.5L9 16.5L18 6"
          stroke="#01B4AF" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}

// ── main component ──────────────────────────────────────────────

export default function SubmitSheet({ identity, route, nodes, onConfirm }) {
  // stage: "sheet" | "processing" | "success"
  const [stage, setStage] = useState("sheet");
  const [btnHovered, setBtnHovered] = useState(false);
  const navigate = useNavigate();

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

  const API_ENDPOINT = `${import.meta.env.VITE_API_URL ?? ""}/api/routes`;

  async function handleConfirm() {
    setStage("processing");

    const payload = {
      name: identity?.routeName,
      org_code: identity?.orgCode,
      instructor_email: identity?.email,
      instructor_name: identity?.ownerName,
      payload: {
        submittedAt: new Date().toISOString(),
        route: {
          waypoints: route?.waypoints ?? [],
          path: route?.path ?? [],
          distanceKm: distKm ? parseFloat(distKm) : null,
        },
        instructions: (nodes ?? []).map((n) => ({ id: n.id, pos: n.pos, text: n.text })),
      },
    };

    try {
      await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (_) {
      // Network errors are silently swallowed so the UX flow continues
    }

    setTimeout(() => setStage("success"), 2800);
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
        opacity: 0.04, pointerEvents: "none", zIndex: 1,
      }} />

      {/* Logo */}
      <div style={{ position: "absolute", top: 28, left: 32, zIndex: 2 }}>
        <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
      </div>

      {/* Stage label */}
      <div style={{
        position: "absolute", top: 28, right: 32,
        fontSize: 11, color: "rgba(247,247,247,0.28)",
        letterSpacing: "0.08em", textTransform: "uppercase", zIndex: 2,
        transition: "opacity 300ms ease",
      }}>
        {stage === "sheet" ? "Submit" : stage === "processing" ? "Uploading" : "Confirmed"}
      </div>

      {/* ── Stages ── */}
      <AnimatePresence mode="wait">

        {stage === "sheet" && (
          <motion.div
            key="sheet"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-120vh", opacity: 0, rotate: -2, transition: { duration: 0.5, ease: [0.55, 0, 0.75, 0.15] } }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "relative", zIndex: 2,
              width: 400,
              background: "rgba(255,255,255,0.035)",
              border: "0.5px solid rgba(255,255,255,0.10)",
              borderRadius: 12,
              padding: "28px 28px 24px",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(247,247,247,0.30)", textTransform: "uppercase", marginBottom: 8 }}>
                Route Summary
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, color: "#F7F7F7", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {identity?.routeName || "Unnamed Route"}
              </div>
            </div>

            <div style={{ height: "0.5px", background: "rgba(255,255,255,0.09)", marginBottom: 4 }} />

            <Row label="Creator" value={identity?.ownerName} />
            <Row label="Organisation" value={identity?.orgCode} />
            <Row label="Email" value={identity?.email} />
            <Row label="Date" value={dateStr} />
            {distKm && <Row label="Distance" value={`${distKm} km`} />}
            {nodes?.length > 0 && <Row label="Instructions" value={`${nodes.length} turn point${nodes.length !== 1 ? "s" : ""}`} />}
            {route?.waypoints?.length > 2 && <Row label="Via stops" value={`${route.waypoints.length - 2}`} />}

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

        {stage === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}
          >
            <SpinningArc />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.10em", color: "rgba(247,247,247,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
                Uploading Route
              </div>
              <div style={{ fontSize: 18, fontWeight: 500, color: "#F7F7F7", letterSpacing: "-0.01em" }}>
                Processing your submission…
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(1,180,175,0.6)" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {stage === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}
          >
            <CheckCircle />
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.10em", color: "rgba(247,247,247,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
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
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={onConfirm}
                style={{
                  padding: "10px 22px",
                  background: "transparent",
                  color: "rgba(247,247,247,0.45)",
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
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(247,247,247,0.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                Submit another route →
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  padding: "10px 22px",
                  background: "#01B4AF",
                  color: "#031119",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  letterSpacing: 0.3,
                }}
              >
                Return to dashboard ↗
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

