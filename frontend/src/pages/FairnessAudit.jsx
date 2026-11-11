import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { runBiasAudit, errorMessage } from '../api/client.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Stat from '../components/ui/Stat.jsx'
import Badge from '../components/ui/Badge.jsx'

export default function FairnessAudit() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await runBiasAudit()
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = useMemo(
    () =>
      (data?.metrics || []).map((m) => ({
        group: m.group,
        'Model A (name-aware)': +(m.model_a_shortlist_rate * 100).toFixed(2),
        'Model B (name-blind)': +(m.model_b_shortlist_rate * 100).toFixed(2),
      })),
    [data]
  )

  const fourFifthsA = data?.disparate_impact_ratio_model_a ?? null
  const fourFifthsB = data?.disparate_impact_ratio_model_b ?? null

  return (
    <div>
      <PageHeader
        title="Fairness Audit"
        description="Paired counterfactual audit over held-out qualified resumes: shortlist rates, demographic gap and disparate impact."
        actions={<Button onClick={run} loading={loading}>Run audit</Button>}
      />

      {error && <Alert title="Audit failed">{errorMessage(error)}</Alert>}
      {loading && !data && <Card><Spinner label="Auditing both models against held-out resumes… this can take a moment" /></Card>}

      {!loading && !data && !error && (
        <Card>
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path d="M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mt-3 text-sm font-semibold text-ink">No audit run yet</div>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted">
              The audit evaluates Model A and Model B under paired counterfactual testing on held-out qualified resumes. Metrics are returned by the backend — nothing is estimated client-side.
            </p>
          </div>
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Sample Size" value={data.sample_size} hint={data.evaluation_criteria} />
            <Stat label="Demographic Gap · A" value={(data.model_a_gap * 100).toFixed(1) + 'pp'} tone={data.model_a_gap > 0.05 ? 'bad' : 'good'} />
            <Stat label="Demographic Gap · B" value={(data.model_b_gap * 100).toFixed(1) + 'pp'} tone={data.model_b_gap > 0.05 ? 'bad' : 'good'} />
            <Stat label="Disparate Impact · A" value={fourFifthsA?.toFixed(3) ?? '—'}
              hint="4/5 rule threshold: 0.800"
              tone={fourFifthsA !== null && fourFifthsA < 0.8 ? 'bad' : 'good'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Shortlist Rate by Group" subtitle="Percentage of qualified resumes shortlisted, per model">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="24%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3DECF" vertical={false} />
                    <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#6B7269' }} tickLine={false} axisLine={{ stroke: '#E3DECF' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7269' }} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip
                      cursor={{ fill: '#EFF5F1' }}
                      contentStyle={{ border: '1px solid #E3DECF', borderRadius: 10, fontSize: 12, background: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Model A (name-aware)" fill="#D9A441" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Model B (name-blind)" fill="#244B3B" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Disparate Impact Ratio" subtitle="Ratio of lowest to highest group shortlist rate (EEOC 4/5 rule)">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { model: 'Model A', ratio: +(fourFifthsA ?? 0).toFixed(3) },
                      { model: 'Model B', ratio: +(fourFifthsB ?? 0).toFixed(3) },
                    ]}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3DECF" horizontal={false} />
                    <XAxis type="number" domain={[0, 1.2]} tick={{ fontSize: 11, fill: '#6B7269' }} tickLine={false} axisLine={{ stroke: '#E3DECF' }} />
                    <YAxis type="category" dataKey="model" tick={{ fontSize: 12, fill: '#1C2321', fontWeight: 600 }} tickLine={false} axisLine={false} width={80} />
                    <Tooltip cursor={{ fill: '#EFF5F1' }} contentStyle={{ border: '1px solid #E3DECF', borderRadius: 10, fontSize: 12, background: '#fff' }} />
                    <ReferenceLine x={0.8} stroke="#B91C1C" strokeDasharray="4 4" label={{ value: '0.8 threshold', fill: '#B91C1C', fontSize: 11 }} />
                    <Bar dataKey="ratio" fill="#244B3B" radius={[0, 4, 4, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-600" /> Below 0.8 → potential disparate impact</span>
              </div>
            </Card>
          </div>

          <Card title="Per-Group Metrics" subtitle="Shortlist rates returned by the audit">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                    <th className="py-2.5 pr-4 font-semibold">Group</th>
                    <th className="py-2.5 pr-4 font-semibold">Model A rate</th>
                    <th className="py-2.5 pr-4 font-semibold">Model B rate</th>
                    <th className="py-2.5 font-semibold">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {data.metrics.map((m) => (
                    <tr key={m.group} className="border-b border-line/60 last:border-0">
                      <td className="py-2.5 pr-4 font-semibold text-ink">{m.group}</td>
                      <td className="py-2.5 pr-4 font-mono tabular-nums">{(m.model_a_shortlist_rate * 100).toFixed(1)}%</td>
                      <td className="py-2.5 pr-4 font-mono tabular-nums">{(m.model_b_shortlist_rate * 100).toFixed(1)}%</td>
                      <td className="py-2.5 font-mono tabular-nums text-muted">
                        {((m.model_a_shortlist_rate - m.model_b_shortlist_rate) * 100).toFixed(1)}pp
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {data.top_name_influences?.length > 0 && (
            <Card title="Top Discriminatory Name Tokens" subtitle="Name tokens with strongest learned coefficient in Model A">
              <div className="flex flex-wrap gap-2">
                {data.top_name_influences.map((t) => (
                  <span
                    key={t.word}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-1.5 font-mono text-xs"
                  >
                    <span className="font-semibold text-ink">{t.word}</span>
                    <span className={`tabular-nums ${t.coefficient >= 0 ? 'text-red-600' : 'text-forest-600'}`}>
                      {t.coefficient >= 0 ? '+' : ''}{t.coefficient.toFixed(3)}
                    </span>
                    <Badge tone="outline">{t.impact}</Badge>
                  </span>
                ))}
              </div>
            </Card>
          )}

          {data.audit_summary && (
            <Card title="Audit Summary">
              <p className="text-sm leading-relaxed text-ink">{data.audit_summary}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
