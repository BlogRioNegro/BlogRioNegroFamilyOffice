import type { JSONContent } from '@tiptap/core'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { AdminHeader } from '@/components/admin-header'
import { ArticleForm } from '@/components/article-form'
import { dateInputValue } from '@/lib/domain/admin-date'
import { checkRichText } from '@/lib/domain/rich-text'
import { findArticleForEdit } from '@/lib/services/article-store'
import { requireAdminPage } from '@/lib/services/require-admin'

export const metadata: Metadata = {
  title: 'Editar artigo · Rio Negro Admin',
}

// O JSON do banco passa pelo schema do editor; o que ele não reconhece não chega ao Tiptap.
function richTextBody(json: unknown): JSONContent | null {
  const richText = checkRichText(json ?? null, null)
  return richText.ok ? richText.doc : null
}

export default async function EditArticlePage({ params }: PageProps<'/artigos/[id]'>) {
  const { supabase } = await requireAdminPage()
  const id = z.uuid().safeParse((await params).id)
  if (!id.success) notFound()

  const article = await findArticleForEdit(supabase, id.data)
  if (!article) notFound()

  return (
    <>
      <AdminHeader current="artigos" />
      <main className="mx-auto w-full max-w-(--layout-admin) px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-16">
        <ArticleForm
          isNew={false}
          initial={{
            id: article.id,
            title: article.title,
            slug: article.slug,
            summary: article.summary ?? '',
            contentType: article.content_type,
            publishedDate: dateInputValue(new Date(article.published_at)),
            body: richTextBody(article.article_contents?.body_json),
          }}
        />
      </main>
    </>
  )
}
