import { useCallback, useEffect, useReducer } from 'react'
import { fetchRoute, getConfig } from '../api/client'
import type {
  GeoCandidate,
  Metadata,
  PinMode,
  RouteNode,
  RoutePoint,
  Step,
} from '../types/instruction'

interface ViaPoint {
  id: string
  lat: number
  lng: number
}

export interface AppState {
  step: Step
  metadata: Metadata
  startAddress: string
  endAddress: string
  startCoords: [number, number] | null
  endCoords: [number, number] | null
  startLabel: string
  endLabel: string
  startCands: GeoCandidate[]
  endCands: GeoCandidate[]
  viaPoints: ViaPoint[]
  routePath: RoutePoint[]
  nodes: RouteNode[]
  activeNodeId: string | null
  pinMode: PinMode
  status: string
  loading: boolean
  maptilerKey: string
  hasOrsKey: boolean
  email: string
  submitted: boolean
}

const INIT: AppState = {
  step: 0,
  metadata: { route_name: '', org_code: '', owner: '', contact: '' },
  startAddress: '',
  endAddress: '',
  startCoords: null,
  endCoords: null,
  startLabel: '',
  endLabel: '',
  startCands: [],
  endCands: [],
  viaPoints: [],
  routePath: [],
  nodes: [],
  activeNodeId: null,
  pinMode: null,
  status: '',
  loading: false,
  maptilerKey: '',
  hasOrsKey: false,
  email: '',
  submitted: false,
}

type Action =
  | { type: 'SET'; payload: Partial<AppState> }
  | { type: 'SET_METADATA'; payload: Partial<Metadata> }
  | { type: 'UPDATE_NODE'; id: string; patch: Partial<RouteNode> }
  | { type: 'INSERT_NODE'; index: number; node: RouteNode }
  | { type: 'REINDEX_NODES' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET':
      return { ...state, ...action.payload }
    case 'SET_METADATA':
      return { ...state, metadata: { ...state.metadata, ...action.payload } }
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.id ? { ...n, ...action.patch } : n,
        ),
      }
    case 'INSERT_NODE': {
      const nodes = [...state.nodes]
      nodes.splice(action.index, 0, action.node)
      return { ...state, nodes: nodes.map((n, i) => ({ ...n, index: i })) }
    }
    case 'REINDEX_NODES':
      return { ...state, nodes: state.nodes.map((n, i) => ({ ...n, index: i })) }
    default:
      return state
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, INIT)

  const set = useCallback(
    (payload: Partial<AppState>) => dispatch({ type: 'SET', payload }),
    [],
  )

  // Load config on mount
  useEffect(() => {
    getConfig()
      .then((cfg) =>
        set({ maptilerKey: cfg.maptiler_key, hasOrsKey: cfg.has_ors_key }),
      )
      .catch(() => {})
  }, [set])

  const reroute = useCallback(async () => {
    if (!state.startCoords || !state.endCoords) return
    set({ loading: true, status: 'Routing…' })
    const wps: [number, number][] = [
      state.startCoords,
      ...state.viaPoints.map((v): [number, number] => [v.lat, v.lng]),
      state.endCoords,
    ]
    try {
      const { path, nodes } = await fetchRoute(wps)
      set({
        routePath: path,
        nodes,
        loading: false,
        status: `${nodes.length} steps generated.`,
      })
    } catch (err) {
      set({
        loading: false,
        status: `Routing error: ${err instanceof Error ? err.message : err}`,
      })
    }
  }, [state.startCoords, state.endCoords, state.viaPoints, set])

  return { state, set, dispatch, reroute }
}
