import type { Instruction } from '../types/instruction'

export const initialInstructions: Instruction[] = [
  {
    id: 'start-1',
    lat: 37.77606,
    lng: -122.41711,
    text:
      'Start at the tactile paving near the corner and align your cane with the building line on the right.',
    type: 'start',
  },
  {
    id: 'cue-1',
    lat: 37.77648,
    lng: -122.41603,
    text:
      'Continue shorelining until the audible crossing signal is strongest directly ahead.',
    type: 'cue',
  },
  {
    id: 'turn-1',
    lat: 37.77562,
    lng: -122.41478,
    text:
      'Turn left after the surface changes from smooth concrete to textured brick.',
    type: 'turn',
  },
  {
    id: 'destination-1',
    lat: 37.77493,
    lng: -122.41408,
    text:
      'Destination is on the right, just beyond the recessed doorway and the bus stop audio cue.',
    type: 'destination',
  },
]
