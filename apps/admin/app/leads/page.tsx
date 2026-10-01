import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin-header'
import { LeadsView } from '@/components/leads-view'
import { pageFromParam } from '@/lib/domain/leads'
import { listLeads } from '@/lib/services/leads'
import { countFailedLeads, webhookConfigFromEnv } from '@/lib/services/lead-webhook'
import { requireAdminPage } from '@/lib/services/require-admin'

export const metadata: Metadata = {
  title: 'Leads · Rio Negro Admin',
}

const pageHref = (page: number) => (page === 1 ? '/leads' : `/leads?pagina=${page}`)

// ADM-013 · Lista geral: inclui os leads de artigos excluídos (título original no snapshot).
export default async function LeadsPage({ searchParams }: PageProps<'/leads'>) {
  const { supabase } = await requireAdminPage()
  const page = pageFromParam((await searchParams).pagina)
  const { leads, total } = await listLeads(supabase, null, page)
  if (leads.length === 0 && page > 1) redirect('/leads')
  const failedCount = webhookConfigFromEnv() ? await countFailedLeads(supabase, null) : null

  return (
    <>
      <AdminHeader current="leads" />
      <LeadsView
        leads={leads}
        total={total}
        page={page}
        scope="todos os artigos"
        exportHref="/leads/exportar"
        pageHref={pageHref}
        articleId={null}
        failedCount={failedCount}
      />
    </>
  )
}
