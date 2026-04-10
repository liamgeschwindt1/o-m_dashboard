import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'

import type { RouteNode, RoutePoint, PinMode } from '../types/instruction'

type Mode = 'idle' | 'plan' | 'calibrate' | 'refine' | 'review'

interface RouteMapProps {
  mode: Mode
  nodes: RouteNode[]
  routePath: RoutePoint[]
  startCoords: [number, number] | null
  endCoords: [number, number] | null
  viaPoints: { id: string; lat: number; lng: number }[]
  activeNodeId: string | null
  maptilerKey: string
  pinMode: PinMode
  onMapClick: (lat: number, lng: number) => void
  onNodeClick: (id: string) => void
  onUpdateNode: (id: string, patch: Partial<RouteNode>) => void
  onDeselectNode: () => void
  onPinDrag: (role: 'start' | 'end', lat: number, lng: number) => void
  onViaDrag: (id: string, lat: number, lng: number) => void
  onViaAdd: (lat: number, lng: number) => void
  onRouteClick: (lat: number, lng: number, nearestIdx: number) => void
}

/* ── Icons ── */
function pinIcon(cls: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:50%;
      font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);
      ${cls === 'start'
        ? 'background:#111;color:#fff;border:2px solid #111'
        : 'background:#fff;color:#111;border:2px solid #111'
      }
    ">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  })
}

function nodeIcon(index: number, active: boolean) {
  const sz = active ? 24 : 20
  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:${sz}px;height:${sz}px;border-radius:50%;
      font-size:${active ? 10 : 9}px;font-weight:700;
      font-family:'JetBrains Mono',monospace;cursor:pointer;
      ${active
        ? 'background:#111;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.28)'
        : 'background:#fff;color:#111;border:2px solid #111'
      }
    ">${index + 1}</div>`,
    iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
  })
}

function viaIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:12px;height:12px;border-radius:50%;
      background:#666;border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:grab;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

/* ── Cursor manager ── */
function CursorManager({ mode }: { mode: Mode }) {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const cursor = (mode === 'plan' || mode === 'calibrate' || mode === 'refine')
      ? 'crosshair' : ''
    el.style.cursor = cursor
    return () => { el.style.cursor = '' }
  }, [map, mode])
  return null
}

/* ── Auto-fit to route on route change ── */
function AutoFit({ routePath, mode }: { routePath: RoutePoint[]; mode: Mode }) {
  const map = useMap()
  const lastHash = useRef('')

  useEffect(() => {
    if (routePath.length < 2) return
    if (mode !== 'calibrate' && mode !== 'refine' && mode !== 'review') return
    const hash = `${routePath.length}:${routePath[0].lat},${routePath[0].lng}:${routePath[routePath.length - 1].lat},${routePath[routePath.length - 1].lng}`
    if (hash === lastHash.current) return
    lastHash.current = hash
    const bounds = L.latLngBounds(routePath.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [48, 48] })
  }, [map, routePath, mode])

  return null
}

/* ── Click handler ── */
function ClickHandler({
  mode,
  onMapClick,
}: {
  mode: Mode
  onMapClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      if (mode === 'plan') {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export default function RouteMap({
  mode,
  nodes,
  routePath,
  startCoords,
  endCoords,
  viaPoints,
  activeNodeId,
  maptilerKey,
  onMapClick,
  onNodeClick,
  onUpdateNode,
  onDeselectNode,
  onPinDrag,
  onViaDrag,
  onViaAdd,
  onRouteClick,
}: RouteMapProps) {
  const center = useMemo<[number, number]>(() => {
    if (startCoords) return startCoords
    return [51.5099, -0.1181]
  }, [startCoords])

  const tileUrl = maptilerKey
    ? `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${maptilerKey}`
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const tileAttr = maptilerKey
    ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'

  const pathPositions = routePath.map((p): [number, number] => [p.lat, p.lng])

  function handleRouteLineClick(e: L.LeafletMouseEvent) {
    L.DomEvent.stopPropagation(e)
    if (mode === 'calibrate') {
      onViaAdd(e.latlng.lat, e.latlng.lng)
    } else if (mode === 'refine') {
      let best = nodes.length
      let bestD = Infinity
      nodes.forEach((n, i) => {
        const d = Math.hypot(n.lat - e.latlng.lat, n.lng - e.latlng.lng)
        if (d < bestD) { bestD = d; best = i + 1 }
      })
      onRouteClick(e.latlng.lat, e.latlng.lng, best)
    }
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="w-full h-full"
      zoomControl
    >
      <TileLayer url={tileUrl} attribution={tileAttr} maxZoom={20} />
      <CursorManager mode={mode} />
      <AutoFit routePath={routePath} mode={mode} />
      <ClickHandler mode={mode} onMapClick={onMapClick} />

      {/* Route line */}
      {pathPositions.length > 1 && (
        <Polyline
          positions={pathPositions}
          pathOptions={{
            color: '#111',
            weight: 3,
            opacity: 0.85,
            lineJoin: 'round',
            lineCap: 'round',
            interactive: mode === 'calibrate' || mode === 'refine',
          }}
          eventHandlers={{
            click: handleRouteLineClick,
          }}
        />
      )}

      {/* Start pin */}
      {startCoords && (
        <Marker
          position={startCoords}
          icon={pinIcon('start', 'S')}
          draggable={mode === 'calibrate'}
          zIndexOffset={600}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng()
              onPinDrag('start', lat, lng)
            },
          }}
        />
      )}

      {/* End pin */}
      {endCoords && (
        <Marker
          position={endCoords}
          icon={pinIcon('end', 'E')}
          draggable={mode === 'calibrate'}
          zIndexOffset={600}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng()
              onPinDrag('end', lat, lng)
            },
          }}
        />
      )}

      {/* Via points */}
      {mode === 'calibrate' && viaPoints.map((v) => (
        <Marker
          key={v.id}
          position={[v.lat, v.lng]}
          icon={viaIcon()}
          draggable
          zIndexOffset={500}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng()
              onViaDrag(v.id, lat, lng)
            },
          }}
        />
      ))}

      {/* Step nodes */}
      {(mode === 'refine' || mode === 'review') && nodes.map((n) => (
        <Marker
          key={n.id}
          position={[n.lat, n.lng]}
          icon={nodeIcon(n.index, n.id === activeNodeId)}
          zIndexOffset={n.id === activeNodeId ? 400 : 0}
          eventHandlers={{
            click: () => onNodeClick(n.id),
          }}
        >
          {n.id === activeNodeId && mode === 'refine' && (
            <NodePopup node={n} onSave={(patch) => { onUpdateNode(n.id, patch); onDeselectNode() }} />
          )}
          {mode === 'review' && (
            <Popup className="node-popup" autoPan={false}>
              <div style={{ fontSize: 11, lineHeight: '1.5', maxWidth: 200 }}>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                  Step {n.index + 1}
                </strong>
                <p style={{ margin: '4px 0 0', color: '#555' }}>
                  {n.instruction || 'No instruction.'}
                </p>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  )
}

/* ── Editable popup for refine mode ── */
function NodePopup({ node, onSave }: { node: RouteNode; onSave: (patch: Partial<RouteNode>) => void }) {
  const [draft, setDraft] = useState(node.instruction)

  return (
    <Popup className="node-popup" autoPan closeButton={false}>
      <div style={{ minWidth: 220, maxWidth: 260 }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, color: '#111' }}>
          Step {node.index + 1} — {node.type}
        </div>
        <textarea
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            padding: '6px 8px',
            fontSize: 11,
            fontFamily: 'inherit',
            border: '1px solid #ddd',
            borderRadius: 4,
            resize: 'none',
            outline: 'none',
            color: '#111',
            lineHeight: '1.5',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#111'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ddd'
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSave({ instruction: draft })
          }}
          style={{
            marginTop: 6,
            padding: '4px 14px',
            fontSize: 11,
            fontWeight: 600,
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Save ✓
        </button>
      </div>
    </Popup>
  )
}
