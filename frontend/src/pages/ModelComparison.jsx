import { useState } from 'react'
import { screenResume, errorMessage } from '../api/client.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import FileDrop from '../components/ui/FileDrop.jsx'
import ModelDecisionCard from '../components/screening/ModelDecisionCard.jsx'
import CounterfactualPanel from '../components/screening/CounterfactualPanel.jsx'

/**
 * Model Comparison: side-by-side A/B evaluation of the same candidate,
 * with a matrix view across a batch of name pairs.
 */
export default function ModelComparison() {
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [pairs, setPairs] = useState([
    { applicant_name: 'Michael Smith', counterfactual_name: 'Jennifer Smith' },
    { applicant_name: 'James Johnson', counterfactual_name: 'Maria Garcia' },
  ])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const canRun = (file || resumeText.trim().length >= 10) && pairs.length > 0

  const updatePair = (i, field, value) =>
    setPairs((ps) => ps.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))

  const runBatch = async () => {
    setLoading(true)
    setError(null)
    setResults([])
    const next = []
    for (const pair of pairs) {
      try {
        const data = await screenResume({
          file,
          resumeText: resumeText.trim() || undefined,
          applicantName: pair.applicant_name,
          counterfactualName: pair.counterfactual_name || undefined,
        })
        next.push({ ...pair, ok: true, data })
      } catch (err) {
        next.push({ ...pair, ok: false, error: err })
      }
      setResults([...next])
    }
    setLoading(false)
  }

  return (
    <div>
      <PageHeader
        title="Model Comparison"
        description="Evaluate Model A (name-aware) vs Model B (name-blind) across multiple name pairs on the same resume."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Shared Resume" subtitle="One resume, many name pairs">
            <FileDrop compact file={file} onFile={setFile} />
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={6}
              placeholder="…or paste resume text (min 10 chars)"
              className="mt-3 w-full resize-y rounded-lg border border-line bg-paper px-3 py-2.5 font-mono text-xs outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
            />
          </Card>

          <Card
            title="Name Pairs"
            subtitle="Each pair runs one screening with counterfactual swap"
            actions={
              <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => setPairs((p) => [...p, { applicant_name: '', counterfactual_name: '' }])}>
                + Add pair
              </Button>
            }
          >
            <div className="space-y-3">
              {pairs.map((pair, i) => (
                <div key={i} className="flex items-end gap-2">
                  <label className="flex-1">
                    <span className="mb-1 block text-[11px] font-semibold text-muted">Name A</span>
                    <input value={pair.applicant_name} onChange={(e) => updatePair(i, 'applicant_name', e.target.value)}
                      className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest-400" />
                  </label>
                  <span className="pb-2.5 text-muted">→</span>
                  <label className="flex-1">
                    <span className="mb-1 block text-[11px] font-semibold text-muted">Name B</span>
                    <input value={pair.counterfactual_name} onChange={(e) => updatePair(i, 'counterfactual_name', e.target.value)}
                      className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest-400" />
                  </label>
                  <button
                    onClick={() => setPairs((p) => p.filter((_, idx) => idx !== i))}
                    className="pb-2.5 text-xs font-semibold text-red-600 hover:underline"
                    disabled={pairs.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <Button onClick={runBatch} loading={loading} disabled={!canRun} className="w-full">
                Run comparison batch
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-3">
          {error && <Alert title="Comparison failed">{errorMessage(error)}</Alert>}
          {loading && results.length === 0 && <Card><Spinner label="Screening pairs sequentially…" /></Card>}

          {!loading && results.length === 0 && (
            <Card>
              <div className="py-10 text-center text-sm text-muted">
                Run a comparison batch to see per-pair Model A vs Model B decisions.
              </div>
            </Card>
          )}

          {results.map((r, i) => (
            <Card
              key={i}
              title={`Pair ${i + 1}: ${r.applicant_name || '—'} vs ${r.counterfactual_name || '—'}`}
              subtitle={r.ok ? `Verdicts — A: ${r.data.model_a_biased.verdict} · B: ${r.data.model_b_fair.verdict}` : 'Failed'}
            >
              {!r.ok ? (
                <Alert title="Request failed">{errorMessage(r.error)}</Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ModelDecisionCard title="Model A · Name-aware" decision={r.data.model_a_biased} tone="amber" />
                    <ModelDecisionCard title="Model B · Name-blind" decision={r.data.model_b_fair} tone="green" />
                  </div>
                  {r.data.counterfactual && <CounterfactualPanel comparison={r.data.counterfactual} />}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-line text-muted">
                          <th className="py-2 pr-4 font-semibold">Model</th>
                          <th className="py-2 pr-4 font-semibold">Score</th>
                          <th className="py-2 pr-4 font-semibold">Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-line/60">
                          <td className="py-2 pr-4 font-semibold text-ink">A (name-aware)</td>
                          <td className="py-2 pr-4 font-mono tabular-nums">{r.data.model_a_biased.score.toFixed(4)}</td>
                          <td className="py-2 pr-4">{r.data.model_a_biased.verdict}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-ink">B (name-blind)</td>
                          <td className="py-2 pr-4 font-mono tabular-nums">{r.data.model_b_fair.score.toFixed(4)}</td>
                          <td className="py-2 pr-4">{r.data.model_b_fair.verdict}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
