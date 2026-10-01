# Fase 3 · Fundação

Specs: [00-overview](../specs/00-overview.md), [01-data-model](../specs/01-data-model.md), [02-security-rls](../specs/02-security-rls.md)

## Monorepo e deploy
- [x] **F3-001** · OVW-001 · Monorepo pnpm + Turborepo: `apps/web`, `apps/admin`, `packages/db`, `packages/ui`, tsconfig base strict, ESLint, Prettier, scripts raiz
- [ ] **F3-002** · OVW-004 · Spike StayCloud: deploy hello world dos dois apps; validar Node 20+, build pnpm em subpasta, env vars, Server Action e geração de PDF (pdf-lib + @react-pdf); registrar resultado em ADR
- [x] **F3-003** · OVW-003 · Supabase CLI local, `config.toml` com signup desligado (SEC-001), `.env.example` completo (SEC-003)

## Schema
- [x] **F3-004** · DATA-001 · Migration `articles` + enum + CHECK + índices + trigger `updated_at`
- [x] **F3-005** · DATA-002 · Migration `article_contents`
- [x] **F3-006** · DATA-003 · Migration `article_slug_history` + trigger de unicidade entre slugs
- [x] **F3-007** · DATA-004 · Migration `leads` + enum `webhook_status` + índices
- [x] **F3-008** · DATA-005 · Migration `lead_rate_limits` + função `consume_rate_limit`
- [x] **F3-009** · DATA-006 · Migration `admin_users` + seed do admin local
- [x] **F3-010** · DATA-007 · Buckets com limites de tamanho e MIME
- [x] **F3-011** · DATA-008 · Script `pnpm db:types`, types gerados em `packages/db`, seed com 3 artigos

## RLS e segurança
- [x] **F3-012** · RLS-001 · RLS habilitado em todas as tabelas + teste que detecta tabela sem RLS
- [x] **F3-013** · RLS-002 · Função `is_admin()`
- [x] **F3-014** · RLS-003 · Políticas das tabelas + testes da matriz (anon, autenticado, admin)
- [x] **F3-015** · RLS-004 · Políticas do Storage + teste de acesso anon ao bucket privado
- [x] **F3-016** · SEC-003 · `env.ts` com Zod em cada app
- [x] **F3-017** · SEC-002 · Client service role `server-only` no `apps/web`
- [x] **F3-018** · SEC-006 · Headers de segurança nos dois apps
- [x] **F3-019** · SEC-004 · Hasher HMAC (IP e e-mail) + teste

## Auth e testes
- [x] **F3-020** · ADM-001 · Login do admin com `@supabase/ssr`
- [x] **F3-021** · ADM-002 · Middleware + helper `requireAdmin()` usado em toda action
- [x] **F3-022** · OVW-005 · Vitest e Playwright configurados na raiz contra o Supabase local
- [x] **F3-023** · SEC-005 · Teste: Server Action do admin sem sessão retorna erro e não altera dados
- [x] **F3-024** · SEC-008 · Helper de erro genérico para o client + logger do server sem dados pessoais
