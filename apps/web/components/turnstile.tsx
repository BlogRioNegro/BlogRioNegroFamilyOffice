'use client'

import { useEffect, useRef } from 'react'

// LEAD-005 · Widget do Cloudflare Turnstile (300 × 65) em renderização explícita. O script entra
// por createElement a partir de um script com nonce, o que o 'strict-dynamic' da CSP aceita.

type TurnstileApi = {
  render(container: HTMLElement, options: Record<string, unknown>): string
  reset(widgetId: string): void
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let loading: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)

  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile indisponível'))
    script.onerror = () => {
      loading = null
      reject(new Error('Falha ao carregar o Turnstile'))
    }
    document.head.append(script)
  })
  return loading
}

/**
 * Entrega o token por `onToken` ('' quando expira ou falha). Mudar `resetKey` descarta o token
 * atual e pede um novo desafio (usado depois de cada erro do envio).
 */
export function Turnstile({
  siteKey,
  resetKey,
  onToken,
}: {
  siteKey: string
  resetKey: number
  onToken: (token: string) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const tokenHandler = useRef(onToken)

  useEffect(() => {
    tokenHandler.current = onToken
  }, [onToken])

  useEffect(() => {
    let cancelled = false
    const emit = (token: string) => tokenHandler.current(token)

    loadTurnstile()
      .then((api) => {
        if (cancelled || !container.current) return
        widgetId.current = api.render(container.current, {
          sitekey: siteKey,
          language: 'pt-br',
          callback: emit,
          'expired-callback': () => emit(''),
          'error-callback': () => emit(''),
        })
      })
      .catch(() => emit(''))

    return () => {
      cancelled = true
      if (widgetId.current) window.turnstile?.remove(widgetId.current)
      widgetId.current = null
    }
  }, [siteKey])

  useEffect(() => {
    if (resetKey === 0 || !widgetId.current) return
    tokenHandler.current('')
    window.turnstile?.reset(widgetId.current)
  }, [resetKey])

  return <div ref={container} className="min-h-[65px]" />
}
