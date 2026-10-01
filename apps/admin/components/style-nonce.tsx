'use client'

import { setNonce } from 'get-nonce'

// SEC-006 · ADR 0020 · O Dialog do Radix (react-remove-scroll) injeta um <style> ao abrir; o
// get-nonce passa o nonce da CSP para ele. Renderizado antes do conteúdo, então roda antes de
// qualquer Dialog, no server e no client.
// QA-1 · No browser vale a CSP da 1ª carga, mas uma navegação por Server Action re-renderiza o
// layout com o nonce de outro request. Por isso o client fixa, uma única vez, o nonce que o
// documento já usa nos <script nonce>.
let documentNonceFixed = false

function fixDocumentNonce(fallback: string) {
  if (documentNonceFixed) return
  documentNonceFixed = true
  setNonce(document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce || fallback)
}

export function StyleNonce({ nonce }: { nonce: string }) {
  if (typeof document === 'undefined') setNonce(nonce)
  else fixDocumentNonce(nonce)
  return null
}
