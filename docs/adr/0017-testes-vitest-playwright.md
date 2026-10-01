# 0017 · Testes com Vitest e Playwright

- Status: accepted · Data: 2026-09-23
- Specs: [OVW-005](../specs/00-overview.md)

## Decisão
Vitest para regra de negócio e serviços; Playwright para login admin e fluxo de lead;
Playwright MCP para QA exploratório na fase 7.

## Consequências
- Lógica fora dos componentes é pré-requisito para testar sem renderizar UI.
