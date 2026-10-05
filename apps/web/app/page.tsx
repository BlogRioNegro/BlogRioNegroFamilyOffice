import { Button } from '@rio-negro/ui'
import { ArrowRight } from '@rio-negro/ui/icons'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

// PUB-001 · Hero fixo no código, sem consulta ao banco. Ocupa a altura que sobra entre o header e
// o rodapé; os anéis são decoração (aria-hidden), sem texto novo.
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex flex-1 items-center overflow-hidden bg-linear-to-b from-bg to-surface-muted">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -right-60 hidden size-180 -translate-y-1/2 md:block"
        >
          <div className="absolute inset-0 rounded-full border border-border" />
          <div className="absolute inset-25 rounded-full border border-border" />
          <div className="absolute inset-50 rounded-full border border-border" />
        </div>
        <div className="relative mx-auto w-full max-w-(--layout-admin) px-4 py-16 md:px-6 md:py-24">
          <div className="flex flex-col items-start gap-8">
            <h1 className="max-w-[20ch] font-serif font-extralight text-3xl text-balance wrap-anywhere uppercase md:text-5xl">
              Artigos, estudos e perspectivas da nossa equipe de consultores e especialistas.
            </h1>
            <Button asChild className="w-full md:w-auto">
              <Link href="/artigos">
                Ver artigos
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
