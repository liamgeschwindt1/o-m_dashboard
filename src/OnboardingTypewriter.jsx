import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const questions = [
  { label: "What's the route name?", key: "routeName" },
  { label: "Organization code?", key: "orgCode" },
  { label: "Owner name?", key: "ownerName" },
  { label: "Contact details?", key: "contact" },
];

export function OnboardingTypewriter({ onComplete }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const interval = useRef();
  const inputRef = useRef();

  // Typewriter effect for question
  useEffect(() => {
    setTyped("");
    setInput("");
    let i = 0;
    const q = questions[step]?.label;
    if (!q) return;
    interval.current = setInterval(() => {
      setTyped(q.slice(0, i + 1));
      i++;
      if (i >= q.length) clearInterval(interval.current);
    }, 38);
    return () => clearInterval(interval.current);
  }, [step]);

  // Focus input after typing finishes
  useEffect(() => {
    if (typed === questions[step]?.label) {
      inputRef.current?.focus();
    }
  }, [typed, step]);

  const advance = () => {
    const value = input.trim();
    const newAnswers = { ...answers, [questions[step].key]: value };
    setAnswers(newAnswers);
    setInput("");
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
      setTimeout(() => onComplete(newAnswers), 600);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") advance();
  };

  const isTyping = typed.length < questions[step]?.label.length;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#031119",
        background: [
          "radial-gradient(ellipse at 20% 50%, rgba(1,180,175,0.55) 0%, transparent 60%)",
          "radial-gradient(ellipse at 80% 30%, rgba(255,177,0,0.40) 0%, transparent 55%)",
          "radial-gradient(ellipse at 50% 90%, rgba(27,53,79,0.60) 0%, transparent 70%)",
        ].join(", "),
      }}
    >
      {/* Grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          opacity: 0.05,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Base dark layer */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#031119", zIndex: -1 }} />

      {/* Top-left logo */}
      <div style={{ position: "absolute", top: 28, left: 32, zIndex: 2 }}>
        <img src={logo} alt="Touchpulse" style={{ height: 32, display: "block" }} />
      </div>

      {/* Centered content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 400 }}
        >
          {/* Step indicator */}
          <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(247,247,247,0.35)", textTransform: "uppercase", marginBottom: 32 }}>
            {step + 1} / {questions.length}
          </div>

          {/* Typewriter question */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#F7F7F7",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              textAlign: "center",
              minHeight: "2.8em",
              marginBottom: 40,
            }}
          >
            {typed}
            {!done && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "0.9em",
                  background: "rgba(1,180,175,0.8)",
                  marginLeft: 3,
                  verticalAlign: "middle",
                  animation: isTyping ? "none" : "blink 1s step-end infinite",
                }}
              />
            )}
          </div>

          {/* Answer input */}
          {!done && (
            <>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                placeholder={isTyping ? "" : "Type your answer…"}
                style={{
                  width: "100%",
                  border: "none",
                  borderBottom: "0.5px solid rgba(255,255,255,0.20)",
                  outline: "none",
                  fontSize: 16,
                  fontFamily: "Inter, sans-serif",
                  padding: "12px 0",
                  background: "transparent",
                  color: "#F7F7F7",
                  textAlign: "center",
                  caretColor: "rgba(1,180,175,0.9)",
                  transition: "border-color 150ms ease",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.55)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.20)")}
              />
              <div style={{ marginTop: 28, display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  onClick={advance}
                  disabled={isTyping}
                  style={{
                    padding: "10px 28px",
                    background: "transparent",
                    color: isTyping ? "rgba(247,247,247,0.3)" : "#F7F7F7",
                    border: `0.5px solid ${isTyping ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.55)"}`,
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    cursor: isTyping ? "default" : "pointer",
                    letterSpacing: "0.04em",
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => { if (!isTyping) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {step < questions.length - 1 ? "Next →" : "Finish →"}
                </button>
                <button
                  onClick={() => advance()}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(247,247,247,0.30)",
                    fontSize: 12,
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    padding: "10px 0",
                  }}
                >
                  skip
                </button>
              </div>
            </>
          )}

          {/* Previous answers */}
          {Object.keys(answers).length > 0 && (
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
              {Object.entries(answers).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(247,247,247,0.35)", borderBottom: "0.5px solid rgba(255,255,255,0.06)", paddingBottom: 6 }}>
                  <span style={{ textTransform: "capitalize" }}>{questions.find((q) => q.key === k)?.label.replace("?", "")}</span>
                  <span style={{ color: "rgba(247,247,247,0.6)" }}>{v || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
