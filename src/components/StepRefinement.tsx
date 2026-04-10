import { useState } from 'react'
import type { RouteNode } from '../types/instruction'

interface Props {
  nodes: RouteNode[]
  activeNodeId: string | null
  status: string
  onSelectNode: (id: string) => void
  onUpdateNode: (id: string, patch: Partial<RouteNode>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepRefinement({
  nodes,
  activeNodeId,
  status,
  onSelectNode,
  onUpdateNode,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <h3 className="text-[11px] font-semibold tracking-widest uppercase text-neutral-900">
        Tactical Refinement
      </h3>

      <div className="flex gap-2">
        <button
          onClick={onNext}
          className="flex-1 py-2 rounded text-xs font-semibold
                     bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
        >
          Continue →
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-1.5 rounded text-xs font-medium
                     border border-neutral-200 text-neutral-600
                     hover:border-neutral-400 transition-colors"
        >
          ← Back
        </button>
      </div>

      <p className="text-[11px] text-neutral-500 leading-relaxed">
        Select a step to edit its instruction. Click the route line on the map to
        inject a new node.
      </p>

      {status && (
        <p className="text-[11px] text-neutral-500">{status}</p>
      )}

      {nodes.length === 0 && (
        <p className="text-[11px] text-neutral-400 text-center py-6">
          No instruction nodes yet.
        </p>
      )}

      <div className="flex flex-col gap-0.5">
        {nodes.map((node) => {
          const isActive = node.id === activeNodeId
          return (
            <NodeCard
              key={node.id}
              node={node}
              isActive={isActive}
              onSelect={() => onSelectNode(node.id)}
              onUpdate={(patch) => onUpdateNode(node.id, patch)}
            />
          )
        })}
      </div>
    </div>
  )
}

function NodeCard({
  node,
  isActive,
  onSelect,
  onUpdate,
}: {
  node: RouteNode
  isActive: boolean
  onSelect: () => void
  onUpdate: (patch: Partial<RouteNode>) => void
}) {
  const [draft, setDraft] = useState(node.instruction)

  return (
    <div
      onClick={onSelect}
      className={`
        flex flex-col gap-1.5 py-2 px-3 rounded cursor-pointer transition-colors
        border-l-2
        ${isActive
          ? 'border-l-neutral-900 bg-neutral-50'
          : 'border-l-transparent hover:bg-neutral-50'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span
          className={`
            flex items-center justify-center w-5 h-5 rounded-full
            text-[10px] font-bold font-mono shrink-0
            ${isActive
              ? 'bg-neutral-900 text-white'
              : 'border border-neutral-900 text-neutral-900'
            }
          `}
        >
          {node.index + 1}
        </span>
        <span className="text-[10px] tracking-wider uppercase text-neutral-500">
          {node.type}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="ml-auto text-[11px] text-neutral-400 hover:text-neutral-900"
        >
          {isActive ? '●' : '▶'}
        </button>
      </div>

      {isActive ? (
        <div className="flex flex-col gap-1.5">
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full px-2 py-1.5 text-[11px] rounded border border-neutral-200
                       bg-white text-neutral-900 resize-none caret-neutral-900
                       focus:border-neutral-900 focus:outline-none transition-colors"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              onUpdate({ instruction: draft })
            }}
            className="self-start px-3 py-1 rounded text-[11px] font-semibold
                       bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
          >
            Save ✓
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-neutral-500 pl-7 leading-relaxed">
          {node.instruction || 'No instruction.'}
        </p>
      )}
    </div>
  )
}
