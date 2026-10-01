-- DATA-004 · leads: um registro por download (ADR 0019); excluir o artigo preserva o lead (ADR 0013).

create type public.webhook_status as enum ('disabled', 'pending', 'sent', 'failed');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles (id) on delete set null,
  article_title_snapshot text not null,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email = lower(email) and char_length(email) <= 254),
  phone text not null check (phone ~ '^\+55\d{10,11}$'),
  consent_at timestamptz not null,
  policy_version text not null,
  marketing_opt_in boolean not null default false,
  ip_hash text not null,
  webhook_status public.webhook_status not null default 'disabled',
  webhook_attempts int not null default 0,
  webhook_last_error text check (char_length(webhook_last_error) <= 500),
  created_at timestamptz not null default now()
);

create index leads_article_id_idx on public.leads (article_id);

create index leads_created_at_idx on public.leads (created_at desc);

create index leads_webhook_failed_idx on public.leads (webhook_status)
  where webhook_status = 'failed';

alter table public.leads enable row level security;
