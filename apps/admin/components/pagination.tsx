import { Button, cn } from '@rio-negro/ui'
import { ChevronLeft, ChevronRight } from '@rio-negro/ui/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { pageCount, paginationItems, showingLabel } from '@/lib/domain/leads'

type PaginationProps = { page: number; total: number; href: (page: number) => string }

function Arrow({
  page,
  enabled,
  href,
  label,
  children,
}: {
  page: number
  enabled: boolean
  href: PaginationProps['href']
  label: string
  children: ReactNode
}) {
  if (!enabled) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        disabled
        aria-label={label}
        className="disabled:bg-transparent disabled:text-text-muted"
      >
        {children}
      </Button>
    )
  }
  return (
    <Button asChild variant="ghost" size="icon-sm">
      <Link href={href(page)} aria-label={label}>
        {children}
      </Link>
    </Button>
  )
}

// Spec 05, UI · Leads: 10 por página com "Mostrando X–Y de N". A página vai na URL (?pagina=).
export function Pagination({ page, total, href }: PaginationProps) {
  const totalPages = pageCount(total)

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <p className="text-xs text-text-muted">{showingLabel(page, total)}</p>
      <ul className="flex items-center gap-1">
        <li>
          <Arrow page={page - 1} enabled={page > 1} href={href} label="Página anterior">
            <ChevronLeft aria-hidden className="size-4" />
          </Arrow>
        </li>
        {paginationItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-xs text-text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                asChild
                variant={item === page ? 'primary' : 'ghost'}
                size="icon-sm"
                className={cn(item !== page && 'font-normal')}
              >
                <Link href={href(item)} aria-current={item === page ? 'page' : undefined}>
                  <span className="sr-only">Página </span>
                  {item}
                </Link>
              </Button>
            </li>
          ),
        )}
        <li>
          <Arrow page={page + 1} enabled={page < totalPages} href={href} label="Próxima página">
            <ChevronRight aria-hidden className="size-4" />
          </Arrow>
        </li>
      </ul>
    </nav>
  )
}
