import { useState } from "react";
import IdentityStep from "./IdentityStep";
import { MapStudio } from "./MapStudio";
import { Uplink } from "./Uplink";

const steps = ["Onboarding", "Planning", "Calibration", "Refinement", "Submission"];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Step transitions
  const handleOnboardingComplete = (data) => {
    setOnboardingData(data);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(1);
    }, 1800);
  };

  const handleRouteComplete = (route) => {
    setRouteData(route);
    setCurrentStep(4);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setCurrentStep(0);
      setSubmitted(false);
      setOnboardingData(null);
      setRouteData(null);
      setEmail("");
    }, 3000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar only after onboarding */}
      {currentStep > 0 && onboardingData && !loading && (
        <aside className="flex flex-col items-start border-r border-[#EDEDED] h-full" style={{width: 280, minWidth: 280, background: '#fff'}}>
          <div style={{padding: 24, paddingBottom: 0}}>
            <div style={{fontWeight: 700, fontSize: 28, letterSpacing: 2}}>TIERA</div>
            <div style={{fontSize: 13, color: '#888', marginTop: 2}}>powered by Touchpulse</div>
          </div>
          {/* Step indicator */}
          <div style={{marginTop: 40, width: '100%'}}>
            {steps.map((label, i) => (
              <div key={label} style={{
                fontWeight: currentStep === i ? 700 : 400,
                fontSize: 16,
                padding: '10px 24px',
                background: currentStep === i ? '#f8f9fa' : 'transparent',
                color: currentStep === i ? '#1c1c1e' : '#888',
                borderLeft: currentStep === i ? '3px solid #1c1c1e' : '3px solid transparent',
                transition: 'all 0.2s',
              }}>{i + 1}. {label}</div>
            ))}
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 relative h-full flex items-center justify-center" style={{background: '#f8f9fa'}}>
        {currentStep === 0 && !onboardingData && (
          <IdentityStep onComplete={handleOnboardingComplete} />
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="animate-pulse text-2xl font-bold text-[#1c1c1e]">Loading studio environment…</div>
          </div>
        )}
        {currentStep > 0 && currentStep < 4 && (
          <MapStudio
            step={currentStep}
            onRouteComplete={handleRouteComplete}
            onboardingData={onboardingData}
          />
        )}
        {currentStep === 4 && !submitted && (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="mb-6 text-xl font-semibold">Finalize Route Submission</div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border border-[#EDEDED] rounded px-4 py-2 mb-4 w-72 text-base focus:outline-none"
              style={{fontFamily: 'Inter'}}
            />
            <button
              className="bg-black text-white rounded px-6 py-2 text-base font-semibold"
              style={{fontFamily: 'Inter', letterSpacing: 1}}
              onClick={handleSubmit}
              disabled={!email}
            >
              Submit custom route
            </button>
          </div>
        )}
        {submitted && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-20">
            <div className="text-2xl font-bold text-[#1c1c1e]">Route submitted! Thank you.</div>
          </div>
        )}
      </main>
    </div>
  );
}
