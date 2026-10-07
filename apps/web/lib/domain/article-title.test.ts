import { describe, expect, it } from 'vitest'
import { articleFullTitle } from './article-title'

describe('articleFullTitle', () => {
  it('junta título e subtítulo com dois-pontos', () => {
    expect(
      articleFullTitle({ title: 'O que moveu o mercado', subtitle: '21 a 25 de setembro' }),
    ).toBe('O que moveu o mercado: 21 a 25 de setembro')
  })

  it.each([null, '', '   '])('sem subtítulo (%j), devolve só o título', (subtitle) => {
    expect(articleFullTitle({ title: 'O que moveu o mercado', subtitle })).toBe(
      'O que moveu o mercado',
    )
  })
})
