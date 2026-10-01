import { describe, expect, it } from 'vitest'
import { queryLocalDb } from './support/local-supabase'

describe('RLS-001 · RLS em todas as tabelas', () => {
  it('nenhuma tabela do schema public está sem RLS', () => {
    const tablesWithoutRls = queryLocalDb(`
      select c.relname from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    `)

    expect(tablesWithoutRls).toEqual([])
  })

  it('o schema public tem tabelas para checar', () => {
    const tables = queryLocalDb(`
      select c.relname from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
    `)

    expect(tables.length).toBeGreaterThan(0)
  })

  it('nenhuma política de escrita usa using (true) ou with check (true)', () => {
    const openWritePolicies = queryLocalDb(`
      select tablename, policyname from pg_policies
      where schemaname in ('public', 'storage')
        and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
        and (qual = 'true' or with_check = 'true')
    `)

    expect(openWritePolicies).toEqual([])
  })
})
