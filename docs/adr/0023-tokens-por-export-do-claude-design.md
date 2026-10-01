# 0023 · Tokens entram por export do Claude Design

- Status: accepted · Data: 2026-09-24
- Specs: [DS-003](../specs/06-design-system.md)

## Contexto
O design system aprovado na fase 1 foi exportado do Claude Design para `design/`
(tokens em `design/design-system/tokens/*.css`). A spec previa trazer os tokens com `/design-sync`.

## Decisão
- Os tokens entram no código a partir do **export** do Claude Design: `packages/ui` reproduz os
  mesmos nomes e valores em CSS variables e no `@theme` do Tailwind v4.
- `/design-sync` serve só para publicar componentes do código no Claude Design, não para trazer tokens.
- `design/` é referência versionada, fora de lint, typecheck, Prettier e Turbo. Nenhum código de
  `design/` é copiado para `apps/` ou `packages/`.
- Única diferença intencional: `--font-sans` e `--font-serif` apontam para as variáveis do
  `next/font` (`--font-inter`, `--font-source-serif`) no lugar do nome literal da família,
  mantendo a mesma pilha de fallback.

## Consequências
- Um teste compara `packages/ui`, o export em `design/` e a tabela Tokens da spec 06.
- Novo export do Claude Design exige atualizar `packages/ui` e a spec 06 no mesmo commit.
