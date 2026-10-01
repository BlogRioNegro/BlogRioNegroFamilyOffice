# 0004 · Destaque automático

- Status: accepted · Data: 2026-09-23
- Specs: [PUB-002](../specs/03-public-site.md)

## Contexto
A listagem tem um artigo em destaque fixo no topo. Opções: manual (`is_featured`), automático, híbrido.

## Decisão
Destaque = artigo com `published_at` mais recente. Sem coluna nem campo no admin. O destaque
não se repete na lista abaixo.

## Consequências
- Zero manutenção; para destacar um artigo antigo, o admin edita a data de publicação.
