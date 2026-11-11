import { useEffect, useState } from 'react'
import { fetchHealth } from '../../api/client.js'

export default function Topbar({ onMenu }) {
  const [status, setStatus] = useState({ state: 'checking', message: '' })

  useEffect(() => {
    let cancelled = false
    fetchHealth()
      .then(() => !cancelled && setStatus({ state: 'ok', message: '' }))
      .catch((err) => !cancelled && setStatus({ state: 'down', message: err?.message || '' }))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-muted hover:bg-forest-50 hover:text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>
      <div className="flex-1">
        <div className="text-sm font-semibold text-ink">Resume Screening & Fairness Evaluation</div>
        <div className="text-xs text-muted">AI Ethics · Counterfactual Auditing · Explainability</div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            status.state === 'ok'
              ? 'bg-forest-500'
              : status.state === 'down'
                ? 'bg-red-500'
                : 'bg-amber-500'
          }`}
        />
        <span className="text-xs font-medium text-muted">
          {status.state === 'ok' ? 'Backend online' : status.state === 'down' ? 'Backend offline' : 'Checking…'}
        </span>
      </div>
    </header>
  )
}
