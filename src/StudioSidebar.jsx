import logo from "../assets/logo.png";

const STEPS = [
  { id: 0, label: "Identity" },
  { id: 1, label: "Destination" },
  { id: 2, label: "Calibration" },
  { id: 3, label: "Refinement" },
  { id: 4, label: "Uplink" },
];

const LINE_X = 20;

export default function StudioSidebar({ currentStep, children }) {
  return (
    <div style={{
      position: "absolute",
      top: 16,
      left: 16,
      bottom: 16,
      width: 264,
      display: "flex",
      flexDirection: "column",
      background: "rgba(3, 12, 20, 0.92)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      zIndex: 10,
      overflow: "hidden",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Logo — 24px from top and left */}
      <div style={{ padding: "24px 20px 0" }}>
        <img src={logo} alt="Touchpulse" style={{ height: 28, display: "block" }} />
      </div>

      {/* Vertical timeline stepper */}
      <div style={{ marginTop: 24, position: "relative" }}>
        {/* 1px connecting line */}
        <div style={{
          position: "absolute",
          left: LINE_X,
          top: 10,
          bottom: 10,
          width: 1,
          background: "rgba(255,255,255,0.07)",
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
                padding: "8px 20px 8px 40px",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute",
                left: LINE_X - dotSize / 2,
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                background: isActive ? "#01B4AF" : "transparent",
                border: isActive ? "none" : `1px solid rgba(247,247,247,${isPast ? "0.35" : "0.15"})`,
                zIndex: 1,
              }} />
              <span style={{
                fontSize: 11,
                color: isActive ? "#F7F7F7" : isPast ? "rgba(247,247,247,0.40)" : "rgba(247,247,247,0.20)",
                fontWeight: isActive ? 500 : 400,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ margin: "14px 20px 0", height: "0.5px", background: "rgba(255,255,255,0.07)" }} />

      {/* Step-specific content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "18px 20px 20px",
        overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

