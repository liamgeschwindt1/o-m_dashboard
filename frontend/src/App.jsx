import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeScreen from "./WelcomeScreen";
import { OnboardingTypewriter } from "./OnboardingTypewriter";
import PlanningStep from "./PlanningStep";
import CalibrationStep from "./CalibrationStep";
import RefinementStep from "./RefinementStep";
import SubmitSheet from "./SubmitSheet";

const DEFAULT_MAP_VIEW = {
  basemap: "satellite",
  center: [37.7749, -122.4194],
  zoom: 13,
};

// Teal 1px sweep line — slides top→bottom over the full viewport on studio reveal
function SweepLine({ active }) {
  if (!active) return null;
  return (
    <motion.div
      style={{
        position: "absolute",
        left: 0,
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
  // phase: 'welcome' | 'onboarding' | 'ascending' | 'studio'
  const [phase, setPhase] = useState("welcome");
  const [swept, setSwept] = useState(false);

  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState(null);
  const [pins, setPins] = useState(null);
  const [route, setRoute] = useState(null);
  const [nodes, setNodes] = useState(null);
  const [mapView, setMapView] = useState(DEFAULT_MAP_VIEW);

  const handleWelcomeContinue = () => setPhase("onboarding");

  const handleOnboardingComplete = (data) => {
    setIdentity(data);
    setPhase("ascending");
    setSwept(true);
    setTimeout(() => setPhase("studio"), 950);
  };

  const handleRestart = () => {
    setStep(1);
    setIdentity(null);
    setPins(null);
    setRoute(null);
    setNodes(null);
    setMapView(DEFAULT_MAP_VIEW);
    setPhase("welcome");
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", fontFamily: "Inter, sans-serif", position: "relative", background: "#031119" }}>

      {/* ── Studio layer — slides up from below, exits by sliding down ── */}
      <AnimatePresence>
        {(phase === "ascending" || phase === "studio") && (
          <motion.div
            key="studio"
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <SweepLine active={swept} />
            {step === 1 && (
              <PlanningStep
                currentStep={1}
                mapView={mapView}
                onMapViewChange={setMapView}
                onBack={() => setPhase("onboarding")}
                onNext={(data) => { setPins(data); setStep(2); }}
              />
            )}
            {step === 2 && (
              <CalibrationStep
                currentStep={2}
                pins={pins}
                mapView={mapView}
                onMapViewChange={setMapView}
                onBack={() => setStep(1)}
                onNext={(routeData) => { setRoute(routeData); setStep(3); }}
              />
            )}
            {step === 3 && (
              <RefinementStep
                currentStep={3}
                route={route}
                mapView={mapView}
                onMapViewChange={setMapView}
                onBack={() => setStep(2)}
                onNext={(refinedNodes) => { setNodes(refinedNodes); setStep(4); }}
              />
            )}
            {step === 4 && (
              <SubmitSheet
                identity={identity}
                route={route}
                nodes={nodes}
                onConfirm={handleRestart}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Onboarding — fades in directly after welcome ── */}
      <AnimatePresence>
        {phase === "onboarding" && (
          <motion.div
            key="onboarding"
            style={{ position: "absolute", inset: 0, zIndex: 2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <OnboardingTypewriter onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Welcome screen — fades out when leaving ── */}
      <AnimatePresence>
        {phase === "welcome" && (
          <motion.div
            key="welcome"
            style={{ position: "absolute", inset: 0, zIndex: 3 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <WelcomeScreen onContinue={handleWelcomeContinue} exiting={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

