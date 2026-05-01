import { useState } from "react";
import { X, Share2, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

export default function ShareModal({ route, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  async function handleShare(e) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${API}/api/routes/${route.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(3,17,25,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400, background: "rgba(10,28,46,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, padding: "28px 28px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F7F7F7" }}>Share Route</div>
            <div style={{ fontSize: 12, color: "rgba(247,247,247,0.4)", marginTop: 2 }}>{route.name}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(247,247,247,0.5)" }}
          >
            <X size={16} />
          </button>
        </div>

        {status === "success" ? (
          <div style={{
            textAlign: "center", padding: "24px 0",
            fontSize: 13, color: "#01B4AF", fontWeight: 500,
          }}>
            ✓ Route shared with {email}
            <div style={{ marginTop: 4, fontSize: 12, color: "rgba(247,247,247,0.4)", fontWeight: 400 }}>
              An email notification has been sent.
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: 20, padding: "8px 22px", borderRadius: 8,
                background: "#01B4AF", border: "none",
                color: "#031119", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >Done</button>
          </div>
        ) : (
          <form onSubmit={handleShare}>
            <label style={{ fontSize: 12, color: "rgba(247,247,247,0.5)", display: "block", marginBottom: 6 }}>
              Recipient email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              style={{
                width: "100%", padding: "10px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#F7F7F7", fontSize: 13,
                outline: "none", boxSizing: "border-box",
                marginBottom: 12,
              }}
            />
            {error && (
              <div style={{ fontSize: 12, color: "#FF7230", marginBottom: 12 }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 8,
                background: "#01B4AF", border: "none",
                color: "#031119", fontWeight: 600, fontSize: 13,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {status === "loading" ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Sending…</> : <><Share2 size={14} /> Send Route</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
