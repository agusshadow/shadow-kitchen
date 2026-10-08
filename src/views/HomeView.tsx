import { Dices, Search, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { filterByCategory, listCategories, randomMeal, searchByIngredient, searchByName } from '../api/mealdb'
import { ChefBadge, EmptyState, ErrorBox, GridSkeleton } from '../components/ui'
import { RecipeGrid } from '../components/RecipeCard'
import { paths } from '../lib/router'
import { useAsync } from '../lib/useAsync'

type Mode = 'name' | 'ingredient'
type Query = { kind: 'name' | 'ingredient' | 'category'; value: string }

const QUICK_INGREDIENTS = ['Pollo', 'Huevo', 'Papa', 'Arroz', 'Tomate', 'Salmón']

/** Se conserva al ir a una receta y volver, para no perder la búsqueda. */
let memory: { mode: Mode; text: string; query: Query | null } = { mode: 'name', text: '', query: null }

const MODE_LABEL: Record<Mode, string> = { name: 'Nombre', ingredient: 'Ingrediente' }

export function HomeView() {
  const [mode, setModeState] = useState<Mode>(memory.mode)
  const [text, setTextState] = useState(memory.text)
  const [query, setQueryState] = useState<Query | null>(memory.query)
  const [surpriseError, setSurpriseError] = useState<string | null>(null)
  const [surprising, setSurprising] = useState(false)

  const setMode = (m: Mode) => {
    memory.mode = m
    setModeState(m)
  }
  const setText = (t: string) => {
    memory.text = t
    setTextState(t)
  }
  const setQuery = (q: Query | null) => {
    memory.query = q
    setQueryState(q)
  }

  const categories = useAsync('categories', (signal) => listCategories(signal))
  const results = useAsync(query ? `${query.kind}:${query.value}` : null, (signal) => {
    if (!query) return Promise.resolve([])
    if (query.kind === 'category') return filterByCategory(query.value, signal)
    if (query.kind === 'ingredient') return searchByIngredient(query.value, signal)
    return searchByName(query.value, signal)
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setQuery({ kind: mode, value })
  }

  function quickIngredient(name: string) {
    setMode('ingredient')
    setText(name)
    setQuery({ kind: 'ingredient', value: name })
  }

  function clear() {
    setText('')
    setQuery(null)
  }

  async function surprise() {
    setSurprising(true)
    setSurpriseError(null)
    try {
      const meal = await randomMeal()
      if (meal) window.location.hash = paths.recipe(meal.id)
    } catch {
      setSurpriseError('No pudimos traer una receta al azar. Intentá de nuevo.')
    } finally {
      setSurprising(false)
    }
  }

  const heading = query
    ? query.kind === 'category'
      ? `Categoría: ${query.value}`
      : `Resultados para «${query.value}»`
    : null

  return (
    <div className="space-y-5">
      <section className="clay-card flex items-center gap-3 bg-primary-soft p-4" aria-labelledby="hero-title">
        <ChefBadge className="size-16" />
        <div>
          <h1 id="hero-title" className="text-2xl text-primary">
            ¿Qué cocinamos hoy?
          </h1>
          <p className="text-sm text-muted-foreground">Buscá, guardá tus favoritas y armá la lista de compras.</p>
        </div>
      </section>

      <form onSubmit={submit} role="search" className="space-y-3">
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">Buscar por</legend>
          {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
            <label
              key={m}
              className={`flex min-h-11 items-center justify-center rounded-2xl border-[3px] font-display text-sm ${
                mode === m ? 'border-primary bg-primary text-white' : 'border-border-strong bg-card text-primary'
              }`}
            >
              <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="sr-only" />
              {MODE_LABEL[m]}
            </label>
          ))}
        </fieldset>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="q" className="sr-only">
              {mode === 'name' ? 'Nombre de la receta' : 'Ingrediente'}
            </label>
            <input
              id="q"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'name' ? 'Ej: pasta, tiramisu' : 'Ej: pollo, tomate'}
              autoComplete="off"
              enterKeyHint="search"
              className="min-h-12 w-full rounded-2xl border-[3px] border-border-strong bg-card px-4"
            />
          </div>
          <button type="submit" className="clay-btn" disabled={!text.trim()} aria-label="Buscar">
            <Search size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Las recetas están en inglés. Podés escribir en español: traducimos los ingredientes más comunes.
        </p>
      </form>

      {!query && (
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_INGREDIENTS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => quickIngredient(name)}
              className="min-h-11 rounded-full border-[3px] border-border-strong bg-card px-4 font-display text-sm text-primary"
            >
              {name}
            </button>
          ))}
          <button type="button" className="clay-btn accent" onClick={surprise} disabled={surprising}>
            <Dices size={20} aria-hidden="true" /> {surprising ? 'Buscando…' : 'Sorprendeme'}
          </button>
        </div>
      )}
      {surpriseError && (
        <p role="alert" className="text-danger">
          {surpriseError}
        </p>
      )}

      {query ? (
        <section aria-labelledby="results-title" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 id="results-title" className="text-xl">
              {heading}
            </h2>
            <button type="button" className="clay-btn soft" onClick={clear}>
              <X size={18} aria-hidden="true" /> Limpiar
            </button>
          </div>
          {results.loading && <GridSkeleton />}
          {results.error && <ErrorBox message={results.error.message} onRetry={results.retry} />}
          {!results.loading && !results.error && results.data && results.data.length === 0 && (
            <EmptyState title="No encontramos recetas">
              Probá con otra palabra{query.kind === 'ingredient' ? ' o con el ingrediente en inglés (por ejemplo, «chicken»)' : ''}.
            </EmptyState>
          )}
          {!results.loading && !results.error && results.data && results.data.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {results.data.length} {results.data.length === 1 ? 'receta' : 'recetas'}
              </p>
              <RecipeGrid meals={results.data} />
            </>
          )}
        </section>
      ) : (
        <section aria-labelledby="cats-title" className="space-y-3">
          <h2 id="cats-title" className="text-xl">
            Explorá por categoría
          </h2>
          {categories.loading && <GridSkeleton count={4} />}
          {categories.error && <ErrorBox message={categories.error.message} onRetry={categories.retry} />}
          {categories.data && (
            <ul className="grid grid-cols-2 gap-3">
              {categories.data.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setQuery({ kind: 'category', value: c.name })}
                    className="clay-card flex w-full flex-col items-center gap-1 bg-card p-3"
                  >
                    <img src={c.thumb} alt="" loading="lazy" width={96} height={96} className="size-20 object-contain" />
                    <span className="font-display">{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
