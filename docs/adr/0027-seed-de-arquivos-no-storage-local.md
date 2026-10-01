# 0027 · Arquivos do seed local via `config.toml` do Supabase

- Status: accepted · Data: 2026-09-25
- Specs: [DATA-008](../specs/01-data-model.md), [PUB-005, PUB-007](../specs/03-public-site.md)

## Contexto
O seed cria 3 artigos com `cover_path` e `preview_pdf_path`, mas os arquivos não existiam no
Storage local: capas quebradas e prévia pdf sem arquivo. Um script separado exigiria lembrar de
rodá-lo depois de cada `supabase db reset`.

## Decisão
- Capas PNG e PDFs de prévia (2 páginas) pequenos, criados para o projeto, ficam em
  `supabase/storage/<bucket>/<caminho do seed>`.
- `supabase/config.toml` declara `covers` e `article-previews` com `objects_path`; a CLI envia os
  arquivos no `supabase start` e no `supabase db reset`.
- A CLI sobrescreve a configuração do bucket com a do `config.toml`, então ela repete os valores
  da migration de DATA-007 (público, limite e MIME). Mudar um bucket exige mudar os dois.
- `article-files` (PDF completo) continua sem arquivos no seed.

## Consequências
- Depois do `db reset`, nenhuma capa do seed aparece quebrada e a prévia pdf abre.
- Só vale para o Supabase local; produção recebe arquivos pelo admin.
