'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type MouseEvent } from 'react'
import { hasPreviousPage, recordVisit, type VisitHistory } from '@/lib/domain/visit-history'

// PUB-016 · As rotas desta visita ficam em memória, neste módulo: um carregamento completo da página
// recomeça do zero, e nada vai para localStorage, sessionStorage ou cookie.
let visits: VisitHistory = []
let traversal = false

/** Acompanha as mudanças de rota. Fica no layout raiz, que não desmonta na navegação. */
export function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const markTraversal = () => {
      traversal = true
    }
    window.addEventListener('popstate', markTraversal)
    return () => window.removeEventListener('popstate', markTraversal)
  }, [])

  useEffect(() => {
    visits = recordVisit(visits, pathname, traversal)
    traversal = false
  }, [pathname])

  return null
}

type Props = { fallback: '/' | '/artigos'; className: string }

/**
 * "Voltar" do cabeçalho: um link para o nível acima (`fallback`), que funciona sem JavaScript. Com
 * JavaScript, se a pessoa já navegou dentro do blog nesta visita, o clique volta à tela anterior.
 */
export function BackLink({ fallback, className }: Props) {
  const router = useRouter()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Ctrl/Cmd/Shift/Alt + clique seguem o link normal (nova aba, nova janela, download).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!hasPreviousPage(visits)) return
    event.preventDefault()
    router.back()
  }

  return (
    <Link
      href={fallback}
      aria-label="Voltar para a página anterior"
      className={className}
      onClick={handleClick}
    >
      Voltar
    </Link>
  )
}
