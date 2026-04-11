# O&M Studio

A route-builder dashboard for O&M training. Built with Streamlit and Leaflet.

## Features

- **5-step wizard**: Identity → Destination → Calibration → Refinement → Uplink
- Interactive Leaflet map with click-to-place start/end points
- ORS-powered walking route generation
- Draggable A/B pins and via-point calibration
- Click-to-edit instruction nodes with hover tooltips
- JSON export of completed routes

## Setup

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Configure API keys:

   ```bash
   cp .streamlit/secrets.toml.example .streamlit/secrets.toml
   # Add your ORS_API_KEY and MAPTILER_API_KEY
   ```

3. Run:

   ```bash
   streamlit run app.py
   ```

## Project Structure

```
app.py                              # Main Streamlit application
assets/
  tiera_styles.py                   # CSS theme
  touchpulse-logo.png               # Brand logo
components/
  leaflet_component/
    __init__.py                     # Streamlit custom component wrapper
    index.html                      # Leaflet map with full interactivity
requirements.txt                    # Python dependencies
.streamlit/
  secrets.toml                      # API keys (not committed)
  secrets.toml.example              # Template for secrets
```

