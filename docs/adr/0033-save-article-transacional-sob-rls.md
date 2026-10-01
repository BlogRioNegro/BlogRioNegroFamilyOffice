# 0033 · `save_article` transacional sob RLS

- Status: accepted · Data: 2026-09-25
- Specs: [DATA-002, DATA-003](../specs/01-data-model.md), [ADM-004, ADM-010](../specs/05-admin-panel.md), [SEC-002](../specs/02-security-rls.md)

## Contexto
DATA-002 exige que artigo e `article_contents` sejam gravados na mesma transação ("função
`save_article` ou Server Action transacional"). O admin não tem service role (SEC-002) e o
supabase-js não abre transação pelo PostgREST.

## Decisão
- Função `public.save_article(...)` em plpgsql, `security invoker`: upsert de `articles` e de
  `article_contents` por id; o histórico de slug continua no trigger `record_slug_change`.
  Roda com a sessão do admin, então a RLS decide quem escreve. `execute` revogado de `anon`.
- Parâmetros que podem ser nulos (`summary`, `preview_json`, `preview_pdf_path`, `body_json`)
  vêm por último com `default null`, para os tipos gerados os marcarem como opcionais.
- O id do artigo novo é gerado na página `/artigos/novo`, para os arquivos usarem
  `<article_id>/<uuid>.<ext>` (DATA-007) antes do primeiro salvamento.
- Data de publicação (ADM-010): se o dia não mudou, o instante anterior é mantido; senão vale o
  dia escolhido com o horário do salvamento, no fuso de Brasília.

## Consequências
- Falha em qualquer parte desfaz o artigo inteiro; a Server Action remove os arquivos que enviou.
- Anon e autenticado fora de `admin_users` recebem `42501` (teste `save-article.test.ts`).
