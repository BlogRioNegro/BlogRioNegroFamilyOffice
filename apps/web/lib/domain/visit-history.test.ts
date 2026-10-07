import { describe, expect, it } from 'vitest'
import { hasPreviousPage, recordVisit, type VisitHistory } from './visit-history'

// Cada passo é [rota, veio do histórico do navegador?].
function visit(...steps: [string, boolean?][]): VisitHistory {
  return steps.reduce<VisitHistory>(
    (history, [pathname, traversal = false]) => recordVisit(history, pathname, traversal),
    [],
  )
}

describe('recordVisit', () => {
  it('a primeira página aberta não tem tela anterior', () => {
    const history = visit(['/artigos/renda-fixa'])

    expect(history).toEqual(['/artigos/renda-fixa'])
    expect(hasPreviousPage(history)).toBe(false)
  })

  it('cada navegação dentro do blog empilha a rota', () => {
    const history = visit(['/'], ['/artigos'], ['/artigos/renda-fixa'])

    expect(history).toEqual(['/', '/artigos', '/artigos/renda-fixa'])
    expect(hasPreviousPage(history)).toBe(true)
  })

  it('voltar pelo histórico desempilha, até não sobrar tela anterior', () => {
    const onList = visit(['/'], ['/artigos'], ['/artigos/renda-fixa'], ['/artigos', true])
    const onHome = recordVisit(onList, '/', true)

    expect(onList).toEqual(['/', '/artigos'])
    expect(onHome).toEqual(['/'])
    expect(hasPreviousPage(onHome)).toBe(false)
  })

  it('avançar pelo histórico empilha de novo', () => {
    const history = visit(['/'], ['/artigos'], ['/', true], ['/artigos', true])

    expect(history).toEqual(['/', '/artigos'])
  })

  it('clicar num link para a rota anterior é navegação nova, não um voltar', () => {
    const history = visit(['/'], ['/artigos'], ['/'])

    expect(history).toEqual(['/', '/artigos', '/'])
  })

  // Artigo aberto por link externo: o destino de reserva leva à lista; de lá, voltar cai no artigo,
  // que de novo não tem tela anterior do blog (o histórico do navegador sairia do site).
  it('depois de voltar à primeira página, não há mais tela anterior', () => {
    const history = visit(['/artigos/renda-fixa'], ['/artigos'], ['/artigos/renda-fixa', true])

    expect(history).toEqual(['/artigos/renda-fixa'])
    expect(hasPreviousPage(history)).toBe(false)
  })

  it('registrar a mesma rota duas vezes não muda nada', () => {
    const history = visit(['/artigos'])

    expect(recordVisit(history, '/artigos', false)).toBe(history)
    expect(recordVisit(history, '/artigos', true)).toBe(history)
  })
})
