-- DATA-006 · admin_users: allowlist da conta fixa do admin (ADR 0014). Sem tela de gestão.

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
