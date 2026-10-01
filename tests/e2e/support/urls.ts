// O apps/web roda numa porta própria nos E2E, separada do `pnpm dev` (:3000).
export const WEB_URL = 'http://localhost:3100'

export function webUrl(path: string): string {
  return new URL(path, WEB_URL).href
}

// Segunda instância do apps/web, com o secret de teste do Turnstile que sempre reprova.
export const TURNSTILE_FAIL_WEB_URL = 'http://localhost:3102'
