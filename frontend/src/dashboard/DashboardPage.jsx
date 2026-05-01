import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, MapPin, Share2, Eye, Plus, UserPlus,
  Activity, ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import AddClientModal from "./AddClientModal";
import { useClients } from "./clientsStore";
import { ACTIVITY, WEEKLY_VIEWS } from "./seedData";

const API = import.meta.env.VITE_API_URL ?? "";

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, delta }) {
  return (
    <div style={{
      background: "rgba(14,34,54,0.8)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "rgba(247,247,247,0.45)", fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={15} color={color} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#F7F7F7", lineHeight: 1 }}>{value}</div>
      {delta && (
        <div style={{ fontSize: 11, color: "#01B4AF", display: "flex", alignItems: "center", gap: 4 }}>
          <ArrowUpRight size={12} /> {delta}
        </div>
      )}
    </div>
  );
}

function ActivityDot({ type }) {
  const colors = {
    route_created: "#01B4AF",
    route_shared:  "#FFB100",
    route_viewed:  "rgba(247,247,247,0.4)",
    client_added:  "#FF7230",
  };
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%",
      background: colors[type] ?? "rgba(247,247,247,0.3)",
      flexShrink: 0, marginTop: 4,
    }} />
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,28,46,0.97)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: "8px 12px", fontSize: 12,
    }}>
      <div style={{ color: "rgba(247,247,247,0.5)", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#01B4AF", fontWeight: 600 }}>{payload[0].value} views</div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const clients = useClients();
  const [routes, setRoutes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/routes`)
      .then((r) => r.json())
      .then(setRoutes)
      .catch(() => {});
  }, []);

  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalViews = WEEKLY_VIEWS.reduce((s, d) => s + d.views, 0);

  const action = (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onClick={() => setShowAdd(true)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 8,
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(247,247,247,0.7)", fontSize: 13, cursor: "pointer",
        }}
      >
        <UserPlus size={14} /> Add Client
      </button>
      <button
        onClick={() => navigate("/studio")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 8,
          background: "#01B4AF",
          border: "none",
          color: "#031119", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >
        <Plus size={14} /> New Route
      </button>
    </div>
  );

  return (
    <DashboardLayout action={action}>
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users}  label="Total Clients"    value={clients.length} color="#01B4AF" delta="+1 this month" />
        <StatCard icon={MapPin} label="Routes Created"   value={routes.length}  color="#FFB100" />
        <StatCard icon={Share2} label="Routes Shared"    value={routes.length}  color="#FF7230" />
        <StatCard icon={Eye}    label="Views This Week"  value={totalViews}     color="#a78bfa" delta="+18% vs last week" />
      </div>

      {/* Chart + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginBottom: 28 }}>
        {/* Bar chart */}
        <div style={{
          background: "rgba(14,34,54,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "20px 22px",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F7F7", marginBottom: 4 }}>Route Views — This Week</div>
          <div style={{ fontSize: 12, color: "rgba(247,247,247,0.4)", marginBottom: 20 }}>Across all shared routes</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_VIEWS} barSize={20}>
              <XAxis dataKey="day" tick={{ fill: "rgba(247,247,247,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="views" fill="#01B4AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div style={{
          background: "rgba(14,34,54,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "20px 22px",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Activity size={14} color="#01B4AF" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#F7F7F7" }}>Recent Activity</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ACTIVITY.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 12 }}>
                <ActivityDot type={item.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#F7F7F7", fontWeight: 500 }}>{item.text}</div>
                  <div style={{ fontSize: 11, color: "rgba(247,247,247,0.45)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.detail} · {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clients quick list */}
      <div style={{
        background: "rgba(14,34,54,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, padding: "20px 22px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F7F7" }}>Clients</div>
          <button
            onClick={() => navigate("/clients")}
            style={{ fontSize: 12, color: "#01B4AF", background: "none", border: "none", cursor: "pointer" }}
          >View all →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {clients.slice(0, 4).map((c, i) => (
            <div
              key={c.id}
              onClick={() => navigate(`/clients/${c.id}`)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 0",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "rgba(1,180,175,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600, color: "#01B4AF",
                }}>
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#F7F7F7", fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(247,247,247,0.4)" }}>{c.condition}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 12, color: "rgba(247,247,247,0.5)", textAlign: "right" }}>
                  {c.routesAssigned} route{c.routesAssigned !== 1 ? "s" : ""}
                </div>
                <div style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 20,
                  background: c.status === "active" ? "rgba(1,180,175,0.12)" : "rgba(255,255,255,0.07)",
                  color: c.status === "active" ? "#01B4AF" : "rgba(247,247,247,0.4)",
                  fontWeight: 500,
                }}>
                  {c.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
