# 0001 · Monorepo com pnpm + Turborepo

- Status: accepted · Data: 2026-09-23
- Specs: [OVW-001](../specs/00-overview.md)

## Contexto
Dois apps Next.js (web, admin) compartilham schema/types do Supabase e o design system.

## Decisão
pnpm workspaces + Turborepo. Pacotes internos com escopo `@rio-negro/*`.

## Consequências
- Cache de build/test por pacote; um `pnpm build` na raiz.
- A hospedagem precisa buildar um app em subpasta de monorepo (validado em F3-002, [ADR 0002](0002-hospedagem-staycloud.md)).
