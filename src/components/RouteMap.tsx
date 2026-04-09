import { useMemo } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from 'react-leaflet'

import type { Instruction } from '../types/instruction'
import type { RoutePoint } from '../utils/routeTools'

interface RouteMapProps {
  instructions: Instruction[]
  routePath: RoutePoint[]
  activeId: string | null
  onSelect: (id: string) => void
  onMarkerDrag: (id: string, lat: number, lng: number) => void
  onRouteInsert: (lat: number, lng: number) => void
}

function buildInstructionIcon(index: number, isActive: boolean, type: string) {
  return L.divIcon({
    className: 'instruction-marker-shell',
    html: `<span class="instruction-marker ${isActive ? 'is-active' : ''}" data-type="${type}">${index + 1}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export default function RouteMap({
  instructions,
  routePath,
  activeId,
  onSelect,
  onMarkerDrag,
  onRouteInsert,
}: RouteMapProps) {
  const center = useMemo<[number, number]>(() => {
    const firstPoint = instructions[0]
    return firstPoint ? [firstPoint.lat, firstPoint.lng] : [37.77606, -122.41711]
  }, [instructions])

  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom
      className="route-map"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <Polyline
        positions={routePath}
        pathOptions={{ color: '#1d4ed8', weight: 6, opacity: 0.85 }}
        eventHandlers={{
          click: (event) => {
            onRouteInsert(event.latlng.lat, event.latlng.lng)
          },
        }}
      />

      {instructions.map((instruction, index) => (
        <Marker
          key={instruction.id}
          position={[instruction.lat, instruction.lng]}
          icon={buildInstructionIcon(
            index,
            instruction.id === activeId,
            instruction.type,
          )}
          draggable
          keyboard
          autoPan
          title={`${index + 1}. ${instruction.type}`}
          eventHandlers={{
            click: () => onSelect(instruction.id),
            dragend: (event) => {
              const marker = event.target as L.Marker
              const { lat, lng } = marker.getLatLng()
              onMarkerDrag(instruction.id, lat, lng)
            },
          }}
        >
          <Popup>
            <strong>{instruction.type}</strong>
            <p>{instruction.text}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
