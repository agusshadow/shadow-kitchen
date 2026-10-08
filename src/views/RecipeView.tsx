import { ArrowLeft, Check, Heart, ListPlus, PlayCircle, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { getMeal } from '../api/mealdb'
import { Chip, EmptyState, ErrorBox } from '../components/ui'
import { goBack, paths } from '../lib/router'
import { ingredientImage } from '../lib/meals'
import { useAsync } from '../lib/useAsync'
import { useFavorites, useShopping } from '../store/stores'

export function RecipeView({ id }: { id: string }) {
  const { data: meal, loading, error, retry } = useAsync(id, (signal) => getMeal(id, signal))
  const { isFavorite, toggle } = useFavorites()
  const shopping = useShopping()
  const [added, setAdded] = useState(false)

  const back = (
    <button type="button" className="clay-btn soft self-start" onClick={() => goBack()}>
      <ArrowLeft size={18} aria-hidden="true" /> Volver
    </button>
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando receta">
        {back}
        <div className="skeleton aspect-[4/3] rounded-[22px]" />
        <div className="skeleton h-7 w-3/4 rounded-full" />
        <div className="skeleton h-24 rounded-[22px]" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <ErrorBox message={error.message} onRetry={retry} />
      </div>
    )
  }
  if (!meal) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <EmptyState title="No encontramos esa receta" action={<a href={paths.home} className="clay-btn">Ir al inicio</a>}>
          Puede que ya no exista. Probá buscando otra.
        </EmptyState>
      </div>
    )
  }

  const fav = isFavorite(meal.id)

  function addToList() {
    if (!meal) return
    shopping.addRecipe(meal.ingredients, meal.name)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <article className="flex flex-col gap-5">
      {back}

      <img
        src={`${meal.thumb}/medium`}
        alt={meal.name}
        width={700}
        height={525}
        className="aspect-[4/3] w-full rounded-[22px] border-[3px] border-border bg-muted object-cover"
      />

      <header className="space-y-3">
        <h1 className="text-3xl text-primary">{meal.name}</h1>
        <div className="flex flex-wrap gap-2">
          {meal.category && <Chip>{meal.category}</Chip>}
          {meal.area && <Chip tone="green">{meal.area}</Chip>}
          {meal.tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggle(meal)}
            aria-pressed={fav}
            className={`clay-btn ${fav ? '' : 'soft'}`}
          >
            <Heart size={20} aria-hidden="true" fill={fav ? 'currentColor' : 'none'} />
            {fav ? 'En favoritos' : 'Guardar'}
          </button>
          <button type="button" onClick={addToList} className="clay-btn accent">
            {added ? <Check size={20} aria-hidden="true" /> : <ListPlus size={20} aria-hidden="true" />}
            {added ? 'Agregado a la lista' : 'Agregar a la lista'}
          </button>
        </div>
        <p role="status" className="sr-only">
          {added ? 'Ingredientes agregados a la lista de compras' : ''}
        </p>
      </header>

      <section aria-labelledby="ing-title" className="clay-card p-4">
        <h2 id="ing-title" className="mb-3 text-xl">
          Ingredientes
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {meal.ingredients.map((ing) => (
            <li key={ing.name} className="flex items-center gap-3 rounded-2xl bg-muted p-2">
              <img
                src={ingredientImage(ing.name)}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                className="size-10 shrink-0 object-contain"
                onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
              />
              <span className="min-w-0">
                <span className="block leading-tight">{ing.name}</span>
                {ing.measure && <span className="text-sm text-muted-foreground">{ing.measure}</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title" className="clay-card p-4">
        <h2 id="steps-title" className="mb-3 text-xl">
          Preparación
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">Las instrucciones están en inglés.</p>
        <ol className="space-y-3">
          {meal.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm text-white" aria-hidden="true">
                {i + 1}
              </span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {(meal.youtube || meal.source) && (
        <div className="flex flex-wrap gap-2">
          {meal.youtube && (
            <a href={meal.youtube} target="_blank" rel="noopener noreferrer" className="clay-btn soft">
              <PlayCircle size={20} aria-hidden="true" /> Ver el video
            </a>
          )}
          {meal.source && (
            <a href={meal.source} target="_blank" rel="noopener noreferrer" className="clay-btn ghost">
              <ExternalLink size={18} aria-hidden="true" /> Fuente original
            </a>
          )}
        </div>
      )}
    </article>
  )
}
