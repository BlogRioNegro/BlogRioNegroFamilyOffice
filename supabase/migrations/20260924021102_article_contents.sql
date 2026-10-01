-- DATA-002 · article_contents: conteúdo completo e privado, 1:1 com articles.

create table public.article_contents (
  article_id uuid primary key references public.articles (id) on delete cascade,
  body_json jsonb,
  full_pdf_path text not null,
  updated_at timestamptz not null default now()
);

create trigger article_contents_set_updated_at
  before update on public.article_contents
  for each row execute function public.set_updated_at();

alter table public.article_contents enable row level security;

-- As regras envolvem duas tabelas, então são checadas no commit (constraint trigger adiada):
-- todo artigo tem exatamente uma linha aqui, e body_json é obrigatório se o artigo é rich_text.
create function public.check_article_content(target_article_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  article_type public.article_content_type;
  content_found boolean;
  body_missing boolean;
begin
  select a.content_type into article_type from public.articles a where a.id = target_article_id;
  if not found then
    return;
  end if;

  select true, c.body_json is null into content_found, body_missing
  from public.article_contents c
  where c.article_id = target_article_id;

  if content_found is null then
    raise exception 'article % has no article_contents row', target_article_id
      using errcode = 'check_violation';
  end if;

  if article_type = 'rich_text' and body_missing then
    raise exception 'article % is rich_text and requires body_json', target_article_id
      using errcode = 'check_violation';
  end if;
end;
$$;

revoke execute on function public.check_article_content(uuid) from public, anon, authenticated;

create function public.check_article_content_from_articles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.check_article_content(new.id);
  return null;
end;
$$;

create function public.check_article_content_from_contents()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.check_article_content(old.article_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.check_article_content(new.article_id);
  end if;
  return null;
end;
$$;

create constraint trigger articles_require_content
  after insert or update of content_type on public.articles
  deferrable initially deferred
  for each row execute function public.check_article_content_from_articles();

create constraint trigger article_contents_match_article
  after insert or update or delete on public.article_contents
  deferrable initially deferred
  for each row execute function public.check_article_content_from_contents();
