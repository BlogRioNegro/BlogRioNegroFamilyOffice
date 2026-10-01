import { describe, expect, it } from 'vitest'
import { formatPublishedDate } from './published-date'

describe('formatPublishedDate', () => {
  it('usa dia, mês abreviado e ano', () => {
    expect(formatPublishedDate('2026-09-15T15:00:00Z')).toBe('15 set. 2026')
  })

  it('abrevia todos os meses em português', () => {
    const months = Array.from({ length: 12 }, (_, index) =>
      formatPublishedDate(`2026-${String(index + 1).padStart(2, '0')}-10T15:00:00Z`),
    )

    expect(months.map((date) => date.split(' ')[1])).toEqual([
      'jan.',
      'fev.',
      'mar.',
      'abr.',
      'mai.',
      'jun.',
      'jul.',
      'ago.',
      'set.',
      'out.',
      'nov.',
      'dez.',
    ])
  })

  it('segue o fuso de Brasília na virada do dia', () => {
    expect(formatPublishedDate('2026-10-01T02:00:00Z')).toBe('30 set. 2026')
  })
})
