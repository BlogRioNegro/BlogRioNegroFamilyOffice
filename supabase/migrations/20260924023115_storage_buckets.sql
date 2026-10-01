-- DATA-007 · Buckets com limite de tamanho (MiB) e MIME no próprio bucket.
-- Políticas de acesso ficam para a RLS-004 (F3-015). O server revalida por magic bytes (ADM-006).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('covers', 'covers', true, 2 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']),
  ('article-images', 'article-images', true, 2 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']),
  ('article-previews', 'article-previews', true, 20 * 1024 * 1024, array['application/pdf']),
  ('article-files', 'article-files', false, 20 * 1024 * 1024, array['application/pdf']);
