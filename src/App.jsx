import { useState } from "react";
import IdentityStep from "./IdentityStep";
import PlanningStep from "./PlanningStep";
import CalibrationStep from "./CalibrationStep";
import RefinementStep from "./RefinementStep";
import UplinkStep from "./UplinkStep";

export default function App() {
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState(null);
  const [pins, setPins] = useState(null);
  const [route, setRoute] = useState(null);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      {step === 0 && (
        <IdentityStep onComplete={(data) => { setIdentity(data); setStep(1); }} />
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
    </div>
  );
}
