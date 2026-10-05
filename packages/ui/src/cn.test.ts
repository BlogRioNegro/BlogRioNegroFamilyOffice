import { describe, expect, it } from 'vitest'
import { cn } from './cn'

// DS-003: as escalas próprias do design system estão registradas no tailwind-merge. Sem isso, um
// utilitário de um grupo anula o de outro que tem o mesmo prefixo (font-*, text-*).

describe('cn', () => {
  it.each(['extralight', 'light', 'regular', 'medium', 'semibold', 'bold'])(
    'o peso font-%s não anula a família font-serif',
    (weight) => {
      expect(cn('font-serif', `font-${weight}`)).toBe(`font-serif font-${weight}`)
      expect(cn(`font-${weight}`, 'font-serif')).toBe(`font-${weight} font-serif`)
    },
  )

  it('o último peso vence', () => {
    expect(cn('font-serif font-medium', 'font-extralight')).toBe('font-serif font-extralight')
  })

  it('a última família vence', () => {
    expect(cn('font-sans font-light', 'font-serif')).toBe('font-light font-serif')
  })

  it('a entrelinha e o espaçamento dos títulos de seção convivem com tamanho e cor', () => {
    const classes = 'text-xl leading-section tracking-section text-text'

    expect(cn(classes)).toBe(classes)
    expect(cn('leading-tight', 'leading-section')).toBe('leading-section')
  })
})
