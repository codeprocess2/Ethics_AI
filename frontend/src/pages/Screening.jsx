import { useState } from 'react'
import { predictResume, screenResume, errorMessage } from '../api/client.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import FileDrop from '../components/ui/FileDrop.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import ModelDecisionCard from '../components/screening/ModelDecisionCard.jsx'
import CounterfactualPanel from '../components/screening/CounterfactualPanel.jsx'

export default function Screening() {
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [applicantName, setApplicantName] = useState('Michael Smith')
  const [counterfactualName, setCounterfactualName] = useState('Jennifer Smith')
  const [topK, setTopK] = useState(5)

  const [predictState, setPredictState] = useState({ loading: false, error: null, data: null })
  const [screenState, setScreenState] = useState({ loading: false, error: null, data: null })

  const canRun = file || resumeText.trim().length >= 10

  const runPredict = async () => {
    if (!file) return
    setPredictState({ loading: true, error: null, data: null })
    try {
      const data = await predictResume(file, topK)
      setPredictState({ loading: false, error: null, data })
    } catch (err) {
      setPredictState({ loading: false, error: err, data: null })
    }
  }

  const runScreen = async () => {
    setScreenState({ loading: true, error: null, data: null })
    try {
      const data = await screenResume({
        file,
        resumeText: resumeText.trim() || undefined,
        applicantName: applicantName.trim() || 'Michael Smith',
        counterfactualName: counterfactualName.trim() || undefined,
      })
      setScreenState({ loading: false, error: null, data })
    } catch (err) {
      setScreenState({ loading: false, error: err, data: null })
    }
  }

  return (
    <div>
      <PageHeader
        title="Resume Screening"
        description="Classify a resume, then compare the name-aware Model A against the name-blind Model B with counterfactual testing."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ---------- Input column ---------- */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Candidate Input" subtitle="Upload a document or paste raw resume text">
            <div className="space-y-4">
              <FileDrop file={file} onFile={(f) => { setFile(f); setPredictState((s) => ({ ...s, data: null })) }} />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">or paste text</span>
                <div className="h-px flex-1 bg-line" />
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={7}
                placeholder="Paste resume text here (at least 10 characters)…"
                className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2.5 font-mono text-xs text-ink outline-none placeholder:text-muted/70 focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink">Applicant name (Model A)</span>
                  <input
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink">Counterfactual name</span>
                  <input
                    value={counterfactualName}
                    onChange={(e) => setCounterfactualName(e.target.value)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={runScreen} loading={screenState.loading} disabled={!canRun}>
                  Screen with Model A & B
                </Button>
                <Button variant="secondary" onClick={runPredict} loading={predictState.loading} disabled={!file}>
                  Classify category (Linear SVM)
                </Button>
              </div>
              {(!file && resumeText.trim().length > 0 && resumeText.trim().length < 10) && (
                <p className="text-xs text-amber-700">Resume text must be at least 10 characters.</p>
              )}
            </div>
          </Card>
        </div>

        {/* ---------- Results column ---------- */}
        <div className="space-y-6 lg:col-span-3">
          {screenState.error && <Alert title="Screening failed">{errorMessage(screenState.error)}</Alert>}
          {predictState.error && <Alert title="Classification failed">{errorMessage(predictState.error)}</Alert>}

          {screenState.loading && <Card><Spinner label="Running both models and counterfactual test…" /></Card>}
          {predictState.loading && !screenState.loading && <Card><Spinner label="Classifying resume…" /></Card>}

          {!screenState.loading && !screenState.data && !predictState.loading && !predictState.data && (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
                    <path d="M14 3v5h5" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mt-3 text-sm font-semibold text-ink">No results yet</div>
                <p className="mt-1 max-w-sm text-xs text-muted">
                  Provide a resume above and run screening or classification. Results appear here — nothing is fabricated.
                </p>
              </div>
            </Card>
          )}

          {screenState.data && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <ModelDecisionCard title="Model A · Name-aware" decision={screenState.data.model_a_biased} tone="amber" />
                <ModelDecisionCard title="Model B · Name-blind" decision={screenState.data.model_b_fair} tone="green" />
              </div>
              {screenState.data.counterfactual && (
                <CounterfactualPanel comparison={screenState.data.counterfactual} applicantName={screenState.data.applicant_name} />
              )}
              {screenState.data.note && (
                <Card><p className="text-xs leading-relaxed text-muted">{screenState.data.note}</p></Card>
              )}
            </>
          )}

          {predictState.data && (
            <Card
              title="Category Classification"
              subtitle={predictState.data.filename ? `Source file: ${predictState.data.filename}` : undefined}
              actions={<Badge tone="green">{predictState.data.predicted_category}</Badge>}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MiniStat label="Characters" value={predictState.data.character_count} />
                  <MiniStat label="After cleaning" value={predictState.data.cleaned_character_count} />
                  <MiniStat label="Confidence" value={`${(predictState.data.confidence * 100).toFixed(1)}%`} />
                  <MiniStat label="Top K" value={predictState.data.top_categories?.length ?? topK} />
                </div>
                <div className="space-y-3">
                  {predictState.data.top_categories?.map((c) => (
                    <ProgressBar key={c.category} label={c.category} value={c.probability} />
                  ))}
                </div>
                {predictState.data.cleaned_text_preview && (
                  <div>
                    <div className="mb-1 text-xs font-semibold text-muted">Cleaned text preview</div>
                    <p className="line-clamp-4 rounded-lg bg-paper p-3 font-mono text-[11px] text-ink/80">
                      {predictState.data.cleaned_text_preview}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-paper px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-ink">{value ?? '—'}</div>
    </div>
  )
}
