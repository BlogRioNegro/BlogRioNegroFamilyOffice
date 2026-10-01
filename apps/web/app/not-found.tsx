import { Button } from '@rio-negro/ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ErrorState } from '@/components/error-state'

export const metadata: Metadata = { title: 'Página não encontrada' }

export default function NotFound() {
  return (
    <ErrorState
      label="Erro 404"
      title="Página não encontrada"
      text="O endereço pode ter mudado ou o conteúdo não está mais disponível."
    >
      <Button asChild className="w-full md:w-auto">
        <Link href="/artigos">Ver todos os artigos</Link>
      </Button>
    </ErrorState>
  )
}
