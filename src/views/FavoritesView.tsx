import { EmptyState } from '../components/ui'
import { RecipeGrid } from '../components/RecipeCard'
import { paths } from '../lib/router'
import { useFavorites } from '../store/stores'

export function FavoritesView() {
  const { favorites } = useFavorites()

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-primary">Tus favoritas</h1>
      {favorites.length === 0 ? (
        <EmptyState
          title="Todavía no guardaste recetas"
          action={
            <a href={paths.home} className="clay-btn">
              Buscar recetas
            </a>
          }
        >
          Tocá el corazón en cualquier receta y la vas a encontrar acá, incluso sin conexión.
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'receta guardada' : 'recetas guardadas'}
          </p>
          <RecipeGrid meals={favorites} />
        </>
      )}
    </div>
  )
}
