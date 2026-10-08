/** Datos mínimos para mostrar una receta en una grilla o lista. */
export interface MealSummary {
  id: string
  name: string
  thumb: string
}

export interface Ingredient {
  name: string
  measure: string
}

export interface Meal extends MealSummary {
  category: string | null
  area: string | null
  tags: string[]
  /** Pasos de preparación, uno por elemento. */
  steps: string[]
  ingredients: Ingredient[]
  youtube: string | null
  source: string | null
}

export interface Category {
  id: string
  name: string
  thumb: string
  description: string
}

export interface ShoppingItem {
  /** Identificador estable: el nombre del ingrediente en minúsculas. */
  id: string
  name: string
  /** Cantidades acumuladas, una por receta ("2 cups", "1 tbs"). */
  measures: string[]
  /** Recetas de las que viene el ingrediente. */
  from: string[]
  done: boolean
}
