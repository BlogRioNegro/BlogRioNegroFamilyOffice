-- DATA-001 · articles: dados públicos do artigo (prévia). Conteúdo completo fica em article_contents.

create type public.article_content_type as enum ('pdf', 'rich_text');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 3 and 160),
  summary text check (char_length(summary) <= 160),
  cover_path text not null,
  content_type public.article_content_type not null,
  preview_json jsonb,
  preview_pdf_path text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_preview_matches_content_type check (
    (content_type = 'rich_text' and preview_json is not null and preview_pdf_path is null)
    or (content_type = 'pdf' and preview_pdf_path is not null and preview_json is null)
  )
);

create index articles_published_at_created_at_idx
  on public.articles (published_at desc, created_at desc);

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

alter table public.articles enable row level security;
