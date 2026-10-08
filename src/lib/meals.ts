import type { Category, Ingredient, Meal, MealSummary } from './types'

/** Respuesta cruda de TheMealDB: casi todos los campos son strings o null. */
export type RawMeal = Record<string, string | null | undefined>

const clean = (value: string | null | undefined): string => (value ?? '').trim()

export function parseSummary(raw: RawMeal): MealSummary {
  return { id: clean(raw.idMeal), name: clean(raw.strMeal), thumb: clean(raw.strMealThumb) }
}

/** La API devuelve hasta 20 pares strIngredientN / strMeasureN, con vacíos al final. */
export function parseIngredients(raw: RawMeal): Ingredient[] {
  const list: Ingredient[] = []
  for (let i = 1; i <= 20; i++) {
    const name = clean(raw[`strIngredient${i}`])
    if (!name) continue
    list.push({ name, measure: clean(raw[`strMeasure${i}`]) })
  }
  return list
}

/**
 * Convierte el texto de preparación en pasos. Maneja saltos de línea, títulos
 * tipo "STEP 1" y numeración ("1.", "2)"). Si todo viene en un solo párrafo
 * largo, lo corta por oraciones.
 */
export function parseSteps(instructions: string | null | undefined): string[] {
  const text = clean(instructions)
  if (!text) return []

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    // Títulos sueltos como "STEP 1" o "Step 2:"
    .filter((l) => !/^step\s*\d+[:.)-]?$/i.test(l))
    // Numeración al inicio: "1. ", "2) ", "3 - "
    .map((l) => l.replace(/^\d+\s*[.):-]\s*/, '').replace(/^step\s*\d+\s*[:.)-]\s*/i, ''))
    .filter(Boolean)

  if (lines.length === 1 && lines[0].length > 280) {
    return lines[0].split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean)
  }
  return lines
}

export function parseTags(raw: RawMeal): string[] {
  return clean(raw.strTags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function parseMeal(raw: RawMeal): Meal {
  return {
    ...parseSummary(raw),
    category: clean(raw.strCategory) || null,
    area: clean(raw.strArea) || null,
    tags: parseTags(raw),
    steps: parseSteps(raw.strInstructions),
    ingredients: parseIngredients(raw),
    youtube: clean(raw.strYoutube) || null,
    source: clean(raw.strSource) || null,
  }
}

export function parseCategory(raw: RawMeal): Category {
  return {
    id: clean(raw.idCategory),
    name: clean(raw.strCategory),
    thumb: clean(raw.strCategoryThumb),
    description: clean(raw.strCategoryDescription),
  }
}

export function ingredientImage(name: string): string {
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}-small.png`
}
