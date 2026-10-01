import { describe, expect, it } from 'vitest'
import { LEAD_MESSAGES, leadSchema, toBrazilianE164, type LeadInput } from './lead'

const valid: LeadInput = {
  articleId: '11111111-1111-4111-8111-111111111111',
  name: 'Maria Silva',
  email: 'maria@exemplo.com.br',
  phone: '(11) 98765-4321',
  consent: true,
  marketingOptIn: false,
  turnstileToken: 'token',
}

function without(key: keyof LeadInput): Record<string, unknown> {
  return Object.fromEntries(Object.entries(valid).filter(([entry]) => entry !== key))
}

function errorsOf(input: Record<string, unknown>) {
  const result = leadSchema.safeParse(input)
  if (result.success) return {}
  return Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]))
}

describe('toBrazilianE164', () => {
  it.each([
    ['(11) 98765-4321', '+5511987654321'],
    ['(21) 3456-7890', '+552134567890'],
    ['11987654321', '+5511987654321'],
    ['+55 (11) 98765-4321', '+5511987654321'],
    ['+552134567890', '+552134567890'],
  ])('%s → %s', (input, expected) => {
    expect(toBrazilianE164(input)).toBe(expected)
  })

  it.each([
    ['sem DDD (celular)', '98765-4321'],
    ['sem DDD (fixo)', '3456-7890'],
    ['país diferente de BR', '+1 (415) 555-2671'],
    ['país diferente de BR (Portugal)', '+351 912 345 678'],
    ['DDD com zero', '(01) 98765-4321'],
    ['celular sem o 9', '(11) 18765-4321'],
    ['vazio', ''],
  ])('rejeita %s', (_, input) => {
    expect(toBrazilianE164(input)).toBeNull()
  })
})

describe('leadSchema', () => {
  it('aceita o pedido válido e normaliza telefone e e-mail', () => {
    const lead = leadSchema.parse({ ...valid, email: '  Maria.Silva@Exemplo.COM.br ' })

    expect(lead.phone).toBe('+5511987654321')
    expect(lead.email).toBe('maria.silva@exemplo.com.br')
    expect(lead.name).toBe('Maria Silva')
  })

  it('rejeita telefone sem DDD e de outro país, com a mensagem da spec', () => {
    expect(errorsOf({ ...valid, phone: '98765-4321' })).toEqual({ phone: LEAD_MESSAGES.phone })
    expect(errorsOf({ ...valid, phone: '+1 415 555 2671' })).toEqual({
      phone: LEAD_MESSAGES.phone,
    })
  })

  it('rejeita nome com 1 e com 121 caracteres e aceita 2 e 120', () => {
    expect(errorsOf({ ...valid, name: 'A' })).toEqual({ name: LEAD_MESSAGES.name })
    expect(errorsOf({ ...valid, name: 'A'.repeat(121) })).toEqual({ name: LEAD_MESSAGES.name })
    expect(errorsOf({ ...valid, name: 'Al' })).toEqual({})
    expect(errorsOf({ ...valid, name: 'A'.repeat(120) })).toEqual({})
  })

  // SEC-2 · O CHECK do Postgres conta code points (`char_length`); '😀'.length é 2 no JS.
  it('conta o nome por code points, como o CHECK do banco', () => {
    expect(errorsOf({ ...valid, name: '😀' })).toEqual({ name: LEAD_MESSAGES.name })
    expect(errorsOf({ ...valid, name: '😀😀' })).toEqual({})
    expect(errorsOf({ ...valid, name: '😀'.repeat(121) })).toEqual({ name: LEAD_MESSAGES.name })
    expect(errorsOf({ ...valid, name: '😀'.repeat(120) })).toEqual({})
  })

  it('não conta espaços das pontas no tamanho do nome', () => {
    expect(errorsOf({ ...valid, name: '  A  ' })).toEqual({ name: LEAD_MESSAGES.name })
  })

  it('rejeita e-mail inválido', () => {
    expect(errorsOf({ ...valid, email: 'maria@' })).toEqual({ email: LEAD_MESSAGES.email })
  })

  it('bloqueia sem o checkbox de consentimento (ausente ou desmarcado)', () => {
    expect(errorsOf(without('consent'))).toEqual({ consent: LEAD_MESSAGES.consent })
    expect(errorsOf({ ...valid, consent: false })).toEqual({ consent: LEAD_MESSAGES.consent })
  })

  it('opt-in de comunicações é opcional e falso por padrão', () => {
    expect(leadSchema.parse(without('marketingOptIn')).marketingOptIn).toBe(false)
  })

  it('exige o token do Turnstile e um artigo válido', () => {
    expect(Object.keys(errorsOf({ ...valid, turnstileToken: '' }))).toEqual(['turnstileToken'])
    expect(Object.keys(errorsOf({ ...valid, articleId: 'nao-e-uuid' }))).toEqual(['articleId'])
  })
})
