import Link from 'next/link'
import { Logo } from './logo'

export function SiteHeader({ current }: { current?: 'artigos' }) {
  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-(--layout-admin) items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" aria-label="Rio Negro Investimentos, página inicial" className="flex">
          <Logo alt="" />
        </Link>
        <nav aria-label="Principal" className="flex gap-6">
          <Link
            href="/artigos"
            aria-current={current === 'artigos' ? 'page' : undefined}
            className="py-2 text-sm font-medium underline-offset-6 hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2"
          >
            Artigos
          </Link>
        </nav>
      </div>
    </header>
  )
}
