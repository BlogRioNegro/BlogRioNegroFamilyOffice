'use client'

import { Button, FieldMessage } from '@rio-negro/ui'
import { RotateCcw } from '@rio-negro/ui/icons'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { loadMoreArticles } from '@/app/artigos/actions'
import type { ArticleCardData } from '@/lib/services/articles'
import { ArticleCard } from './article-card'

// PUB-004 · Sem JS é o link /artigos?page=N; com JS, o clique anexa o próximo lote aqui mesmo.
// Os cards anexados entram no mesmo contêiner da lista, logo depois dos que vieram do server.
export function LoadMoreButton({ nextPage }: { nextPage: number }) {
  const [appended, setAppended] = useState<ArticleCardData[]>([])
  const [page, setPage] = useState<number | null>(nextPage)
  const [failed, setFailed] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [loading, startLoading] = useTransition()

  function load(requested: number) {
    setFailed(false)
    setAnnouncement('Carregando mais artigos')
    startLoading(async () => {
      const result = await loadMoreArticles(requested).catch(() => null)
      if (!result?.ok) {
        setFailed(true)
        setAnnouncement('')
        return
      }
      setAppended((current) => [...current, ...result.data.articles])
      setPage(result.data.nextPage)
      setAnnouncement(`${result.data.articles.length} artigos carregados`)
    })
  }

  return (
    <>
      {appended.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
      <div className="flex flex-col items-center gap-2 pt-2 md:pt-6">
        {page === null ? null : loading ? (
          <Button variant="secondary" loading className="min-w-60">
            Carregando…
          </Button>
        ) : failed ? (
          <Button variant="secondary" className="min-w-60" onClick={() => load(page)}>
            <RotateCcw aria-hidden className="size-5" />
            Tentar novamente
          </Button>
        ) : (
          <Button asChild variant="secondary" className="min-w-60">
            <Link
              href={`/artigos?page=${page}`}
              scroll={false}
              onClick={(event) => {
                // Ctrl/Cmd/Shift + clique continuam abrindo o link em outra aba.
                if (event.metaKey || event.ctrlKey || event.shiftKey) return
                event.preventDefault()
                load(page)
              }}
            >
              Carregar mais
            </Link>
          </Button>
        )}
        {failed ? (
          <FieldMessage variant="error" role="alert">
            Não foi possível carregar mais artigos.
          </FieldMessage>
        ) : null}
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </>
  )
}
