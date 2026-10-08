import { useCallback, useEffect, useRef, useState } from 'react'

interface State<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

/**
 * Ejecuta una función asíncrona cuando cambia `key`. Cancela el pedido anterior
 * y permite reintentar. Con `key` null no hace nada.
 */
export function useAsync<T>(key: string | null, run: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: key !== null })
  const [attempt, setAttempt] = useState(0)
  const runRef = useRef(run)
  runRef.current = run

  useEffect(() => {
    if (key === null) {
      setState({ data: null, error: null, loading: false })
      return
    }
    const controller = new AbortController()
    setState((s) => ({ data: s.data, error: null, loading: true }))
    runRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false })
      })
      .catch((error: Error) => {
        if (controller.signal.aborted || error.name === 'AbortError') return
        setState({ data: null, error, loading: false })
      })
    return () => controller.abort()
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}
