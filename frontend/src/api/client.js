import axios from 'axios'

/**
 * Base URL resolution:
 *  - Default: '/api' (proxied by Vite dev server to the FastAPI backend)
 *  - Overridable at runtime from Settings (persisted to localStorage)
 */
const STORAGE_KEY = 'fairhire.api.baseUrl'

export function getBaseUrl() {
  return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_API_BASE_URL || '/api'
}

export function setBaseUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/$/, ''))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

const api = axios.create({ timeout: 120000 })

api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl()
  return config
})

export default api

/* ------------------------------------------------------------------ */
/* Contract mirrors the OpenAPI spec exactly.                          */
/* ------------------------------------------------------------------ */

/** GET /health */
export async function fetchHealth() {
  const { data } = await api.get('/health')
  return data // HealthResponse
}

/**
 * POST /predict?top_k={k}
 * multipart: file
 */
export async function predictResume(file, topK = 5) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/predict', form, {
    params: { top_k: topK },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data // PredictResponse
}

/**
 * POST /screen
 * Accepts multipart (file / resume_text / applicant_name / counterfactual_name / json_request)
 * or a pure JSON body matching ScreenRequest when no file is involved.
 */
export async function screenResume({ file, resumeText, applicantName, counterfactualName }) {
  if (file) {
    const form = new FormData()
    form.append('file', file)
    form.append('applicant_name', applicantName || 'Michael Smith')
    if (counterfactualName) form.append('counterfactual_name', counterfactualName)
    const { data } = await api.post('/screen', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data // ScreenResponse
  }
  const { data } = await api.post('/screen', {
    resume_text: resumeText,
    applicant_name: applicantName || 'Michael Smith',
    counterfactual_name: counterfactualName || null,
  })
  return data // ScreenResponse
}

/** POST /bias-audit (no body) */
export async function runBiasAudit() {
  const { data } = await api.post('/bias-audit')
  return data // BiasAuditResponse
}

/**
 * POST /explain  (ExplainRequest)
 * body: { resume_text, method: 'lime'|'shap', num_features, target_category? }
 */
export async function explainResume({ resumeText, method = 'lime', numFeatures = 8, targetCategory }) {
  const { data } = await api.post('/explain', {
    resume_text: resumeText,
    method,
    num_features: numFeatures,
    target_category: targetCategory || null,
  })
  return data // ExplainResponse
}

/** Normalize an axios error into a friendly message string. */
export function errorMessage(err) {
  if (!err) return 'Unknown error'
  if (err.response) {
    const detail = err.response.data?.detail
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join('; ')
    }
    if (typeof detail === 'string') return detail
    return `Request failed with status ${err.response.status}`
  }
  if (err.code === 'ECONNABORTED') return 'Request timed out. The model may still be processing.'
  if (err.request) return 'Could not reach the backend. Check the API base URL in Settings.'
  return err.message || 'Unknown error'
}
