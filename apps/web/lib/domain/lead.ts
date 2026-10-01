import { z } from 'zod'

// LEAD-001 · LEAD-002 · Schema único do pedido de download: o form (client) e a Server Action
// (server) validam com ele. Mensagens da spec 04 (UI · Estados).

/** LEAD-013 · Versão do aviso de privacidade aceito. Mudar o texto do aviso exige nova versão. */
export const POLICY_VERSION = 'blog-2026-09-v1'

/** LEAD-009 · Validade da URL assinada do PDF completo, em segundos. */
export const SIGNED_URL_SECONDS = 60

/** Erro genérico do fluxo de lead (spec 04, UI · Estados); nunca traz detalhe da falha (SEC-008). */
export const LEAD_ERROR_MESSAGE = 'Não foi possível concluir. Tente novamente.'

export const LEAD_MESSAGES = {
  name: 'Informe seu nome.',
  email: 'Informe um e-mail válido, como nome@exemplo.com.br.',
  phone: 'Informe o telefone com DDD, no formato (99) 99999-9999.',
  consent: 'Marque esta opção para continuar.',
} as const

// DDD de 11 a 99 (sem zero); celular com 9 + 8 dígitos ou fixo iniciado em 2 a 8 com 8 dígitos.
const NATIONAL_NUMBER = /^[1-9]{2}(?:9\d{8}|[2-8]\d{7})$/

/**
 * Telefone brasileiro em E.164 (`+55` + DDD + número), ou null se não for um telefone do Brasil
 * com DDD. Aceita a máscara `(99) 99999-9999` e o prefixo `+55`; outro código de país é recusado.
 */
export function toBrazilianE164(input: string): string | null {
  const trimmed = input.trim()
  const digits = trimmed.replace(/\D/g, '')

  if (trimmed.startsWith('+')) {
    if (!digits.startsWith('55')) return null
    return NATIONAL_NUMBER.test(digits.slice(2)) ? `+${digits}` : null
  }
  return NATIONAL_NUMBER.test(digits) ? `+55${digits}` : null
}

export const leadSchema = z.object({
  articleId: z.uuid(),
  // SEC-2 · Tamanho em code points, como o `char_length` do CHECK de `leads.name`.
  name: z
    .string({ error: LEAD_MESSAGES.name })
    .trim()
    .refine((name) => {
      const length = [...name].length
      return length >= 2 && length <= 120
    }, LEAD_MESSAGES.name),
  email: z
    .string({ error: LEAD_MESSAGES.email })
    .trim()
    .toLowerCase()
    .pipe(z.email(LEAD_MESSAGES.email).max(254, LEAD_MESSAGES.email)),
  phone: z.string({ error: LEAD_MESSAGES.phone }).transform((value, context) => {
    const phone = toBrazilianE164(value)
    if (phone) return phone
    context.addIssue({ code: 'custom', message: LEAD_MESSAGES.phone })
    return z.NEVER
  }),
  consent: z.literal(true, { error: LEAD_MESSAGES.consent }),
  marketingOptIn: z.boolean().default(false),
  turnstileToken: z.string().min(1),
})

/** Dados como o form envia. */
export type LeadInput = z.input<typeof leadSchema>
/** Dados validados e normalizados (telefone E.164, e-mail minúsculo). */
export type Lead = z.output<typeof leadSchema>
