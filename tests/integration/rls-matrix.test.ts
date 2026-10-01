import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  adminClient,
  anonClient,
  createAuthenticatedUser,
  SEED_ADMIN,
  serviceClient,
  type Client,
  type TestUser,
} from './support/clients'
import { executeLocalSql } from './support/local-supabase'

// RLS-003 · Matriz de acesso: cada célula (papel × operação × tabela), permitida e negada.

type Result = { data: unknown; error: { code: string } | null }

async function expectRlsError(query: PromiseLike<Result>) {
  const { error } = await query
  expect(error?.code).toBe('42501')
}

async function expectNothingAffected(query: PromiseLike<Result>) {
  const { data, error } = await query
  if (error) {
    expect(error.code).toBe('42501')
    return
  }
  expect(data).toEqual([])
}

async function expectRows(query: PromiseLike<Result>, count: number) {
  const { data, error } = await query
  expect(error).toBeNull()
  expect(data).toHaveLength(count)
}

function asAdmin(body: string) {
  executeLocalSql(`do $$ begin
    perform set_config('request.jwt.claims', '{"sub":"${SEED_ADMIN.id}","role":"authenticated"}', true);
    execute 'set local role authenticated';
    ${body}
  end $$`)
}

function insertArticleAsPostgres(id: string) {
  executeLocalSql(`with a as (
    insert into public.articles (id, slug, title, cover_path, content_type, preview_pdf_path)
    values ('${id}', 'rls-${id}', 'Artigo de teste', '${id}/capa.jpg', 'pdf', '${id}/previa.pdf')
    returning id
  ) insert into public.article_contents (article_id, full_pdf_path) select id, id || '/completo.pdf' from a`)
}

function newArticleRow(id: string) {
  return {
    id,
    slug: `rls-${id}`,
    title: 'Artigo negado',
    cover_path: `${id}/capa.jpg`,
    content_type: 'pdf' as const,
    preview_pdf_path: `${id}/previa.pdf`,
  }
}

function newLeadRow() {
  return {
    article_title_snapshot: 'Artigo de teste',
    name: 'Pessoa Teste',
    email: `lead-${randomUUID()}@example.com`,
    phone: '+5511912345678',
    consent_at: new Date().toISOString(),
    policy_version: 'v1',
    ip_hash: 'hash',
  }
}

describe('RLS-003 · matriz de acesso', () => {
  const articleId = randomUUID()
  const historySlug = `rls-antigo-${randomUUID()}`
  const rateLimitKey = `ip:rls-${randomUUID()}`
  const createdArticles = [articleId]
  const createdLeads: string[] = []

  let anon: Client
  let user: TestUser
  let admin: Client
  let service: Client
  let leadId: string

  async function insertLead(): Promise<string> {
    const { data, error } = await service.from('leads').insert(newLeadRow()).select('id').single()
    if (error) throw error
    createdLeads.push(data.id)
    return data.id
  }

  beforeAll(async () => {
    anon = anonClient()
    user = await createAuthenticatedUser()
    admin = await adminClient()
    service = serviceClient()

    insertArticleAsPostgres(articleId)
    executeLocalSql(
      `insert into public.article_slug_history (old_slug, article_id) values ('${historySlug}', '${articleId}')`,
    )
    executeLocalSql(
      `insert into public.lead_rate_limits (key, window_start, count) values ('${rateLimitKey}', now(), 1)`,
    )
    leadId = await insertLead()
  })

  afterAll(async () => {
    await user.remove()
    const ids = createdArticles.map((id) => `'${id}'`).join(', ')
    executeLocalSql(`delete from public.articles where id in (${ids})`)
    executeLocalSql(`delete from public.lead_rate_limits where key like 'ip:rls-%'`)
    await service.from('leads').delete().in('id', createdLeads)
  })

  function nonAdmins(): [string, Client][] {
    return [
      ['anon', anon],
      ['autenticado', user.client],
    ]
  }

  describe('articles', () => {
    it('anon, autenticado e admin leem', async () => {
      for (const client of [anon, user.client, admin]) {
        await expectRows(client.from('articles').select('id').eq('id', articleId), 1)
      }
    })

    it('anon e autenticado não inserem, não alteram e não apagam', async () => {
      for (const [, client] of nonAdmins()) {
        await expectRlsError(client.from('articles').insert(newArticleRow(randomUUID())))
        await expectNothingAffected(
          client.from('articles').update({ title: 'Invadido' }).eq('id', articleId).select(),
        )
        await expectNothingAffected(client.from('articles').delete().eq('id', articleId).select())
      }
      await expectRows(
        service.from('articles').select('id').eq('id', articleId).eq('title', 'Artigo de teste'),
        1,
      )
    })

    it('admin insere artigo e conteúdo na mesma transação', async () => {
      const id = randomUUID()
      createdArticles.push(id)

      asAdmin(`
        insert into public.articles (id, slug, title, cover_path, content_type, preview_pdf_path)
        values ('${id}', 'rls-${id}', 'Artigo do admin', '${id}/capa.jpg', 'pdf', '${id}/previa.pdf');
        insert into public.article_contents (article_id, full_pdf_path) values ('${id}', '${id}/completo.pdf');
      `)

      await expectRows(
        service.from('article_contents').select('article_id').eq('article_id', id),
        1,
      )
    })

    it('admin altera e apaga', async () => {
      const id = randomUUID()
      createdArticles.push(id)
      insertArticleAsPostgres(id)

      await expectRows(
        admin.from('articles').update({ title: 'Título novo' }).eq('id', id).select(),
        1,
      )
      await expectRows(admin.from('articles').delete().eq('id', id).select(), 1)
      await expectRows(service.from('articles').select('id').eq('id', id), 0)
    })
  })

  describe('article_contents (conteúdo completo, ADR 0007)', () => {
    it('anon e autenticado não leem, não inserem, não alteram e não apagam', async () => {
      for (const [, client] of nonAdmins()) {
        await expectRows(client.from('article_contents').select('*').eq('article_id', articleId), 0)
        await expectRows(client.from('article_contents').select('*'), 0)
        await expectRlsError(
          client.from('article_contents').insert({ article_id: articleId, full_pdf_path: 'x.pdf' }),
        )
        await expectNothingAffected(
          client
            .from('article_contents')
            .update({ full_pdf_path: 'invadido.pdf' })
            .eq('article_id', articleId)
            .select(),
        )
        await expectNothingAffected(
          client.from('article_contents').delete().eq('article_id', articleId).select(),
        )
      }
      await expectRows(
        service
          .from('article_contents')
          .select('article_id')
          .eq('article_id', articleId)
          .eq('full_pdf_path', `${articleId}/completo.pdf`),
        1,
      )
    })

    it('admin lê e altera', async () => {
      await expectRows(admin.from('article_contents').select('*').eq('article_id', articleId), 1)
      await expectRows(
        admin
          .from('article_contents')
          .update({ full_pdf_path: `${articleId}/completo.pdf` })
          .eq('article_id', articleId)
          .select(),
        1,
      )
    })

    it('admin apaga o conteúdo junto com o artigo', async () => {
      const id = randomUUID()
      createdArticles.push(id)
      insertArticleAsPostgres(id)

      asAdmin(`
        delete from public.article_contents where article_id = '${id}';
        if not found then raise exception 'delete de article_contents negado'; end if;
        delete from public.articles where id = '${id}';
      `)

      await expectRows(
        service.from('article_contents').select('article_id').eq('article_id', id),
        0,
      )
    })
  })

  describe('article_slug_history', () => {
    it('anon, autenticado e admin leem', async () => {
      for (const client of [anon, user.client, admin]) {
        await expectRows(
          client.from('article_slug_history').select('old_slug').eq('old_slug', historySlug),
          1,
        )
      }
    })

    it('anon e autenticado não inserem, não alteram e não apagam', async () => {
      for (const [, client] of nonAdmins()) {
        await expectRlsError(
          client
            .from('article_slug_history')
            .insert({ old_slug: `rls-negado-${randomUUID()}`, article_id: articleId }),
        )
        await expectNothingAffected(
          client
            .from('article_slug_history')
            .update({ created_at: '2000-01-01T00:00:00Z' })
            .eq('old_slug', historySlug)
            .select(),
        )
        await expectNothingAffected(
          client.from('article_slug_history').delete().eq('old_slug', historySlug).select(),
        )
      }
      await expectRows(
        service.from('article_slug_history').select('old_slug').eq('old_slug', historySlug),
        1,
      )
    })

    it('admin insere, altera e apaga', async () => {
      const slug = `rls-admin-${randomUUID()}`

      await expectRows(
        admin
          .from('article_slug_history')
          .insert({ old_slug: slug, article_id: articleId })
          .select(),
        1,
      )
      await expectRows(
        admin
          .from('article_slug_history')
          .update({ created_at: new Date().toISOString() })
          .eq('old_slug', slug)
          .select(),
        1,
      )
      await expectRows(admin.from('article_slug_history').delete().eq('old_slug', slug).select(), 1)
    })
  })

  describe('leads (só a service role insere)', () => {
    it('anon e autenticado não leem, não inserem, não alteram e não apagam', async () => {
      for (const [, client] of nonAdmins()) {
        await expectRows(client.from('leads').select('id'), 0)
        await expectRlsError(client.from('leads').insert(newLeadRow()))
        await expectNothingAffected(
          client.from('leads').update({ webhook_status: 'sent' }).eq('id', leadId).select(),
        )
        await expectNothingAffected(client.from('leads').delete().eq('id', leadId).select())
      }
      await expectRows(
        service.from('leads').select('id').eq('id', leadId).eq('webhook_status', 'disabled'),
        1,
      )
    })

    it('admin lê, mas não insere', async () => {
      await expectRows(admin.from('leads').select('id').eq('id', leadId), 1)
      await expectRlsError(admin.from('leads').insert(newLeadRow()))
    })

    it('admin altera só as colunas webhook_*', async () => {
      await expectRows(
        admin
          .from('leads')
          .update({ webhook_status: 'failed', webhook_attempts: 1, webhook_last_error: 'timeout' })
          .eq('id', leadId)
          .select('id'),
        1,
      )
      await expectRlsError(admin.from('leads').update({ name: 'Outro Nome' }).eq('id', leadId))
      await expectRlsError(
        admin.from('leads').update({ email: 'outro@example.com' }).eq('id', leadId),
      )
    })

    it('admin apaga', async () => {
      const id = await insertLead()

      await expectRows(admin.from('leads').delete().eq('id', id).select('id'), 1)
    })
  })

  describe('lead_rate_limits (só a service role)', () => {
    it('anon, autenticado e admin não leem, não inserem, não alteram e não apagam', async () => {
      for (const client of [anon, user.client, admin]) {
        await expectNothingAffected(client.from('lead_rate_limits').select('key'))
        await expectRlsError(
          client
            .from('lead_rate_limits')
            .insert({ key: 'ip:negado', window_start: new Date().toISOString(), count: 1 }),
        )
        await expectNothingAffected(
          client.from('lead_rate_limits').update({ count: 99 }).eq('key', rateLimitKey).select(),
        )
        await expectNothingAffected(
          client.from('lead_rate_limits').delete().eq('key', rateLimitKey).select(),
        )
      }
      await expectRows(
        service.from('lead_rate_limits').select('key').eq('key', rateLimitKey).eq('count', 1),
        1,
      )
    })
  })

  describe('admin_users', () => {
    it('anon e autenticado não veem nenhuma linha', async () => {
      for (const [, client] of nonAdmins()) {
        await expectRows(client.from('admin_users').select('user_id'), 0)
      }
    })

    it('admin vê só a própria linha', async () => {
      const { data, error } = await admin.from('admin_users').select('user_id')

      expect(error).toBeNull()
      expect(data).toEqual([{ user_id: SEED_ADMIN.id }])
    })

    it('ninguém se promove a admin nem altera ou apaga a allowlist', async () => {
      await expectRlsError(anon.from('admin_users').insert({ user_id: user.id }))
      await expectRlsError(user.client.from('admin_users').insert({ user_id: user.id }))
      await expectRlsError(admin.from('admin_users').insert({ user_id: user.id }))

      for (const client of [anon, user.client, admin]) {
        await expectNothingAffected(
          client
            .from('admin_users')
            .update({ created_at: '2000-01-01T00:00:00Z' })
            .eq('user_id', SEED_ADMIN.id)
            .select(),
        )
        await expectNothingAffected(
          client.from('admin_users').delete().eq('user_id', SEED_ADMIN.id).select(),
        )
      }

      const { data } = await user.client.rpc('is_admin')
      expect(data).toBe(false)
      await expectRows(service.from('admin_users').select('user_id'), 1)
    })
  })
})
