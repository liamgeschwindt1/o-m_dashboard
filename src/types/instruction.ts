export type InstructionType =
  | 'start'
  | 'turn'
  | 'landmark'
  | 'hazard'
  | 'cue'
  | 'destination'

export interface Instruction {
  id: string
  lat: number
  lng: number
  text: string
  type: InstructionType
}

export interface RouteNode {
  id: string
  index: number
  lat: number
  lng: number
  instruction: string
  type: string
  distance_m: number
  duration_s: number
}

export interface RoutePoint {
  lat: number
  lng: number
}

export interface Metadata {
  route_name: string
  org_code: string
  owner: string
  contact: string
}

export type Step = 0 | 1 | 2 | 3 | 4

export interface GeoCandidate {
  label: string
  lat: number
  lng: number
}

export type PinMode = 'start' | 'end' | null
