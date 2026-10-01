import { describe, expect, it } from 'vitest'
import { articleDescription, BLOG_DESCRIPTION, DESCRIPTION_MAX_LENGTH } from './article-description'

const doc = (...content: unknown[]) => ({ type: 'doc', content })
const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })

describe('articleDescription', () => {
  it('usa o resumo quando existe, nos dois tipos', () => {
    for (const content_type of ['pdf', 'rich_text'] as const) {
      expect(
        articleDescription({ summary: '  Resumo do artigo.  ', content_type, preview_json: null }),
      ).toBe('Resumo do artigo.')
    }
  })

  it('pdf sem resumo usa a descrição padrão do blog', () => {
    expect(articleDescription({ summary: null, content_type: 'pdf', preview_json: null })).toBe(
      BLOG_DESCRIPTION,
    )
    expect(articleDescription({ summary: '   ', content_type: 'pdf', preview_json: null })).toBe(
      BLOG_DESCRIPTION,
    )
  })

  it('rich_text sem resumo usa o texto da prévia, com espaços normalizados', () => {
    const preview_json = doc(
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Juros' }] },
      paragraph('Texto   da prévia.'),
      { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph('item')] }] },
    )

    expect(articleDescription({ summary: '', content_type: 'rich_text', preview_json })).toBe(
      'Juros Texto da prévia. item',
    )
  })

  it('corta o texto da prévia em ~160 caracteres, na última palavra inteira', () => {
    const preview_json = doc(paragraph('palavra '.repeat(40)))

    const description = articleDescription({
      summary: null,
      content_type: 'rich_text',
      preview_json,
    })

    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH)
    expect(description).toMatch(/palavra…$/)
  })

  it('só lê os blocos da prévia, nunca além dela', () => {
    const preview_json = doc(
      paragraph('um'),
      paragraph('dois'),
      paragraph('três'),
      paragraph('quatro'),
    )

    expect(articleDescription({ summary: null, content_type: 'rich_text', preview_json })).toBe(
      'um dois três',
    )
  })

  it('rich_text sem texto na prévia cai na descrição padrão', () => {
    const preview_json = doc({
      type: 'image',
      attrs: { src: 'https://cdn.example/a.png', alt: 'x' },
    })

    expect(articleDescription({ summary: null, content_type: 'rich_text', preview_json })).toBe(
      BLOG_DESCRIPTION,
    )
  })
})
