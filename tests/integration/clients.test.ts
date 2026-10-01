import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  adminClient,
  anonClient,
  createAuthenticatedUser,
  serviceClient,
  type TestUser,
} from './support/clients'

describe('clients de integração', () => {
  let user: TestUser

  beforeAll(async () => {
    user = await createAuthenticatedUser()
  })

  afterAll(async () => {
    await user.remove()
  })

  it('anon não tem sessão', async () => {
    const { data } = await anonClient().auth.getUser()

    expect(data.user).toBeNull()
  })

  it('autenticado comum tem sessão própria', async () => {
    const { data } = await user.client.auth.getUser()

    expect(data.user?.id).toBe(user.id)
  })

  it('admin do seed faz login', async () => {
    const admin = await adminClient()
    const { data } = await admin.auth.getUser()

    expect(data.user?.email).toBe('admin@rionegro.local')
  })

  it('o usuário de teste é apagado no cleanup', async () => {
    const extra = await createAuthenticatedUser()
    await extra.remove()

    const { data } = await serviceClient().auth.admin.getUserById(extra.id)
    expect(data.user).toBeNull()
  })
})
