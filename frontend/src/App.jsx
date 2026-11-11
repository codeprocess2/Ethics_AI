import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Screening from './pages/Screening.jsx'
import ModelComparison from './pages/ModelComparison.jsx'
import FairnessAudit from './pages/FairnessAudit.jsx'
import Explainability from './pages/Explainability.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/screening" element={<Screening />} />
        <Route path="/comparison" element={<ModelComparison />} />
        <Route path="/audit" element={<FairnessAudit />} />
        <Route path="/explain" element={<Explainability />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  )
}
