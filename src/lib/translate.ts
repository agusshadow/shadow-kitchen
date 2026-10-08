/**
 * La base de datos de recetas está en inglés. Este diccionario traduce los
 * ingredientes y platos más comunes para poder buscar en español.
 */
const ES_TO_EN: Record<string, string> = {
  pollo: 'chicken',
  carne: 'beef',
  vaca: 'beef',
  vacuna: 'beef',
  cerdo: 'pork',
  cordero: 'lamb',
  pescado: 'fish',
  salmon: 'salmon',
  atun: 'tuna',
  camaron: 'prawns',
  camarones: 'prawns',
  langostino: 'prawns',
  langostinos: 'prawns',
  huevo: 'egg',
  huevos: 'eggs',
  tomate: 'tomato',
  tomates: 'tomatoes',
  papa: 'potato',
  papas: 'potatoes',
  patata: 'potato',
  patatas: 'potatoes',
  arroz: 'rice',
  ajo: 'garlic',
  cebolla: 'onion',
  queso: 'cheese',
  leche: 'milk',
  manteca: 'butter',
  mantequilla: 'butter',
  harina: 'flour',
  azucar: 'sugar',
  chocolate: 'chocolate',
  limon: 'lemon',
  naranja: 'orange',
  manzana: 'apple',
  banana: 'banana',
  pasta: 'pasta',
  fideos: 'pasta',
  pan: 'bread',
  zanahoria: 'carrot',
  champinones: 'mushrooms',
  hongos: 'mushrooms',
  espinaca: 'spinach',
  espinacas: 'spinach',
  lentejas: 'lentils',
  garbanzos: 'chickpeas',
  tocino: 'bacon',
  panceta: 'bacon',
  crema: 'cream',
  frutilla: 'strawberries',
  frutillas: 'strawberries',
  coco: 'coconut',
  maiz: 'sweetcorn',
  sopa: 'soup',
  ensalada: 'salad',
  torta: 'cake',
  tarta: 'pie',
  postre: 'dessert',
  hamburguesa: 'burger',
  empanada: 'empanada',
}

/** Quita acentos y pasa a minúsculas para comparar sin importar cómo se escribió. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Traduce palabra por palabra lo que conoce y deja el resto como está. */
export function translateQuery(query: string): string {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ES_TO_EN[word] ?? word)
    .join(' ')
}

/** Los ingredientes de la API se filtran con guion bajo: "chicken breast" -> "chicken_breast". */
export function toIngredientKey(query: string): string {
  return translateQuery(query).replace(/\s+/g, '_')
}
