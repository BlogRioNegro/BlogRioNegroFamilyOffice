import { defineConfig, devices } from '@playwright/test'
import { localSupabase } from '../integration/support/local-supabase'
import { TURNSTILE_FAIL_WEB_URL, WEB_URL } from './support/urls'

const ADMIN_PORT = 3101
const ADMIN_URL = `http://localhost:${ADMIN_PORT}`

// Env do apps/web nos E2E, com as chaves de teste públicas do Turnstile (docs da Cloudflare).
function webEnv(siteUrl: string, turnstileSecret: string) {
  return {
    NEXT_PUBLIC_SUPABASE_URL: localSupabase.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: localSupabase.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: localSupabase.SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_RIO_NEGRO_URL: 'https://rionegroinvestimentos.com.br',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    TURNSTILE_SECRET_KEY: turnstileSecret,
    LEAD_HASH_SECRET: 'e2e-local-lead-hash-secret-com-32-caracteres',
    NEXT_TELEMETRY_DISABLED: '1',
  }
}

const TURNSTILE_SECRET_PASS = '1x0000000000000000000000000000000AA'
const TURNSTILE_SECRET_FAIL = '2x0000000000000000000000000000000AA'

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  reporter: 'list',
  use: {
    baseURL: ADMIN_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    // Web com o secret que sempre reprova, só para o teste de Turnstile inválido (LEAD-005). Build
    // + start, porque o Next não sobe dois `next dev` no mesmo app; o build termina antes dos devs.
    {
      command: `pnpm --filter @rio-negro/web exec next build && pnpm --filter @rio-negro/web exec next start --port ${new URL(TURNSTILE_FAIL_WEB_URL).port}`,
      url: TURNSTILE_FAIL_WEB_URL,
      reuseExistingServer: false,
      timeout: 300_000,
      env: webEnv(TURNSTILE_FAIL_WEB_URL, TURNSTILE_SECRET_FAIL),
    },
    {
      command: `pnpm --filter @rio-negro/admin exec next dev --port ${ADMIN_PORT}`,
      url: `${ADMIN_URL}/login`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: localSupabase.API_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: localSupabase.ANON_KEY,
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        ADMIN_SITE_URL: ADMIN_URL,
        // ADM-014 · Domínio .invalid (RFC 2606): o reenvio falha na hora, sem sair da máquina.
        LEAD_WEBHOOK_URL: 'https://crm.invalid/webhook',
        LEAD_WEBHOOK_SECRET: 'e2e-segredo-do-webhook-com-32-caracteres',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
    {
      command: `pnpm --filter @rio-negro/web exec next dev --port ${new URL(WEB_URL).port}`,
      url: WEB_URL,
      reuseExistingServer: false,
      timeout: 180_000,
      env: webEnv(WEB_URL, TURNSTILE_SECRET_PASS),
    },
  ],
})
