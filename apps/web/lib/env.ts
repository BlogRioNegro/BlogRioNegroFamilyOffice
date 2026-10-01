import 'server-only'
import { z } from 'zod'

const required = z.string().min(1)
const secret = z.string().min(32)

const schema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: required,
    SUPABASE_SERVICE_ROLE_KEY: required,
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: required,
    TURNSTILE_SECRET_KEY: required,
    LEAD_HASH_SECRET: secret,
    LEAD_WEBHOOK_URL: z.url().optional(),
    LEAD_WEBHOOK_SECRET: secret.optional(),
    NEXT_PUBLIC_RIO_NEGRO_URL: z.url(),
  })
  .refine((env) => !env.LEAD_WEBHOOK_URL || new URL(env.LEAD_WEBHOOK_URL).protocol === 'https:', {
    path: ['LEAD_WEBHOOK_URL'],
    message: 'O webhook precisa usar https',
  })
  .refine((env) => !env.LEAD_WEBHOOK_URL || Boolean(env.LEAD_WEBHOOK_SECRET), {
    path: ['LEAD_WEBHOOK_SECRET'],
    message: 'Obrigatório quando LEAD_WEBHOOK_URL está definida',
  })

function withoutEmptyValues(source: NodeJS.ProcessEnv) {
  return Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ''))
}

function parseEnv(source: NodeJS.ProcessEnv) {
  const result = schema.safeParse(withoutEmptyValues(source))
  if (result.success) return result.data

  const names = [...new Set(result.error.issues.map((issue) => issue.path.join('.')))]
  throw new Error(`Variáveis de ambiente ausentes ou inválidas: ${names.join(', ')}`)
}

export const env = parseEnv(process.env)
