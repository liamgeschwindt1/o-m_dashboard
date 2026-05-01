import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Share2, Plus, Eye, MapPin } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import ShareModal from "./ShareModal";
import { INSTRUCTOR } from "./seedData";

const API = import.meta.env.VITE_API_URL ?? "";

const STATUS_COLORS = {
  active:   { bg: "rgba(1,180,175,0.12)",    text: "#01B4AF" },
  archived: { bg: "rgba(255,255,255,0.07)",  text: "rgba(247,247,247,0.4)" },
};

export default function RoutesPage() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(null); // route object being shared

  function load() {
    setLoading(true);
    const orgCode = INSTRUCTOR.org_code;
    const url = orgCode
      ? `${API}/api/routes?org_code=${encodeURIComponent(orgCode)}`
      : `${API}/api/routes`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setRoutes(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function archiveRoute(id) {
    await fetch(`${API}/api/routes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    }).catch(() => {});
    load();
  }

  const action = (
    <button
      onClick={() => navigate("/studio")}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 8,
        background: "#01B4AF", border: "none",
        color: "#031119", fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}
    >
      <Plus size={14} /> New Route
    </button>
  );

  return (
    <DashboardLayout action={action}>
      {sharing && (
        <ShareModal route={sharing} onClose={() => setSharing(null)} />
      )}

      <div style={{
        background: "rgba(14,34,54,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, overflow: "hidden",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 140px 100px 100px 90px 100px",
          padding: "11px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontSize: 11, color: "rgba(247,247,247,0.35)",
          fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          <span>Route Name</span>
          <span>Created</span>
          <span>Instructor</span>
          <span>Views</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "rgba(247,247,247,0.3)", fontSize: 13 }}>
            Loading routes…
          </div>
        ) : routes.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <MapPin size={28} color="rgba(247,247,247,0.15)" style={{ marginBottom: 12 }} />
            <div style={{ color: "rgba(247,247,247,0.4)", fontSize: 13, marginBottom: 16 }}>No routes yet</div>
            <button
              onClick={() => navigate("/studio")}
              style={{
                padding: "9px 18px", borderRadius: 8,
                background: "#01B4AF", border: "none",
                color: "#031119", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >Create your first route</button>
          </div>
        ) : (
          routes.map((r, i) => {
            const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.active;
            return (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 140px 100px 100px 90px 100px",
                  padding: "14px 20px",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  alignItems: "center",
                }}
              >
                {/* Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                    background: "rgba(1,180,175,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <MapPin size={13} color="#01B4AF" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "#F7F7F7", fontWeight: 500 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)" }}>{r.org_code ?? "—"}</div>
                  </div>
                </div>

                {/* Created */}
                <div style={{ fontSize: 12, color: "rgba(247,247,247,0.5)" }}>
                  {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                </div>

                {/* Instructor */}
                <div style={{ fontSize: 12, color: "rgba(247,247,247,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.instructor_name ?? "—"}
                </div>

                {/* Views */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(247,247,247,0.5)" }}>
                  <Eye size={11} /> {r.views ?? 0}
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    fontSize: 11, padding: "3px 9px", borderRadius: 20,
                    background: sc.bg, color: sc.text, fontWeight: 500,
                  }}>
                    {r.status ?? "active"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setSharing(r)}
                    title="Share"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, borderRadius: 7,
                      background: "rgba(255,177,0,0.1)", border: "none", cursor: "pointer",
                    }}
                  >
                    <Share2 size={13} color="#FFB100" />
                  </button>
                  <button
                    onClick={() => navigate("/studio")}
                    title="Edit in Studio"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, borderRadius: 7,
                      background: "rgba(1,180,175,0.1)", border: "none", cursor: "pointer",
                    }}
                  >
                    <PenLine size={13} color="#01B4AF" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
