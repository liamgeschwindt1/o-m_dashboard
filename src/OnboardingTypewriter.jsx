import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const messages = [
  "Welcome to Tiera O&M Studio.",
  "Your Apple-minimalist dashboard.",
  "Let's get started!"
];

export function OnboardingTypewriter({ onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const interval = useRef();

  useEffect(() => {
    if (msgIdx >= messages.length) {
      onComplete?.();
      return;
    }
    interval.current = setInterval(() => {
      setDisplayed((prev) =>
        messages[msgIdx].slice(0, prev.length + 1)
      );
      setCharIdx((i) => i + 1);
    }, 40);
    return () => clearInterval(interval.current);
  }, [msgIdx]);

  useEffect(() => {
    if (displayed === messages[msgIdx]) {
      setTimeout(() => {
        setMsgIdx((i) => i + 1);
        setDisplayed("");
        setCharIdx(0);
      }, 900);
    }
  }, [displayed, msgIdx]);

  return (
    <motion.div
      className="font-sans text-2xl text-text px-8 py-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <span>{displayed}</span>
      <span className="animate-pulse">|</span>
    </motion.div>
  );
}
