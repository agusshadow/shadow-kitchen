import { ChefHat, Heart, ShoppingBasket } from 'lucide-react'
import { useEffect } from 'react'
import { ChefBadge } from './components/ui'
import { paths, useRoute, type Route } from './lib/router'
import { useShopping } from './store/stores'
import { FavoritesView } from './views/FavoritesView'
import { HomeView } from './views/HomeView'
import { RecipeView } from './views/RecipeView'
import { ShoppingView } from './views/ShoppingView'

function NavItem({ href, label, active, children, badge }: { href: string; label: string; active: boolean; children: React.ReactNode; badge?: number }) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 font-display text-xs ${
        active ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      <span className={`flex h-8 w-14 items-center justify-center rounded-full ${active ? 'bg-primary-soft' : ''}`}>{children}</span>
      {label}
      {badge ? (
        <span
          aria-label={`${badge} pendientes`}
          className="absolute top-1 left-1/2 ml-3 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-white"
        >
          {badge}
        </span>
      ) : null}
    </a>
  )
}

function View({ route }: { route: Route }) {
  switch (route.name) {
    case 'recipe':
      return <RecipeView key={route.id} id={route.id} />
    case 'favorites':
      return <FavoritesView />
    case 'shopping':
      return <ShoppingView />
    default:
      return <HomeView />
  }
}

export default function App() {
  const route = useRoute()
  const { pending } = useShopping()

  // Al cambiar de pantalla, volver arriba.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.name, route.name === 'recipe' ? route.id : ''])

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="flex items-center gap-2 px-4 pt-4">
        <ChefBadge className="size-10" />
        <a href={paths.home} className="font-display text-xl text-primary">
          Shadow Kitchen
        </a>
      </header>

      <main className="flex-1 px-4 pt-4 pb-28">
        <View route={route} />
      </main>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-border bg-card pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto flex max-w-2xl">
          <NavItem href={paths.home} label="Inicio" active={route.name === 'home' || route.name === 'recipe'}>
            <ChefHat size={22} aria-hidden="true" />
          </NavItem>
          <NavItem href={paths.favorites} label="Favoritas" active={route.name === 'favorites'}>
            <Heart size={22} aria-hidden="true" />
          </NavItem>
          <NavItem href={paths.shopping} label="Compras" active={route.name === 'shopping'} badge={pending}>
            <ShoppingBasket size={22} aria-hidden="true" />
          </NavItem>
        </div>
      </nav>
    </div>
  )
}
