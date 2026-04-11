# Touchpulse Instructor Studio — Copilot Instructions

## Project Overview

React + Vite web app. Instructors build and submit custom O&M walking routes for the Touchpulse Tiera community.

## Architecture

- **App.jsx** — Phase state machine: `welcome → onboarding → ascending → studio`
- **StudioSidebar** — Floating frosted panel, `zIndex: 1000`, over full-bleed Leaflet maps
- **Maps** — CartoDB DarkMatter tiles, `zoomControl={false}`, polyline colour `#FF7230`
- **Routing** — GraphHopper pedestrian API (`GH_KEY` in CalibrationStep.jsx)
- **Submit** — POST to `API_ENDPOINT` placeholder in SubmitSheet.jsx

## Key Conventions

- All styling is inline React style objects (no Tailwind classes in active components)
- Colours: Teal `#01B4AF`, Gold `#FFB100`, Orange `#FF7230`, Dark `#031119`, Text `#F7F7F7`
- Fonts: Inter (body), JetBrains Mono (coordinates)
- Framer Motion for all transitions; `AnimatePresence` wraps phase layers
- Map containers sit at `zIndex: 0`; sidebar at `zIndex: 1000`

## Handoff Notes

- Replace `API_ENDPOINT` in `src/SubmitSheet.jsx` with the production POST URL
- GraphHopper key (`GH_KEY`) in `src/CalibrationStep.jsx` should be moved to an env variable before production

