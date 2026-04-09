import { distance, lineString, nearestPointOnLine, point } from '@turf/turf'

import type { Instruction, InstructionType } from '../types/instruction'

export type RoutePoint = [number, number]

interface OsrmRouteResponse {
  code: string
  routes?: Array<{
    geometry: {
      coordinates: [number, number][]
    }
  }>
}

export function buildFallbackRoute(instructions: Instruction[]): RoutePoint[] {
  return instructions.map((instruction) => [instruction.lat, instruction.lng])
}

export async function fetchWalkingRoute(
  instructions: Instruction[],
): Promise<RoutePoint[]> {
  if (instructions.length < 2) {
    return buildFallbackRoute(instructions)
  }

  const coordinates = instructions
    .map((instruction) => `${instruction.lng},${instruction.lat}`)
    .join(';')

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=false`,
  )

  if (!response.ok) {
    throw new Error(`Routing request failed with status ${response.status}`)
  }

  const data = (await response.json()) as OsrmRouteResponse
  const geometry = data.routes?.[0]?.geometry.coordinates

  if (data.code !== 'Ok' || !geometry?.length) {
    throw new Error('OSRM did not return a route geometry')
  }

  return geometry.map(([lng, lat]) => [lat, lng])
}

export function findInsertionPoint(
  instructions: Instruction[],
  lat: number,
  lng: number,
) {
  if (instructions.length < 2) {
    return { index: instructions.length, lat, lng }
  }

  const clickedPoint = point([lng, lat])
  let bestMatch = {
    index: 1,
    lat,
    lng,
    distance: Number.POSITIVE_INFINITY,
  }

  for (let index = 0; index < instructions.length - 1; index += 1) {
    const start = instructions[index]
    const end = instructions[index + 1]
    const segment = lineString([
      [start.lng, start.lat],
      [end.lng, end.lat],
    ])

    const snappedPoint = nearestPointOnLine(segment, clickedPoint, {
      units: 'meters',
    })

    const [snappedLng, snappedLat] = snappedPoint.geometry.coordinates
    const metersAway = distance(clickedPoint, snappedPoint, { units: 'meters' })

    if (metersAway < bestMatch.distance) {
      bestMatch = {
        index: index + 1,
        lat: snappedLat,
        lng: snappedLng,
        distance: metersAway,
      }
    }
  }

  return bestMatch
}

export function createInstruction(
  lat: number,
  lng: number,
  type: InstructionType = 'landmark',
): Instruction {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `instruction-${Date.now()}-${Math.round(Math.random() * 100000)}`

  return {
    id,
    lat,
    lng,
    type,
    text:
      type === 'hazard'
        ? 'Flag a hazard cue here for cane preview or trainer coaching.'
        : 'Add a landmark, tactile cue, or shoreline instruction for this point.',
  }
}
