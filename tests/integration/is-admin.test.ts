import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { adminClient, anonClient, createAuthenticatedUser, type TestUser } from './support/clients'

describe('RLS-002 · is_admin()', () => {
  let user: TestUser

  beforeAll(async () => {
    user = await createAuthenticatedUser()
  })

  afterAll(async () => {
    await user.remove()
  })

  it('retorna false para anon', async () => {
    const { data, error } = await anonClient().rpc('is_admin')

    expect(error).toBeNull()
    expect(data).toBe(false)
  })

  it('retorna false para autenticado fora de admin_users', async () => {
    const { data, error } = await user.client.rpc('is_admin')

    expect(error).toBeNull()
    expect(data).toBe(false)
  })

  it('retorna true para o admin', async () => {
    const admin = await adminClient()
    const { data, error } = await admin.rpc('is_admin')

    expect(error).toBeNull()
    expect(data).toBe(true)
  })
})
