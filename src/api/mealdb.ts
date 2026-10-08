import { parseCategory, parseMeal, parseSummary, type RawMeal } from '../lib/meals'
import { toIngredientKey, translateQuery } from '../lib/translate'
import type { Category, Meal, MealSummary } from '../lib/types'

/**
 * TheMealDB, clave pública de prueba "1" (sin registro). La página indica que
 * es para desarrollo y uso educativo.
 */
const BASE = 'https://www.themealdb.com/api/json/v1/1'

export class ApiError extends Error {
  constructor(message = 'No pudimos conectar con el servidor de recetas. Revisá tu conexión e intentá de nuevo.') {
    super(message)
    this.name = 'ApiError'
  }
}

const cache = new Map<string, Promise<unknown>>()

/**
 * El pedido compartido (cacheado) no se cancela por un solo llamador: si lo
 * hiciera, otro que espera el mismo resultado quedaría colgado. La señal solo
 * corta la espera de quien la pasó.
 */
function withSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'))
    if (signal.aborted) return abort()
    signal.addEventListener('abort', abort, { once: true })
    promise.then(
      (value) => {
        signal.removeEventListener('abort', abort)
        resolve(value)
      },
      (error) => {
        signal.removeEventListener('abort', abort)
        reject(error)
      },
    )
  })
}

async function fetchJson<T>(url: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new ApiError()
  }
  if (!res.ok) throw new ApiError()
  try {
    return (await res.json()) as T
  } catch {
    throw new ApiError()
  }
}

function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${BASE}/${path}`
  let promise = cache.get(url) as Promise<T> | undefined
  if (!promise) {
    promise = fetchJson<T>(url)
    cache.set(url, promise)
    // Si falla, no dejamos el error guardado: el próximo intento vuelve a pedirlo.
    promise.catch(() => cache.delete(url))
  }
  return withSignal(promise, signal)
}

interface MealsResponse {
  meals: RawMeal[] | null
}

const enc = encodeURIComponent

/** Busca por nombre. Prueba primero con la traducción y, si no hay resultados, con lo que escribió. */
export async function searchByName(query: string, signal?: AbortSignal): Promise<MealSummary[]> {
  const original = query.trim()
  if (!original) return []
  const translated = translateQuery(original)

  const first = await request<MealsResponse>(`search.php?s=${enc(translated)}`, signal)
  let meals = first.meals
  if ((!meals || meals.length === 0) && translated !== original) {
    meals = (await request<MealsResponse>(`search.php?s=${enc(original)}`, signal)).meals
  }
  return (meals ?? []).map(parseSummary)
}

export async function searchByIngredient(query: string, signal?: AbortSignal): Promise<MealSummary[]> {
  const key = toIngredientKey(query)
  if (!key) return []
  const data = await request<MealsResponse>(`filter.php?i=${enc(key)}`, signal)
  return (data.meals ?? []).map(parseSummary)
}

export async function listCategories(signal?: AbortSignal): Promise<Category[]> {
  const data = await request<{ categories: RawMeal[] | null }>('categories.php', signal)
  return (data.categories ?? []).map(parseCategory)
}

export async function filterByCategory(category: string, signal?: AbortSignal): Promise<MealSummary[]> {
  const data = await request<MealsResponse>(`filter.php?c=${enc(category)}`, signal)
  return (data.meals ?? []).map(parseSummary)
}

export async function getMeal(id: string, signal?: AbortSignal): Promise<Meal | null> {
  const data = await request<MealsResponse>(`lookup.php?i=${enc(id)}`, signal)
  const raw = data.meals?.[0]
  return raw ? parseMeal(raw) : null
}

/** Receta al azar: no se cachea, para que cada pedido traiga una distinta. */
export async function randomMeal(signal?: AbortSignal): Promise<Meal | null> {
  const data = await withSignal(fetchJson<MealsResponse>(`${BASE}/random.php`), signal)
  const raw = data.meals?.[0]
  return raw ? parseMeal(raw) : null
}
