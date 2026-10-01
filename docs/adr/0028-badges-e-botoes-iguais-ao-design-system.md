# 0028 · Badges e botões iguais ao export do design system

- Status: accepted · Data: 2026-09-25
- Specs: [DS-004](../specs/06-design-system.md)

## Contexto
O `TypeBadge` de `packages/ui` saía branco com borda e ~26 px de altura em todos os formatos, e os
botões não tinham a borda transparente de 1 px do `rn-btn`, ficando 2 px mais estreitos que no
protótipo. A [ADR 0026](0026-ordem-da-pagina-do-artigo.md) tinha mantido o badge fora do protótipo.

## Decisão
- Badges seguem o `rn-badge` de `design/design-system/components/components.css`: 24 px de altura,
  borda transparente, PDF em `--color-surface-muted` sem borda, Texto em `--color-surface` com
  `--color-border`, status Desativado sem borda.
- `Button` tem borda transparente de 1 px em todas as variantes; o secundário usa
  `--color-border-strong` e escurece para `--color-text-muted` no hover.

- Na F5-013 (modal de lead), pelo mesmo critério: `Button` em `loading` mantém a cor do hover
  (`rn-btn[aria-busy]`) em vez do estilo desabilitado; `Checkbox` com rótulo `text-sm`, erro recuado
  até o texto e estados desabilitados do `rn-check`; `Alert` com corpo `text-xs`, título `text-sm` e
  padding 12/16 (`rn-alert`); `DialogContent` com 16 px de padding no mobile, 16 px entre cabeçalho e
  corpo, título com `pt-2` e "Fechar" recuado 8 px (`rn-modal`).
- Na F6-001 (lista do admin), pelo mesmo critério: `Button` sm com texto `text-xs` (`rn-btn--sm`) e
  `Table` com `shadow-card` (`rn-table-wrap`).

## Consequências
- Badges e botões com as mesmas medidas do protótipo nos dois apps.
- Contraste do badge PDF registrado na spec 06 (13,70:1).
