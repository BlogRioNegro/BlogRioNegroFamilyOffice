# 0025 · Rich text: allowlist em árvore tipada + renderer React

- Status: accepted · Data: 2026-09-25
- Specs: [SEC-007](../specs/02-security-rls.md), [PUB-006](../specs/03-public-site.md), [ADM-005](../specs/05-admin-panel.md)

## Contexto
SEC-007 pede um serializer do JSON do Tiptap para HTML, no server, com allowlist. O CLAUDE.md
proíbe `dangerouslySetInnerHTML` com conteúdo vindo do banco, então uma string HTML gerada à mão
não pode ser injetada na página.

## Decisão
- `apps/web/lib/domain/rich-text.ts` (`parseRichText`): função pura que lê o JSON não confiável e
  devolve uma árvore tipada só com os nós e marcas de ADM-005 (parágrafo, H2/H3, listas, citação,
  imagem, quebra de linha, negrito, itálico, link). O resto é descartado.
- Links só com `http(s)`, `mailto` ou caminho do próprio site; imagens só com `http(s)`. Links
  `http(s)` recebem `rel="noopener noreferrer nofollow"`.
- `apps/web/components/rich-text.tsx` (`RichText`): Server Component que renderiza a árvore.
  O HTML sai do SSR do React, que escapa texto e atributos.
- Sem dependência do Tiptap no `apps/web`: a allowlist é o schema.

## Consequências
- O HTML da prévia só contém o que a árvore permite; os testes de XSS rodam sobre o HTML final.
- Nó novo no editor (ADM-005) só aparece no site depois de entrar na allowlist.
