import type { ReactNode } from 'react'

export function ChefBadge({ className = 'size-12' }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-primary-soft ${className}`}>
      <img src="/chef.svg" alt="" width={32} height={32} className="size-3/4" style={{ imageRendering: 'pixelated' }} />
    </span>
  )
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="clay-card p-5 text-center">
      <p className="mb-3">{message}</p>
      <button type="button" className="clay-btn" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="clay-card flex flex-col items-center gap-3 p-6 text-center">
      <ChefBadge className="size-16" />
      <h2 className="text-xl">{title}</h2>
      {children && <p className="max-w-sm text-muted-foreground">{children}</p>}
      {action}
    </div>
  )
}

export function Chip({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'green' }) {
  const colors = tone === 'green' ? 'bg-accent-soft text-accent-dark' : 'bg-primary-soft text-primary'
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${colors}`}>{children}</span>
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3" aria-busy="true" aria-label="Cargando recetas">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="clay-card overflow-hidden">
          <div className="skeleton aspect-square" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-4 w-4/5 rounded-full" />
            <div className="skeleton h-4 w-2/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
