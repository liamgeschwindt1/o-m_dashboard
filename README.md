# Tiera O&M Training Studio

A trainer-first O&M dashboard with a tactical HUD, Google Maps route editing, sidebar instruction sync, and JSON export.

## Streamlit cockpit

### Features

- Fixed `100vh` dashboard layout with a scrolling instruction rail
- Google Maps walking directions rendered with `DirectionsRenderer({ draggable: true })`
- Clickable tactical step dots that sync back to the active sidebar instruction
- Manual instruction injection by clicking the route corridor
- Structured export payload:

```json
{
  "route_id": "tiera-demo-001",
  "metadata": { "trainer": "", "client": "" },
  "waypoints": [
    { "lat": 0, "lng": 0, "instruction": "...", "type": "cue" }
  ]
}
```

### Run locally

1. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Add your Google Maps key:

   ```bash
   cp .streamlit/secrets.toml.example .streamlit/secrets.toml
   ```

3. Start the dashboard:

   ```bash
   streamlit run app.py
   ```

## Legacy React prototype

The original Vite route-builder prototype is still available:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Build check

```bash
npm run build
```

