import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'

export default function CounterfactualPanel({ comparison }) {
  return (
    <Card
      title="Counterfactual Name-Swap Test"
      subtitle="Same resume, different applicant name — flags name-based discrimination explicitly"
      actions={
        <Badge tone={comparison.bias_detected ? 'red' : 'green'}>
          {comparison.bias_detected ? 'Bias detected' : 'No bias detected'}
        </Badge>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NameColumn label="Name A" name={comparison.name_a} decision={comparison.decision_a} />
        <NameColumn label="Name B" name={comparison.name_b} decision={comparison.decision_b} />
      </div>
      <div className="mt-4 rounded-lg bg-paper px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">Explanation</div>
        <p className="mt-1 text-sm leading-relaxed text-ink">{comparison.explanation}</p>
      </div>
    </Card>
  )
}

function NameColumn({ label, name, decision }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</span>
        <Badge tone="outline">{decision?.verdict}</Badge>
      </div>
      <div className="mt-2 text-lg font-bold text-ink">{name}</div>
      <div className="mt-1 font-mono text-sm tabular-nums text-muted">
        score {Number.isFinite(decision?.score) ? decision.score.toFixed(4) : '—'}
        {decision?.percentage ? ` · ${decision.percentage}` : ''}
      </div>
    </div>
  )
}
