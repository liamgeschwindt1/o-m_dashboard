import type { Step } from '../types/instruction'

const LABELS = ['Identity', 'Destination', 'Calibration', 'Refinement', 'Uplink']

interface StepperProps {
  current: Step
  onChange: (step: Step) => void
}

export default function Stepper({ current, onChange }: StepperProps) {
  return (
    <nav className="flex flex-col gap-0.5 px-4 py-3 border-b border-neutral-200">
      {LABELS.map((label, i) => {
        const done = i < current
        const active = i === current
        const future = i > current
        return (
          <button
            key={label}
            disabled={future}
            onClick={() => onChange(i as Step)}
            className={`
              flex items-center gap-2.5 px-2 py-1.5 rounded text-left text-xs font-medium
              transition-colors duration-100 disabled:opacity-30 disabled:cursor-default
              ${active ? 'bg-neutral-900 text-white' : ''}
              ${done ? 'text-neutral-600 hover:bg-neutral-100 cursor-pointer' : ''}
              ${future ? 'text-neutral-400' : ''}
            `}
          >
            <span
              className={`
                flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                font-mono shrink-0 border
                ${active ? 'bg-white text-neutral-900 border-white' : ''}
                ${done ? 'bg-neutral-900 text-white border-neutral-900' : ''}
                ${future ? 'bg-transparent text-neutral-400 border-neutral-300' : ''}
              `}
            >
              {done ? '✓' : i + 1}
            </span>
            {label}
          </button>
        )
      })}
    </nav>
  )
}
