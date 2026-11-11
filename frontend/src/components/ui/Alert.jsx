export default function Alert({ variant = 'error', title, children }) {
  const styles =
    variant === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : variant === 'info'
        ? 'border-forest-200 bg-forest-50 text-forest-800'
        : 'border-amber-200 bg-amber-soft text-amber-800'
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`} role="alert">
      {title && <div className="font-semibold">{title}</div>}
      <div className="mt-0.5 break-words">{children}</div>
    </div>
  )
}
