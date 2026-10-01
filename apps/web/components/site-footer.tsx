import { Button } from '@rio-negro/ui'
import { ArrowRight } from '@rio-negro/ui/icons'
import Link from 'next/link'
import { env } from '@/lib/env'
import { Logo } from './logo'

// PUB-013 · Cópia exata do rodapé de rionegromfo.com.br (2026-10-01). Não editar à mão.
const RIGHTS_NOTICE = '2024 RIO NEGRO FAMILY OFFICE • TODOS OS DIREITOS RESERVADOS'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto flex max-w-(--layout-admin) flex-col gap-8 px-4 pt-12 pb-8 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo alt="Rio Negro Family Office" />
          <Button asChild variant="link">
            <a href={env.NEXT_PUBLIC_RIO_NEGRO_URL} target="_blank" rel="noopener noreferrer">
              Conheça a Rio Negro Family Office
              <ArrowRight aria-hidden className="size-4" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4 text-xs text-text-muted">
          <span>{RIGHTS_NOTICE}</span>
          <Link
            href="/privacidade"
            className="text-link underline underline-offset-3 hover:decoration-2"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
