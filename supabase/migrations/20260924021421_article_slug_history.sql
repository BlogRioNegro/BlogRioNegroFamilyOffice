-- DATA-003 · article_slug_history: slugs anteriores, que redirecionam com 301 (ADR 0006).

create table public.article_slug_history (
  old_slug text primary key
    check (old_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(old_slug) <= 120),
  article_id uuid not null references public.articles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index article_slug_history_article_id_idx on public.article_slug_history (article_id);

alter table public.article_slug_history enable row level security;

-- Um slug não pode ser o atual de um artigo e estar no histórico de outro.
create function public.reject_slug_in_other_article_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.article_slug_history h
    where h.old_slug = new.slug and h.article_id <> new.id
  ) then
    raise exception 'slug % belongs to the history of another article', new.slug
      using errcode = 'unique_violation';
  end if;
  return new;
end;
$$;

create trigger articles_reject_slug_in_history
  before insert or update of slug on public.articles
  for each row execute function public.reject_slug_in_other_article_history();

-- Ao editar o slug, o anterior entra no histórico; voltar a um slug antigo remove a linha dele.
create function public.record_slug_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.article_slug_history h
  where h.old_slug = new.slug and h.article_id = new.id;

  insert into public.article_slug_history (old_slug, article_id) values (old.slug, new.id);
  return null;
end;
$$;

create trigger articles_record_slug_change
  after update of slug on public.articles
  for each row
  when (old.slug is distinct from new.slug)
  execute function public.record_slug_change();

create function public.reject_history_of_current_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.articles a where a.slug = new.old_slug) then
    raise exception 'slug % is the current slug of an article', new.old_slug
      using errcode = 'unique_violation';
  end if;
  return new;
end;
$$;

create trigger article_slug_history_reject_current_slug
  before insert or update on public.article_slug_history
  for each row execute function public.reject_history_of_current_slug();
