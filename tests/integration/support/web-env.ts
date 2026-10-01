import { vi } from 'vitest'
import { localSupabase } from './local-supabase'

// Chave secreta de teste oficial do Turnstile que sempre aprova (docs da Cloudflare).
export const TURNSTILE_TEST_SECRET_PASS = '1x0000000000000000000000000000000AA'

/** Env do apps/web contra o Supabase local. Chamar antes de importar módulos que leem `env`. */
export function stubWebEnv(overrides: Record<string, string> = {}): void {
  const values: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: localSupabase.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: localSupabase.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: localSupabase.SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    TURNSTILE_SECRET_KEY: TURNSTILE_TEST_SECRET_PASS,
    LEAD_HASH_SECRET: 'x'.repeat(32),
    NEXT_PUBLIC_RIO_NEGRO_URL: 'https://rionegro.example',
    ...overrides,
  }
  for (const [name, value] of Object.entries(values)) vi.stubEnv(name, value)
}
