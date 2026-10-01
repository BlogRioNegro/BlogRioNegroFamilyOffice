import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { AdminHeader } from '@/components/admin-header'
import { LeadsView } from '@/components/leads-view'
import { pageFromParam } from '@/lib/domain/leads'
import { findArticleSummary, listLeads } from '@/lib/services/leads'
import { countFailedLeads, webhookConfigFromEnv } from '@/lib/services/lead-webhook'
import { requireAdminPage } from '@/lib/services/require-admin'

export const metadata: Metadata = {
  title: 'Leads do artigo · Rio Negro Admin',
}

// ADM-013 · Leads de um artigo, do mais recente para o mais antigo.
export default async function ArticleLeadsPage({
  params,
  searchParams,
}: PageProps<'/artigos/[id]/leads'>) {
  const { supabase } = await requireAdminPage()
  const id = z.uuid().safeParse((await params).id)
  if (!id.success) notFound()

  const article = await findArticleSummary(supabase, id.data)
  if (!article) notFound()

  const basePath = `/artigos/${article.id}/leads`
  const page = pageFromParam((await searchParams).pagina)
  const { leads, total } = await listLeads(supabase, article.id, page)
  if (leads.length === 0 && page > 1) redirect(basePath)
  const failedCount = webhookConfigFromEnv() ? await countFailedLeads(supabase, article.id) : null

  return (
    <>
      <AdminHeader current="artigos" />
      <LeadsView
        leads={leads}
        total={total}
        page={page}
        scope={article.title}
        backToArticles
        exportHref={`/leads/exportar?artigo=${article.id}`}
        pageHref={(target) => (target === 1 ? basePath : `${basePath}?pagina=${target}`)}
        articleId={article.id}
        failedCount={failedCount}
      />
    </>
  )
}
