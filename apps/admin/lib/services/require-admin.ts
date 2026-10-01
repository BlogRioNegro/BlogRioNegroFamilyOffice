import 'server-only'
import { redirect } from 'next/navigation'
import { failAction, type ActionFailure } from './action-result'
import { createSupabaseServerClient } from './supabase-server'

export const UNAUTHORIZED_MESSAGE = 'Sessão expirada ou sem permissão. Entre novamente.'

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

export type AdminContext = { ok: true; supabase: SupabaseServerClient; userId: string }

// Obrigatório na primeira linha de toda Server Action e route handler do admin (SEC-005):
// o proxy só checa a sessão; aqui a sessão é revalidada e a allowlist é consultada.
export async function requireAdmin(): Promise<AdminContext | ActionFailure> {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase.auth.getUser()
  if (!data.user) return { ok: false, error: UNAUTHORIZED_MESSAGE }

  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  if (error) return failAction('admin.is_admin_failed', error)
  if (!isAdmin) return { ok: false, error: UNAUTHORIZED_MESSAGE }

  return { ok: true, supabase, userId: data.user.id }
}

/** Páginas do painel: sem sessão de admin, volta para /login em vez de renderizar. */
export async function requireAdminPage(): Promise<AdminContext> {
  const auth = await requireAdmin()
  if (!auth.ok) redirect('/login')
  return auth
}
