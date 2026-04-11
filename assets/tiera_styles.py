TIERA_STYLES = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --bg:           #0A0A0A;
  --panel:        rgba(18, 18, 18, 0.92);
  --panel-solid:  #141414;
  --border:       rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.18);
  --text:         #F5F5F5;
  --text-dim:     rgba(255, 255, 255, 0.40);
  --text-mid:     rgba(255, 255, 255, 0.65);
  --accent:       #FFFFFF;
  --accent-hover: #E0E0E0;
  --accent-dim:   rgba(255, 255, 255, 0.08);
  --alert:        #FFFFFF;
  --alert-dim:    rgba(255, 255, 255, 0.08);
  --danger:       #FF4D4D;
  --success:      #34D399;
  --radius:       8px;
  --radius-sm:    6px;
  --transition:   0.2s ease-in-out;
  --blur:         saturate(1.2) blur(24px);
  --font:         'Inter', sans-serif;
  --mono:         'JetBrains Mono', monospace;
}

/* ── Global reset ── */
html, body {
  background: var(--bg) !important;
  color: var(--text) !important;
  font-family: var(--font);
  font-size: 13px;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

[data-testid="stApp"],
[data-testid="stAppViewContainer"],
[data-testid="stAppViewContainer"] > .main,
[data-testid="stMain"],
.main {
  background: var(--bg) !important;
  color: var(--text) !important;
  font-family: var(--font);
  font-size: 13px;
  margin: 0 !important;
  padding: 0 !important;
}

/* Kill ALL Streamlit chrome */
header[data-testid="stHeader"],
[data-testid="stHeader"],
#MainMenu, footer,
[data-testid="stToolbar"],
[data-testid="stDecoration"],
[data-testid="stStatusWidget"] {
  display: none !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Block-container */
.main .block-container,
[data-testid="stMainBlockContainer"],
[data-testid="stMain"] > div {
  max-width: 100% !important;
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: visible !important;
}

/* ================================================================
   Top-level two-column row: FIXED to viewport
   ================================================================ */
.main [data-testid="stHorizontalBlock"]:first-of-type {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 999 !important;
  display: flex !important;
  gap: 0 !important;
  align-items: stretch !important;
  margin: 0 !important;
  padding: 0 !important;
  background: var(--bg) !important;
}

/* ── Sidebar column (floating glassmorphic blade) ── */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child {
  flex: 0 0 25vw !important;
  max-width: 25vw !important;
  min-width: 320px !important;
  width: 25vw !important;
  height: 100vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  background: var(--panel) !important;
  backdrop-filter: var(--blur) !important;
  -webkit-backdrop-filter: var(--blur) !important;
  border-right: 1px solid var(--border) !important;
  padding: 0 1.8rem !important;
  margin: 0 !important;
  z-index: 10 !important;
}

/* Scrollbar styling */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child::-webkit-scrollbar {
  width: 4px;
}
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child::-webkit-scrollbar-track {
  background: transparent;
}
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child::-webkit-scrollbar-thumb {
  background: rgba(247, 247, 247, 0.12);
  border-radius: 4px;
}

/* All wrapper divs inside sidebar: break flex-grow chain */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child > div,
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child > div > div,
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child > div > div > div,
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child > div > div > div > div,
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child > div > div > div > div > div {
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
  flex: 0 0 auto !important;
}

/* Sidebar vertical-block spacing — handled by sidebar widget inset rule below */

/* Nested horizontal blocks inside sidebar stay row-flex */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"] {
  display: flex !important;
  flex-wrap: nowrap !important;
  height: auto !important;
  overflow: visible !important;
  position: static !important;
  inset: unset !important;
  width: 100% !important;
  z-index: auto !important;
}

/* Nested columns inside sidebar stay flexible */
[data-testid="stColumn"] [data-testid="stColumn"] {
  flex: unset !important;
  max-width: unset !important;
  min-width: unset !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
}

/* ── Map column (full-screen canvas) ── */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:last-child {
  flex: 1 1 auto !important;
  height: 100% !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin: 0 !important;
}

.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:last-child > div,
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:last-child > div > div,
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:last-child > div > div > div,
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:last-child > div > div > div > div {
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:last-child iframe {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  border: none !important;
}

/* ================================================================
   Brand
   ================================================================ */
/* Brand area: logo + subtitle */
.main [data-testid="stColumn"]:first-child [data-testid="stImage"] {
  padding: 24px 0 0 0 !important;
  margin: 0 !important;
}
.main [data-testid="stColumn"]:first-child [data-testid="stImage"] img {
  max-width: 160px !important;
}
.t-brand-title {
  font-family: var(--font);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  padding: 0.6rem 0 0;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.t-brand-subtitle {
  font-family: var(--font);
  font-size: 0.9rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.35);
  padding: 0.25rem 0 1rem;
  line-height: 1.5;
  border-bottom: 1px solid var(--border);
}

.t-divider {
  height: 1px;
  background: var(--border);
  margin: 0.2rem 0 0.6rem;
}

/* ================================================================
   Section & Typography
   ================================================================ */
.t-section {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-mid);
  padding: 0.6rem 0 0.5rem;
}
.t-field-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 0.15rem 0 0.2rem;
}
.t-hint {
  font-size: 11px;
  color: var(--text-dim);
  padding: 0.2rem 0;
  line-height: 1.6;
}
.t-gap { height: 0.5rem; }
.t-coord {
  font-size: 11px;
  color: var(--success);
  padding: 0.15rem 0;
  line-height: 1.4;
  font-family: var(--mono);
}
.t-status {
  font-size: 11px;
  color: var(--text-dim);
  padding: 0.2rem 0 0.3rem;
  line-height: 1.5;
}
.t-via {
  font-size: 11px;
  font-family: var(--mono);
  color: var(--text-mid);
  padding: 0.15rem 0;
}
.t-warn {
  font-size: 11px;
  color: var(--alert);
  padding: 0.2rem 0;
}
.t-success {
  padding: 1.5rem 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 0.8rem 0;
  background: rgba(52, 211, 153, 0.06);
}

/* ================================================================
   Stepper (horizontal numbered dots)
   Target the 5-column row uniquely (only stepper has 5 cols)
   ================================================================ */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 !important;
  padding: 0.9rem 1rem 0.6rem !important;
}

/* Each column in the dot row */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) > [data-testid="stColumn"] {
  flex: 0 0 auto !important;
  width: auto !important;
  max-width: none !important;
  min-width: auto !important;
  padding: 0 6px !important;
}

/* All dot buttons: circle shape */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) .stButton > button {
  width: 30px !important;
  height: 30px !important;
  min-height: 30px !important;
  max-width: 30px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  font-family: var(--mono) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
}

/* Done steps: subtle filled circle */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) .stButton > button:not([kind="primary"]):not(:disabled) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: var(--text) !important;
}

/* Current step: white (styled by primary button rules) */

/* Future steps: dim (already styled by :disabled rules) */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) .stButton > button:disabled {
  width: 30px !important;
  height: 30px !important;
  border-radius: 50% !important;
  opacity: 0.25 !important;
}

/* Connector bars between dots (via column gaps) */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) > [data-testid="stColumn"]:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  width: 12px;
  height: 1.5px;
  background: rgba(247, 247, 247, 0.12);
}

/* ================================================================
   Instruction nodes (refinement step)
   ================================================================ */
.t-node {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 0;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all var(--transition);
}
.t-node:hover {
  background: rgba(247, 247, 247, 0.04);
}
.t-node--active {
  border-left-color: var(--text) !important;
  background: rgba(247, 247, 247, 0.05) !important;
}
.t-node-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid var(--text-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
  font-family: var(--mono);
  color: var(--text-mid);
  transition: all var(--transition);
}
.t-node--active .t-node-num {
  background: var(--text);
  color: var(--bg);
}
.t-node-meta {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  text-transform: uppercase;
  font-family: var(--mono);
}
.t-node-text {
  font-size: 11px;
  color: var(--text-dim);
  padding: 0.15rem 0 0.3rem 2rem;
  line-height: 1.5;
}

/* ================================================================
   Widget overrides (clean bottom-border inputs)
   ================================================================ */
[data-testid="stTextInput"] input,
[data-testid="stTextArea"] textarea,
[data-testid="stNumberInput"] input {
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 0 !important;
  color: var(--text) !important;
  font-size: 13px !important;
  font-family: var(--font) !important;
  padding: 0.5rem 0 !important;
  transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
}
[data-baseweb="select"] > div {
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 0 !important;
  color: var(--text) !important;
  font-size: 13px !important;
  font-family: var(--font) !important;
  transition: border-color 0.3s ease !important;
}
[data-testid="stTextInput"] input::placeholder,
[data-testid="stTextArea"] textarea::placeholder {
  color: var(--text-dim) !important;
}
[data-testid="stTextInput"] input:focus,
[data-testid="stTextArea"] textarea:focus,
[data-testid="stNumberInput"] input:focus {
  border-bottom-color: rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.2) !important;
  outline: none !important;
}
[data-testid="stTextArea"] textarea {
  caret-color: var(--text) !important;
}
label, [data-testid="stWidgetLabel"] {
  font-size: 11px !important;
  color: var(--text-dim) !important;
  font-family: var(--font) !important;
}

/* Select dropdowns */
[data-baseweb="select"] [data-baseweb="select-option"] {
  font-size: 12px !important;
  background: var(--panel-solid) !important;
  color: var(--text) !important;
}
[data-baseweb="popover"] > div {
  background: var(--panel-solid) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-sm) !important;
}
[data-baseweb="select"] [data-baseweb="select-option"]:hover {
  background: rgba(247, 247, 247, 0.06) !important;
}

/* ================================================================
   Buttons
   ================================================================ */
.stButton > button {
  background: rgba(247, 247, 247, 0.04) !important;
  color: var(--text-mid) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  font-family: var(--font) !important;
  padding: 0.45rem 0.75rem !important;
  box-shadow: none !important;
  text-align: left !important;
  justify-content: flex-start !important;
  transition: all var(--transition) !important;
  cursor: pointer !important;
}
.stButton > button:hover {
  border-color: var(--border-hover) !important;
  background: rgba(247, 247, 247, 0.07) !important;
  color: var(--text) !important;
}

/* Primary buttons — Clean White */
.stButton > button[kind="primary"] {
  background: var(--text) !important;
  color: var(--bg) !important;
  border-color: var(--text) !important;
  font-weight: 600 !important;
  text-align: center !important;
  justify-content: center !important;
}
.stButton > button[kind="primary"]:hover {
  background: var(--accent-hover) !important;
  border-color: var(--accent-hover) !important;
}
.stButton > button:disabled {
  opacity: 0.3 !important;
  cursor: not-allowed !important;
}

/* Download buttons */
.stDownloadButton > button {
  background: rgba(247, 247, 247, 0.04) !important;
  color: var(--text-mid) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  font-size: 12px !important;
  font-family: var(--font) !important;
  transition: all var(--transition) !important;
}
.stDownloadButton > button:hover {
  border-color: var(--border-hover) !important;
}

/* Alert button */
.t-alert-btn > button {
  background: rgba(255, 255, 255, 0.06) !important;
  color: var(--text) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  text-align: center !important;
  justify-content: center !important;
  font-weight: 600 !important;
}
.t-alert-btn > button:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.35) !important;
}

div[data-testid="stExpander"] {
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  background: transparent !important;
}

/* ── Sidebar widget vertical spacing ── */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child
  [data-testid="stVerticalBlock"] {
  gap: 0.25rem !important;
  padding-bottom: 2rem !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
  flex: 0 0 auto !important;
}

/* ================================================================
   Spinner / loading
   ================================================================ */
.stSpinner > div {
  border-top-color: var(--accent) !important;
}

/* ================================================================
   Streaming text animation
   ================================================================ */
@keyframes t-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.t-stream {
  animation: t-fade-in 0.4s ease-out both;
}
.t-stream-line {
  display: block;
  animation: t-fade-in 0.3s ease-out both;
}
.t-stream-line:nth-child(2) { animation-delay: 0.08s; }
.t-stream-line:nth-child(3) { animation-delay: 0.16s; }
.t-stream-line:nth-child(4) { animation-delay: 0.24s; }
.t-stream-line:nth-child(5) { animation-delay: 0.32s; }
.t-stream-line:nth-child(6) { animation-delay: 0.40s; }

/* ================================================================
   AI log / streaming card
   ================================================================ */
.t-ai-log {
  padding: 0.8rem;
  font-size: 11px;
  line-height: 1.7;
  color: var(--text-dim);
  font-family: var(--mono);
  border-left: 2px solid var(--text-dim);
  margin: 0.4rem 0;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

/* ================================================================
   Studio fade-in transition
   ================================================================ */
.t-studio-enter {
  animation: t-studio-fade 0.5s ease-in-out both;
}
@keyframes t-studio-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ================================================================
   Onboarding overlay — hides the main studio
   ================================================================ */
.onboarding-hide .main [data-testid="stHorizontalBlock"]:first-of-type {
  display: none !important;
}

/* ================================================================
   Onboarding iframe — fill full viewport so the component is visible
   before the two-column studio layout renders.
   ================================================================ */
[data-testid="stCustomComponentV1"] iframe {
  min-height: 100vh;
}
"""
