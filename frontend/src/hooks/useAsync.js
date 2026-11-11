import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic async state hook with loading / data / error states.
 * `auto` runs the fetcher immediately on mount.
 */
export function useAsync(fetcher, { auto = false, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(auto)
  const mounted = useRef(true)

  const run = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetcher(...args)
        if (mounted.current) setData(result)
        return result
      } catch (err) {
        if (mounted.current) setError(err)
        throw err
      } finally {
        if (mounted.current) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetcher]
  )

  useEffect(() => {
    mounted.current = true
    if (auto) run()
    return () => {
      mounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, error, loading, run, setData }
}
