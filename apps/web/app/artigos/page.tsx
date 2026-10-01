import type { Metadata } from 'next'
import { ArticleCard } from '@/components/article-card'
import { FeaturedArticleCard } from '@/components/featured-article-card'
import { LoadMoreButton } from '@/components/load-more-button'
import { getFeaturedArticle } from '@/lib/domain/featured-article'
import { FEATURED_RANGE, lotRange, parsePage, splitLot } from '@/lib/domain/listing'
import { listArticles, toArticleCard } from '@/lib/services/articles'

export const metadata: Metadata = {
  title: 'Artigos',
}

// PUB-002 a PUB-004 · Destaque no topo e, abaixo, o lote `?page=N` em coluna única, sem repetir
// o destaque. O "Carregar mais" anexa os lotes seguintes.
export default async function ArticlesPage({ searchParams }: PageProps<'/artigos'>) {
  const page = parsePage((await searchParams).page)
  const [head, lotRows] = await Promise.all([
    listArticles(FEATURED_RANGE),
    listArticles(lotRange(page)),
  ])
  const featured = getFeaturedArticle(head)
  const { articles, hasMore } = splitLot(lotRows)

  return (
    <main className="mx-auto flex w-full max-w-(--layout-reading) flex-1 flex-col gap-6 px-4 pt-8 pb-16 md:gap-8 md:px-0 md:pt-16 md:pb-24">
      <h1 className="text-3xl font-bold md:text-4xl">Artigos</h1>
      {featured ? (
        <>
          <FeaturedArticleCard article={toArticleCard(featured)} />
          {articles.length > 0 ? (
            <div className="flex flex-col gap-4 md:gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={toArticleCard(article)} />
              ))}
              {hasMore ? <LoadMoreButton nextPage={page + 1} /> : null}
            </div>
          ) : null}
        </>
      ) : (
        <p className="rounded-card border border-border bg-surface px-4 py-12 text-center text-text-muted shadow-card">
          Nenhum artigo publicado ainda
        </p>
      )}
    </main>
  )
}
