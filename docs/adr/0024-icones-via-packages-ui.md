# 0024 · Ícones dos apps via `@rio-negro/ui/icons`

- Status: accepted · Data: 2026-09-25
- Specs: [DS-004](../specs/06-design-system.md), [03-public-site](../specs/03-public-site.md)

## Contexto
As telas do site usam ícones do `lucide-react` (setas, download, arquivo). O pacote é dependência
só de `packages/ui`, e o pnpm não deixa os apps importarem dependência de outro pacote.
Adicionar `lucide-react` a cada app duplicaria a versão a manter.

## Decisão
`packages/ui` expõe o subpath `@rio-negro/ui/icons`, que reexporta só os ícones usados pelos apps.
Os apps importam ícones desse subpath; ícone novo entra na lista quando uma tela passa a usá-lo.

## Consequências
- Uma única versão do `lucide-react` no workspace, controlada por `packages/ui`.
- Os ícones não entram no índice de componentes do pacote (a tabela da spec 06 continua igual).
