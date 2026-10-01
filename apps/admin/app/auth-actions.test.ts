import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GENERIC_ERROR_MESSAGE } from '../lib/services/action-result'
import { ACCESS_DENIED_MESSAGE, INVALID_CREDENTIALS_MESSAGE } from './login/messages'

const auth = {
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}
const rpc = vi.fn()

vi.mock('../lib/services/supabase-server', () => ({
  createSupabaseServerClient: async () => ({ auth, rpc }),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

const { login, logout } = await import('./auth-actions')

function credentials(email = 'admin@rionegro.local', password = 'senha') {
  const formData = new FormData()
  formData.set('email', email)
  formData.set('password', password)
  return formData
}

describe('login', () => {
  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    auth.signInWithPassword.mockResolvedValue({ error: null })
    auth.signOut.mockResolvedValue({ error: null })
    rpc.mockResolvedValue({ data: true, error: null })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('redireciona o admin para o painel', async () => {
    await expect(login(null, credentials())).rejects.toThrow('NEXT_REDIRECT:/')
    expect(auth.signOut).not.toHaveBeenCalled()
  })

  it('rejeita formulário inválido sem chamar o Supabase', async () => {
    const result = await login(null, credentials('nao-e-email', ''))

    expect(result).toEqual({ ok: false, error: INVALID_CREDENTIALS_MESSAGE })
    expect(auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('usa a mesma mensagem genérica para senha errada e e-mail inexistente', async () => {
    auth.signInWithPassword.mockResolvedValue({
      error: { status: 400, code: 'invalid_credentials' },
    })

    const result = await login(null, credentials('ninguem@example.com'))

    expect(result).toEqual({ ok: false, error: INVALID_CREDENTIALS_MESSAGE })
  })

  it('desloga e nega acesso a usuário fora de admin_users', async () => {
    rpc.mockResolvedValue({ data: false, error: null })

    const result = await login(null, credentials())

    expect(result).toEqual({ ok: false, error: ACCESS_DENIED_MESSAGE })
    expect(auth.signOut).toHaveBeenCalledOnce()
  })

  it('desloga e devolve erro genérico se is_admin() falhar', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('rpc indisponível') })

    const result = await login(null, credentials())

    expect(result).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
    expect(auth.signOut).toHaveBeenCalledOnce()
  })

  it('devolve erro genérico em falha inesperada do Auth', async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { status: 500, message: 'falhou' } })

    const result = await login(null, credentials())

    expect(result).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
  })
})

describe('logout', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('encerra a sessão e volta para /login', async () => {
    auth.signOut.mockResolvedValue({ error: null })

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(auth.signOut).toHaveBeenCalledOnce()
  })
})
