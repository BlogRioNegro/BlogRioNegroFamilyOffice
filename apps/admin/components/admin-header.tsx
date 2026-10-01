import Link from 'next/link'
import { logout } from '@/app/auth-actions'
import { Logo } from './logo'

const LINK_CLASSES =
  'py-2 text-sm font-medium underline-offset-6 hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2'

const NAV = [
  { key: 'artigos', label: 'Artigos', href: '/artigos' },
  { key: 'leads', label: 'Leads', href: '/leads' },
] as const

export function AdminHeader({ current }: { current: (typeof NAV)[number]['key'] }) {
  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-(--layout-admin) items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/artigos" aria-label="Rio Negro Investimentos, painel" className="flex">
          <Logo alt="" />
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={current === item.key ? 'page' : undefined}
              className={LINK_CLASSES}
            >
              {item.label}
            </Link>
          ))}
          <form action={logout}>
            <button type="submit" className={LINK_CLASSES}>
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
