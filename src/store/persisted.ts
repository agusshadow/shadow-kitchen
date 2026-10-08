import { useSyncExternalStore } from 'react'

/**
 * Estado global mínimo guardado en localStorage. Se comparte entre pantallas
 * y se mantiene sincronizado entre pestañas.
 */
export function createPersistedStore<T>(key: string, initial: T, validate: (value: unknown) => T | null) {
  let state: T = read()
  const listeners = new Set<() => void>()

  function read(): T {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initial
      return validate(JSON.parse(raw)) ?? initial
    } catch {
      return initial
    }
  }

  function emit() {
    listeners.forEach((l) => l())
  }

  function set(next: T) {
    state = next
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // sin localStorage la app sigue funcionando, pero no guarda los datos
    }
    emit()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === key) {
        state = read()
        emit()
      }
    })
  }

  return {
    get: () => state,
    set,
    update: (fn: (current: T) => T) => set(fn(state)),
    use: (): T =>
      useSyncExternalStore(
        (cb) => {
          listeners.add(cb)
          return () => listeners.delete(cb)
        },
        () => state,
        () => initial,
      ),
  }
}
