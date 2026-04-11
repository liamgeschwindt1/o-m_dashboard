import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

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
      position: "relative",
      backgroundColor: "#031119",
      background: [
        "radial-gradient(ellipse at 0% 35%, rgba(1,180,175,0.38) 0%, transparent 65%)",
        "radial-gradient(ellipse at 110% 15%, rgba(255,177,0,0.22) 0%, transparent 55%)",
        "radial-gradient(ellipse at 50% 100%, rgba(27,53,79,0.55) 0%, transparent 65%)",
      ].join(", "),
      borderRight: "0.5px solid rgba(255,255,255,0.08)",
      flexShrink: 0,
    }}>
      {/* Grain overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
        opacity: 0.05,
        pointerEvents: "none",
        zIndex: 0,
      }} />
      {/* Logo */}
      <div style={{ padding: 24, paddingBottom: 0, position: "relative", zIndex: 1 }}>
        <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
      </div>

      {/* Step indicator */}
      <div style={{ marginTop: 28, marginBottom: 4, position: "relative", zIndex: 1 }}>
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

      <div style={{ width: "calc(100% - 48px)", margin: "16px 24px 0", height: "0.5px", background: "rgba(255,255,255,0.08)", position: "relative", zIndex: 1 }} />

      {/* Step-specific content fills remaining height */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "20px 24px 24px",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}
