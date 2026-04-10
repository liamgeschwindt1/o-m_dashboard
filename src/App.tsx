import { useEffect, useState } from 'react'

import RouteMap from './components/RouteMap'
import Sidebar from './components/Sidebar'
import './App.css'
import type { Instruction } from './types/instruction'
import {
  buildFallbackRoute,
  createInstruction,
  fetchWalkingRoute,
  findInsertionPoint,
} from './utils/routeTools'

function App() {
  const [instructions, setInstructions] = useState<Instruction[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [routePath, setRoutePath] = useState(buildFallbackRoute([]))

  useEffect(() => {
    let ignore = false

    async function syncRoutePreview() {
      if (instructions.length < 2) {
        setRoutePath(buildFallbackRoute(instructions))
        return
      }

      try {
        const nextPath = await fetchWalkingRoute(instructions)
        if (!ignore) setRoutePath(nextPath)
      } catch {
        if (!ignore) setRoutePath(buildFallbackRoute(instructions))
      }
    }

    void syncRoutePreview()

    return () => {
      ignore = true
    }
  }, [instructions])

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
  }

  function handleReset() {
    setInstructions([])
    setActiveId(null)
  }

  return (
    <div className="app-shell">
      <Sidebar
        instructions={instructions}
        activeId={activeId}
        onSelect={setActiveId}
        onUpdate={updateInstruction}
        onAdd={handleRouteInsert}
        onDelete={(id) => {
          setInstructions((prev) => prev.filter((i) => i.id !== id))
          setActiveId((prev) => (prev === id ? null : prev))
        }}
        onExport={handleExport}
        onReset={handleReset}
      />
      <RouteMap
        instructions={instructions}
        routePath={routePath}
        activeId={activeId}
        onSelect={setActiveId}
        onMarkerDrag={handleMarkerDrag}
        onRouteInsert={handleRouteInsert}
      />
    </div>
  )
}

export default App
