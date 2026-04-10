TIERA_STYLES = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

:root {
    --tiera-bg: #02060A;
    --tiera-card: #060E14;
    --tiera-panel: rgba(6, 14, 20, 0.92);
    --tiera-accent: #FFB100;
    --tiera-accent-soft: rgba(255, 177, 0, 0.14);
    --tiera-ink: #9FC3FF;
    --tiera-text: #EAF2FF;
    --tiera-muted: #8EA2B8;
    --tiera-danger: #FF6A6A;
    --tiera-border: rgba(255, 177, 0, 0.22);
}

html,
body,
[data-testid="stAppViewContainer"],
[data-testid="stApp"] {
    background: var(--tiera-bg);
    color: var(--tiera-text);
    font-family: 'Inter', sans-serif;
}

[data-testid="stAppViewContainer"] {
    background-image:
        radial-gradient(circle at 1px 1px, rgba(255, 177, 0, 0.12) 1px, transparent 0),
        radial-gradient(circle at top right, rgba(159, 195, 255, 0.10), transparent 28%),
        linear-gradient(180deg, rgba(2, 6, 10, 0.98), rgba(2, 6, 10, 1));
    background-size: 40px 40px, auto, auto;
}

header[data-testid="stHeader"],
#MainMenu,
footer {
    visibility: hidden;
    height: 0;
}

[data-testid="stToolbar"] { right: 0.6rem; }

.main .block-container {
    max-width: 100%;
    height: 100vh;
    overflow: hidden;
    padding: 0.8rem 1.1rem;
}

h1, h2, h3,
[data-testid="stMarkdownContainer"] h1,
[data-testid="stMarkdownContainer"] h2,
[data-testid="stMarkdownContainer"] h3 {
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.02em;
}

code, pre, .stCodeBlock { font-family: 'JetBrains Mono', monospace !important; }

/* ── Banner ── */
.tiera-banner {
    background: linear-gradient(180deg, rgba(6,14,20,0.97), rgba(3,9,13,0.95));
    border: 1px solid var(--tiera-border);
    border-radius: 18px;
    padding: 0.85rem 1.1rem;
    margin-bottom: 0.75rem;
    box-shadow: 0 0 0 1px rgba(255,177,0,0.06), 0 14px 40px rgba(0,0,0,0.3);
}

.tiera-banner__top {
    display: flex;
    align-items: center;
    margin-bottom: 0.15rem;
}

.tiera-banner__brand {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    color: var(--tiera-accent);
    padding: 0.12rem 0.45rem;
    border: 1px solid rgba(255,177,0,0.35);
    border-radius: 6px;
    background: rgba(255,177,0,0.06);
}

.tiera-banner__head h1 {
    margin: 0.2rem 0 0.1rem;
    font-size: 1.35rem;
    color: #FFFFFF;
}

.tiera-banner__sub {
    color: #6a7e96;
    font-size: 0.76rem;
}

.panel-label {
    color: var(--tiera-accent);
    font-size: 0.71rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin: 0.55rem 0 0.25rem;
}

/* ── HUD chips ── */
.hud-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    margin-top: 0.7rem;
}

.hud-chip {
    background: rgba(255,177,0,0.07);
    border: 1px solid rgba(255,177,0,0.15);
    border-radius: 12px;
    padding: 0.5rem 0.65rem;
}

.hud-chip strong {
    color: #FFF4D2;
    display: block;
    font-size: 0.82rem;
    font-family: 'JetBrains Mono', monospace;
}

.hud-chip span {
    color: var(--tiera-muted);
    font-size: 0.74rem;
}

/* ── Form inputs ── */
[data-testid="stTextInput"] input,
[data-testid="stTextArea"] textarea,
[data-testid="stNumberInput"] input,
[data-baseweb="select"] > div {
    background: rgba(4,10,15,0.92) !important;
    color: var(--tiera-text) !important;
    border: 1px solid rgba(255,177,0,0.18) !important;
    border-radius: 12px !important;
}

[data-testid="stTextInput"] input:focus,
[data-testid="stTextArea"] textarea:focus,
[data-baseweb="select"] > div:focus-within {
    border-color: rgba(255,177,0,0.72) !important;
    box-shadow: 0 0 0 1px rgba(255,177,0,0.28), 0 0 18px rgba(255,177,0,0.1) !important;
}

label, [data-testid="stWidgetLabel"] { color: #DCE8F8 !important; }

/* ── Buttons ── */
.stButton > button, .stDownloadButton > button {
    background: linear-gradient(180deg,#FFB100,#F5A200);
    color: #02060A;
    border: none; border-radius: 12px; font-weight: 700;
    box-shadow: 0 6px 18px rgba(255,177,0,0.18);
    transition: transform 0.12s, box-shadow 0.12s;
}

.stButton > button:hover, .stDownloadButton > button:hover {
    box-shadow: 0 0 0 1px rgba(255,177,0,0.4), 0 0 22px rgba(255,177,0,0.2);
    transform: translateY(-1px);
}

.stButton > button[kind="secondary"] {
    background: rgba(255,177,0,0.08);
    color: var(--tiera-text);
    border: 1px solid rgba(255,177,0,0.24);
}

/* ── Containers & expanders ── */
[data-testid="stVerticalBlockBorderWrapper"] {
    border-radius: 16px !important;
    border-color: rgba(255,177,0,0.18) !important;
    background: rgba(6,14,20,0.9) !important;
}

div[data-testid="stExpander"] {
    border: 1px solid rgba(255,177,0,0.16);
    border-radius: 14px;
    background: rgba(6,14,20,0.86);
}

div[data-testid="stAlert"] { border-radius: 14px; }

/* ── Status banner ── */
.status-banner {
    margin: 0.35rem 0 0.6rem;
    padding: 0.6rem 0.8rem;
    border-radius: 12px;
    background: rgba(159,195,255,0.07);
    border: 1px solid rgba(159,195,255,0.16);
    color: #C8D8F0;
    font-size: 0.82rem;
    line-height: 1.5;
}

/* ── Instruction log ── */
.log-empty {
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--tiera-muted);
    font-size: 0.84rem;
    border: 1px dashed rgba(255,177,0,0.14);
    border-radius: 14px;
    background: rgba(6,14,20,0.6);
}

.log-step {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.6rem 0.75rem;
    border-radius: 12px;
    background: rgba(6,14,20,0.7);
    border: 1px solid rgba(255,177,0,0.10);
    margin-bottom: 0.35rem;
    transition: border-color 0.2s, background 0.2s;
}

.log-step.active {
    background: rgba(255,177,0,0.10);
    border-color: rgba(255,177,0,0.45);
    box-shadow: 0 0 0 1px rgba(255,177,0,0.12), inset 0 0 12px rgba(255,177,0,0.04);
}

.log-step__num {
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 50%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; font-weight: 700;
    background: rgba(255,177,0,0.12);
    border: 1.5px solid rgba(255,177,0,0.32);
    color: var(--tiera-accent);
}

.log-step.active .log-step__num {
    background: var(--tiera-accent);
    border-color: var(--tiera-accent);
    color: #02060A;
}

.log-step__body { flex: 1; min-width: 0; }

.log-step__type {
    font-size: 0.69rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--tiera-accent); margin-bottom: 0.2rem;
}

.log-step.active .log-step__type { color: #FFF4D2; }

.log-step__text {
    font-size: 0.82rem; line-height: 1.45;
    color: #C0D0E8;
}

.log-step__dist {
    margin-top: 0.2rem;
    font-size: 0.72rem;
    color: var(--tiera-muted);
    font-family: 'JetBrains Mono', monospace;
}

/* ── Code block ── */
div[data-testid="stCodeBlock"] {
    border-radius: 14px;
    border: 1px solid rgba(255,177,0,0.16);
}

/* ── Hide bridge widget ── */
.element-container:has(input[aria-label="tiera-bridge"]) {
    display: none;
}
"""
