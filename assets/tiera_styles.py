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
        radial-gradient(circle at 1px 1px, rgba(255, 177, 0, 0.14) 1px, transparent 0),
        radial-gradient(circle at top right, rgba(159, 195, 255, 0.12), transparent 28%),
        linear-gradient(180deg, rgba(2, 6, 10, 0.98), rgba(2, 6, 10, 1));
    background-size: 40px 40px, auto, auto;
}

header[data-testid="stHeader"],
#MainMenu,
footer {
    visibility: hidden;
    height: 0;
}

[data-testid="stToolbar"] {
    right: 0.6rem;
}

.main .block-container {
    max-width: 100%;
    height: 100vh;
    overflow: hidden;
    padding: 1rem 1.1rem 1rem 1.1rem;
}

h1,
h2,
h3,
[data-testid="stMarkdownContainer"] h1,
[data-testid="stMarkdownContainer"] h2,
[data-testid="stMarkdownContainer"] h3 {
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.02em;
}

p,
span,
label,
li,
button,
input,
textarea,
select,
code {
    font-family: 'Inter', sans-serif;
}

code,
pre,
.stCodeBlock {
    font-family: 'JetBrains Mono', monospace !important;
}

.tiera-banner,
.hud-card,
.map-card,
.json-card {
    background: linear-gradient(180deg, rgba(6, 14, 20, 0.96), rgba(3, 9, 13, 0.94));
    border: 1px solid var(--tiera-border);
    border-radius: 18px;
    padding: 0.9rem 1rem;
    box-shadow: 0 0 0 1px rgba(255, 177, 0, 0.06), 0 18px 48px rgba(0, 0, 0, 0.32);
}

.tiera-banner {
    margin-bottom: 0.8rem;
    padding: 1rem 1.15rem;
}

.tiera-banner__eyebrow,
.panel-label,
.waypoint-label {
    color: var(--tiera-accent);
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.tiera-banner h1 {
    margin: 0.28rem 0 0.45rem;
    font-size: 1.45rem;
    color: #FFF4D2;
}

.tiera-banner p {
    margin: 0;
    color: var(--tiera-muted);
}

.hud-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.55rem;
    margin-top: 0.8rem;
}

.hud-chip {
    background: rgba(255, 177, 0, 0.08);
    border: 1px solid rgba(255, 177, 0, 0.16);
    border-radius: 12px;
    padding: 0.55rem 0.7rem;
}

.hud-chip strong {
    color: #FFF4D2;
    display: block;
    font-size: 0.82rem;
}

.hud-chip span {
    color: var(--tiera-muted);
    font-size: 0.76rem;
}

[data-testid="stTextInput"] input,
[data-testid="stTextArea"] textarea,
[data-testid="stNumberInput"] input,
[data-baseweb="select"] > div {
    background: rgba(4, 10, 15, 0.92) !important;
    color: var(--tiera-text) !important;
    border: 1px solid rgba(255, 177, 0, 0.18) !important;
    border-radius: 12px !important;
}

[data-testid="stTextInput"] input:focus,
[data-testid="stTextArea"] textarea:focus,
[data-testid="stNumberInput"] input:focus,
[data-baseweb="select"] > div:focus-within {
    border-color: rgba(255, 177, 0, 0.72) !important;
    box-shadow: 0 0 0 1px rgba(255, 177, 0, 0.28), 0 0 18px rgba(255, 177, 0, 0.12) !important;
}

label,
[data-testid="stWidgetLabel"] {
    color: #DCE8F8 !important;
}

.stButton > button,
.stDownloadButton > button {
    background: linear-gradient(180deg, #FFB100, #F5A200);
    color: #02060A;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 6px 18px rgba(255, 177, 0, 0.2);
}

.stButton > button:hover,
.stDownloadButton > button:hover {
    box-shadow: 0 0 0 1px rgba(255, 177, 0, 0.36), 0 0 20px rgba(255, 177, 0, 0.18);
    transform: translateY(-1px);
}

.stButton > button[kind="secondary"] {
    background: rgba(255, 177, 0, 0.08);
    color: var(--tiera-text);
    border: 1px solid rgba(255, 177, 0, 0.24);
}

[data-testid="stVerticalBlockBorderWrapper"] {
    border-radius: 16px;
    border-color: rgba(255, 177, 0, 0.18) !important;
    background: rgba(6, 14, 20, 0.9);
}

.waypoint-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
    padding: 0.35rem 0.55rem;
    border-radius: 10px;
    background: rgba(255, 177, 0, 0.06);
    border: 1px solid rgba(255, 177, 0, 0.12);
}

.waypoint-title.active {
    background: rgba(255, 177, 0, 0.16);
    box-shadow: inset 0 0 0 1px rgba(255, 177, 0, 0.26);
}

.waypoint-title strong {
    color: #FFF4D2;
    font-family: 'JetBrains Mono', monospace;
}

.waypoint-meta {
    color: var(--tiera-muted);
    font-size: 0.77rem;
}

.status-banner {
    margin: 0.4rem 0 0.8rem;
    padding: 0.7rem 0.85rem;
    border-radius: 14px;
    background: rgba(159, 195, 255, 0.08);
    border: 1px solid rgba(159, 195, 255, 0.18);
    color: #D8E7FF;
}

.status-banner strong {
    color: var(--tiera-accent);
}

.map-card iframe {
    border-radius: 16px;
}

.json-card pre,
.json-card code {
    white-space: pre-wrap;
    word-break: break-word;
}

div[data-testid="stCodeBlock"] {
    border-radius: 14px;
    border: 1px solid rgba(255, 177, 0, 0.16);
}

div[data-testid="stExpander"] {
    border: 1px solid rgba(255, 177, 0, 0.16);
    border-radius: 14px;
    background: rgba(6, 14, 20, 0.86);
}

div[data-testid="stAlert"] {
    border-radius: 14px;
}

.element-container:has(input[aria-label="tiera-bridge"]) {
    display: none;
}
"""
