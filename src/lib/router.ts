import { useSyncExternalStore } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'recipe'; id: string }
  | { name: 'favorites' }
  | { name: 'shopping' }

/** Convierte el hash de la URL ("#/receta/52772") en una ruta. */
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\//, '')
  const [first, second] = path.split('/')
  if (first === 'receta' && second) return { name: 'recipe', id: decodeURIComponent(second) }
  if (first === 'favoritos') return { name: 'favorites' }
  if (first === 'compras') return { name: 'shopping' }
  return { name: 'home' }
}

export const paths = {
  home: '#/',
  recipe: (id: string) => `#/receta/${encodeURIComponent(id)}`,
  favorites: '#/favoritos',
  shopping: '#/compras',
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '')
  return parseRoute(hash)
}

let hasNavigated = false
if (typeof window !== 'undefined') window.addEventListener('hashchange', () => (hasNavigated = true))

export function goBack(fallback: string = paths.home) {
  // Si ya navegó dentro de la app, volvemos atrás; si abrió un link directo, vamos al inicio.
  if (hasNavigated) window.history.back()
  else window.location.hash = fallback
}
