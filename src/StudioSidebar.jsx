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
      background: "#fff",
      borderRight: "1px solid #EDEDED",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: 24, paddingBottom: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 26, letterSpacing: 3, fontFamily: "Inter, sans-serif" }}>
          TIERA
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 2, fontFamily: "Inter, sans-serif" }}>
          powered by Touchpulse
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ marginTop: 28, marginBottom: 4 }}>
        {STEPS.map((s) => (
          <div
            key={s.id}
            style={{
              fontSize: 12,
              fontWeight: currentStep === s.id ? 600 : 400,
              padding: "7px 24px",
              color: currentStep === s.id ? "#1c1c1e" : "#ccc",
              borderLeft: currentStep === s.id ? "2px solid #1c1c1e" : "2px solid transparent",
              fontFamily: "Inter, sans-serif",
              letterSpacing: 0.3,
            }}
          >
            {s.label}
          </div>
        ))}
      </div>

      <div style={{ width: "calc(100% - 48px)", margin: "16px 24px 0", height: 1, background: "#EDEDED" }} />

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
