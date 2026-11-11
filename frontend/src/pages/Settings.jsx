import { useState } from 'react'
import { getBaseUrl, setBaseUrl } from '../api/client.js'
import { fetchHealth, errorMessage } from '../api/client.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'

export default function Settings() {
  const [baseUrl, setBaseUrlState] = useState(getBaseUrl())
  const [test, setTest] = useState({ state: 'idle', message: '' })

  const save = () => {
    setBaseUrl(baseUrl)
    setTest({ state: 'idle', message: 'Saved. Test the connection to confirm.' })
  }

  const testConnection = async () => {
    setTest({ state: 'testing', message: '' })
    try {
      const health = await fetchHealth()
      setTest({ state: 'ok', message: health.message || 'Backend reachable and healthy.' })
    } catch (err) {
      setTest({ state: 'fail', message: errorMessage(err) })
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Connection and workspace configuration." />

      <div className="max-w-2xl space-y-6">
        <Card title="API Connection" subtitle="Base URL used by all FairHire API calls">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink">Base URL</span>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrlState(e.target.value)}
                placeholder="/api"
                className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 font-mono text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
              />
              <p className="mt-1.5 text-xs text-muted">
                Default <code className="rounded bg-forest-50 px-1 py-0.5 font-mono">/api</code> is proxied to the FastAPI
                backend by the Vite dev server (see <code className="rounded bg-forest-50 px-1 py-0.5 font-mono">vite.config.js</code>).
                Set <code className="rounded bg-forest-50 px-1 py-0.5 font-mono">VITE_API_BASE_URL</code> for a direct backend URL.
              </p>
            </label>

            <div className="flex flex-wrap gap-2">
              <Button onClick={save}>Save</Button>
              <Button variant="secondary" onClick={testConnection} loading={test.state === 'testing'}>
                Test connection
              </Button>
            </div>

            {test.state === 'ok' && (
              <div className="flex items-center gap-2">
                <Alert variant="info">✓ {test.message}</Alert>
              </div>
            )}
            {test.state === 'fail' && <Alert title="Connection failed">{test.message}</Alert>}
          </div>
        </Card>

        <Card title="Backend Endpoints" subtitle="This frontend consumes the following FastAPI routes — no others">
          <ul className="space-y-2 font-mono text-xs">
            {[
              ['GET', '/health', 'Artifact & health verification'],
              ['POST', '/predict?top_k=', 'Resume category classification (file upload)'],
              ['POST', '/screen', 'Model A vs Model B with counterfactual name-swap'],
              ['POST', '/bias-audit', 'Fairness metrics over held-out qualified resumes'],
              ['POST', '/explain', 'LIME / SHAP token attributions'],
            ].map(([m, path, desc]) => (
              <li key={path} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
                <Badge tone={m === 'GET' ? 'outline' : 'green'}>{m}</Badge>
                <span className="font-semibold text-ink">{path}</span>
                <span className="ml-auto hidden text-muted sm:inline">{desc}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="About" subtitle="No fabricated metrics">
          <p className="text-sm leading-relaxed text-muted">
            FairHire renders only values returned by the backend. Loading, error and empty states are shown for every
            request, and the Fairness Audit must be triggered explicitly so all reported metrics come from the actual
            paired counterfactual evaluation.
          </p>
        </Card>
      </div>
    </div>
  )
}
