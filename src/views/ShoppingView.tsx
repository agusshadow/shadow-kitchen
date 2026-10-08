import { MessageCircle, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../components/ui'
import { paths } from '../lib/router'
import { shoppingText } from '../lib/shopping'
import { useShopping } from '../store/stores'

export function ShoppingView() {
  const { items, toggle, remove, clearDone, clearAll } = useShopping()
  const [confirmingClear, setConfirmingClear] = useState(false)

  const done = items.filter((i) => i.done).length
  const text = shoppingText(items)
  const shareUrl = text ? `https://wa.me/?text=${encodeURIComponent(text)}` : null

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-primary">Lista de compras</h1>

      {items.length === 0 ? (
        <EmptyState
          title="Tu lista está vacía"
          action={
            <a href={paths.home} className="clay-btn">
              Buscar recetas
            </a>
          }
        >
          Abrí una receta y tocá «Agregar a la lista» para sumar todos sus ingredientes.
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {items.length - done} por comprar · {done} en el carrito
          </p>

          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="clay-card flex items-center gap-2 p-2 pr-1">
                <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 px-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggle(item.id)}
                    className="size-6 shrink-0 accent-[var(--accent)]"
                  />
                  <span className="min-w-0">
                    <span className={`block leading-tight ${item.done ? 'text-muted-foreground line-through' : ''}`}>{item.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {item.measures.length > 0 && `${item.measures.join(' + ')} · `}
                      {item.from.join(', ')}
                    </span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Quitar ${item.name}`}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            {shareUrl && (
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="clay-btn accent">
                <MessageCircle size={20} aria-hidden="true" /> Enviar por WhatsApp
              </a>
            )}
            {done > 0 && (
              <button type="button" className="clay-btn soft" onClick={clearDone}>
                Quitar comprados
              </button>
            )}
            <button type="button" className="clay-btn ghost" onClick={() => setConfirmingClear(true)}>
              <Trash2 size={18} aria-hidden="true" /> Vaciar lista
            </button>
          </div>

          {confirmingClear && (
            <div role="alertdialog" aria-labelledby="clear-title" className="clay-card border-danger p-4">
              <p id="clear-title" className="mb-3">
                ¿Vaciar toda la lista de compras?
              </p>
              <div className="flex gap-2">
                <button type="button" className="clay-btn ghost" onClick={() => setConfirmingClear(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="clay-btn"
                  style={{ background: 'var(--danger)', borderBottomColor: '#7f1d1d' }}
                  onClick={() => {
                    clearAll()
                    setConfirmingClear(false)
                  }}
                >
                  Sí, vaciar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
