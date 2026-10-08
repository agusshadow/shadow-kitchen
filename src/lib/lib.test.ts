import { describe, expect, it } from 'vitest'
import { parseIngredients, parseMeal, parseSteps } from './meals'
import { addIngredients, clearDone, removeItem, shoppingText, toggleItem } from './shopping'
import { normalize, toIngredientKey, translateQuery } from './translate'

describe('parseIngredients', () => {
  it('ignora los campos vacíos y recorta espacios', () => {
    const raw = {
      strIngredient1: ' Penne ',
      strMeasure1: '1 pound ',
      strIngredient2: 'Garlic',
      strMeasure2: '3 cloves',
      strIngredient3: '',
      strMeasure3: ' ',
      strIngredient4: null,
    }
    expect(parseIngredients(raw)).toEqual([
      { name: 'Penne', measure: '1 pound' },
      { name: 'Garlic', measure: '3 cloves' },
    ])
  })

  it('acepta un ingrediente sin cantidad', () => {
    expect(parseIngredients({ strIngredient1: 'Salt', strMeasure1: '' })).toEqual([{ name: 'Salt', measure: '' }])
  })
})

describe('parseSteps', () => {
  it('separa por líneas y descarta títulos STEP', () => {
    const text = 'STEP 1\r\nBoil water.\r\nSTEP 2\r\nAdd pasta.\r\n\r\nSTEP 3\r\nServe.'
    expect(parseSteps(text)).toEqual(['Boil water.', 'Add pasta.', 'Serve.'])
  })

  it('quita la numeración del inicio', () => {
    expect(parseSteps('1. Chop onions.\n2) Fry them.\n3 - Eat.')).toEqual(['Chop onions.', 'Fry them.', 'Eat.'])
  })

  it('corta por oraciones un párrafo largo', () => {
    const long = Array.from({ length: 12 }, (_, i) => `Do thing number ${i + 1} carefully.`).join(' ')
    const steps = parseSteps(long)
    expect(steps.length).toBe(12)
    expect(steps[0]).toBe('Do thing number 1 carefully.')
  })

  it('devuelve vacío sin texto', () => {
    expect(parseSteps(null)).toEqual([])
    expect(parseSteps('   ')).toEqual([])
  })
})

describe('parseMeal', () => {
  it('arma la receta completa', () => {
    const meal = parseMeal({
      idMeal: '1',
      strMeal: 'Arrabiata',
      strMealThumb: 'http://x/y.jpg',
      strCategory: 'Pasta',
      strArea: 'Italian',
      strTags: 'Pasta,Curry',
      strInstructions: 'Cook.\nServe.',
      strIngredient1: 'Penne',
      strMeasure1: '1 pound',
      strYoutube: '',
    })
    expect(meal).toMatchObject({ id: '1', name: 'Arrabiata', category: 'Pasta', area: 'Italian', youtube: null })
    expect(meal.tags).toEqual(['Pasta', 'Curry'])
    expect(meal.steps).toHaveLength(2)
    expect(meal.ingredients).toHaveLength(1)
  })
})

describe('translate', () => {
  it('normaliza acentos y mayúsculas', () => {
    expect(normalize('  Limón ')).toBe('limon')
  })
  it('traduce lo que conoce y deja el resto', () => {
    expect(translateQuery('Pollo con limón')).toBe('chicken con lemon')
    expect(translateQuery('tiramisu')).toBe('tiramisu')
  })
  it('arma la clave de ingrediente con guion bajo', () => {
    expect(toIngredientKey('Pollo')).toBe('chicken')
    expect(toIngredientKey('chicken breast')).toBe('chicken_breast')
  })
})

describe('lista de compras', () => {
  const pasta = [
    { name: 'Penne', measure: '1 pound' },
    { name: 'Garlic', measure: '3 cloves' },
  ]

  it('agrega ingredientes de una receta', () => {
    const list = addIngredients([], pasta, 'Arrabiata')
    expect(list).toHaveLength(2)
    expect(list[0]).toMatchObject({ id: 'penne', measures: ['1 pound'], from: ['Arrabiata'], done: false })
  })

  it('no duplica: junta cantidades y recetas, y vuelve a marcar como pendiente', () => {
    let list = addIngredients([], pasta, 'Arrabiata')
    list = toggleItem(list, 'garlic')
    list = addIngredients(list, [{ name: 'garlic', measure: '2 cloves' }], 'Pollo al ajo')
    const garlic = list.find((i) => i.id === 'garlic')!
    expect(list).toHaveLength(2)
    expect(garlic.measures).toEqual(['3 cloves', '2 cloves'])
    expect(garlic.from).toEqual(['Arrabiata', 'Pollo al ajo'])
    expect(garlic.done).toBe(false)
  })

  it('no repite una cantidad idéntica de la misma receta', () => {
    let list = addIngredients([], pasta, 'Arrabiata')
    list = addIngredients(list, pasta, 'Arrabiata')
    expect(list.find((i) => i.id === 'penne')!.measures).toEqual(['1 pound'])
  })

  it('no modifica la lista original', () => {
    const original = addIngredients([], pasta, 'Arrabiata')
    addIngredients(original, [{ name: 'Penne', measure: '2 pounds' }], 'Otra')
    expect(original[0].measures).toEqual(['1 pound'])
  })

  it('marca, quita y limpia comprados', () => {
    let list = addIngredients([], pasta, 'Arrabiata')
    list = toggleItem(list, 'penne')
    expect(list.find((i) => i.id === 'penne')!.done).toBe(true)
    expect(clearDone(list).map((i) => i.id)).toEqual(['garlic'])
    expect(removeItem(list, 'garlic').map((i) => i.id)).toEqual(['penne'])
  })

  it('arma el texto para compartir solo con lo pendiente', () => {
    let list = addIngredients([], pasta, 'Arrabiata')
    list = toggleItem(list, 'penne')
    const text = shoppingText(list)
    expect(text).toContain('Garlic (3 cloves)')
    expect(text).not.toContain('Penne')
    expect(shoppingText(toggleItem(list, 'garlic'))).toBe('')
  })
})
