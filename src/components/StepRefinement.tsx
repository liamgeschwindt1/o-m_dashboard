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
  status,
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
        Click any numbered node on the map to edit its instruction.
        Click the route line to add a new node.
      </p>

      {status && (
        <p className="text-[11px] text-neutral-500">{status}</p>
      )}

      <div className="text-[11px] text-neutral-400 text-center py-4">
        {nodes.length === 0
          ? 'No instruction nodes yet — click the route line to add one.'
          : `${nodes.length} node${nodes.length !== 1 ? 's' : ''} placed on route.`}
      </div>
    </div>
  )
}
