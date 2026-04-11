import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const questions = [
  { label: "Route Name?", key: "routeName" },
  { label: "Organization?", key: "organization" },
  { label: "Trainer Name?", key: "trainerName" },
];

export function OnboardingTypewriter({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState({});
  const interval = useRef();

  // Typewriter effect for question
  useEffect(() => {
    setTyped("");
    let i = 0;
    const q = questions[step]?.label;
    if (!q) return;
    interval.current = setInterval(() => {
      setTyped(q.slice(0, i + 1));
      i++;
      if (i >= q.length) clearInterval(interval.current);
    }, 32);
    return () => clearInterval(interval.current);
  }, [step]);

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      setAnswers((prev) => ({ ...prev, [questions[step].key]: input.trim() }));
      setInput("");
      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        setTimeout(() => {
          onComplete({ ...answers, [questions[step].key]: input.trim() });
        }, 400);
      }
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9fa] z-20">
      <motion.div
        className="flex flex-col items-center justify-center w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="font-sans text-2xl text-[#1c1c1e] mb-8 text-center min-h-[2.5em]">
          <span>{typed}</span>
          <span className="animate-pulse">|</span>
        </div>
        <input
          className="border border-[#EDEDED] rounded px-4 py-2 w-80 text-lg text-center font-sans bg-white focus:outline-none"
          style={{ fontFamily: 'Inter' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={typed.length < questions[step]?.label.length}
          placeholder={typed.length < questions[step]?.label.length ? "" : "Type your answer..."}
        />
        <div className="mt-8 text-gray-400 text-sm font-mono">
          {Object.entries(answers).map(([k, v]) => (
            <div key={k}>{questions.find(q => q.key === k)?.label} <span className="text-black">{v}</span></div>
          ))}
        </div>
        <button
          className="mt-10 px-6 py-2 rounded bg-black text-white font-semibold text-base hover:bg-[#222] transition"
          style={{ fontFamily: 'Inter', letterSpacing: 1 }}
          onClick={() => onSkip?.()}
        >
          Skip Onboarding
        </button>
      </motion.div>
    </div>
  );
}
