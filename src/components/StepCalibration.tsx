import type { RoutePoint } from '../types/instruction'

interface ViaPoint {
  id: string
  lat: number
  lng: number
}

interface Props {
  viaPoints: ViaPoint[]
  routePath: RoutePoint[]
  status: string
  onDeleteVia: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export default function StepCalibration({
  viaPoints,
  status,
  onDeleteVia,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <h3 className="text-[11px] font-semibold tracking-widest uppercase text-neutral-900">
        Path Calibration
      </h3>
      <p className="text-[11px] text-neutral-500 leading-relaxed">
        Drag the <strong>S</strong> or <strong>E</strong> pins to adjust endpoints.
        Click the route line to add an intermediate waypoint.
      </p>

      {status && (
        <p className="text-[11px] text-neutral-500">{status}</p>
      )}

      {viaPoints.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-500">
            Via Points
          </span>
          {viaPoints.map((v, i) => (
            <div key={v.id} className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-700">
                V{i + 1} · {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
              </span>
              <button
                onClick={() => onDeleteVia(v.id)}
                className="text-[11px] text-neutral-400 hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button
          onClick={onNext}
          className="flex-1 py-2 rounded text-xs font-semibold
                     bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
        >
          Confirm →
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
    </div>
  )
}
