import { randomUUID } from 'node:crypto'
import type { Database } from '@rio-negro/db'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { localSupabase } from './local-supabase'

export type Client = SupabaseClient<Database>

// Conta criada pelo supabase/seed.sql; vale só para o Supabase local.
export const SEED_ADMIN = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  email: 'admin@rionegro.local',
  password: 'rionegro-dev-local',
}

function newClient(key: string): Client {
  return createClient<Database>(localSupabase.API_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function anonClient(): Client {
  return newClient(localSupabase.ANON_KEY)
}

export function serviceClient(): Client {
  return newClient(localSupabase.SERVICE_ROLE_KEY)
}

async function signedInClient(email: string, password: string): Promise<Client> {
  const client = anonClient()
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

export function adminClient(): Promise<Client> {
  return signedInClient(SEED_ADMIN.email, SEED_ADMIN.password)
}

export type TestUser = { id: string; email: string; client: Client; remove: () => Promise<void> }

export async function createAuthenticatedUser(password: string = randomUUID()): Promise<TestUser> {
  const email = `teste-${randomUUID()}@rionegro.local`
  const service = serviceClient()

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error

  const id = data.user.id
  const remove = async () => {
    const { error: deleteError } = await service.auth.admin.deleteUser(id)
    if (deleteError) throw deleteError
  }

  return { id, email, client: await signedInClient(email, password), remove }
}
