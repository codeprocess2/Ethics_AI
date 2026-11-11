export default function ProgressBar({ value, max = 1, tone = 'auto', showValue = true, label }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const barTone =
    tone === 'auto'
      ? pct >= 66
        ? 'bg-forest-600'
        : pct >= 33
          ? 'bg-forest-400'
          : 'bg-line'
      : tone === 'red'
        ? 'bg-red-500'
        : tone === 'amber'
          ? 'bg-amber-500'
          : 'bg-forest-600'
  return (
    <div>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-ink">{label}</span>}
          {showValue && (
            <span className="font-mono font-semibold tabular-nums text-muted">{pct.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-forest-50">
        <div className={`h-full rounded-full transition-all ${barTone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
