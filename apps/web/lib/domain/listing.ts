// PUB-003 · PUB-004: a posição 0 da ordem de publicação é o destaque (ADR 0004); os lotes de
// 10 começam logo depois dele, então o destaque nunca se repete na lista.
export const ARTICLES_PER_LOT = 10

export const FEATURED_RANGE = { from: 0, to: 0 }

/** Intervalo inclusivo do lote `page` (1, 2...), com um artigo a mais para saber se há outro lote. */
export function lotRange(page: number): { from: number; to: number } {
  const from = 1 + (page - 1) * ARTICLES_PER_LOT
  return { from, to: from + ARTICLES_PER_LOT }
}

export function splitLot<T>(rows: readonly T[]): { articles: T[]; hasMore: boolean } {
  return { articles: rows.slice(0, ARTICLES_PER_LOT), hasMore: rows.length > ARTICLES_PER_LOT }
}

export const MAX_PAGE = 10_000

/** `?page=N` da listagem; ausente, inválido ou fora do intervalo cai na página 1 (PUB-004). */
export function parsePage(raw: string | string[] | undefined): number {
  if (typeof raw !== 'string' || !/^\d{1,5}$/.test(raw)) return 1
  const page = Number(raw)
  return page >= 1 && page <= MAX_PAGE ? page : 1
}
