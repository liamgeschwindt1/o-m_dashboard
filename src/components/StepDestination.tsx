import { useState } from 'react'
import { geocode } from '../api/client'
import type { GeoCandidate, PinMode } from '../types/instruction'

interface Props {
  startCoords: [number, number] | null
  endCoords: [number, number] | null
  startLabel: string
  endLabel: string
  pinMode: PinMode
  status: string
  hasOrsKey: boolean
  onSetCoords: (role: 'start' | 'end', lat: number, lng: number, label: string) => void
  onClearCoords: (role: 'start' | 'end') => void
  onSetPinMode: (mode: PinMode) => void
  onGenerate: () => void
  onBack: () => void
}

function EndpointBlock({
  role,
  coords,
  label,
  pinActive,
  hasOrsKey,
  onSetCoords,
  onClear,
  onTogglePin,
}: {
  role: 'start' | 'end'
  coords: [number, number] | null
  label: string
  pinActive: boolean
  hasOrsKey: boolean
  onSetCoords: (lat: number, lng: number, label: string) => void
  onClear: () => void
  onTogglePin: () => void
}) {
  const [query, setQuery] = useState('')
  const [candidates, setCandidates] = useState<GeoCandidate[]>([])
  const [searching, setSearching] = useState(false)

  async function handleSearch() {
    if (!query.trim() || !hasOrsKey) return
    setSearching(true)
    try {
      const results = await geocode(query)
      setCandidates(results)
    } catch {
      setCandidates([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-500">
        {role.toUpperCase()}
      </span>

      <div className="flex gap-1">
        <input
          type="text"
          value={query}
          placeholder="Address or place…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded border border-neutral-200
                     bg-white text-neutral-900 placeholder:text-neutral-400
                     focus:border-neutral-900 focus:outline-none transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={!hasOrsKey || searching}
          className="px-2 py-1.5 text-xs rounded border border-neutral-200 bg-white
                     text-neutral-600 hover:border-neutral-400 disabled:opacity-30
                     transition-colors shrink-0"
        >
          {searching ? '…' : '↵'}
        </button>
        <button
          onClick={onTogglePin}
          className={`
            px-2 py-1.5 text-xs rounded border shrink-0 transition-colors
            ${pinActive
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
            }
          `}
        >
          {pinActive ? '●' : '📍'}
        </button>
      </div>

      {coords && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-green-700">✓ {label}</span>
          <button
            onClick={onClear}
            className="text-[11px] text-neutral-400 hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {candidates.length > 0 && !coords && (
        <div className="flex flex-col gap-1 mt-1">
          {candidates.map((c) => (
            <button
              key={`${c.lat}-${c.lng}`}
              onClick={() => {
                onSetCoords(c.lat, c.lng, c.label)
                setCandidates([])
              }}
              className="text-left text-[11px] px-2 py-1.5 rounded border border-neutral-200
                         hover:bg-neutral-50 text-neutral-700 transition-colors truncate"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {!coords && candidates.length === 0 && (
        <span className="text-[11px] text-neutral-400">
          Or click the map to pin {role}.
        </span>
      )}
    </div>
  )
}

export default function StepDestination({
  startCoords,
  endCoords,
  startLabel,
  endLabel,
  pinMode,
  status,
  hasOrsKey,
  onSetCoords,
  onClearCoords,
  onSetPinMode,
  onGenerate,
  onBack,
}: Props) {
  const canGenerate = hasOrsKey && !!startCoords && !!endCoords

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      <h3 className="text-[11px] font-semibold tracking-widest uppercase text-neutral-900">
        Destination Planning
      </h3>

      {!hasOrsKey && (
        <p className="text-[11px] text-red-600">
          Add <code className="text-[10px] bg-neutral-100 px-1 rounded">ORS_API_KEY</code> to
          environment variables.
        </p>
      )}

      <EndpointBlock
        role="start"
        coords={startCoords}
        label={startLabel}
        pinActive={pinMode === 'start'}
        hasOrsKey={hasOrsKey}
        onSetCoords={(lat, lng, label) => onSetCoords('start', lat, lng, label)}
        onClear={() => onClearCoords('start')}
        onTogglePin={() => onSetPinMode(pinMode === 'start' ? null : 'start')}
      />

      <EndpointBlock
        role="end"
        coords={endCoords}
        label={endLabel}
        pinActive={pinMode === 'end'}
        hasOrsKey={hasOrsKey}
        onSetCoords={(lat, lng, label) => onSetCoords('end', lat, lng, label)}
        onClear={() => onClearCoords('end')}
        onTogglePin={() => onSetPinMode(pinMode === 'end' ? null : 'end')}
      />

      {status && (
        <p className="text-[11px] text-neutral-500">{status}</p>
      )}

      <div className="flex flex-col gap-2 mt-1">
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full py-2 rounded text-xs font-semibold
                     bg-neutral-900 text-white hover:bg-neutral-700
                     disabled:opacity-30 transition-colors"
        >
          Generate Route
        </button>
        <button
          onClick={onBack}
          className="w-full py-1.5 rounded text-xs font-medium
                     border border-neutral-200 text-neutral-600
                     hover:border-neutral-400 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
