import logo from "../assets/logo.png";

const STEPS = [
  { id: 0, label: "Identity" },
  { id: 1, label: "Destination" },
  { id: 2, label: "Calibration" },
  { id: 3, label: "Refinement" },
  { id: 4, label: "Uplink" },
];

export default function StudioSidebar({ currentStep, children }) {
  return (
    <div style={{
      width: 280,
      minWidth: 280,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#031119",
      borderRight: "0.5px solid rgba(255,255,255,0.08)",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: 24, paddingBottom: 0 }}>
        <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
      </div>

      {/* Step indicator */}
      <div style={{ marginTop: 28, marginBottom: 4 }}>
        {STEPS.map((s) => (
          <div
            key={s.id}
            style={{
              fontSize: 12,
              fontWeight: currentStep === s.id ? 500 : 400,
              padding: "7px 24px",
              color: currentStep === s.id ? "#01B4AF" : "rgba(247,247,247,0.35)",
              borderLeft: currentStep === s.id ? "2px solid #01B4AF" : "2px solid transparent",
              fontFamily: "Inter, sans-serif",
              letterSpacing: 0.3,
              transition: "color 200ms ease, border-color 200ms ease",
            }}
          >
            {s.label}
          </div>
        ))}
      </div>

      <div style={{ width: "calc(100% - 48px)", margin: "16px 24px 0", height: "0.5px", background: "rgba(255,255,255,0.08)" }} />

      {/* Step-specific content fills remaining height */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "20px 24px 24px",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}>
        {children}
      </div>
    </div>
  );
}
