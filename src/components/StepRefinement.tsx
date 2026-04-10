import type { RouteNode } from '../types/instruction'

const NODE_TYPES = ['start', 'step', 'right', 'left', 'straight', 'u-turn', 'landmark', 'hazard', 'arrive'] as const

interface Props {
  nodes: RouteNode[]
  activeNodeId: string | null
  status: string
  onSelectNode: (id: string) => void
  onDeselectNode: () => void
  onUpdateNode: (id: string, patch: Partial<RouteNode>) => void
  onDeleteNode: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export default function StepRefinement({
  nodes,
  activeNodeId,
  status,
  onDeselectNode,
  onUpdateNode,
  onDeleteNode,
  onNext,
  onBack,
}: Props) {
  const activeNode = activeNodeId
    ? nodes.find((n) => n.id === activeNodeId)
    : null

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
          Continue to Submit →
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
        Hover a node on the map to see its instruction.
        Click a node to edit it here. Click the route line to add a new node.
      </p>

      {status && (
        <p className="text-[11px] text-neutral-500">{status}</p>
      )}

      {activeNode ? (
        <div className="border border-neutral-200 rounded-md p-3 bg-white mt-1">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono text-neutral-900">
              Step {activeNode.index + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDeleteNode(activeNode.id)}
                title="Delete node"
                className="w-6 h-6 flex items-center justify-center rounded
                           text-neutral-400 hover:text-red-500 hover:bg-red-50
                           transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={onDeselectNode}
                title="Close"
                className="w-6 h-6 flex items-center justify-center rounded
                           text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100
                           transition-colors text-sm font-medium"
              >
                ×
              </button>
            </div>
          </div>

          {/* Type selector */}
          <select
            value={activeNode.type}
            onChange={(e) => onUpdateNode(activeNode.id, { type: e.target.value })}
            className="w-full mb-2 px-2 py-1.5 text-[11px] font-mono font-semibold
                       border border-neutral-200 rounded bg-neutral-50
                       focus:outline-none focus:border-neutral-400 transition-colors"
          >
            {NODE_TYPES.map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>

          {/* Instruction text */}
          <textarea
            rows={3}
            placeholder="Instruction text…"
            value={activeNode.instruction}
            onChange={(e) => onUpdateNode(activeNode.id, { instruction: e.target.value })}
            className="w-full px-2 py-1.5 text-[11px] leading-relaxed
                       border border-neutral-200 rounded resize-none
                       focus:outline-none focus:border-neutral-400 transition-colors"
          />
        </div>
      ) : (
        <div className="text-[11px] text-neutral-400 text-center py-4">
          {nodes.length === 0
            ? 'No instruction nodes yet — click the route line to add one.'
            : `${nodes.length} node${nodes.length !== 1 ? 's' : ''} on route. Click one to edit.`}
        </div>
      )}
    </div>
  )
}
