import type { Metadata } from '../types/instruction'

interface Props {
  metadata: Metadata
  onChange: (patch: Partial<Metadata>) => void
  onNext: () => void
}

export default function StepIdentity({ metadata, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <h3 className="text-[11px] font-semibold tracking-widest uppercase text-neutral-900">
        Route Identity
      </h3>
      {([
        ['Route Name', 'route_name', 'e.g. Highgate Loop A'] as const,
        ['Organization Code', 'org_code', 'e.g. TP-001'] as const,
        ['Owner Name', 'owner', 'e.g. J. Smith'] as const,
        ['Contact', 'contact', 'e.g. j@org.com'] as const,
      ]).map(([label, key, placeholder]) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-500">
            {label}
          </span>
          <input
            type="text"
            value={metadata[key]}
            placeholder={placeholder}
            onChange={(e) => onChange({ [key]: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200
                       bg-white text-neutral-900 placeholder:text-neutral-400
                       focus:border-neutral-900 focus:outline-none transition-colors"
          />
        </label>
      ))}
      <button
        onClick={onNext}
        className="mt-2 w-full py-2 rounded text-xs font-semibold
                   bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
      >
        Continue →
      </button>
    </div>
  )
}
