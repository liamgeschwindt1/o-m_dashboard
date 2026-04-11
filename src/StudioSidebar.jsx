import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const STEPS = [
  { id: 0, label: "Identity" },
  { id: 1, label: "Destination" },
  { id: 2, label: "Calibration" },
  { id: 3, label: "Refinement" },
  { id: 4, label: "Uplink" },
];

// Dot x-center inside the sidebar (from sidebar left edge)
const LINE_X = 24;

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

      {/* Logo — 24px from top and left */}
      <div style={{ padding: "24px 24px 0", position: "relative", zIndex: 1 }}>
        <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
      </div>

      {/* Vertical timeline stepper */}
      <div style={{ marginTop: 28, position: "relative", zIndex: 1 }}>
        {/* 1px connecting line */}
        <div style={{
          position: "absolute",
          left: LINE_X,
          top: 10,
          bottom: 10,
          width: 1,
          background: "rgba(255,255,255,0.08)",
        }} />

        {STEPS.map((s) => {
          const isActive = currentStep === s.id;
          const isPast = currentStep > s.id;
          const dotSize = isActive ? 6 : 5;
          return (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 24px 9px 44px",
                position: "relative",
              }}
            >
              {/* Dot on the timeline */}
              <div style={{
                position: "absolute",
                left: LINE_X - dotSize / 2,
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                background: isActive ? "#01B4AF" : "transparent",
                border: isActive ? "none" : `1px solid rgba(247,247,247,${isPast ? "0.40" : "0.20"})`,
                zIndex: 1,
              }} />
              {/* Label */}
              <span style={{
                fontSize: 11,
                color: isActive ? "#F7F7F7" : isPast ? "rgba(247,247,247,0.45)" : "rgba(247,247,247,0.25)",
                fontWeight: isActive ? 500 : 400,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ width: "calc(100% - 48px)", margin: "16px 24px 0", height: "0.5px", background: "rgba(255,255,255,0.08)", position: "relative", zIndex: 1 }} />

      {/* Step-specific content */}
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
