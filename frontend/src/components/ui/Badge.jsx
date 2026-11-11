const TONES = {
  neutral: 'bg-forest-50 text-forest-700',
  green: 'bg-forest-700 text-paper',
  amber: 'bg-amber-soft text-amber-700 border border-amber-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  outline: 'border border-line text-muted',
}

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  )
}
