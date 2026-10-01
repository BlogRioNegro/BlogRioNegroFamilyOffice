'use client'

import { Button } from '@rio-negro/ui'
import Link from 'next/link'
import { ErrorState } from '@/components/error-state'

// PUB-015 · SEC-008: nada do erro (mensagem, digest, stack) é mostrado; o server já logou.
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      title="Algo deu errado"
      text="Não foi possível carregar esta página agora. Tente novamente em instantes."
    >
      <Button className="w-full md:w-auto" onClick={reset}>
        Tentar novamente
      </Button>
      <Button asChild variant="link">
        <Link href="/artigos">Ver artigos</Link>
      </Button>
    </ErrorState>
  )
}
