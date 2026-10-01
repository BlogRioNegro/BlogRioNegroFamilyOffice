-- DATA-002 · DATA-003 · ADM-004 · save_article: cria ou atualiza o artigo e o conteúdo na mesma
-- transação. O slug anterior entra em article_slug_history pelo trigger record_slug_change.
-- security invoker: roda com a sessão de quem chama, então a RLS de articles e article_contents
-- continua valendo (só o admin escreve).

-- Os parâmetros que podem ser nulos vêm por último, com default null.
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
  body_json jsonb default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
#variable_conflict use_column
begin
  insert into public.articles as a (
    id, slug, title, summary, cover_path, content_type, preview_json, preview_pdf_path, published_at
  )
  values (
    save_article.article_id,
    save_article.slug,
    save_article.title,
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
