import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, ChevronRight } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import AddClientModal from "./AddClientModal";
import { useClients } from "./clientsStore";

export default function ClientsPage() {
  const navigate = useNavigate();
  const clients = useClients();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = clients.filter((c) => {
    const matchName = c.name.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchName && matchStatus;
  });

  const action = (
    <button
      onClick={() => setShowAdd(true)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 8,
        background: "#01B4AF", border: "none",
        color: "#031119", fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}
    >
      <UserPlus size={14} /> Add Client
    </button>
  );

  return (
    <DashboardLayout action={action}>
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {/* Search */}
        <div style={{
          flex: 1, maxWidth: 320, position: "relative",
          display: "flex", alignItems: "center",
        }}>
          <Search size={14} color="rgba(247,247,247,0.35)" style={{ position: "absolute", left: 12 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients…"
            style={{
              width: "100%", padding: "9px 12px 9px 34px",
              background: "rgba(14,34,54,0.8)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8, color: "#F7F7F7", fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {/* Status filter */}
        {["all", "active", "inactive"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12,
              cursor: "pointer", fontWeight: statusFilter === s ? 600 : 400,
              background: statusFilter === s ? "rgba(1,180,175,0.12)" : "rgba(14,34,54,0.8)",
              border: statusFilter === s ? "1px solid rgba(1,180,175,0.3)" : "1px solid rgba(255,255,255,0.09)",
              color: statusFilter === s ? "#01B4AF" : "rgba(247,247,247,0.55)",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(247,247,247,0.35)" }}>
          {filtered.length} client{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Client table */}
      <div style={{
        background: "rgba(14,34,54,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr 80px 100px 90px 36px",
          padding: "11px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontSize: 11,
          color: "rgba(247,247,247,0.35)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          <span>Name</span>
          <span>Condition</span>
          <span>Age</span>
          <span>Last Active</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(247,247,247,0.3)", fontSize: 13 }}>
            No clients found
          </div>
        ) : (
          filtered.map((c, i) => (
            <div
              key={c.id}
              onClick={() => navigate(`/clients/${c.id}`)}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 80px 100px 90px 36px",
                padding: "14px 20px",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                alignItems: "center",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(1,180,175,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {/* Name + avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(1,180,175,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600, color: "#01B4AF",
                }}>
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#F7F7F7", fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(247,247,247,0.4)" }}>
                    {c.routesAssigned} route{c.routesAssigned !== 1 ? "s" : ""} assigned
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "rgba(247,247,247,0.6)" }}>{c.condition}</div>
              <div style={{ fontSize: 12, color: "rgba(247,247,247,0.6)" }}>{c.age}</div>
              <div style={{ fontSize: 12, color: "rgba(247,247,247,0.5)" }}>
                {new Date(c.lastActive).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>

              <div>
                <span style={{
                  fontSize: 11, padding: "3px 9px", borderRadius: 20,
                  background: c.status === "active" ? "rgba(1,180,175,0.12)" : "rgba(255,255,255,0.07)",
                  color: c.status === "active" ? "#01B4AF" : "rgba(247,247,247,0.4)",
                  fontWeight: 500,
                }}>
                  {c.status}
                </span>
              </div>

              <ChevronRight size={14} color="rgba(247,247,247,0.25)" />
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
