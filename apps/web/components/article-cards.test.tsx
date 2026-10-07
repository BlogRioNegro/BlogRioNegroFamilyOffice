import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ArticleCardData } from '@/lib/services/articles'
import { ArticleCard } from './article-card'
import { FeaturedArticleCard } from './featured-article-card'

// PUB-003 · O subtítulo sai num <p> logo abaixo do título do card (ADR 0048); sem ele, nada muda.

const ARTICLE: ArticleCardData = {
  slug: 'o-que-moveu-o-mercado',
  title: 'O que moveu o mercado',
  subtitle: null,
  coverUrl: 'https://cdn.example/covers/capa.png',
  publishedAt: '2026-09-25T12:00:00Z',
  dateLabel: '25 set. 2026',
}
const SUBTITLE = '21 a 25 de setembro'

describe.each([
  { name: 'ArticleCard', Card: ArticleCard, size: 'text-sm' },
  { name: 'FeaturedArticleCard', Card: FeaturedArticleCard, size: 'text-lg' },
])('$name', ({ Card, size }) => {
  it('com subtítulo, mostra um <p> em Roboto Slab Regular logo depois do <h2>', () => {
    const html = renderToStaticMarkup(<Card article={{ ...ARTICLE, subtitle: SUBTITLE }} />)

    const subtitle = html.match(/<\/h2><p class="([^"]*)">21 a 25 de setembro<\/p>/)
    expect(subtitle?.[1]).toContain(`font-serif font-regular ${size}`)
    expect(html.match(/<h2/g)).toHaveLength(1)
  })

  it('sem subtítulo, o card só tem o título', () => {
    const html = renderToStaticMarkup(<Card article={ARTICLE} />)

    expect(html).toMatch(/>O que moveu o mercado<\/h2><\/div>/)
    expect(html).not.toContain('<p')
  })
})
