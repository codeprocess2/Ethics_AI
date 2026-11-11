import { useMemo, useState } from 'react'

export default function FeatureWeightList({ features }) {
  const [sortByAbs, setSortByAbs] = useState(true)

  const sorted = useMemo(() => {
    const copy = [...features]
    copy.sort((a, b) => (sortByAbs ? Math.abs(b.weight) - Math.abs(a.weight) : b.weight - a.weight))
    return copy
  }, [features, sortByAbs])

  if (!features.length) return <p className="text-sm text-muted">No features returned.</p>

  const maxAbs = Math.max(...features.map((f) => Math.abs(f.weight)), 1e-9)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted">
          <span className="mr-3 inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-forest-600" /> supports decision</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500" /> opposes decision</span>
        </p>
        <button
          onClick={() => setSortByAbs((s) => !s)}
          className="text-xs font-semibold text-forest-700 hover:underline"
        >
          Sort: {sortByAbs ? 'by magnitude' : 'by signed weight'}
        </button>
      </div>
      <ul className="space-y-3">
        {sorted.map((f, i) => {
          const width = (Math.abs(f.weight) / maxAbs) * 100
          const positive = f.weight >= 0
          return (
            <li key={`${f.feature}-${i}`}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate font-mono text-xs font-semibold text-ink" title={f.feature}>
                  {i + 1}. {f.feature}
                </span>
                <span className={`shrink-0 font-mono text-xs tabular-nums ${positive ? 'text-forest-700' : 'text-red-600'}`}>
                  {positive ? '+' : ''}{f.weight.toFixed(4)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-forest-50">
                <div
                  className={`h-full rounded-full ${positive ? 'bg-forest-600' : 'bg-red-500'}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
