---
id: 00-overview
status: approved
fase: 0
depends_on: []
---

# 00 · Visão geral

## Visão

Blog institucional da **Rio Negro Assessoria de Investimentos** (parceira XP) para publicar
artigos (majoritariamente PDFs) e captar leads. Dois lados:

- **Site público** (`apps/web`): visitantes leem a prévia dos artigos sem conta e baixam o
  artigo completo após deixar nome, e-mail e telefone. Não é rede social: sem perfil,
  curtida, comentário ou feed personalizado. Layout de feed em coluna única é só visual.
- **Painel admin** (`apps/admin`): uma única pessoa publica artigos e consulta leads.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js App Router, TypeScript estrito |
| Monorepo | pnpm + Turborepo ([ADR 0001](../adr/0001-monorepo-pnpm-turborepo.md)) |
| Dados | Supabase: Postgres, Auth, Storage |
| UI | Tailwind + shadcn/ui, tokens do Claude Design em `packages/ui` |
| Validação | Zod no client e no server |
| Hospedagem | StayCloud Pro ([ADR 0002](../adr/0002-hospedagem-staycloud.md)) |
| Testes | Vitest + Playwright ([ADR 0017](../adr/0017-testes-vitest-playwright.md)) |

## Requisitos

### OVW-001 · Estrutura do monorepo
```
apps/web      site público
apps/admin    painel admin
packages/db   migrations, types gerados do Supabase, clients tipados
packages/ui   design system (tokens + componentes base)
supabase/     config do Supabase CLI e migrations
```
**Aceite:** `pnpm build` na raiz builda os dois apps; cada app importa `@rio-negro/db` e
`@rio-negro/ui`; `tsconfig` base com `strict: true` herdado por todos.

### OVW-002 · Documentação spec-driven
Specs, tasks, ADRs e memory seguem o protocolo do [CLAUDE.md](../../CLAUDE.md).
**Aceite:** toda spec tem frontmatter, IDs, critérios de aceite e "Fora de escopo"; toda
task referencia um ID existente.

### OVW-003 · Ambientes
Desenvolvimento e testes no Supabase local (CLI); um único projeto Supabase de produção
([ADR 0016](../adr/0016-supabase-local-e-prod.md)).
**Aceite:** `supabase start` + `pnpm dev` sobem os dois apps sem acessar produção;
`.env.example` documenta todas as variáveis de [SEC-003](02-security-rls.md).

### OVW-004 · Deploy
Dois projetos na StayCloud (web e admin), build `output: 'standalone'`, sem APIs exclusivas
de uma hospedagem ([ADR 0002](../adr/0002-hospedagem-staycloud.md)), no Deploy Pro com Node 22
([ADR 0038](../adr/0038-staycloud-deploy-pro-node-22.md)).
**Aceite:** o spike da tarefa F3-002 comprova Node 20+, build pnpm do app em subpasta,
variáveis de ambiente, Server Action e geração de PDF em produção.

### OVW-005 · Testes
Vitest para `lib/domain` e `lib/services`; Playwright para login admin e fluxo de lead.
QA exploratório com Playwright MCP na fase 7.
**Aceite:** `pnpm test` e `pnpm test:e2e` rodam na raiz contra o Supabase local.

## Mapa de specs

| Spec | Prefixo | Fase |
|---|---|---|
| [01-data-model](01-data-model.md) | DATA | 3 |
| [02-security-rls](02-security-rls.md) | RLS, SEC | 3 |
| [03-public-site](03-public-site.md) | PUB | 4 |
| [04-lead-capture](04-lead-capture.md) | LEAD | 5 |
| [05-admin-panel](05-admin-panel.md) | ADM | 6 |
| [06-design-system](06-design-system.md) | DS | 1–2 |

## Fases

| Fase | Entrega | Tasks |
|---|---|---|
| 0 | Specs, ADRs, protocolo | [fase-0](../tasks/fase-0.md) |
| 1 | Claude Design: design system + protótipos (fora do Claude Code) | [fase-1](../tasks/fase-1.md) |
| 2 | Handoff: seções de UI das specs + `/design-sync` | [fase-2](../tasks/fase-2.md) |
| 3 | Fundação: monorepo, schema, RLS, auth, spike StayCloud (paralela à 1) | [fase-3](../tasks/fase-3.md) |
| 4 | Site público | [fase-4](../tasks/fase-4.md) |
| 5 | Captura de lead | [fase-5](../tasks/fase-5.md) |
| 6 | Painel admin | [fase-6](../tasks/fase-6.md) |
| 7 | Security review, QA, deploy | [fase-7](../tasks/fase-7.md) |

## Glossário

- **Prévia**: parte pública do artigo; regra de corte em [ADM-007 e ADM-008](05-admin-panel.md).
- **Conteúdo completo**: texto/PDF integral, só entregue após o lead ([ADR 0007](../adr/0007-conteudo-gated-previa-publica.md)).
- **Destaque**: artigo com `published_at` mais recente ([ADR 0004](../adr/0004-destaque-automatico.md)).
- **Lead**: um registro por download (nome, e-mail, telefone, consentimento).

## Pendências

- Domínios do site público e do admin (serão da Rio Negro). Até lá: `NEXT_PUBLIC_SITE_URL`
  e `ADMIN_SITE_URL` em env.
- Contato do encarregado de dados (DPO) da Rio Negro, necessário para o texto de
  [LEAD-013](04-lead-capture.md). Validação na F7-006.

## Fora de escopo

- Múltiplos usuários, papéis, cadastro, convite e recuperação de senha pelo app.
- Rascunho e agendamento de publicação ([ADR 0005](../adr/0005-publicacao-imediata.md)).
- Autor, categorias, tags, busca.
- Comentários, curtidas, perfis, newsletter e envio de e-mail.
- Analytics no lançamento.
- Internacionalização (só pt-BR).
