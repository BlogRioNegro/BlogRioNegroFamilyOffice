import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GENERIC_ERROR_MESSAGE } from '../../lib/services/action-result'

const requireAdmin = vi.fn()
const deleteLeadRecord = vi.fn()

vi.mock('../../lib/services/require-admin', () => ({ requireAdmin }))
vi.mock('../../lib/services/leads', () => ({ deleteLeadRecord }))
const webhook = { webhookConfigFromEnv: vi.fn(), resendFailedLeads: vi.fn() }
vi.mock('../../lib/services/lead-webhook', () => webhook)

const { deleteLead, resendWebhookFailures } = await import('./actions')

const ID = '4b4f7c5e-2d7a-4c1e-9d55-0a3f5c1e8b21'
const supabase = { marker: 'supabase' }

describe('deleteLead', () => {
  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    requireAdmin.mockResolvedValue({ ok: true, supabase, userId: 'admin' })
    deleteLeadRecord.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('devolve a negação do requireAdmin sem excluir', async () => {
    requireAdmin.mockResolvedValue({ ok: false, error: 'Sessão expirada' })

    expect(await deleteLead(ID)).toEqual({ ok: false, error: 'Sessão expirada' })
    expect(deleteLeadRecord).not.toHaveBeenCalled()
  })

  it('recusa id inválido', async () => {
    expect(await deleteLead('1; drop table leads')).toEqual({
      ok: false,
      error: GENERIC_ERROR_MESSAGE,
    })
    expect(deleteLeadRecord).not.toHaveBeenCalled()
  })

  it('exclui o lead', async () => {
    expect(await deleteLead(ID)).toEqual({ ok: true, data: null })
    expect(deleteLeadRecord).toHaveBeenCalledWith(supabase, ID)
  })

  it('falha no banco vira erro genérico', async () => {
    deleteLeadRecord.mockResolvedValue({ code: 'XX000', message: 'internal' })

    expect(await deleteLead(ID)).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
  })
})

describe('resendWebhookFailures', () => {
  const config = { url: 'https://crm.example/webhook', secret: 's'.repeat(32) }

  beforeEach(() => {
    requireAdmin.mockResolvedValue({ ok: true, supabase, userId: 'admin' })
    webhook.webhookConfigFromEnv.mockReturnValue(config)
    webhook.resendFailedLeads.mockResolvedValue({ sent: 2, failed: 1 })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('devolve a negação do requireAdmin sem reenviar', async () => {
    requireAdmin.mockResolvedValue({ ok: false, error: 'Sessão expirada' })

    expect(await resendWebhookFailures(null)).toEqual({ ok: false, error: 'Sessão expirada' })
    expect(webhook.resendFailedLeads).not.toHaveBeenCalled()
  })

  it('sem LEAD_WEBHOOK_URL explica que o reenvio está desligado', async () => {
    webhook.webhookConfigFromEnv.mockReturnValue(null)

    const result = await resendWebhookFailures(null)

    expect(result).toEqual({ ok: false, error: expect.stringContaining('LEAD_WEBHOOK_URL') })
    expect(webhook.resendFailedLeads).not.toHaveBeenCalled()
  })

  it('reenvia do artigo e devolve enviados e falhas', async () => {
    expect(await resendWebhookFailures(ID)).toEqual({ ok: true, data: { sent: 2, failed: 1 } })
    expect(webhook.resendFailedLeads).toHaveBeenCalledWith(supabase, ID, config)
  })

  it('recusa filtro inválido', async () => {
    expect(await resendWebhookFailures('x')).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
  })
})
