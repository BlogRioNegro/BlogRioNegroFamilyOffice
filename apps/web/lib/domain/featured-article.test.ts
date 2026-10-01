import { describe, expect, it } from 'vitest'
import { getFeaturedArticle } from './featured-article'

function article(id: string, publishedAt: string, createdAt = '2026-01-01T00:00:00Z') {
  return { id, published_at: publishedAt, created_at: createdAt }
}

describe('getFeaturedArticle', () => {
  it('sem artigos, não há destaque', () => {
    expect(getFeaturedArticle([])).toBeNull()
  })

  it('com 1 artigo, ele é o destaque', () => {
    const only = article('a', '2026-09-01T12:00:00Z')

    expect(getFeaturedArticle([only])).toBe(only)
  })

  it('escolhe o published_at mais recente, em qualquer ordem de entrada', () => {
    const older = article('a', '2026-09-01T12:00:00Z')
    const newer = article('b', '2026-09-20T12:00:00Z')

    expect(getFeaturedArticle([older, newer])).toBe(newer)
    expect(getFeaturedArticle([newer, older])).toBe(newer)
  })

  it('compara instantes, não o texto da data', () => {
    const utc = article('a', '2026-09-20T12:00:00Z')
    const later = article('b', '2026-09-20T10:00:00-03:00')

    expect(getFeaturedArticle([later, utc])).toBe(later)
  })

  it('empate de published_at: vence o created_at mais recente', () => {
    const first = article('a', '2026-09-20T12:00:00Z', '2026-09-01T00:00:00Z')
    const second = article('b', '2026-09-20T12:00:00Z', '2026-09-02T00:00:00Z')

    expect(getFeaturedArticle([second, first])).toBe(second)
    expect(getFeaturedArticle([first, second])).toBe(second)
  })

  it('empate total: o resultado é o mesmo em qualquer ordem', () => {
    const a = article('a', '2026-09-20T12:00:00Z')
    const b = article('b', '2026-09-20T12:00:00Z')

    expect(getFeaturedArticle([a, b])).toBe(b)
    expect(getFeaturedArticle([b, a])).toBe(b)
  })
})
