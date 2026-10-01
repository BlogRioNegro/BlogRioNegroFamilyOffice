# 0002 · Hospedagem na StayCloud, código agnóstico

- Status: accepted · Data: 2026-09-23
- Complementada por: [ADR 0038](0038-staycloud-deploy-pro-node-22.md) (Deploy Pro com Node 22)
- Specs: [OVW-004](../specs/00-overview.md)

## Contexto
Todos os sites da agência rodam na StayCloud (plano Pro já contratado, "SSR/Node completo").
A documentação pública não informa versão do Node, suporte a monorepo/pnpm nem número de
instâncias. A Vercel é a hospedagem nativa do Next.js.

## Decisão
- Hospedar web e admin na StayCloud Pro, um projeto para cada.
- Código sem APIs exclusivas de hospedagem: `output: 'standalone'`, sem Vercel Analytics/Cron/KV.
- Spike na F3-002 valida Node 20+, build pnpm em subpasta, env vars, Server Action e geração
  de PDF. Se o monorepo não for suportado: script de build por app na raiz.
- Plano B se o spike falhar: Vercel (registrar em nova ADR).

## Consequências
- Sem dependência de cache compartilhado entre instâncias ([ADR 0003](0003-renderizacao-dinamica.md)).
- Tarefas agendadas (cron) não são usadas.
