import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import logo from "../../assets/logo.png";
import { INSTRUCTOR } from "./seedData";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(INSTRUCTOR.email);
  const [password, setPassword] = useState("demo");
  const [submitting, setSubmitting] = useState(false);

  // Already authed → bounce to dashboard
  if (sessionStorage.getItem("om_auth") === "true") {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    // Fake auth — accept any non-empty email + password
    setTimeout(() => {
      sessionStorage.setItem("om_auth", "true");
      navigate("/dashboard");
    }, 600);
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      {/* Aurora background */}
      <div
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

      {/* Logo */}
      <div style={{ position: "absolute", top: 28, left: 32, zIndex: 3 }}>
        <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: "relative", zIndex: 2,
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div style={{
          width: 380,
          padding: "40px 36px 32px",
          background: "rgba(10,28,46,0.55)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}>
          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              fontSize: 11, letterSpacing: "0.10em",
              color: "rgba(247,247,247,0.4)",
              textTransform: "uppercase", marginBottom: 10,
            }}>
              Instructor Studio
            </div>
            <h1 style={{
              margin: 0,
              fontSize: 24, fontWeight: 500, color: "#F7F7F7",
              letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              Sign in to continue
            </h1>
            <div style={{ fontSize: 12, color: "rgba(247,247,247,0.45)", marginTop: 8 }}>
              Welcome back to Touchpulse.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label style={{ fontSize: 11, color: "rgba(247,247,247,0.45)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Email
            </label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Mail size={14} color="rgba(247,247,247,0.35)" style={{ position: "absolute", top: 13, left: 12 }} />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "11px 12px 11px 36px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, color: "#F7F7F7", fontSize: 13,
                  outline: "none", boxSizing: "border-box",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>

            {/* Password */}
            <label style={{ fontSize: 11, color: "rgba(247,247,247,0.45)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <Lock size={14} color="rgba(247,247,247,0.35)" style={{ position: "absolute", top: 13, left: 12 }} />
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "11px 12px 11px 36px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, color: "#F7F7F7", fontSize: 13,
                  outline: "none", boxSizing: "border-box",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%", padding: "12px 0",
                background: submitting ? "rgba(1,180,175,0.6)" : "#01B4AF",
                border: "none", borderRadius: 8,
                color: "#031119", fontWeight: 600, fontSize: 13,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontFamily: "Inter, sans-serif",
                transition: "background 150ms",
              }}
            >
              {submitting ? "Signing in…" : <>Sign in <ArrowRight size={14} /></>}
            </button>

            <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "rgba(247,247,247,0.3)" }}>
              Demo mode — any email/password works
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
