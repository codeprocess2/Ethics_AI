import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/screening', label: 'Resume Screening', icon: IconScreen },
  { to: '/comparison', label: 'Model Comparison', icon: IconCompare },
  { to: '/audit', label: 'Fairness Audit', icon: IconAudit },
  { to: '/explain', label: 'Explainability', icon: IconExplain },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-700 font-mono text-sm font-bold text-paper">
            F
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight text-ink">FairHire</div>
            <div className="text-[11px] font-medium text-muted">Ethical Screening</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-700 text-paper'
                    : 'text-muted hover:bg-forest-50 hover:text-ink'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <div className="rounded-lg bg-paper px-3 py-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Models
            </div>
            <div className="mt-1.5 space-y-1 text-[12px] font-medium text-ink">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />
                Model A · Name-aware
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-forest-700" />
                Model B · Name-blind
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                TF-IDF + Linear SVM
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

/* --- minimal inline SVG icons (stroke-based, Linear-style) --- */
const base = 'h-[18px] w-[18px] stroke-current'
function IconDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className={base} {...props}>
      <rect x="3" y="3" width="8" height="10" rx="1.5" />
      <rect x="13" y="3" width="8" height="6" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="15" width="8" height="6" rx="1.5" />
    </svg>
  )
}
function IconScreen(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className={base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
      <path d="M14 3v5h5" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4" strokeLinecap="round" />
    </svg>
  )
}
function IconCompare(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className={base} {...props}>
      <path d="M8 3v18M16 3v18M3 8h5M3 16h5M16 8h5M16 16h5" strokeLinecap="round" />
    </svg>
  )
}
function IconAudit(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className={base} {...props}>
      <path d="M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconExplain(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className={base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v.01M12 11v5" strokeLinecap="round" />
    </svg>
  )
}
function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className={base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06A2 2 0 1 1 7.07 4.2l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"
        strokeLinejoin="round"
      />
    </svg>
  )
}
