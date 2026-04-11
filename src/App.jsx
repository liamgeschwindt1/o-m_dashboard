import { useState } from "react";
import { motion } from "framer-motion";
import WelcomeScreen from "./WelcomeScreen";
import { OnboardingTypewriter } from "./OnboardingTypewriter";
import PlanningStep from "./PlanningStep";
import CalibrationStep from "./CalibrationStep";
import RefinementStep from "./RefinementStep";
import UplinkStep from "./UplinkStep";

// Teal 1px sweep line — slides top→bottom over the map area once on studio reveal
function SweepLine({ active }) {
  if (!active) return null;
  return (
    <motion.div
      style={{
        position: "absolute",
        left: 280,
        right: 0,
        height: 1,
        background: "#01B4AF",
        boxShadow: "0 0 8px rgba(1,180,175,0.7)",
        top: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: "100vh", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.8, ease: "linear", delay: 0.55 }}
    />
  );
}

export default function App() {
  // phase: 'welcome' | 'ascending' | 'studio'
  const [phase, setPhase] = useState("welcome");
  const [swept, setSwept] = useState(false);

  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState(null);
  const [pins, setPins] = useState(null);
  const [route, setRoute] = useState(null);

  const handleAscend = () => {
    setPhase("ascending");
    setSwept(true);
    setTimeout(() => setPhase("studio"), 950);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", fontFamily: "Inter, sans-serif", position: "relative", background: "#031119" }}>

      {/* ── Studio layer — slides up from below when ascending ── */}
      {phase !== "welcome" && (
        <motion.div
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <SweepLine active={swept} />

          {step === 0 && (
            <OnboardingTypewriter onComplete={(data) => { setIdentity(data); setStep(1); }} />
          )}
          {step === 1 && (
            <PlanningStep
              currentStep={1}
              onBack={() => setStep(0)}
              onNext={(data) => { setPins(data); setStep(2); }}
            />
          )}
          {step === 2 && (
            <CalibrationStep
              currentStep={2}
              pins={pins}
              onBack={() => setStep(1)}
              onNext={(routeData) => { setRoute(routeData); setStep(3); }}
            />
          )}
          {step === 3 && (
            <RefinementStep
              currentStep={3}
              route={route}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <UplinkStep
              identity={identity}
              onRestart={() => {
                setStep(0);
                setIdentity(null);
                setPins(null);
                setRoute(null);
              }}
            />
          )}
        </motion.div>
      )}

      {/* ── Welcome screen — sits on top, unmounts after transition ── */}
      {phase !== "studio" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <WelcomeScreen onContinue={handleAscend} exiting={phase === "ascending"} />
        </div>
      )}
    </div>
  );
}
