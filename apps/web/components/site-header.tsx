import Link from 'next/link'
import { BackLink } from './back-link'
import { Logo } from './logo'

const NAV_ITEM_CLASSES =
  'py-2 text-sm font-regular text-link uppercase underline-offset-6 hover:underline'

// PUB-016 · Na home (sem `back`) o item do menu é "Artigos". Nas outras páginas ele dá lugar ao
// "Voltar", e `back` é o destino de reserva: o nível acima da página.
export function SiteHeader({ back }: { back?: '/' | '/artigos' }) {
  return (
    <header className="border-b border-border bg-surface-muted">
      <div className="mx-auto flex h-16 max-w-(--layout-admin) items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" aria-label="Rio Negro Family Office, página inicial" className="flex">
          <Logo alt="" />
        </Link>
        <nav aria-label="Principal" className="flex gap-6">
          {back ? (
            <BackLink
              fallback={back}
              className={`inline-flex min-h-(--control-height) items-center ${NAV_ITEM_CLASSES}`}
            />
          ) : (
            <Link href="/artigos" className={NAV_ITEM_CLASSES}>
              Artigos
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
