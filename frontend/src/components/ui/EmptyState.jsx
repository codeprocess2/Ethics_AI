export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-paper px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path d="M9 13h6M9 17h4" strokeLinecap="round" />
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
          <path d="M14 3v5h5" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mt-3 text-sm font-semibold text-ink">{title}</div>
      {description && <div className="mt-1 max-w-sm text-xs text-muted">{description}</div>}
    </div>
  )
}
