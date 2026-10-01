import { describe, expect, it } from 'vitest'
import {
  csvCell,
  formatPhone,
  leadsCsv,
  pageCount,
  pageFromParam,
  pageRange,
  paginationItems,
  showingLabel,
  type LeadRow,
} from './leads'

const LEAD: LeadRow = {
  id: '1',
  created_at: '2026-09-24T17:32:00Z',
  article_title_snapshot: 'Previdência privada: PGBL ou VGBL?',
  name: 'João Pereira',
  email: 'joao@example.com',
  phone: '+5521987654321',
  marketing_opt_in: false,
  webhook_status: 'failed',
}

describe('paginação', () => {
  it('10 por página', () => {
    expect(pageRange(1)).toEqual({ from: 0, to: 9 })
    expect(pageRange(3)).toEqual({ from: 20, to: 29 })
    expect(pageCount(0)).toBe(1)
    expect(pageCount(188)).toBe(19)
  })

  it('"Mostrando X–Y de N"', () => {
    expect(showingLabel(1, 188)).toBe('Mostrando 1–10 de 188')
    expect(showingLabel(19, 188)).toBe('Mostrando 181–188 de 188')
  })

  it('mostra primeira, última e vizinhas da atual', () => {
    expect(paginationItems(1, 19)).toEqual([1, 2, 'gap', 19])
    expect(paginationItems(10, 19)).toEqual([1, 'gap', 9, 10, 11, 'gap', 19])
    expect(paginationItems(2, 3)).toEqual([1, 2, 3])
    expect(paginationItems(1, 1)).toEqual([1])
  })
})

describe('formatPhone', () => {
  it('celular e fixo', () => {
    expect(formatPhone('+5511912345678')).toBe('(11) 91234-5678')
    expect(formatPhone('+551132345678')).toBe('(11) 3234-5678')
  })
})

describe('csvCell', () => {
  it.each(['=1+1', '+SOMA(A1)', '-2', '@cmd', '\tx', '\rx'])('neutraliza fórmula: %j', (value) => {
    expect(csvCell(value).replace(/^"/, '')).toMatch(/^'/)
  })

  it('põe entre aspas e duplica aspas quando precisa', () => {
    expect(csvCell('a;b')).toBe('"a;b"')
    expect(csvCell('diz "oi"')).toBe('"diz ""oi"""')
    expect(csvCell('linha\nnova')).toBe('"linha\nnova"')
    expect(csvCell('Ação')).toBe('Ação')
  })
})

describe('leadsCsv', () => {
  it('BOM, cabeçalho da spec, `;` e CRLF', () => {
    expect(leadsCsv([LEAD])).toBe(
      '\uFEFFdata;artigo;nome;email;telefone;aceite_comunicacoes;status_webhook\r\n' +
        '24/09/2026 14:32;Previdência privada: PGBL ou VGBL?;João Pereira;joao@example.com;(21) 98765-4321;Não;failed\r\n',
    )
  })

  it('nome malicioso sai escapado', () => {
    const csv = leadsCsv([{ ...LEAD, name: '=HYPERLINK("http://x")' }])
    expect(csv).toContain(`;"'=HYPERLINK(""http://x"")";`)
  })
})

describe('pageFromParam', () => {
  it('aceita inteiro positivo e cai para 1 no resto', () => {
    expect(pageFromParam('3')).toBe(3)
    for (const value of [undefined, '', '0', '-2', '1.5', 'abc', ['2']])
      expect(pageFromParam(value)).toBe(1)
  })
})

describe('BOM', () => {
  it('o CSV começa com o BOM UTF-8 (EF BB BF)', () => {
    expect([...Buffer.from(leadsCsv([])).subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  })
})
