'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { failAction, type ActionFailure } from '../lib/services/action-result'
import { createSupabaseServerClient } from '../lib/services/supabase-server'
import { ACCESS_DENIED_MESSAGE, INVALID_CREDENTIALS_MESSAGE } from './login/messages'

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

// login e logout são as únicas actions sem requireAdmin(): elas criam e encerram a sessão.

export async function login(
  _previous: ActionFailure | null,
  formData: FormData,
): Promise<ActionFailure> {
  const credentials = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!credentials.success) return { ok: false, error: INVALID_CREDENTIALS_MESSAGE }

  const supabase = await createSupabaseServerClient()
  const { error: signInError } = await supabase.auth.signInWithPassword(credentials.data)
  if (signInError?.status === 400) return { ok: false, error: INVALID_CREDENTIALS_MESSAGE }
  if (signInError) return failAction('admin.login_failed', signInError)

  const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin')
  if (isAdminError || !isAdmin) {
    await supabase.auth.signOut()
    if (isAdminError) return failAction('admin.is_admin_failed', isAdminError)
    return { ok: false, error: ACCESS_DENIED_MESSAGE }
  }

  redirect('/')
}

export async function logout(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
