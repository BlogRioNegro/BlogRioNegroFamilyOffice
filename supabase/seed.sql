-- Seed local (DATA-008): admin local e 3 artigos de exemplo. Capas e prévias estão em supabase/storage (config.toml); os PDFs completos não existem.
-- Cada artigo e seu conteúdo entram no mesmo statement, porque a F3-005 checa o 1:1 no commit.

with article as (
  insert into public.articles (id, slug, title, summary, cover_path, content_type, preview_json, published_at)
  values (
    '11111111-1111-4111-8111-111111111111',
    'renda-fixa-em-2026',
    'Renda fixa em 2026: o que muda para o investidor',
    'Um panorama dos títulos públicos e privados diante da nova trajetória de juros.',
    '11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
    'rich_text',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Com a nova trajetória da Selic, a renda fixa volta ao centro das carteiras."}]}]}',
    now() - interval '2 days'
  )
  returning id
)
insert into public.article_contents (article_id, body_json, full_pdf_path)
select
  id,
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Com a nova trajetória da Selic, a renda fixa volta ao centro das carteiras."}]},{"type":"paragraph","content":[{"type":"text","text":"Texto completo de exemplo, disponível só após o cadastro."}]}]}',
  id || '/a1b2c3d4-0000-4000-8000-000000000002.pdf'
from article;

with article as (
  insert into public.articles (id, slug, title, summary, cover_path, content_type, preview_pdf_path, published_at)
  values (
    '22222222-2222-4222-8222-222222222222',
    'carteira-recomendada-outubro',
    'Carteira recomendada de outubro',
    'Alocação sugerida por perfil de risco para o próximo mês.',
    '22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000001.png',
    'pdf',
    '22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
    now() - interval '1 day'
  )
  returning id
)
insert into public.article_contents (article_id, full_pdf_path)
select id, id || '/b1b2c3d4-0000-4000-8000-000000000003.pdf'
from article;

with article as (
  insert into public.articles (id, slug, title, summary, cover_path, content_type, preview_pdf_path, published_at)
  values (
    '33333333-3333-4333-8333-333333333333',
    'guia-de-previdencia-privada',
    'Guia de previdência privada: PGBL ou VGBL?',
    'Como escolher o plano certo de acordo com a sua declaração de IR.',
    '33333333-3333-4333-8333-333333333333/c1b2c3d4-0000-4000-8000-000000000001.png',
    'pdf',
    '33333333-3333-4333-8333-333333333333/c1b2c3d4-0000-4000-8000-000000000002.pdf',
    now()
  )
  returning id
)
insert into public.article_contents (article_id, full_pdf_path)
select id, id || '/c1b2c3d4-0000-4000-8000-000000000003.pdf'
from article;

-- Admin local (DATA-006). ATENÇÃO: esta credencial vale só para o Supabase local (seed de dev);
-- a conta de produção é criada pelo dashboard (SEC-001). Login: admin@rionegro.local / rionegro-dev-local.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'authenticated',
  'authenticated',
  'admin@rionegro.local',
  extensions.crypt('rionegro-dev-local', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '', '', '', '', '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'email',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","email":"admin@rionegro.local","email_verified":true}',
  now(),
  now(),
  now()
);

insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@rionegro.local';
