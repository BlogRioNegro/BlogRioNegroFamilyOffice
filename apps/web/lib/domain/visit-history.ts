// PUB-016 · Caminhos que a pessoa abriu dentro do blog nesta visita, do primeiro ao atual. Vive só
// em memória: um carregamento completo da página (link externo, nova aba, F5) recomeça do zero.

export type VisitHistory = readonly string[]

/**
 * Registra a rota atual. `traversal` indica que a mudança veio do histórico do navegador (voltar ou
 * avançar): se a rota é a anterior da pilha, foi um "voltar" e o topo sai; senão, entra como nova.
 */
export function recordVisit(
  history: VisitHistory,
  pathname: string,
  traversal: boolean,
): VisitHistory {
  if (history.at(-1) === pathname) return history
  if (traversal && history.at(-2) === pathname) return history.slice(0, -1)
  return [...history, pathname]
}

/** Há uma tela anterior do próprio blog para onde voltar. */
export function hasPreviousPage(history: VisitHistory): boolean {
  return history.length > 1
}
