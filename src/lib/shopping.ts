import type { Ingredient, ShoppingItem } from './types'

const idOf = (name: string) => name.trim().toLowerCase()

/**
 * Suma los ingredientes de una receta a la lista. Si el ingrediente ya estaba,
 * agrega la cantidad y la receta en vez de duplicarlo (y lo vuelve a marcar
 * como pendiente: hay que comprar más).
 */
export function addIngredients(list: ShoppingItem[], ingredients: Ingredient[], recipeName: string): ShoppingItem[] {
  const next = list.map((item) => ({ ...item, measures: [...item.measures], from: [...item.from] }))
  for (const ing of ingredients) {
    const id = idOf(ing.name)
    if (!id) continue
    const existing = next.find((item) => item.id === id)
    if (existing) {
      if (ing.measure && !existing.measures.includes(ing.measure)) existing.measures.push(ing.measure)
      if (!existing.from.includes(recipeName)) existing.from.push(recipeName)
      existing.done = false
    } else {
      next.push({
        id,
        name: ing.name,
        measures: ing.measure ? [ing.measure] : [],
        from: [recipeName],
        done: false,
      })
    }
  }
  return next
}

export function toggleItem(list: ShoppingItem[], id: string): ShoppingItem[] {
  return list.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
}

export function removeItem(list: ShoppingItem[], id: string): ShoppingItem[] {
  return list.filter((item) => item.id !== id)
}

export function clearDone(list: ShoppingItem[]): ShoppingItem[] {
  return list.filter((item) => !item.done)
}

/** Texto listo para compartir (WhatsApp, notas): pendientes primero. */
export function shoppingText(list: ShoppingItem[]): string {
  const pending = list.filter((i) => !i.done)
  if (pending.length === 0) return ''
  const lines = pending.map((i) => `• ${i.name}${i.measures.length ? ` (${i.measures.join(' + ')})` : ''}`)
  return ['*Lista de compras - Shadow Kitchen*', '', ...lines].join('\n')
}
