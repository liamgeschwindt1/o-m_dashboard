import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Eye, Calendar, PenLine } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import { CLIENTS } from "./seedData";

const API = import.meta.env.VITE_API_URL ?? "";

export default function ClientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = CLIENTS.find((c) => c.id === id);

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/routes`)
      .then((r) => r.json())
      .then((data) => {
        setRoutes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!client) {
    return (
      <DashboardLayout>
        <div style={{ color: "rgba(247,247,247,0.4)", fontSize: 14, marginTop: 40 }}>
          Client not found. <button onClick={() => navigate("/clients")} style={{ color: "#01B4AF", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
        </div>
      </DashboardLayout>
    );
  }

  // Attach fake view counts from seed data
  const clientRoutes = routes.map((r) => ({
    ...r,
    views: client.viewCounts?.[r.id] ?? 0,
  }));

  const action = (
    <button
      onClick={() => navigate("/clients")}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 8,
        background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(247,247,247,0.7)", fontSize: 13, cursor: "pointer",
      }}
    >
      <ArrowLeft size={14} /> All Clients
    </button>
  );

  return (
    <DashboardLayout action={action}>
      <div style={{ maxWidth: 800 }}>
        {/* Profile header */}
        <div style={{
          background: "rgba(14,34,54,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "24px 28px",
          display: "flex", alignItems: "flex-start", gap: 20,
          marginBottom: 20,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
            background: "rgba(1,180,175,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "#01B4AF",
          }}>
            {client.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#F7F7F7" }}>{client.name}</h1>
              <span style={{
                fontSize: 11, padding: "3px 9px", borderRadius: 20,
                background: client.status === "active" ? "rgba(1,180,175,0.12)" : "rgba(255,255,255,0.07)",
                color: client.status === "active" ? "#01B4AF" : "rgba(247,247,247,0.4)",
                fontWeight: 500,
              }}>
                {client.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(247,247,247,0.55)", marginBottom: 12 }}>
              {client.condition} · Age {client.age}
            </div>
            <div style={{ fontSize: 12, color: "rgba(247,247,247,0.45)", lineHeight: 1.6 }}>{client.notes}</div>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end",
          }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)" }}>Last active</div>
              <div style={{ fontSize: 13, color: "#F7F7F7", fontWeight: 500 }}>
                {new Date(client.lastActive).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(247,247,247,0.35)" }}>Routes assigned</div>
              <div style={{ fontSize: 13, color: "#F7F7F7", fontWeight: 500 }}>{client.routesAssigned}</div>
            </div>
          </div>
        </div>

        {/* Assigned routes */}
        <div style={{
          background: "rgba(14,34,54,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F7F7", marginBottom: 16 }}>Assigned Routes</div>

          {loading ? (
            <div style={{ color: "rgba(247,247,247,0.3)", fontSize: 13 }}>Loading…</div>
          ) : clientRoutes.length === 0 ? (
            <div style={{ color: "rgba(247,247,247,0.3)", fontSize: 13, padding: "20px 0" }}>No routes yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 120px 80px 100px 44px",
                padding: "8px 0 10px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                fontSize: 11, color: "rgba(247,247,247,0.35)",
                fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                <span>Route</span><span>Created</span><span>Views</span><span>Last Opened</span><span />
              </div>
              {clientRoutes.map((r, i) => (
                <div key={r.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 120px 80px 100px 44px",
                  padding: "13px 0",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <MapPin size={13} color="#01B4AF" />
                    <span style={{ fontSize: 13, color: "#F7F7F7", fontWeight: 500 }}>{r.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(247,247,247,0.45)" }}>
                    <Calendar size={11} />
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(247,247,247,0.55)" }}>
                    <Eye size={11} /> {r.views}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(247,247,247,0.4)" }}>
                    {r.views > 0 ? "Recently" : "—"}
                  </div>
                  <button
                    onClick={() => navigate("/studio")}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, borderRadius: 7,
                      background: "rgba(1,180,175,0.1)", border: "none", cursor: "pointer",
                    }}
                    title="Open in Studio"
                  >
                    <PenLine size={13} color="#01B4AF" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
