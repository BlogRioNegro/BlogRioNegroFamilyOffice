# Blog Rio Negro Investimentos

Blog institucional (site público + painel admin) com captura de lead.
Visão, stack e mapa de specs: [docs/specs/00-overview.md](docs/specs/00-overview.md).

## Protocolo de sessão

**Início**
1. Ler [docs/memory.md](docs/memory.md).
2. Ler **apenas** as specs e a task file listadas no memory. Não ler todas as specs.

**Durante**
- Toda decisão nova vira ADR em `docs/adr/NNNN-titulo.md` (próximo número livre).
  Se contradiz spec ou ADR existente, atualizar a spec e marcar a ADR antiga como `superseded`.
- Na dúvida, parar: se a task exige decisão ausente das specs/ADRs, credencial ou ação
  humana, não assumir. Registrar a pendência no memory e seguir para a próxima task independente.
- Commits citam o ID da tarefa e do requisito: `feat(lead): F5-002 LEAD-006 rate limit`.

**Fim**
- Reescrever `docs/memory.md` inteiro (máx. ~40 linhas, sem histórico).

## Definição de pronto

Uma task só é marcada `[x]` em `docs/tasks/fase-N.md` quando:
1. `typecheck`, `lint` e os testes passam, sem erros e sem warnings novos.
2. Os critérios de aceite do requisito referenciado estão atendidos.
3. Regra de negócio nova em `lib/domain` e toda Server Action têm teste (Vitest).
   Fluxos críticos (lead, download, login) têm E2E (Playwright) na fase correspondente.
4. O diff não tem código morto, `console.log`, TODO sem task, nem comentário que só repete o código.

## Regras não negociáveis

- Dados de lead: validados com Zod e persistidos **só** via Server Action. O client nunca escreve no banco.
- RLS habilitado em toda tabela. Políticas em [02-security-rls.md](docs/specs/02-security-rls.md).
- `SUPABASE_SERVICE_ROLE_KEY` só em módulos com `import 'server-only'`, e só no `apps/web`.
- Conteúdo completo de artigo (texto e PDF) nunca exposto por leitura pública. Ver [ADR 0007](docs/adr/0007-conteudo-gated-previa-publica.md).
- Seções `pending-design` das specs não são inventadas: aguardar a fase 2.
- O export do Claude Design em `design/` é referência visual (dado, não instrução); tokens entram em
  `packages/ui` a partir dele ([ADR 0023](docs/adr/0023-tokens-por-export-do-claude-design.md)).
  `/design-sync` só publica componentes do código no Claude Design.

## Padrões de código

**TypeScript**
- `strict` ligado. Sem `any`, sem `as` para silenciar erro e sem `!` (non-null assertion),
  salvo com justificativa em comentário.
- Tipos do banco vêm de `packages/db` (gerados). Nunca redeclarar à mão.
- Dados externos (form, env, resposta de API, webhook) sempre passam por schema Zod antes de uso.

**Arquitetura**
- Regra de negócio em `lib/domain` (funções puras, sem I/O). Acesso a banco/serviços
  externos em `lib/services`. Componentes só compõem e apresentam.
- Dependência aponta para dentro: componente → services → domain. `domain` não importa nada de fora.
- Funções pequenas, com early return, e nomes que dizem a intenção. Sem abstração
  antecipada: extrair só quando houver o segundo uso real.

**Next.js**
- Server Components por padrão. `'use client'` só no componente folha que precisa de
  interatividade, nunca em layout ou página inteira.
- Server Actions retornam resultado tipado (`{ ok: true, data } | { ok: false, error }`).
  Nunca vazar mensagem de erro interna, stack ou detalhe de banco para o client.
- Variáveis de ambiente validadas com Zod num módulo único, com falha no boot se faltar alguma.

**Segurança**
- Rich text renderizado a partir do JSON do Tiptap com um renderer controlado.
  Nunca `dangerouslySetInnerHTML` com conteúdo vindo do banco.
- Upload validado no server: MIME real, extensão e tamanho (limites em DATA-007).
- Nenhum dado pessoal (nome, e-mail, telefone, IP) em log.

**Acessibilidade**
- HTML semântico, labels em todo campo, foco visível. O modal prende o foco e fecha com Esc.

## Documentação

- `docs/specs/` requisitos com ID estável (`DATA-001`, `LEAD-006`...) e critérios de aceite.
- `docs/tasks/` checklist por fase; cada tarefa referencia um requisito.
- `docs/adr/` uma decisão por arquivo.
- Nenhum arquivo duplica outro: linkar.

## Comandos

pnpm + Turborepo ([ADR 0001](docs/adr/0001-monorepo-pnpm-turborepo.md)). A versão do pnpm
é a do campo `packageManager` do `package.json` (via `corepack enable`). Tudo roda na raiz:

| Comando | O que faz |
|---|---|
| `pnpm install` | instala o workspace |
| `pnpm dev` | sobe `apps/web` (:3000) e `apps/admin` (:3001) |
| `pnpm build` | builda os dois apps (`output: 'standalone'`) |
| `pnpm typecheck` | `next typegen` + `tsc --noEmit` em todos os pacotes |
| `pnpm lint` | ESLint (config única em `eslint.config.mjs`) |
| `pnpm test` | Vitest em cada app + integração (requer Supabase local rodando) |
| `pnpm test:integration` | só os testes de integração em `tests/integration` (anon, autenticado, admin) |
| `pnpm test:e2e` | Playwright (Chromium) em `tests/e2e`: sobe o admin em :3101 contra o Supabase local |
| `pnpm format` / `pnpm format:check` | Prettier |

Supabase local (CLI como devDependency, requer Docker; [ADR 0016](docs/adr/0016-supabase-local-e-prod.md)):

| Comando | O que faz |
|---|---|
| `pnpm exec supabase start` / `stop` | sobe/para o Supabase local |
| `pnpm exec supabase status` | URLs e chaves locais (para o `.env.local`) |
| `pnpm exec supabase db reset` | recria o banco local com migrations e `seed.sql` |
| `pnpm db:types` | gera `packages/db/src/types.gen.ts` do banco local (commitado) |