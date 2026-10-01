-- DATA-007 · ADR 0037 · Capa e imagens do editor aceitam só JPEG e PNG: o PDF do rich text
-- (@react-pdf) não embute WebP.

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png']
where id in ('covers', 'article-images');
