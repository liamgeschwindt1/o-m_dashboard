import { useState } from 'react'
import type { RouteNode } from '../types/instruction'

interface Props {
  nodes: RouteNode[]
  metadata: { route_name: string }
  submitted: boolean
  onSubmit: (email: string) => void
  onBack: () => void
}

export default function StepUplink({ nodes, metadata, submitted, onSubmit, onBack }: Props) {
  const [email, setEmail] = useState('')

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())

  function handleExport() {
    const payload = {
      route_name: metadata.route_name,
      metadata,
      exported_at: new Date().toISOString(),
      nodes: nodes.map(({ lat, lng, instruction, type }) => ({
        lat, lng, instruction, type,
      })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tiera-route.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (submitted) {
    return (
      <div className="px-4 py-6">
        <div className="rounded border border-neutral-200 bg-neutral-50 p-4 text-[13px] text-neutral-700 leading-relaxed">
          Your custom route has been submitted successfully and will be reviewed.
          You will receive a confirmation once this is available in the app.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <h3 className="text-[11px] font-semibold tracking-widest uppercase text-neutral-900">
        Uplink
      </h3>
      <p className="text-[11px] text-neutral-500">
        Enter your email address to receive a confirmation.
      </p>

      <input
        type="email"
        value={email}
        placeholder="you@organisation.com"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200
                   bg-white text-neutral-900 placeholder:text-neutral-400
                   focus:border-neutral-900 focus:outline-none transition-colors"
      />

      <button
        onClick={() => onSubmit(email)}
        disabled={!valid}
        className="w-full py-2 rounded text-xs font-semibold
                   bg-neutral-900 text-white hover:bg-neutral-700
                   disabled:opacity-30 transition-colors"
      >
        Submit custom route
      </button>

      <button
        onClick={handleExport}
        className="w-full py-1.5 rounded text-xs font-medium
                   border border-neutral-200 text-neutral-600
                   hover:border-neutral-400 transition-colors"
      >
        Export JSON
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
  )
}
