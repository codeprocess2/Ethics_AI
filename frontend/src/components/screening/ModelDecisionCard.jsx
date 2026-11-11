import Badge from '../ui/Badge.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

const TONES = {
  amber: {
    ring: 'border-amber-200',
    badge: 'amber',
    bar: 'amber',
  },
  green: {
    ring: 'border-forest-200',
    badge: 'green',
    bar: 'forest',
  },
}

export default function ModelDecisionCard({ title, decision, tone = 'green' }) {
  const t = TONES[tone]
  const pct = decision?.percentage ? parseFloat(decision.percentage) : null
  const score = decision?.score ?? 0

  return (
    <div className={`rounded-xl2 border bg-white p-5 shadow-card ${t.ring}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <Badge tone={t.badge}>{decision?.verdict ?? '—'}</Badge>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="font-mono text-3xl font-bold tabular-nums text-ink">
          {pct !== null && !Number.isNaN(pct) ? `${pct.toFixed(1)}%` : score.toFixed(3)}
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={Number.isFinite(score) ? Math.abs(score) : 0} max={1} showValue={false} tone={tone === 'amber' ? 'amber' : 'forest'} />
        <p className="mt-1.5 font-mono text-[11px] text-muted">raw score: {Number.isFinite(score) ? score.toFixed(4) : '—'}</p>
      </div>
    </div>
  )
}
