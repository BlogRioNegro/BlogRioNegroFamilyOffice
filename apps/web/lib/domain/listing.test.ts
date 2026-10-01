import { describe, expect, it } from 'vitest'
import { ARTICLES_PER_LOT, FEATURED_RANGE, lotRange, parsePage, splitLot } from './listing'

describe('lotRange', () => {
  it('o 1º lote começa depois do destaque e pede um artigo a mais', () => {
    expect(lotRange(1)).toEqual({ from: 1, to: 11 })
  })

  it('lotes seguintes não se sobrepõem nem incluem o destaque', () => {
    expect(lotRange(2)).toEqual({ from: 11, to: 21 })
    expect(lotRange(3)).toEqual({ from: 21, to: 31 })
    expect(lotRange(2).from).toBeGreaterThan(FEATURED_RANGE.to)
  })
})

describe('splitLot', () => {
  const rows = (count: number) => Array.from({ length: count }, (_, index) => index)

  it('com o artigo extra, corta em 10 e indica que há mais', () => {
    expect(splitLot(rows(ARTICLES_PER_LOT + 1))).toEqual({
      articles: rows(ARTICLES_PER_LOT),
      hasMore: true,
    })
  })

  it('sem o artigo extra, é o último lote', () => {
    expect(splitLot(rows(ARTICLES_PER_LOT))).toEqual({
      articles: rows(ARTICLES_PER_LOT),
      hasMore: false,
    })
    expect(splitLot([])).toEqual({ articles: [], hasMore: false })
  })
})

describe('parsePage', () => {
  it('aceita inteiros positivos', () => {
    expect(parsePage('1')).toBe(1)
    expect(parsePage('2')).toBe(2)
    expect(parsePage('10000')).toBe(10_000)
  })

  it.each([undefined, '', '0', '-1', '1.5', '2e1', 'abc', ' 2', '10001', '99999999'])(
    '%j cai na página 1',
    (raw) => {
      expect(parsePage(raw)).toBe(1)
    },
  )

  it('parâmetro repetido cai na página 1', () => {
    expect(parsePage(['2', '3'])).toBe(1)
  })
})
