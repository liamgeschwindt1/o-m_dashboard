import { useEffect, useRef } from 'react'

import type { Instruction, InstructionType } from '../types/instruction'

interface SidebarProps {
  instructions: Instruction[]
  activeId: string | null
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<Instruction>) => void
  onAdd: (lat: number, lng: number) => void
  onDelete: (id: string) => void
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
  onSelect,
  onUpdate,
  onDelete,
  onExport,
  onReset,
}: SidebarProps) {
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (!activeId) return
    cardRefs.current[activeId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeId])

  return (
    <aside className="sidebar" aria-label="Route editor">
      <div className="sidebar__header">
        <span className="sidebar__title">Route Editor</span>
        <div className="sidebar__actions">
          {instructions.length > 0 && (
            <button onClick={onExport}>Export</button>
          )}
          {instructions.length > 0 && (
            <button className="secondary" onClick={onReset}>Clear</button>
          )}
        </div>
      </div>

      {instructions.length === 0 ? (
        <p className="sidebar__empty">Click the map to add waypoints.</p>
      ) : (
        <div className="instruction-list">
          {instructions.map((instruction, index) => {
            const isActive = instruction.id === activeId

            return (
              <section
                key={instruction.id}
                ref={(el) => { cardRefs.current[instruction.id] = el }}
                className={`instruction-card ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelect(instruction.id)}
              >
                <div className="instruction-card__row">
                  <span className="instruction-card__num">{index + 1}</span>
                  <select
                    value={instruction.type}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onUpdate(instruction.id, { type: e.target.value as InstructionType })
                    }
                  >
                    {instructionTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    className="icon-btn"
                    title="Remove"
                    onClick={(e) => { e.stopPropagation(); onDelete(instruction.id) }}
                  >
                    ×
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Instruction text…"
                  value={instruction.text}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdate(instruction.id, { text: e.target.value })}
                />
              </section>
            )
          })}
        </div>
      )}
    </aside>
  )
}
