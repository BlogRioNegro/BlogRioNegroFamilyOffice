// PUB-002 · ADR 0004: o destaque é o artigo com published_at mais recente; empate por
// created_at desc e, por último, id desc, para que o resultado não dependa da ordem de entrada.

type Dated = { id: string; published_at: string; created_at: string }

function isMoreRecent(a: Dated, b: Dated): boolean {
  const byPublished = Date.parse(a.published_at) - Date.parse(b.published_at)
  if (byPublished !== 0) return byPublished > 0

  const byCreated = Date.parse(a.created_at) - Date.parse(b.created_at)
  if (byCreated !== 0) return byCreated > 0

  return a.id > b.id
}

export function getFeaturedArticle<T extends Dated>(articles: readonly T[]): T | null {
  return articles.reduce<T | null>(
    (featured, article) => (featured && !isMoreRecent(article, featured) ? featured : article),
    null,
  )
}
