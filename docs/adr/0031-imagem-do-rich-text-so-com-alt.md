# 0031 · Imagem do rich text só com `alt` obrigatório, sem legenda

- Status: accepted · Data: 2026-09-25
- Specs: [ADM-005](../specs/05-admin-panel.md), [PUB-006](../specs/03-public-site.md), [SEC-007](../specs/02-security-rls.md)

## Contexto
A seção de UI da spec 03 citava "legendas em `text-xs`", mas o editor (ADM-005) não tinha atributo
de legenda e a allowlist do rich text ([ADR 0025](0025-rich-text-arvore-sanitizada.md)) só conhece
`src` e `alt`.

## Decisão
Definida pelo responsável do projeto: legenda de imagem fica fora do escopo da v1. A imagem do rich
text tem só `alt`, obrigatório no editor.

## Consequências
- O admin (fase 6) não salva artigo com imagem sem `alt`.
- A allowlist e o renderer do site não mudam: `src` e `alt`, sem `figcaption`.
