import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  PenLine,
  ChevronRight,
  LogOut,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { ORG, INSTRUCTOR } from "./seedData";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/clients",   icon: Users,           label: "Clients"  },
  { to: "/routes",    icon: MapPin,          label: "Routes"   },
  { to: "/studio",    icon: PenLine,         label: "Studio"   },
];

const PAGE_TITLES = {
  "/dashboard": { title: "Overview",  sub: `${ORG.name} · ${ORG.code}` },
  "/clients":   { title: "Clients",   sub: "Manage your VI client list" },
  "/routes":    { title: "Routes",    sub: "All routes in your org" },
  "/studio":    { title: "Studio",    sub: "Build a new walking route" },
};

export default function DashboardLayout({ children, action }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const base = "/" + pathname.split("/")[1];
  const { title, sub } = PAGE_TITLES[base] ?? { title: "Dashboard", sub: "" };

  function handleLogout() {
    sessionStorage.removeItem("om_auth");
    navigate("/login");
  }

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      background: "#031119",
      color: "#F7F7F7",
      fontFamily: "Inter, sans-serif",
      overflow: "hidden",
    }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220,
        minWidth: 220,
        background: "rgba(10,28,46,0.95)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        zIndex: 10,
      }}>
        {/* Org branding */}
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <img src={logo} alt="Touchpulse" style={{ height: 24, display: "block", marginBottom: 14 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F7F7", lineHeight: 1.3 }}>{ORG.name}</div>
          <div style={{ fontSize: 11, color: "rgba(247,247,247,0.4)", marginTop: 2 }}>{ORG.code}</div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "16px 8px" }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#01B4AF" : "rgba(247,247,247,0.6)",
                background: isActive ? "rgba(1,180,175,0.10)" : "transparent",
                transition: "all 0.15s",
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Instructor avatar */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#FFB100,#e09400)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#031119", flexShrink: 0,
          }}>{INSTRUCTOR.initials}</div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#F7F7F7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {INSTRUCTOR.name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(247,247,247,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {INSTRUCTOR.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 6, borderRadius: 6,
              color: "rgba(247,247,247,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FF7230"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(247,247,247,0.4)"; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{
          height: 64,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px",
          background: "rgba(3,17,25,0.9)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(247,247,247,0.35)" }}>{ORG.name}</span>
            <ChevronRight size={12} color="rgba(247,247,247,0.25)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#F7F7F7" }}>{title}</span>
            {sub && (
              <>
                <ChevronRight size={12} color="rgba(247,247,247,0.25)" />
                <span style={{ fontSize: 12, color: "rgba(247,247,247,0.4)" }}>{sub}</span>
              </>
            )}
          </div>
          {action && <div>{action}</div>}
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
