import { Link } from 'react-router-dom'
import { fetchHealth, errorMessage } from '../api/client.js'
import { useAsync } from '../hooks/useAsync.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Stat from '../components/ui/Stat.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'

export default function Dashboard() {
  const { data, error, loading, run } = useAsync(fetchHealth, { auto: true })

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="System health, loaded model artifacts and pipeline overview."
        actions={<Button variant="secondary" onClick={() => run()} loading={loading}>Refresh</Button>}
      />

      {error && (
        <Alert title="Could not reach the backend">
          {errorMessage(error)} — verify the API base URL in <Link to="/settings" className="font-semibold underline">Settings</Link>.
        </Alert>
      )}

      {loading && !data && <Spinner label="Checking backend health…" />}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Backend Status" value={data.status} tone={data.status === 'healthy' ? 'good' : 'warn'} />
            <Stat
              label="Artifacts Loaded"
              value={`${Object.values(data.artifacts_status || {}).filter(Boolean).length}/${Object.keys(data.artifacts_status || {}).length}`}
              hint="Model artifacts reported healthy"
            />
            <Stat label="API Version" value={data.model_metadata?.version || '—'} hint="Model metadata" />
            <Stat label="Classifier" value="Linear SVM" hint="TF-IDF resume categories" />
          </div>

          <Card title="Model Artifacts" subtitle="Artifact load state reported by /health">
            {Object.keys(data.artifacts_status || {}).length === 0 ? (
              <p className="text-sm text-muted">No artifact status reported.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(data.artifacts_status).map(([name, ok]) => (
                  <div key={name} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                    <span className="font-mono text-xs font-medium text-ink">{name}</span>
                    <Badge tone={ok ? 'green' : 'red'}>{ok ? 'Loaded' : 'Missing'}</Badge>
                  </div>
                ))}
              </div>
            )}
            {data.message && (
              <p className="mt-4 text-xs text-muted">{data.message}</p>
            )}
          </Card>

          <Card title="Model Metadata" subtitle="Additional metadata returned by the backend">
            <pre className="scrollbar-thin max-h-72 overflow-auto rounded-lg bg-paper p-4 font-mono text-xs text-ink">
              {JSON.stringify(data.model_metadata || {}, null, 2)}
            </pre>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <FlowCard
              to="/screening"
              step="01"
              title="Resume Screening"
              body="Upload a resume to get Model A / Model B scores plus an instant counterfactual name-swap test."
            />
            <FlowCard
              to="/audit"
              step="02"
              title="Fairness Audit"
              body="Run paired counterfactual audits: shortlist rates, demographic gap and disparate impact per group."
            />
            <FlowCard
              to="/explain"
              step="03"
              title="Explainability"
              body="Inspect LIME / SHAP token attributions that drove the classifier's category decision."
            />
          </div>
        </div>
      )}
    </div>
  )
}

function FlowCard({ to, step, title, body }) {
  return (
    <Link
      to={to}
      className="group rounded-xl2 border border-line bg-white p-5 shadow-card transition-colors hover:border-forest-300 hover:bg-forest-50/40"
    >
      <div className="font-mono text-xs font-semibold text-forest-600">{step}</div>
      <div className="mt-2 text-sm font-semibold text-ink group-hover:text-forest-700">{title}</div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{body}</p>
    </Link>
  )
}
