export default function Stat({ label, value, hint, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-ink',
    good: 'text-forest-600',
    warn: 'text-amber-600',
    bad: 'text-red-600',
  }
  return (
    <div className="rounded-xl2 border border-line bg-white p-4 shadow-card">
      <div className="text-xs font-medium uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums ${tones[tone]}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  )
}
