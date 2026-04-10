import { useCallback } from 'react'

import RouteMap from './components/RouteMap'
import Stepper from './components/Stepper'
import StepIdentity from './components/StepIdentity'
import StepDestination from './components/StepDestination'
import StepCalibration from './components/StepCalibration'
import StepRefinement from './components/StepRefinement'
import StepUplink from './components/StepUplink'
import { useAppState } from './hooks/useAppState'
import { fetchRoute } from './api/client'
import type { PinMode, Step } from './types/instruction'

const MODES = ['idle', 'plan', 'calibrate', 'refine', 'review'] as const

function App() {
  const { state, set, dispatch, reroute } = useAppState()
  const mode = MODES[state.step]

  /* ── Map click (step 1 — pin mode) ── */
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      const rlat = Math.round(lat * 1e6) / 1e6
      const rlng = Math.round(lng * 1e6) / 1e6
      const label = `${rlat}, ${rlng}`

      if (state.pinMode === 'start') {
        set({ startCoords: [rlat, rlng], startLabel: label, pinMode: null, status: 'Start pinned.' })
      } else if (state.pinMode === 'end') {
        set({ endCoords: [rlat, rlng], endLabel: label, pinMode: null, status: 'End pinned.' })
      } else if (!state.startCoords) {
        set({ startCoords: [rlat, rlng], startLabel: label, status: 'Start pinned — now set the end.' })
      } else if (!state.endCoords) {
        set({ endCoords: [rlat, rlng], endLabel: label, status: 'End pinned — press Generate Route.' })
      }
    },
    [state.pinMode, state.startCoords, state.endCoords, set],
  )

  /* ── Pin drag (step 2) ── */
  const handlePinDrag = useCallback(
    (_role: 'start' | 'end', lat: number, lng: number) => {
      const rlat = Math.round(lat * 1e6) / 1e6
      const rlng = Math.round(lng * 1e6) / 1e6
      if (_role === 'start') {
        set({ startCoords: [rlat, rlng] })
      } else {
        set({ endCoords: [rlat, rlng] })
      }
    },
    [set],
  )

  /* ── Via add + drag ── */
  const handleViaAdd = useCallback(
    (lat: number, lng: number) => {
      const id = `via-${crypto.randomUUID?.() ?? Date.now()}`
      set({
        viaPoints: [
          ...state.viaPoints,
          { id, lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 },
        ],
      })
    },
    [state.viaPoints, set],
  )

  const handleViaDrag = useCallback(
    (id: string, lat: number, lng: number) => {
      set({
        viaPoints: state.viaPoints.map((v) =>
          v.id === id
            ? { ...v, lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 }
            : v,
        ),
      })
    },
    [state.viaPoints, set],
  )

  /* ── Route drag (step 2 — drag polyline to reshape) ── */
  const handleRouteDrag = useCallback(
    async (lat: number, lng: number) => {
      const id = `via-${crypto.randomUUID?.() ?? Date.now()}`
      const newVia = { id, lat, lng }
      // Insert the via point, then reroute with the updated list.
      // We need to compute new viaPoints inline since set is async via reducer.
      const updatedVia = [...state.viaPoints, newVia]
      set({ viaPoints: updatedVia, status: 'Rerouting…' })
      // Trigger reroute with the new via points
      if (!state.startCoords || !state.endCoords) return
      const wps: [number, number][] = [
        state.startCoords,
        ...updatedVia.map((v): [number, number] => [v.lat, v.lng]),
        state.endCoords,
      ]
      set({ loading: true })
      try {
        const { path, nodes } = await fetchRoute(wps)
        set({
          viaPoints: updatedVia,
          routePath: path,
          nodes,
          loading: false,
          status: `Route updated — ${nodes.length} steps.`,
        })
      } catch (err) {
        set({
          loading: false,
          status: `Routing error: ${err instanceof Error ? err.message : err}`,
        })
      }
    },
    [state.viaPoints, state.startCoords, state.endCoords, set],
  )

  /* ── Route click (step 3 — insert node) ── */
  const handleRouteClick = useCallback(
    (lat: number, lng: number, nearestIdx: number) => {
      const id = `node-${crypto.randomUUID?.() ?? Date.now()}`
      dispatch({
        type: 'INSERT_NODE',
        index: nearestIdx,
        node: {
          id,
          index: nearestIdx,
          lat: Math.round(lat * 1e6) / 1e6,
          lng: Math.round(lng * 1e6) / 1e6,
          instruction: 'Add instruction here.',
          type: 'step',
          distance_m: 0,
          duration_s: 0,
        },
      })
      set({ activeNodeId: id, status: 'New node added.' })
    },
    [dispatch, set],
  )

  /* ── Step panel ── */
  function renderStep() {
    switch (state.step) {
      case 0:
        return (
          <StepIdentity
            metadata={state.metadata}
            onChange={(patch) => dispatch({ type: 'SET_METADATA', payload: patch })}
            onNext={() => set({ step: 1 })}
          />
        )
      case 1:
        return (
          <StepDestination
            startCoords={state.startCoords}
            endCoords={state.endCoords}
            startLabel={state.startLabel}
            endLabel={state.endLabel}
            pinMode={state.pinMode}
            status={state.status}
            hasRoutingKey={state.hasRoutingKey}
            onSetCoords={(role, lat, lng, label) => {
              if (role === 'start') {
                set({ startCoords: [lat, lng], startLabel: label, startCands: [] })
              } else {
                set({ endCoords: [lat, lng], endLabel: label, endCands: [] })
              }
            }}
            onClearCoords={(role) => {
              if (role === 'start') {
                set({ startCoords: null, startLabel: '', startCands: [] })
              } else {
                set({ endCoords: null, endLabel: '', endCands: [] })
              }
            }}
            onSetPinMode={(m: PinMode) => {
              set({
                pinMode: m,
                status: m ? `Click the map to set ${m}.` : '',
              })
            }}
            onGenerate={async () => {
              await reroute()
              set({ step: 2 })
            }}
            onBack={() => set({ step: 0 })}
          />
        )
      case 2:
        return (
          <StepCalibration
            viaPoints={state.viaPoints}
            routePath={state.routePath}
            status={state.status}
            onDeleteVia={(id) => {
              set({ viaPoints: state.viaPoints.filter((v) => v.id !== id) })
            }}
            onNext={() => {
              if (state.nodes.length > 0 && !state.activeNodeId) {
                set({ activeNodeId: state.nodes[0].id })
              }
              set({ step: 3 })
            }}
            onBack={() => set({ step: 1 })}
          />
        )
      case 3:
        return (
          <StepRefinement
            nodes={state.nodes}
            activeNodeId={state.activeNodeId}
            status={state.status}
            onSelectNode={(id) => set({ activeNodeId: id })}
            onDeselectNode={() => set({ activeNodeId: null })}
            onUpdateNode={(id, patch) => dispatch({ type: 'UPDATE_NODE', id, patch })}
            onDeleteNode={(id) => dispatch({ type: 'DELETE_NODE', id })}
            onNext={() => set({ step: 4 })}
            onBack={() => set({ step: 2 })}
          />
        )
      case 4:
        return (
          <StepUplink
            nodes={state.nodes}
            metadata={state.metadata}
            submitted={state.submitted}
            onSubmit={() => set({ submitted: true })}
            onBack={() => set({ step: 3 })}
          />
        )
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="flex flex-col w-[300px] shrink-0 border-r border-neutral-200 bg-[#FAFAFA] overflow-y-auto overflow-x-hidden">
        {/* Brand */}
        <div className="px-4 pt-5 pb-3 border-b border-neutral-200">
          <div className="font-mono text-[13px] font-semibold tracking-[0.22em] text-neutral-900">
            TIERA
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5 tracking-wide">
            powered by Touchpulse
          </div>
        </div>

        <Stepper current={state.step} onChange={(s: Step) => set({ step: s })} />

        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        {state.loading && (
          <div className="px-4 py-2 text-[11px] text-neutral-500 border-t border-neutral-200">
            Loading…
          </div>
        )}
      </aside>

      {/* Map */}
      <main className="flex-1 h-full">
        <RouteMap
          mode={mode}
          nodes={state.nodes}
          routePath={state.routePath}
          startCoords={state.startCoords}
          endCoords={state.endCoords}
          viaPoints={state.viaPoints}
          activeNodeId={state.activeNodeId}
          maptilerKey={state.maptilerKey}
          pinMode={state.pinMode}
          onMapClick={handleMapClick}
          onNodeClick={(id) => set({ activeNodeId: id })}
          onUpdateNode={(id, patch) => dispatch({ type: 'UPDATE_NODE', id, patch })}
          onDeselectNode={() => set({ activeNodeId: null })}
          onPinDrag={handlePinDrag}
          onViaDrag={handleViaDrag}
          onViaAdd={handleViaAdd}
          onRouteDrag={handleRouteDrag}
          onRouteClick={handleRouteClick}
        />
      </main>
    </div>
  )
}

export default App
