import { randomUUID } from 'node:crypto'
import { setTimeout as wait } from 'node:timers/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  adminClient,
  anonClient,
  createAuthenticatedUser,
  serviceClient,
  type Client,
  type TestUser,
} from './support/clients'

// RLS-004 · Políticas do Storage. O PDF completo (article-files) nunca é lido por anon
// nem por autenticado comum (ADR 0007).

const PDF = new Blob(['%PDF-1.4 teste'], { type: 'application/pdf' })
const PNG = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' })

describe('RLS-004 · políticas do Storage', () => {
  const folder = `rls-${randomUUID()}`
  const privatePath = `${folder}/completo.pdf`
  const coverPath = `${folder}/capa.png`

  let anon: Client
  let user: TestUser
  let admin: Client
  let service: Client

  beforeAll(async () => {
    anon = anonClient()
    user = await createAuthenticatedUser()
    admin = await adminClient()
    service = serviceClient()

    const privateUpload = await service.storage.from('article-files').upload(privatePath, PDF)
    if (privateUpload.error) throw privateUpload.error
    const coverUpload = await service.storage.from('covers').upload(coverPath, PNG)
    if (coverUpload.error) throw coverUpload.error
  })

  afterAll(async () => {
    await user.remove()
    await service.storage.from('article-files').remove([privatePath, `${folder}/admin.pdf`])
    await service.storage.from('covers').remove([coverPath, `${folder}/admin.png`])
  })

  function nonAdmins(): [string, Client][] {
    return [
      ['anon', anon],
      ['autenticado', user.client],
    ]
  }

  describe('bucket privado article-files', () => {
    it('anon e autenticado não baixam, não listam e não geram URL assinada', async () => {
      for (const [, client] of nonAdmins()) {
        const download = await client.storage.from('article-files').download(privatePath)
        expect(download.data).toBeNull()
        expect(download.error).not.toBeNull()

        const list = await client.storage.from('article-files').list(folder)
        expect(list.data ?? []).toEqual([])

        const signed = await client.storage.from('article-files').createSignedUrl(privatePath, 60)
        expect(signed.data).toBeNull()
      }
    })

    it('request anon ao objeto responde 400 ou 404', async () => {
      const { data } = anon.storage.from('article-files').getPublicUrl(privatePath)
      const authenticatedUrl = data.publicUrl.replace('/object/public/', '/object/authenticated/')

      for (const url of [data.publicUrl, authenticatedUrl]) {
        const response = await fetch(url)
        expect([400, 404]).toContain(response.status)
      }
    })

    it('admin baixa o PDF completo', async () => {
      const { data, error } = await admin.storage.from('article-files').download(privatePath)

      expect(error).toBeNull()
      expect(await data?.text()).toBe('%PDF-1.4 teste')
    })

    it('URL assinada pela service role funciona e depois expira', async () => {
      const valid = await service.storage.from('article-files').createSignedUrl(privatePath, 60)
      expect(valid.error).toBeNull()
      expect((await fetch(valid.data?.signedUrl ?? '')).status).toBe(200)

      const short = await service.storage.from('article-files').createSignedUrl(privatePath, 1)
      await wait(2_000)
      expect((await fetch(short.data?.signedUrl ?? '')).status).toBe(400)
    })
  })

  describe('buckets públicos', () => {
    it('anon e autenticado leem a capa', async () => {
      for (const [, client] of nonAdmins()) {
        const { error } = await client.storage.from('covers').download(coverPath)
        expect(error).toBeNull()
      }
      const { data } = anon.storage.from('covers').getPublicUrl(coverPath)
      expect((await fetch(data.publicUrl)).status).toBe(200)
    })
  })

  describe('escrita e remoção', () => {
    it('anon e autenticado não enviam, não substituem e não removem em nenhum bucket', async () => {
      for (const [, client] of nonAdmins()) {
        for (const [bucket, file] of [
          ['covers', PNG],
          ['article-images', PNG],
          ['article-previews', PDF],
          ['article-files', PDF],
        ] as const) {
          const upload = await client.storage.from(bucket).upload(`${folder}/negado`, file)
          expect(upload.error).not.toBeNull()
        }

        const replace = await client.storage.from('covers').update(coverPath, PNG)
        expect(replace.error).not.toBeNull()

        const removed = await client.storage.from('article-files').remove([privatePath])
        expect(removed.data ?? []).toEqual([])
      }

      const stillThere = await service.storage.from('article-files').download(privatePath)
      expect(stillThere.error).toBeNull()
    })

    it('admin envia e remove', async () => {
      const cover = await admin.storage.from('covers').upload(`${folder}/admin.png`, PNG)
      expect(cover.error).toBeNull()
      const file = await admin.storage.from('article-files').upload(`${folder}/admin.pdf`, PDF)
      expect(file.error).toBeNull()

      const removed = await admin.storage.from('article-files').remove([`${folder}/admin.pdf`])
      expect(removed.data).toHaveLength(1)
    })
  })
})
