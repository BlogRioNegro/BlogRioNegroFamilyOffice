# 0016 · Supabase local para dev, um projeto de produção

- Status: accepted · Data: 2026-09-23
- Specs: [OVW-003](../specs/00-overview.md), [DATA-008](../specs/01-data-model.md)

## Decisão
Um único projeto Supabase na nuvem (produção). Desenvolvimento e testes (Vitest, Playwright)
rodam no Supabase CLI local com Docker. Migrations versionadas; seed local.

## Consequências
- Testes nunca sujam leads reais nem arriscam o schema de produção.
- Requer Docker na máquina de desenvolvimento.
