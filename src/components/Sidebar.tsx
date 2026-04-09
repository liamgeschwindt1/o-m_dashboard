import { useEffect, useRef } from 'react'

import type { Instruction, InstructionType } from '../types/instruction'

interface SidebarProps {
  instructions: Instruction[]
  activeId: string | null
  routeStatus: string
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<Instruction>) => void
  onExport: () => void
  onReset: () => void
}

const instructionTypes: InstructionType[] = [
  'start',
  'turn',
  'landmark',
  'hazard',
  'cue',
  'destination',
]

export default function Sidebar({
  instructions,
  activeId,
  routeStatus,
  onSelect,
  onUpdate,
  onExport,
  onReset,
}: SidebarProps) {
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (!activeId) {
      return
    }

    cardRefs.current[activeId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [activeId])

  return (
    <aside className="sidebar" aria-label="Instruction editor">
      <div className="sidebar__header">
        <p className="eyebrow">O&amp;M route editor</p>
        <h2>Sidebar bridge</h2>
        <p className="sidebar__intro">
          The JSON array below is the source of truth. Click a marker to focus it
          here, or update coordinates to move the same point on the map.
        </p>

        <div className="status-card" role="status" aria-live="polite">
          {routeStatus}
        </div>

        <div className="sidebar__actions">
          <button onClick={onExport}>Export JSON</button>
          <button className="secondary" onClick={onReset}>
            Reset demo
          </button>
        </div>

        <div className="schema-card">
          <strong>Export schema</strong>
          <code>{`{ id, lat, lng, text, type }`}</code>
        </div>
      </div>

      <div className="instruction-list">
        {instructions.map((instruction, index) => {
          const isActive = instruction.id === activeId

          return (
            <section
              key={instruction.id}
              ref={(element) => {
                cardRefs.current[instruction.id] = element
              }}
              className={`instruction-card ${isActive ? 'is-active' : ''}`}
              aria-current={isActive}
            >
              <button
                className="instruction-card__focus"
                onClick={() => onSelect(instruction.id)}
              >
                Focus point {index + 1}
              </button>

              <div className="instruction-card__meta">
                <span className={`type-badge type-badge--${instruction.type}`}>
                  {instruction.type}
                </span>
                <code>{instruction.id}</code>
              </div>

              <label>
                <span>Instruction type</span>
                <select
                  value={instruction.type}
                  onFocus={() => onSelect(instruction.id)}
                  onChange={(event) => {
                    onUpdate(instruction.id, {
                      type: event.target.value as InstructionType,
                    })
                  }}
                >
                  {instructionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Instruction text</span>
                <textarea
                  rows={3}
                  value={instruction.text}
                  onFocus={() => onSelect(instruction.id)}
                  onChange={(event) => {
                    onUpdate(instruction.id, { text: event.target.value })
                  }}
                />
              </label>

              <div className="coord-grid">
                <label>
                  <span>Latitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={instruction.lat}
                    onFocus={() => onSelect(instruction.id)}
                    onChange={(event) => {
                      onUpdate(instruction.id, {
                        lat: Number(event.target.value),
                      })
                    }}
                  />
                </label>

                <label>
                  <span>Longitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={instruction.lng}
                    onFocus={() => onSelect(instruction.id)}
                    onChange={(event) => {
                      onUpdate(instruction.id, {
                        lng: Number(event.target.value),
                      })
                    }}
                  />
                </label>
              </div>
            </section>
          )
        })}
      </div>
    </aside>
  )
}
