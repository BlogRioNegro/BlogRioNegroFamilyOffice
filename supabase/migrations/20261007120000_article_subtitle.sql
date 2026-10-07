-- DATA-001 · ADM-004 · articles.subtitle: segunda linha do título, opcional (ADR 0048).
-- Mesmo limite do título (160). Nunca fica vazio: o que não tem subtítulo é null.
-- A coluna herda a RLS e os grants de articles (leitura pública, escrita só do admin).

alter table public.articles
  add column subtitle text check (char_length(subtitle) between 1 and 160);

-- save_article ganha o parâmetro opcional `subtitle`. Um parâmetro novo muda a assinatura, então a
-- função antiga sai antes: com as duas, a chamada sem `subtitle` ficaria ambígua no PostgREST.
-- A migration roda numa transação, e quem chama sem `subtitle` continua atendido pelo default.
drop function public.save_article(
  uuid, text, text, text, public.article_content_type, timestamptz, text, text, jsonb, text, jsonb
);

create function public.save_article(
  article_id uuid,
  slug text,
  title text,
  cover_path text,
  content_type public.article_content_type,
  published_at timestamptz,
  full_pdf_path text,
  summary text default null,
  preview_json jsonb default null,
  preview_pdf_path text default null,
  body_json jsonb default null,
  subtitle text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
#variable_conflict use_column
declare
  -- String vazia (ou só espaços) vira null.
  clean_subtitle text := nullif(btrim(save_article.subtitle), '');
begin
  insert into public.articles as a (
    id, slug, title, subtitle, summary, cover_path, content_type, preview_json, preview_pdf_path,
    published_at
  )
  values (
    save_article.article_id,
    save_article.slug,
    save_article.title,
    clean_subtitle,
    save_article.summary,
    save_article.cover_path,
    save_article.content_type,
    save_article.preview_json,
    save_article.preview_pdf_path,
    save_article.published_at
  )
  on conflict (id) do update set
    slug = excluded.slug,
    title = excluded.title,
    subtitle = excluded.subtitle,
    summary = excluded.summary,
    cover_path = excluded.cover_path,
    content_type = excluded.content_type,
    preview_json = excluded.preview_json,
    preview_pdf_path = excluded.preview_pdf_path,
    published_at = excluded.published_at;

  insert into public.article_contents as c (article_id, body_json, full_pdf_path)
  values (save_article.article_id, save_article.body_json, save_article.full_pdf_path)
  on conflict (article_id) do update set
    body_json = excluded.body_json,
    full_pdf_path = excluded.full_pdf_path;

  return save_article.article_id;
end;
$$;

revoke execute on function public.save_article from public, anon;
grant execute on function public.save_article to authenticated;
