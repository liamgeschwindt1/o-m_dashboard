TIERA_STYLES = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');

:root {
  --bg:        #FFFFFF;
  --sidebar:   #FAFAFA;
  --border:    #EDEDED;
  --text:      #111111;
  --muted:     #888888;
  --accent:    #000000;
  --danger:    #CC0000;
  --radius:    6px;
}

/* ── Global reset ── */
html, body,
[data-testid="stApp"],
[data-testid="stAppViewContainer"],
[data-testid="stAppViewContainer"] > .main,
[data-testid="stMain"],
.main {
  background: var(--bg) !important;
  color: var(--text) !important;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
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

/* Block-container: zero but no overflow clip */
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

/* ── Sidebar column (scroll container) ── */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child {
  flex: 0 0 300px !important;
  max-width: 300px !important;
  min-width: 300px !important;
  width: 300px !important;
  height: 100vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  border-right: 1px solid var(--border) !important;
  background: var(--sidebar) !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* All wrapper divs inside sidebar: break flex-grow chain
   so content overflows and the column scrollbar appears. */
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

/* Sidebar vertical-block spacing */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child
  [data-testid="stVerticalBlock"] {
  gap: 0.2rem !important;
  padding: 0 !important;
  padding-bottom: 2rem !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
  flex: 0 0 auto !important;
}

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

/* ── Map column ── */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:last-child {
  flex: 1 1 auto !important;
  height: 100% !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* ── Force all wrappers inside map column to fill height ── */
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

/* ── Map iframe fills right column ── */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:last-child iframe {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  border: none !important;
}

/* ── Brand ── */
.t-brand {
  padding: 1.2rem 1rem 0.9rem;
  border-bottom: 1px solid var(--border);
}
.t-brand-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; font-weight: 600;
  letter-spacing: 0.22em; color: var(--text);
}
.t-brand-sub {
  font-size: 10px; color: var(--muted);
  margin-top: 2px; letter-spacing: 0.04em;
}

.t-divider { height: 1px; background: var(--border); margin: 0 0 0.5rem; }

/* ── Section typography ── */
.t-section {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text); padding: 0 1rem 0.5rem;
}
.t-field-label {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--muted); padding: 0.15rem 1rem 0.2rem;
}
.t-hint {
  font-size: 11px; color: var(--muted);
  padding: 0.2rem 1rem; line-height: 1.5;
}
.t-gap { height: 0.5rem; }
.t-coord {
  font-size: 11px; color: #338833;
  padding: 0.15rem 0; line-height: 1.4;
  font-family: 'JetBrains Mono', monospace;
}
.t-status {
  font-size: 11px; color: var(--muted);
  padding: 0.2rem 1rem 0.3rem; line-height: 1.5;
}
.t-via {
  font-size: 11px; font-family: 'JetBrains Mono', monospace;
  color: var(--text); padding: 0.15rem 1rem;
}
.t-warn { font-size: 11px; color: var(--danger); padding: 0.2rem 1rem; }
.t-success {
  padding: 1.5rem 1rem; font-size: 13px;
  line-height: 1.7; color: var(--text);
  border: 1px solid var(--border); border-radius: var(--radius);
  margin: 0.8rem 1rem; background: #F8F8F8;
}

/* ── Instruction nodes ── */
.t-node {
  display: flex; align-items: center; gap: 8px;
  padding: 0.4rem 1rem; cursor: pointer;
  border-left: 2px solid transparent;
}
.t-node--active { border-left-color: var(--text); background: #F5F5F5; }
.t-node-num {
  width: 20px; height: 20px; border-radius: 50%;
  border: 1.5px solid var(--text);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600; flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
}
.t-node--active .t-node-num { background: var(--text); color: var(--bg); }
.t-node-meta {
  font-size: 10px; letter-spacing: 0.1em;
  color: var(--muted); text-transform: uppercase;
}
.t-node-text {
  font-size: 11px; color: var(--muted);
  padding: 0.15rem 1rem 0.3rem 2.7rem; line-height: 1.5;
}

/* ── Widget overrides ── */
[data-testid="stTextInput"] input,
[data-testid="stTextArea"] textarea,
[data-testid="stNumberInput"] input,
[data-baseweb="select"] > div {
  background: var(--bg) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  color: var(--text) !important;
  font-size: 12px !important;
}
[data-testid="stTextInput"] input:focus,
[data-testid="stTextArea"] textarea:focus {
  border-color: var(--text) !important;
  box-shadow: none !important;
}
[data-testid="stTextArea"] textarea {
  caret-color: var(--text) !important;
}
label, [data-testid="stWidgetLabel"] {
  font-size: 11px !important; color: var(--muted) !important;
}

/* ── Buttons ── */
.stButton > button {
  background: var(--bg) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  font-size: 12px !important; font-weight: 500 !important;
  padding: 0.3rem 0.5rem !important;
  box-shadow: none !important;
  text-align: left !important;
  justify-content: flex-start !important;
}
.stButton > button:hover { border-color: #999 !important; }
.stButton > button[kind="primary"] {
  background: var(--text) !important;
  color: var(--bg) !important;
  border-color: var(--text) !important;
  text-align: center !important;
  justify-content: center !important;
}
.stButton > button[kind="primary"]:hover { background: #333 !important; }
.stButton > button:disabled { opacity: 0.35 !important; }
.stDownloadButton > button {
  background: var(--bg) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  font-size: 12px !important;
}

[data-baseweb="select"] [data-baseweb="select-option"] { font-size: 12px !important; }
div[data-testid="stExpander"] {
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
}

/* ── Sidebar widget inset ── */
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child [data-testid="stTextInput"],
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child [data-testid="stTextArea"],
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child [data-testid="stButton"],
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child [data-testid="stDownloadButton"],
.main [data-testid="stHorizontalBlock"]:first-of-type
  > [data-testid="stColumn"]:first-child [data-baseweb="select"] {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}
"""
