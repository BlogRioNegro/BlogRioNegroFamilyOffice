import type { Database } from '@rio-negro/db'
import { formatDateTime } from './admin-date'

// ADM-013 · Regras puras da lista e da exportação de leads.

export const LEADS_PAGE_SIZE = 10

export type LeadRow = Pick<
  Database['public']['Tables']['leads']['Row'],
  | 'id'
  | 'created_at'
  | 'article_title_snapshot'
  | 'name'
  | 'email'
  | 'phone'
  | 'marketing_opt_in'
  | 'webhook_status'
>

/** Intervalo `range(from, to)` do Supabase para a página (1 em diante). */
export function pageRange(page: number): { from: number; to: number } {
  const from = (page - 1) * LEADS_PAGE_SIZE
  return { from, to: from + LEADS_PAGE_SIZE - 1 }
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE))
}

/** "Mostrando X–Y de N" da paginação. */
export function showingLabel(page: number, total: number): string {
  const { from } = pageRange(page)
  return `Mostrando ${from + 1}–${Math.min(from + LEADS_PAGE_SIZE, total)} de ${total}`
}

/** Páginas visíveis: primeira, última, a atual e as vizinhas; o resto vira reticências. */
export function paginationItems(page: number, totalPages: number): (number | 'gap')[] {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)
  return pages.flatMap((item, index) => {
    const previous = pages[index - 1]
    return previous !== undefined && item - previous > 1 ? ['gap' as const, item] : [item]
  })
}

/** Telefone E.164 brasileiro (+55DDxxxxxxxxx) como (DD) 9xxxx-xxxx ou (DD) xxxx-xxxx. */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/^\+55/, '')
  const ddd = digits.slice(0, 2)
  const number = digits.slice(2)
  const split = number.length === 9 ? 5 : 4
  return `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`
}

const CSV_COLUMNS = [
  'data',
  'artigo',
  'nome',
  'email',
  'telefone',
  'aceite_comunicacoes',
  'status_webhook',
] as const

// CSV injection: o Excel executa como fórmula a célula que começa com um destes.
const FORMULA_START = /^[=+\-@\t\r]/

/** Célula do CSV: neutraliza fórmula com `'` e põe entre aspas quando tem `;`, aspas ou quebra. */
export function csvCell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value
  return /[";\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** ADM-013 · CSV para o Excel pt-BR: UTF-8 com BOM, separador `;` e linhas CRLF. */
export function leadsCsv(leads: LeadRow[]): string {
  const lines = leads.map((lead) =>
    [
      formatDateTime(lead.created_at),
      lead.article_title_snapshot,
      lead.name,
      lead.email,
      formatPhone(lead.phone),
      lead.marketing_opt_in ? 'Sim' : 'Não',
      lead.webhook_status,
    ]
      .map(csvCell)
      .join(';'),
  )
  return `\uFEFF${[CSV_COLUMNS.join(';'), ...lines].join('\r\n')}\r\n`
}

/** Página da URL (`?pagina=`); valor ausente ou inválido vira 1. */
export function pageFromParam(value: string | string[] | undefined): number {
  const page = Number(typeof value === 'string' ? value : undefined)
  return Number.isInteger(page) && page >= 1 ? page : 1
}
