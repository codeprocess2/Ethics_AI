import { useState } from 'react'
import { explainResume, errorMessage } from '../api/client.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import FeatureWeightList from '../components/explain/FeatureWeightList.jsx'

export default function Explainability() {
  const [resumeText, setResumeText] = useState('')
  const [method, setMethod] = useState('lime')
  const [numFeatures, setNumFeatures] = useState(8)
  const [targetCategory, setTargetCategory] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await explainResume({
        resumeText: resumeText.trim(),
        method,
        numFeatures,
        targetCategory: targetCategory.trim() || undefined,
      })
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Explainability"
        description="Token-level LIME or SHAP attributions showing which resume features drove the classifier's decision."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Explanation Request" subtitle="Mirrors POST /explain" className="lg:col-span-2">
          <div className="space-y-4">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              placeholder="Paste resume text (min 10 chars)…"
              className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2.5 font-mono text-xs outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink">Method</span>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-400"
                >
                  <option value="lime">LIME</option>
                  <option value="shap">SHAP</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink">Top features (1–20)</span>
                <input
                  type="number" min={1} max={20} value={numFeatures}
                  onChange={(e) => setNumFeatures(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-400"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink">Target category <span className="font-normal text-muted">(optional)</span></span>
              <input
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                placeholder="Defaults to the predicted category"
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-400"
              />
            </label>
            <Button onClick={run} loading={loading} disabled={resumeText.trim().length < 10} className="w-full">
              Generate explanation
            </Button>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          {error && <Alert title="Explanation failed">{errorMessage(error)}</Alert>}
          {loading && <Card><Spinner label={method === 'shap' ? 'Computing SHAP values…' : 'Fitting LIME explainer…'} /></Card>}

          {!loading && !data && !error && (
            <Card>
              <div className="py-12 text-center text-sm text-muted">
                Submit a resume to see feature attributions.
              </div>
            </Card>
          )}

          {data && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl2 border border-line bg-white p-4 shadow-card">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted">Method</div>
                  <div className="mt-1 font-mono text-lg font-semibold uppercase text-ink">{data.method}</div>
                </div>
                <div className="rounded-xl2 border border-line bg-white p-4 shadow-card">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted">Target Category</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-forest-700">{data.target_category}</div>
                </div>
                <div className="rounded-xl2 border border-line bg-white p-4 shadow-card">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted">Predicted Probability</div>
                  <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-ink">
                    {(data.predicted_probability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <Card title="Feature Attributions" subtitle={`Top ${data.features?.length} features ranked by |weight|`}>
                <FeatureWeightList features={data.features || []} />
              </Card>

              {data.summary && (
                <Card title="Summary">
                  <p className="text-sm leading-relaxed text-ink">{data.summary}</p>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
