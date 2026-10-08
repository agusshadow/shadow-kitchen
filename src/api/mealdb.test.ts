import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMeal, searchByName } from './mealdb'

afterEach(() => vi.restoreAllMocks())

const okJson = (body: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)

describe('mealdb', () => {
  it('cancelar a un llamador no cuelga a otro que comparte el mismo pedido', async () => {
    let resolveFetch!: (r: Response) => void
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise<Response>((resolve) => (resolveFetch = resolve)),
    )

    const first = new AbortController()
    const a = getMeal('777', first.signal)
    const second = new AbortController()
    const b = getMeal('777', second.signal)

    first.abort() // como hace StrictMode al desmontar el primer efecto
    await expect(a).rejects.toMatchObject({ name: 'AbortError' })

    resolveFetch({ ok: true, json: () => Promise.resolve({ meals: [{ idMeal: '777', strMeal: 'Test' }] }) } as Response)
    await expect(b).resolves.toMatchObject({ id: '777', name: 'Test' })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('traduce la búsqueda y cae al texto original si no hay resultados', async () => {
    const calls: string[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      calls.push(decodeURIComponent(url.split('s=')[1]))
      return okJson({ meals: url.endsWith('s=zzz') ? [{ idMeal: '1', strMeal: 'Zzz', strMealThumb: 't' }] : null })
    })
    const result = await searchByName('zzz')
    expect(result).toEqual([{ id: '1', name: 'Zzz', thumb: 't' }])
    expect(calls).toEqual(['zzz'])
  })

  it('devuelve un error legible si la red falla y permite reintentar', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('network'))
    await expect(getMeal('888')).rejects.toMatchObject({ name: 'ApiError' })
    spy.mockImplementationOnce(() => okJson({ meals: [{ idMeal: '888', strMeal: 'Ok' }] }))
    await expect(getMeal('888')).resolves.toMatchObject({ name: 'Ok' })
  })
})
