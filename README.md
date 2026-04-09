# O&M Route Builder

A React + Leaflet prototype for Orientation & Mobility trainers to create accessible walking routes.

## Current MVP

- Drag numbered instruction dots to update the route and JSON coordinates
- Click the route line to splice in a new editable landmark
- Keep the map and sidebar synced through a shared `Instruction[]` state model
- Export clean JSON objects with `id`, `lat`, `lng`, `text`, and `type`
- Use OSRM foot routing when available, with a straight-line fallback preview

## Local development

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Production check

```bash
npm run build
```

## Suggested next enhancements

1. Add geocoded start/destination search
2. Integrate full draggable route handles with `leaflet-routing-machine`
3. Add saved route sessions and import support
4. Expand accessibility testing for keyboard and screen reader flows

