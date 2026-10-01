import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GENERIC_ERROR_MESSAGE } from './action-result'

const getUser = vi.fn()
const rpc = vi.fn()

vi.mock('./supabase-server', () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser }, rpc }),
}))

const { requireAdmin, UNAUTHORIZED_MESSAGE } = await import('./require-admin')

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    getUser.mockResolvedValue({ data: { user: { id: 'admin-id' } } })
    rpc.mockResolvedValue({ data: true, error: null })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('libera o admin com o client e o id da sessão', async () => {
    const result = await requireAdmin()

    expect(result).toMatchObject({ ok: true, userId: 'admin-id' })
    expect(rpc).toHaveBeenCalledWith('is_admin')
  })

  it('nega sem sessão, sem consultar is_admin()', async () => {
    getUser.mockResolvedValue({ data: { user: null } })

    expect(await requireAdmin()).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('nega autenticado fora de admin_users', async () => {
    rpc.mockResolvedValue({ data: false, error: null })

    expect(await requireAdmin()).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE })
  })

  it('devolve erro genérico se is_admin() falhar', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('rpc indisponível') })

    expect(await requireAdmin()).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
  })
})
