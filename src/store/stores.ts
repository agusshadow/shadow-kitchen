import { addIngredients, clearDone, removeItem, toggleItem } from '../lib/shopping'
import type { Ingredient, MealSummary, ShoppingItem } from '../lib/types'
import { createPersistedStore } from './persisted'

const isString = (v: unknown): v is string => typeof v === 'string'

const favoritesStore = createPersistedStore<MealSummary[]>('shadow-kitchen:favorites', [], (value) => {
  if (!Array.isArray(value)) return null
  return value.filter(
    (v): v is MealSummary => !!v && isString(v.id) && isString(v.name) && isString(v.thumb),
  )
})

const shoppingStore = createPersistedStore<ShoppingItem[]>('shadow-kitchen:shopping', [], (value) => {
  if (!Array.isArray(value)) return null
  return value.filter(
    (v): v is ShoppingItem =>
      !!v &&
      isString(v.id) &&
      isString(v.name) &&
      Array.isArray(v.measures) &&
      Array.isArray(v.from) &&
      typeof v.done === 'boolean',
  )
})

export function useFavorites() {
  const favorites = favoritesStore.use()
  return {
    favorites,
    isFavorite: (id: string) => favorites.some((f) => f.id === id),
    toggle: (meal: MealSummary) =>
      favoritesStore.update((list) =>
        list.some((f) => f.id === meal.id)
          ? list.filter((f) => f.id !== meal.id)
          : [{ id: meal.id, name: meal.name, thumb: meal.thumb }, ...list],
      ),
  }
}

export function useShopping() {
  const items = shoppingStore.use()
  return {
    items,
    pending: items.filter((i) => !i.done).length,
    addRecipe: (ingredients: Ingredient[], recipeName: string) =>
      shoppingStore.update((list) => addIngredients(list, ingredients, recipeName)),
    toggle: (id: string) => shoppingStore.update((list) => toggleItem(list, id)),
    remove: (id: string) => shoppingStore.update((list) => removeItem(list, id)),
    clearDone: () => shoppingStore.update((list) => clearDone(list)),
    clearAll: () => shoppingStore.set([]),
  }
}
