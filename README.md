# Touchpulse Instructor Studio

A web app for O&M instructors to build, calibrate, and submit custom Tiera walking routes for the Touchpulse community.

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + Vite 8 |
| Animations | Framer Motion 12 |
| Maps | React Leaflet 5 + CartoDB DarkMatter tiles |
| Routing API | GraphHopper (pedestrian) |
| Styling | Inline styles + Inter / JetBrains Mono fonts |
| Deployment | Railway (Docker) |

## User Flow

1. **Welcome** — Branded landing screen
2. **Info** — 4-question typewriter onboarding (route name, org code, creator name, email)
3. **Build Route** — Click map to place A/B endpoints
4. **Add Stops** — GraphHopper auto-routes; drag markers or add via-points
5. **Edit Instructions** — Click polyline nodes to edit turn instructions
6. **Submit** — Route summary sheet flies off screen → processing spinner → confirmation

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle → dist/
npm run preview    # serve dist/ locally
```

## Environment / Configuration

### API Keys

| Key | Location | Description |
|---|---|---|
| GraphHopper API | `src/CalibrationStep.jsx` → `GH_KEY` | Pedestrian routing |
| Submit endpoint | `src/SubmitSheet.jsx` → `API_ENDPOINT` | **Placeholder — CTO to fill in** |

> **Note for CTO:** Replace `https://YOUR_API_ENDPOINT_HERE/routes` in `src/SubmitSheet.jsx` with the actual POST endpoint. The full route payload (waypoints, path, instructions, creator info) is already serialised and sent on submit.

## Project Structure

```
src/
  App.jsx                  # Root: phase state machine (welcome → onboarding → studio → submit)
  WelcomeScreen.jsx        # Branded landing with aurora gradient
  OnboardingTypewriter.jsx # 4-step typewriter Q&A
  StudioSidebar.jsx        # Floating frosted-glass control panel with step timeline
  PlanningStep.jsx         # Step 1 — place A/B map pins
  CalibrationStep.jsx      # Step 2 — GraphHopper route + via-points
  RefinementStep.jsx       # Step 3 — click-to-edit turn instruction nodes
  SubmitSheet.jsx          # Step 4 — summary sheet + POST submit + confirmation
assets/
  logo.png                 # Touchpulse wordmark
public/
  ...                      # Static assets served at /
```

## Deployment

The project includes a `Dockerfile`. Railway auto-builds on push to `main`.

```bash
# Build image locally
docker build -t touchpulse-studio .
docker run -p 5173:5173 touchpulse-studio
```


