import { z } from 'zod'
import { dateInputValue } from '../../../lib/domain/admin-date'
import { leadsCsv } from '../../../lib/domain/leads'
import { GENERIC_ERROR_MESSAGE } from '../../../lib/services/action-result'
import { listLeadsForExport } from '../../../lib/services/leads'
import { requireAdmin } from '../../../lib/services/require-admin'

const articleParam = z.uuid().nullable()

/** ADM-013 · CSV dos leads (geral ou `?artigo=<id>`), gerado aqui com o admin revalidado. */
export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return new Response(auth.error, { status: 401 })

  const articleId = articleParam.safeParse(new URL(request.url).searchParams.get('artigo'))
  if (!articleId.success) return new Response('Artigo inválido.', { status: 400 })

  const leads = await listLeadsForExport(auth.supabase, articleId.data)
  if (!leads) return new Response(GENERIC_ERROR_MESSAGE, { status: 500 })

  return new Response(leadsCsv(leads), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${dateInputValue(new Date())}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
