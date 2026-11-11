export default function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`rounded-xl2 border border-line bg-white shadow-card ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
