import type { Metadata } from 'next'
import { randomUUID } from 'node:crypto'
import { AdminHeader } from '@/components/admin-header'
import { ArticleForm } from '@/components/article-form'
import { dateInputValue } from '@/lib/domain/admin-date'
import { requireAdminPage } from '@/lib/services/require-admin'

export const metadata: Metadata = {
  title: 'Novo artigo · Rio Negro Admin',
}

// O id nasce aqui para que os arquivos do artigo usem o caminho <article_id>/... (DATA-007)
// antes do primeiro salvamento.
export default async function NewArticlePage() {
  await requireAdminPage()

  return (
    <>
      <AdminHeader current="artigos" />
      <main className="mx-auto w-full max-w-(--layout-admin) px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-16">
        <ArticleForm
          isNew
          initial={{
            id: randomUUID(),
            title: '',
            slug: '',
            summary: '',
            contentType: 'pdf',
            publishedDate: dateInputValue(new Date()),
            body: null,
          }}
        />
      </main>
    </>
  )
}
