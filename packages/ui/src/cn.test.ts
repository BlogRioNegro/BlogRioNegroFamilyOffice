import { describe, expect, it } from 'vitest'
import { cn } from './cn'

// DS-003: as escalas próprias do design system estão registradas no tailwind-merge. Sem isso, um
// utilitário de um grupo anula o de outro que tem o mesmo prefixo (font-*, text-*).

describe('cn', () => {
  it.each(['light', 'regular', 'medium', 'semibold', 'bold', 'black'])(
    'o peso font-%s não anula a família font-serif',
    (weight) => {
      expect(cn('font-serif', `font-${weight}`)).toBe(`font-serif font-${weight}`)
      expect(cn(`font-${weight}`, 'font-serif')).toBe(`font-${weight} font-serif`)
    },
  )

  it('o último peso vence', () => {
    expect(cn('font-serif font-medium', 'font-black')).toBe('font-serif font-black')
  })

  it('a última família vence', () => {
    expect(cn('font-sans font-light', 'font-serif')).toBe('font-light font-serif')
  })

  it('o tamanho do H1 convive com a cor e cede a outro tamanho', () => {
    expect(cn('text-h1 text-text')).toBe('text-h1 text-text')
    expect(cn('text-3xl', 'text-h1')).toBe('text-h1')
    expect(cn('text-h1', 'text-xl')).toBe('text-xl')
  })

  it('a última entrelinha vence', () => {
    expect(cn('leading-tight', 'leading-snug')).toBe('leading-snug')
  })
})
