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
