export default function Button({ variant = 'primary', loading = false, className = '', children, disabled, ...rest }) {
  const variants = {
    primary:
      'bg-forest-700 text-paper hover:bg-forest-600 active:bg-forest-800 disabled:bg-forest-300',
    secondary:
      'border border-line bg-white text-ink hover:border-forest-300 hover:bg-forest-50 disabled:opacity-50',
    danger:
      'border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:opacity-50',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  )
}
