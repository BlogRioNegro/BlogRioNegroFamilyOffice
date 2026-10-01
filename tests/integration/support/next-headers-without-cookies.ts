// Substitui next/headers nos testes: um request sem nenhum cookie (sem sessão).
export async function cookies() {
  return {
    getAll: () => [],
    set: () => undefined,
  }
}
