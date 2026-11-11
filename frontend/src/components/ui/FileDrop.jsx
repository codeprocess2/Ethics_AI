import { useRef, useState } from 'react'

const ACCEPT = '.pdf,.docx,.txt'

export default function FileDrop({ file, onFile, compact = false }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  const content = file ? (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-forest-200 bg-forest-50 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0 text-forest-600">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
          <path d="M14 3v5h5" strokeLinejoin="round" />
        </svg>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">{file.name}</div>
          <div className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onFile(null)}
        className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>
  ) : (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 text-center transition-colors ${
        compact ? 'py-4' : 'py-10'
      } ${dragging ? 'border-forest-500 bg-forest-50' : 'border-line bg-paper hover:border-forest-300 hover:bg-forest-50'}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7 text-forest-500">
        <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
      </svg>
      {!compact && (
        <>
          <div className="mt-3 text-sm font-semibold text-ink">Drop a resume here, or click to browse</div>
          <div className="mt-1 text-xs text-muted">PDF, DOCX or TXT · processed locally by your backend</div>
        </>
      )}
    </div>
  )

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
      {content}
    </div>
  )
}
