import { useEffect, useMemo, useState } from 'react'

import RouteMap from './components/RouteMap'
import Sidebar from './components/Sidebar'
import { initialInstructions } from './data/seedRoute'
import './App.css'
import type { Instruction } from './types/instruction'
import {
  buildFallbackRoute,
  createInstruction,
  fetchWalkingRoute,
  findInsertionPoint,
} from './utils/routeTools'

function App() {
  const [instructions, setInstructions] =
    useState<Instruction[]>(initialInstructions)
  const [activeId, setActiveId] = useState<string | null>(
    initialInstructions[0]?.id ?? null,
  )
  const [routePath, setRoutePath] = useState(buildFallbackRoute(initialInstructions))
  const [routeStatus, setRouteStatus] = useState(
    'Ready to snap the walking route with OSRM foot routing.',
  )

  useEffect(() => {
    let ignore = false

    async function syncRoutePreview() {
      if (instructions.length < 2) {
        setRoutePath(buildFallbackRoute(instructions))
        return
      }

      try {
        const nextPath = await fetchWalkingRoute(instructions)

        if (!ignore) {
          setRoutePath(nextPath)
          setRouteStatus(
            `OSRM walking preview synced across ${instructions.length} editable waypoints.`,
          )
        }
      } catch {
        if (!ignore) {
          setRoutePath(buildFallbackRoute(instructions))
          setRouteStatus(
            'Using the fallback line preview because the routing service is currently unavailable.',
          )
        }
      }
    }

    void syncRoutePreview()

    return () => {
      ignore = true
    }
  }, [instructions])

  const activeInstruction =
    instructions.find((instruction) => instruction.id === activeId) ??
    instructions[0]

  const activeJsonPreview = useMemo(
    () => JSON.stringify(activeInstruction, null, 2),
    [activeInstruction],
  )

  function updateInstruction(id: string, patch: Partial<Instruction>) {
    setInstructions((currentInstructions) =>
      currentInstructions.map((instruction) =>
        instruction.id === id ? { ...instruction, ...patch } : instruction,
      ),
    )
  }

  function handleMarkerDrag(id: string, lat: number, lng: number) {
    updateInstruction(id, { lat, lng })
    setActiveId(id)
    setRouteStatus('Waypoint moved. The JSON coordinates and route preview were updated.')
  }

  function handleRouteInsert(lat: number, lng: number) {
    setInstructions((currentInstructions) => {
      const match = findInsertionPoint(currentInstructions, lat, lng)
      const insertedInstruction = createInstruction(match.lat, match.lng, 'landmark')

      setActiveId(insertedInstruction.id)

      return [
        ...currentInstructions.slice(0, match.index),
        insertedInstruction,
        ...currentInstructions.slice(match.index),
      ]
    })

    setRouteStatus(
      'New landmark inserted at the nearest route segment and added to the JSON array.',
    )
  }

  function handleExport() {
    const exportPayload = instructions.map(({ id, lat, lng, text, type }) => ({
      id,
      lat,
      lng,
      text,
      type,
    }))

    const file = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'om-route.json'
    link.click()
    URL.revokeObjectURL(url)

    setRouteStatus('Exported a clean JSON file with id, lat, lng, text, and type.')
  }

  function handleReset() {
    setInstructions(initialInstructions)
    setActiveId(initialInstructions[0]?.id ?? null)
    setRouteStatus('Demo route reset to the starter O&M training path.')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Orientation &amp; Mobility route creator</p>
          <h1>Accessible route builder for trainers</h1>
          <p className="app-summary">
            Drag instruction dots, click the route line to inject a new landmark,
            and keep the sidebar synced to the same JSON source of truth.
          </p>
        </div>

        <ul className="tip-list">
          <li>Source of truth: <code>Instruction[]</code></li>
          <li>Polyline click inserts a new instruction at the nearest segment</li>
          <li>OSRM foot routing keeps the path aligned to walkable streets</li>
        </ul>
      </header>

      <main className="workspace">
        <section className="map-panel" aria-label="Route map workspace">
          <div className="panel-heading">
            <h2>Map workspace</h2>
            <p className="map-help">
              Click the blue line to add a point. Drag any numbered dot to refine
              a landmark, turn cue, or hazard location.
            </p>
          </div>

          <div className="map-frame">
            <RouteMap
              instructions={instructions}
              routePath={routePath}
              activeId={activeId}
              onSelect={setActiveId}
              onMarkerDrag={handleMarkerDrag}
              onRouteInsert={handleRouteInsert}
            />
          </div>
        </section>

        <Sidebar
          instructions={instructions}
          activeId={activeId}
          routeStatus={routeStatus}
          onSelect={setActiveId}
          onUpdate={updateInstruction}
          onExport={handleExport}
          onReset={handleReset}
        />
      </main>

      <section className="json-preview-panel" aria-label="Active JSON preview">
        <div>
          <p className="eyebrow">Active point JSON</p>
          <h2>{activeInstruction?.text ?? 'No active instruction selected'}</h2>
        </div>
        <pre>{activeJsonPreview}</pre>
      </section>
    </div>
  )
}

export default App
