# 0007 · Conteúdo completo só após o lead; prévia pública

- Status: accepted · Data: 2026-09-23
- Specs: [DATA-001, DATA-002](../specs/01-data-model.md), [RLS-003](../specs/02-security-rls.md), [PUB-005](../specs/03-public-site.md)

## Contexto
O objetivo é publicar e captar leads ao mesmo tempo. Embutir o PDF inteiro deixaria o modal
contornável. A anon key do Supabase é pública: qualquer coluna com SELECT público pode ser lida
direto pela API.

## Decisão
- Página pública mostra só a prévia: 2 primeiras páginas (pdf) ou 3 primeiros blocos (rich_text).
- Prévia em `articles` / bucket público; conteúdo completo em `article_contents` (sem acesso
  anon) e bucket privado `article-files`.
- Após o lead, a pessoa recebe o PDF completo (nos dois tipos); o texto não é liberado na página.

## Consequências
- SEO indexa apenas prévia, título e resumo.
- Prévias são geradas no save do admin ([ADR 0008](0008-geracao-pdf.md)).
