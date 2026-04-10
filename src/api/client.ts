import type { GeoCandidate, RouteNode, RoutePoint } from '../types/instruction'

const BASE = '/api'

export async function fetchRoute(
  waypoints: [number, number][],
): Promise<{ path: RoutePoint[]; nodes: RouteNode[] }> {
  const res = await fetch(`${BASE}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ waypoints }),
  })
  if (!res.ok) throw new Error(`Route failed: ${res.status}`)
  return res.json()
}

export async function geocode(query: string): Promise<GeoCandidate[]> {
  const res = await fetch(`${BASE}/geocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`)
  return res.json()
}

export async function getConfig(): Promise<{
  maptiler_key: string
  has_routing_key: boolean
}> {
  const res = await fetch(`${BASE}/config`)
  if (!res.ok) throw new Error(`Config failed: ${res.status}`)
  return res.json()
}
