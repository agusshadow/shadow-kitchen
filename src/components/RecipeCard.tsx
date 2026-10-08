import { Heart } from 'lucide-react'
import { paths } from '../lib/router'
import type { MealSummary } from '../lib/types'
import { useFavorites } from '../store/stores'

export function RecipeCard({ meal }: { meal: MealSummary }) {
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(meal.id)

  return (
    <li className="clay-card relative overflow-hidden">
      <a href={paths.recipe(meal.id)} className="block">
        <img
          src={`${meal.thumb}/small`}
          alt=""
          loading="lazy"
          width={300}
          height={300}
          className="aspect-square w-full bg-muted object-cover"
        />
        <span className="block p-3 font-display text-base leading-snug">{meal.name}</span>
      </a>
      <button
        type="button"
        onClick={() => toggle(meal)}
        aria-pressed={fav}
        aria-label={fav ? `Quitar ${meal.name} de favoritos` : `Guardar ${meal.name} en favoritos`}
        className="absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-full border-[3px] border-border bg-card text-primary"
      >
        <Heart size={20} aria-hidden="true" fill={fav ? 'currentColor' : 'none'} className={fav ? 'pop' : ''} />
      </button>
    </li>
  )
}

export function RecipeGrid({ meals }: { meals: MealSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {meals.map((m) => (
        <RecipeCard key={m.id} meal={m} />
      ))}
    </ul>
  )
}
