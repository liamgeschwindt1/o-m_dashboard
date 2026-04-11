import { useState } from "react";
import { SidebarStepper } from "./SidebarStepper";
import { OnboardingTypewriter } from "./OnboardingTypewriter";
import { MapStudio } from "./MapStudio";
import { Uplink } from "./Uplink";

const steps = ["Onboarding", "Map Studio", "Uplink"];

export default function App() {
  const [step, setStep] = useState(0);
  const [onboarded, setOnboarded] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarStepper
        steps={steps}
        currentStep={step}
        onStepChange={setStep}
      />
      <main className="flex-1 flex flex-col items-center justify-center ml-[260px]">
        {step === 0 && !onboarded ? (
          <OnboardingTypewriter onComplete={() => setOnboarded(true)} />
        ) : step === 1 ? (
          <MapStudio />
        ) : step === 2 ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Uplink onUpload={files => alert(`Uploaded ${files?.length} file(s)`)}/>
          </div>
        ) : null}
      </main>
    </div>
  );
}
