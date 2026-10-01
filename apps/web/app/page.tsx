import { Button } from '@rio-negro/ui'
import { ArrowRight } from '@rio-negro/ui/icons'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

// PUB-001 · Hero fixo no código, sem consulta ao banco.
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-(--layout-admin) flex-1 px-4 py-16 md:px-6 md:py-24">
        <div className="flex max-w-(--layout-reading) flex-col items-start gap-6">
          <h1 className="text-3xl font-bold text-balance md:text-4xl">
            Análises sobre investimentos, escritas pela equipe da Rio Negro.
          </h1>
          <p className="text-md leading-normal text-text-muted md:max-w-[60ch] md:text-lg">
            Artigos e estudos para ajudar você a entender o mercado e decidir com mais informação.
          </p>
          <Button asChild className="w-full md:w-auto">
            <Link href="/artigos">
              Ver artigos
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </Button>
        </div>
      </main>
    </>
  )
}
