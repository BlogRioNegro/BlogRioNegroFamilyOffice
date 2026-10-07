// PUB-010 · PUB-012 · Título do artigo numa linha só, para <title>, Open Graph e RSS: com subtítulo,
// "Título: Subtítulo". Na página e nos cards o subtítulo sai numa segunda linha (ADR 0048).

type TitledArticle = { title: string; subtitle: string | null }

export function articleFullTitle(article: TitledArticle): string {
  const subtitle = article.subtitle?.trim()
  return subtitle ? `${article.title}: ${subtitle}` : article.title
}
