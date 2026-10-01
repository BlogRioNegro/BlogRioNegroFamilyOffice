-- RLS-004 · Políticas do Storage (docs/specs/02-security-rls.md).
-- article-files (PDF completo) só é lido pelo admin ou por URL assinada gerada com a service role.

create policy storage_public_buckets_select on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('covers', 'article-images', 'article-previews'));

create policy storage_article_files_select_admin on storage.objects
  for select to authenticated
  using (bucket_id = 'article-files' and (select public.is_admin()));

create policy storage_insert_admin on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('covers', 'article-images', 'article-previews', 'article-files')
    and (select public.is_admin())
  );

create policy storage_update_admin on storage.objects
  for update to authenticated
  using (
    bucket_id in ('covers', 'article-images', 'article-previews', 'article-files')
    and (select public.is_admin())
  )
  with check (
    bucket_id in ('covers', 'article-images', 'article-previews', 'article-files')
    and (select public.is_admin())
  );

create policy storage_delete_admin on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('covers', 'article-images', 'article-previews', 'article-files')
    and (select public.is_admin())
  );
