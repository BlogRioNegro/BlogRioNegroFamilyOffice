import { describe, expect, it } from 'vitest'
import {
  ARTICLE_MESSAGES,
  articleFieldsFrom,
  articleFieldsSchema,
  fieldErrorsOf,
  slugFromTitle,
} from './article-form'

const VALID = {
  id: '4b4f7c5e-2d7a-4c1e-9d55-0a3f5c1e8b21',
  title: '  Cenário macro para o 4º trimestre  ',
  slug: 'cenario-macro-4t',
  summary: '',
  contentType: 'pdf',
  publishedDate: '2026-09-22',
}

function errorsFor(values: Record<string, string>) {
  const result = articleFieldsSchema.safeParse(values)
  return result.success ? {} : fieldErrorsOf(result.error)
}

describe('articleFieldsSchema', () => {
  it('aceita os campos válidos, com título aparado e resumo vazio como null', () => {
    expect(articleFieldsSchema.parse(VALID)).toMatchObject({
      title: 'Cenário macro para o 4º trimestre',
      summary: null,
    })
  })

  it('devolve um erro por campo', () => {
    expect(
      errorsFor({ ...VALID, title: 'ab', slug: 'Com Acento', summary: 'x'.repeat(161) }),
    ).toEqual({
      title: ARTICLE_MESSAGES.title,
      slug: ARTICLE_MESSAGES.slug,
      summary: ARTICLE_MESSAGES.summary,
    })
  })

  it.each(['-inicio', 'fim-', 'duplo--hifen', 'acentuação', 'x'.repeat(121)])(
    'recusa o slug %s',
    (slug) => {
      expect(errorsFor({ ...VALID, slug })).toEqual({ slug: ARTICLE_MESSAGES.slug })
    },
  )

  it('exige a data de publicação', () => {
    expect(errorsFor({ ...VALID, publishedDate: '' })).toEqual({
      publishedDate: ARTICLE_MESSAGES.publishedDate,
    })
  })
})

describe('articleFieldsFrom', () => {
  it('lê os campos de texto do FormData e ignora arquivos', () => {
    const formData = new FormData()
    formData.set('title', 'Título')
    formData.set('cover', new File(['x'], 'capa.png'))

    expect(articleFieldsFrom(formData)).toMatchObject({ title: 'Título', slug: '' })
  })
})

describe('slugFromTitle', () => {
  it('gera minúsculo, sem acento e com hífens', () => {
    expect(slugFromTitle('  Cenário Macro: ações & câmbio em 2026!  ')).toBe(
      'cenario-macro-acoes-cambio-em-2026',
    )
  })

  it('passa no schema de slug', () => {
    const slug = slugFromTitle('Previdência — o que muda?')
    expect(slug).toBe('previdencia-o-que-muda')
    expect(errorsFor({ ...VALID, slug })).toEqual({})
  })

  it('corta em 120 caracteres sem terminar em hífen', () => {
    const slug = slugFromTitle(`${'a'.repeat(119)} bcd`)
    expect(slug).toBe('a'.repeat(119))
  })

  it('título sem letras nem números gera slug vazio', () => {
    expect(slugFromTitle('!!! ???')).toBe('')
  })
})
