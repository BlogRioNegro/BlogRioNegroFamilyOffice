-- RLS-002 · is_admin(): o usuário da sessão está na allowlist admin_users (ADR 0014).

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
