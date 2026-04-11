TIERA_STYLES = """
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

/* ================================================================
   TIERA DESIGN SYSTEM — Brand Token Layer
   ================================================================
   Brand palette
     Charcoal Black  #031119   bg, deepest surface
     Ink Blue        #1B354F   panels, borders, structure
     Golden Yellow   #FFB100   actions, active states, focus
     Electric Teal   #01B4AF   success, live status, feedback
     Soft White      #F7F7F7   primary text, legibility
   ================================================================ */

:root {
  /* ── Brand primitives ── */
  --charcoal:       #031119;
  --ink:            #1B354F;
  --ink-light:      #224060;
  --yellow:         #FFB100;
  --yellow-dim:     rgba(255, 177, 0, 0.10);
  --yellow-border:  rgba(255, 177, 0, 0.22);
  --yellow-focus:   rgba(255, 177, 0, 0.45);
  --teal:           #01B4AF;
  --teal-dim:       rgba(1, 180, 175, 0.08);
  --teal-border:    rgba(1, 180, 175, 0.22);
  --soft-white:     #F7F7F7;

  /* ── Surface stack ── */
  --bg:             #031119;
  --panel:          rgba(5, 18, 28, 0.97);
  --panel-solid:    #071622;
  --surface:        rgba(27, 53, 79, 0.30);
  --surface-hover:  rgba(27, 53, 79, 0.50);
  --surface-ink:    rgba(27, 53, 79, 0.60);

  /* ── Borders ── */
  --border:         rgba(247, 247, 247, 0.07);
  --border-hover:   rgba(247, 247, 247, 0.14);
  --border-focus:   rgba(255, 177, 0, 0.45);
  --border-ink:     rgba(27, 53, 79, 0.70);

  /* ── Text ── */
  --text:           #F7F7F7;
  --text-mid:       rgba(247, 247, 247, 0.52);
  --text-dim:       rgba(247, 247, 247, 0.28);
  --text-ghost:     rgba(247, 247, 247, 0.12);

  /* ── Semantic (mapped to brand) ── */
  --success:        #01B4AF;
  --success-bg:     rgba(1, 180, 175, 0.08);
  --success-border: rgba(1, 180, 175, 0.22);
  --warning:        #FFB100;
  --warning-bg:     rgba(255, 177, 0, 0.10);
  --warning-border: rgba(255, 177, 0, 0.22);
  --danger:         #FF5252;
  --danger-bg:      rgba(255, 82, 82, 0.08);
  --danger-border:  rgba(255, 82, 82, 0.22);
  --info:           rgba(247, 247, 247, 0.55);
  --info-bg:        rgba(247, 247, 247, 0.06);

  /* ── Layout ── */
  --radius:         7px;
  --radius-sm:      5px;
  --radius-lg:      10px;
  --transition:     0.16s ease;
  --blur:           saturate(1.6) blur(28px);
  --font:           'DM Sans', sans-serif;
  --mono:           'DM Mono', monospace;
}

/* ================================================================
   Global reset
   ================================================================ */
html, body {
  background: var(--bg) !important;
  color: var(--text) !important;
  font-family: var(--font);
  font-size: 13px;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  -webkit-font-smoothing: antialiased;
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

/* ── Kill Streamlit chrome ── */
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

/* ── Block container ── */
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
   Two-column fixed viewport layout
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

/* ================================================================
   Sidebar column — glassmorphic ink-blue blade
   ================================================================ */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child {
  flex: 0 0 25vw !important;
  max-width: 25vw !important;
  min-width: 300px !important;
  width: 25vw !important;
  height: 100vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  background: var(--panel) !important;
  backdrop-filter: var(--blur) !important;
  -webkit-backdrop-filter: var(--blur) !important;
  border-right: 1px solid var(--border-ink) !important;
  padding: 0 !important;
  margin: 0 !important;
  z-index: 10 !important;
  scrollbar-width: thin !important;
  scrollbar-color: var(--surface-ink) transparent !important;
}

.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child::-webkit-scrollbar {
  width: 3px;
}
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child::-webkit-scrollbar-track {
  background: transparent;
}
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child::-webkit-scrollbar-thumb {
  background: var(--surface-ink);
  border-radius: 3px;
}

/* ── Break flex-grow chain inside sidebar ── */
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

.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child
  [data-testid="stVerticalBlock"] {
  gap: 0.25rem !important;
  padding: 0 !important;
  padding-bottom: 2rem !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
  flex: 0 0 auto !important;
}

/* ── Nested horizontals inside sidebar stay row-flex ── */
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

[data-testid="stColumn"] [data-testid="stColumn"] {
  flex: unset !important;
  max-width: unset !important;
  min-width: unset !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
}

/* ================================================================
   Map column — full-screen canvas
   ================================================================ */
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
   Brand area
   ================================================================ */
.main [data-testid="stColumn"]:first-child [data-testid="stImage"] {
  padding: 20px 20px 0 20px !important;
  margin: 0 !important;
}
.main [data-testid="stColumn"]:first-child [data-testid="stImage"] img {
  max-width: 148px !important;
}

.t-brand-title {
  font-family: var(--font);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text);
  padding: 0.5rem 20px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.t-brand-subtitle {
  font-family: var(--font);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--text-dim);
  padding: 0.2rem 20px 0.9rem;
  line-height: 1.5;
  border-bottom: 1px solid var(--border-ink);
}

/* ================================================================
   Dividers & spacing
   ================================================================ */
.t-divider {
  height: 1px;
  background: var(--border-ink);
  margin: 0.2rem 0 0.5rem;
}
.t-gap { height: 0.5rem; }

/* ================================================================
   Typography utilities
   ================================================================ */
.t-section {
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
  font-family: var(--mono);
  padding: 0.7rem 20px 0.35rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
/* Trailing rule after section header */
.t-section-ruled::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.t-field-label {
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--text-dim);
  font-family: var(--mono);
  padding: 0.1rem 20px 0.2rem;
}

.t-hint {
  font-size: 11px;
  color: var(--text-dim);
  padding: 0.15rem 20px 0.5rem;
  line-height: 1.6;
}

.t-status {
  font-size: 11px;
  color: var(--text-dim);
  padding: 0.2rem 20px 0.3rem;
  line-height: 1.5;
}

.t-via {
  font-size: 11px;
  font-family: var(--mono);
  color: var(--text-mid);
  padding: 0.1rem 20px;
}

/* ================================================================
   Coordinate chip
   ================================================================ */
.t-coord {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-family: var(--mono);
  color: var(--teal);
  background: var(--teal-dim);
  border: 1px solid var(--teal-border);
  padding: 2px 7px;
  border-radius: 4px;
  line-height: 1.4;
}
.t-coord::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--teal);
}

/* ================================================================
   Status pills
   ================================================================ */
.t-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 100px;
  font-size: 9.5px;
  font-family: var(--mono);
  font-weight: 500;
  letter-spacing: 0.04em;
  border: 1px solid transparent;
}
.t-pill::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}
.t-pill--success {
  background: var(--success-bg);
  color: var(--success);
  border-color: var(--success-border);
}
.t-pill--warning {
  background: var(--warning-bg);
  color: var(--warning);
  border-color: var(--warning-border);
}
.t-pill--danger {
  background: var(--danger-bg);
  color: var(--danger);
  border-color: var(--danger-border);
}
.t-pill--info {
  background: var(--info-bg);
  color: var(--info);
  border-color: var(--border);
}

/* ================================================================
   Stepper — 5-column horizontal dot row
   ================================================================ */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 !important;
  padding: 0.85rem 1rem 0.6rem !important;
  border-bottom: 1px solid var(--border-ink) !important;
}

[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) > [data-testid="stColumn"] {
  flex: 0 0 auto !important;
  width: auto !important;
  max-width: none !important;
  min-width: auto !important;
  padding: 0 5px !important;
}

/* All step dots */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) .stButton > button {
  width: 26px !important;
  height: 26px !important;
  min-height: 26px !important;
  max-width: 26px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  font-family: var(--mono) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  background: var(--surface-ink) !important;
  border-color: rgba(1, 180, 175, 0.25) !important;
  color: var(--teal) !important;
}

/* Active step: golden yellow */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) .stButton > button[kind="primary"] {
  background: var(--yellow) !important;
  color: var(--charcoal) !important;
  border-color: var(--yellow) !important;
  font-weight: 600 !important;
  box-shadow: 0 0 0 3px rgba(255, 177, 0, 0.15) !important;
}

/* Future steps: dimmed */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) .stButton > button:disabled {
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  background: transparent !important;
  border-color: var(--border) !important;
  color: var(--text-ghost) !important;
  opacity: 1 !important;
}

/* Connector bars */
[data-testid="stColumn"]:first-child
  [data-testid="stHorizontalBlock"]:has(
    > [data-testid="stColumn"]:nth-child(5):last-child
  ) > [data-testid="stColumn"]:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  width: 10px;
  height: 1px;
  background: var(--border-ink);
}

/* ================================================================
   Instruction / refinement nodes
   ================================================================ */
.t-node {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 20px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all var(--transition);
}
.t-node:hover {
  background: var(--surface);
}
.t-node--active {
  border-left-color: var(--yellow) !important;
  background: rgba(255, 177, 0, 0.05) !important;
}
.t-node-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--border-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 500;
  font-family: var(--mono);
  color: var(--text-mid);
  flex-shrink: 0;
  transition: all var(--transition);
}
.t-node--active .t-node-num {
  background: var(--yellow);
  color: var(--charcoal);
  border-color: var(--yellow);
  font-weight: 600;
}
.t-node-meta {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-ghost);
  text-transform: uppercase;
  font-family: var(--mono);
  margin-left: auto;
}
.t-node--active .t-node-meta {
  color: var(--yellow);
}
.t-node-text {
  font-size: 12px;
  color: var(--text-mid);
  transition: color var(--transition);
}
.t-node--active .t-node-text {
  color: var(--text);
}

/* ================================================================
   Form inputs — bottom-border style with yellow focus
   ================================================================ */
[data-testid="stTextInput"] input,
[data-testid="stTextArea"] textarea,
[data-testid="stNumberInput"] input {
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid var(--border-ink) !important;
  border-radius: 0 !important;
  color: var(--text) !important;
  font-size: 12.5px !important;
  font-family: var(--font) !important;
  padding: 5px 0 !important;
  transition: border-color var(--transition), box-shadow var(--transition) !important;
}
[data-baseweb="select"] > div {
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid var(--border-ink) !important;
  border-radius: 0 !important;
  color: var(--text) !important;
  font-size: 12.5px !important;
  font-family: var(--font) !important;
  transition: border-color var(--transition) !important;
}
[data-testid="stTextInput"] input::placeholder,
[data-testid="stTextArea"] textarea::placeholder {
  color: var(--text-dim) !important;
}
[data-testid="stTextInput"] input:focus,
[data-testid="stTextArea"] textarea:focus,
[data-testid="stNumberInput"] input:focus {
  border-bottom-color: var(--yellow) !important;
  box-shadow: 0 1px 0 0 rgba(255, 177, 0, 0.25) !important;
  outline: none !important;
}
[data-testid="stTextArea"] textarea {
  caret-color: var(--yellow) !important;
}

label, [data-testid="stWidgetLabel"] {
  font-size: 9.5px !important;
  font-weight: 500 !important;
  letter-spacing: 0.10em !important;
  text-transform: uppercase !important;
  color: var(--text-dim) !important;
  font-family: var(--mono) !important;
}

/* ── Select dropdowns ── */
[data-baseweb="select"] [data-baseweb="select-option"] {
  font-size: 12px !important;
  background: var(--panel-solid) !important;
  color: var(--text) !important;
}
[data-baseweb="popover"] > div {
  background: var(--panel-solid) !important;
  border: 1px solid var(--border-ink) !important;
  border-radius: var(--radius-sm) !important;
}
[data-baseweb="select"] [data-baseweb="select-option"]:hover {
  background: var(--surface) !important;
}

/* ── Force sidebar content padding (except stepper row) ── */
.main [data-testid="stHorizontalBlock"]:first-of-type > [data-testid="stColumn"]:first-child > div:not([data-testid="stHorizontalBlock"]) {
  padding-left: 20px !important;
  padding-right: 20px !important;
  box-sizing: border-box !important;
}

/* For all widgets, labels, and blocks inside sidebar, except stepper row */
.main [data-testid="stHorizontalBlock"]:first-of-type > [data-testid="stColumn"]:first-child > div:not([data-testid="stHorizontalBlock"]) * {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Stepper row: no left/right padding */
.main [data-testid="stHorizontalBlock"]:first-of-type > [data-testid="stColumn"]:first-child [data-testid="stHorizontalBlock"] {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* ================================================================
   Buttons
   ================================================================ */
.stButton > button {
  background: var(--surface) !important;
  color: var(--text-mid) !important;
  border: 1px solid var(--border-ink) !important;
  border-radius: var(--radius) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  font-family: var(--font) !important;
  padding: 0.42rem 0.75rem !important;
  box-shadow: none !important;
  text-align: left !important;
  justify-content: flex-start !important;
  transition: all var(--transition) !important;
  cursor: pointer !important;
}
.stButton > button:hover {
  border-color: var(--border-hover) !important;
  background: var(--surface-hover) !important;
  color: var(--text) !important;
}

/* Push main content away from left edge */
.main .block-container {
  padding-left: 2.5rem !important;
}

/* Primary — Golden Yellow */
.stButton > button[kind="primary"] {
  background: var(--yellow) !important;
  color: var(--charcoal) !important;
  border-color: var(--yellow) !important;
  font-weight: 600 !important;
  text-align: center !important;
  justify-content: center !important;
}
.stButton > button[kind="primary"]:hover {
  background: #e8a200 !important;
  border-color: #e8a200 !important;
  color: var(--charcoal) !important;
}

.stButton > button:disabled {
  opacity: 0.3 !important;
  cursor: not-allowed !important;
}

/* Download buttons */
.stDownloadButton > button {
  background: var(--surface) !important;
  color: var(--text-mid) !important;
  border: 1px solid var(--border-ink) !important;
  border-radius: var(--radius) !important;
  font-size: 12px !important;
  font-family: var(--font) !important;
  transition: all var(--transition) !important;
}
.stDownloadButton > button:hover {
  border-color: var(--border-hover) !important;
  background: var(--surface-hover) !important;
}

/* Teal secondary button helper class */
.t-teal-btn > button {
  background: var(--teal-dim) !important;
  color: var(--teal) !important;
  border-color: var(--teal-border) !important;
  text-align: center !important;
  justify-content: center !important;
}
.t-teal-btn > button:hover {
  background: rgba(1, 180, 175, 0.14) !important;
  border-color: var(--teal) !important;
}

/* Danger soft helper class */
.t-danger-btn > button {
  background: var(--danger-bg) !important;
  color: var(--danger) !important;
  border-color: var(--danger-border) !important;
  text-align: center !important;
  justify-content: center !important;
}
.t-danger-btn > button:hover {
  border-color: var(--danger) !important;
}

/* ================================================================
   Expander
   ================================================================ */
div[data-testid="stExpander"] {
  border: 1px solid var(--border-ink) !important;
  border-radius: var(--radius) !important;
  background: transparent !important;
}

/* ================================================================
   AI log / streaming card
   ================================================================ */
.t-ai-log {
  margin: 4px 16px 6px;
  padding: 10px 12px;
  font-size: 10.5px;
  line-height: 1.8;
  color: var(--text-dim);
  font-family: var(--mono);
  background: rgba(27, 53, 79, 0.25);
  border: 1px solid var(--border-ink);
  border-left: 2px solid var(--ink-light);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
.t-ai-log .t-log-hi   { color: var(--text-mid); }
.t-ai-log .t-log-ok   { color: var(--teal); }
.t-ai-log .t-log-warn { color: var(--yellow); }
.t-ai-log .t-log-err  { color: var(--danger); }

/* ================================================================
   Result / success card
   ================================================================ */
.t-result-card {
  margin: 4px 16px 8px;
  padding: 12px 14px;
  background: rgba(255, 177, 0, 0.05);
  border: 1px solid var(--yellow-border);
  border-radius: var(--radius);
  font-size: 12px;
  color: var(--text);
  line-height: 1.7;
}
.t-result-card .t-result-label {
  font-size: 9.5px;
  font-family: var(--mono);
  color: var(--yellow);
  letter-spacing: 0.10em;
  text-transform: uppercase;
  margin-bottom: 5px;
  display: block;
}

/* Legacy success card alias */
.t-success {
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text);
  border: 1px solid var(--success-border);
  border-radius: var(--radius);
  margin: 0.5rem 16px;
  background: var(--success-bg);
}

/* Warning card */
.t-warn {
  font-size: 11px;
  color: var(--warning);
  padding: 0.2rem 20px;
}

/* ================================================================
   Spinner / loading
   ================================================================ */
.stSpinner > div {
  border-top-color: var(--yellow) !important;
}

/* ================================================================
   Streaming text animation
   ================================================================ */
@keyframes t-fade-in {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}
.t-stream {
  animation: t-fade-in 0.35s ease-out both;
}
.t-stream-line {
  display: block;
  animation: t-fade-in 0.28s ease-out both;
}
.t-stream-line:nth-child(2) { animation-delay: 0.07s; }
.t-stream-line:nth-child(3) { animation-delay: 0.14s; }
.t-stream-line:nth-child(4) { animation-delay: 0.21s; }
.t-stream-line:nth-child(5) { animation-delay: 0.28s; }
.t-stream-line:nth-child(6) { animation-delay: 0.35s; }

/* ================================================================
   Studio fade-in transition
   ================================================================ */
.t-studio-enter {
  animation: t-studio-fade 0.45s ease-in-out both;
}
@keyframes t-studio-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ================================================================
   Onboarding overlay
   ================================================================ */
.onboarding-hide .main [data-testid="stHorizontalBlock"]:first-of-type {
  display: none !important;
}

[data-testid="stCustomComponentV1"] iframe {
  min-height: 100vh;
}
"""