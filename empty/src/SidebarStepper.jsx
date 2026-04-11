import { motion } from "framer-motion";

export function SidebarStepper({ steps, currentStep, onStepChange }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar bg-sidebar border-r border-border flex flex-col px-6 py-8 z-20">
      <nav className="flex flex-col gap-6">
        {steps.map((step, idx) => (
          <motion.button
            key={step}
            className={`text-left px-2 py-2 rounded font-mono text-base transition-colors ${
              idx === currentStep
                ? "bg-accent/10 text-accent font-bold"
                : "text-text hover:bg-accent/5"
            }`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStepChange(idx)}
            aria-current={idx === currentStep ? "step" : undefined}
          >
            <span className="inline-block w-6 text-center mr-2">{idx + 1}</span>
            {step}
          </motion.button>
        ))}
      </nav>
    </aside>
  );
}
