# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 7 na branch `fase-7` (criada da `fase-6`). Fechando o gate do PR `fase-7` → `main` com as
correções escolhidas pelo Rafael: QA-1, SEC-2, SEC-3. F7-001, F7-003 e F7-004 `[x]`. Sem push.

## Próxima tarefa
Gate final do PR `fase-7` → `main`: `pnpm test` verde (467 + 90 de integração); faltam
`pnpm build` e `pnpm test:e2e` (o build foi negado pela permissão do agente; rodar à mão).
Com os dois verdes: código pronto para o PR; próximo: deploy com o Rafael.

## Feito nesta rodada
- Capa de até 5 MB otimizada no browser (ADR 0041): `c1fc6bb`.
- QA-1: `StyleNonce` fixa o nonce do documento uma única vez: `2769954`.
- SEC-2: logger só com `code` e `message` de erro do banco; nome por code points: `8ec72fd`.
- SEC-3: `poweredByHeader: false` nos dois apps: `2b057df`.

## Fora do escopo (decisão do Rafael)
SEC-1, SEC-7, QA-2 a QA-4 e as tarefas de produção (F7-002, F7-005 a F7-009) ficam para depois.

## Regras do loop
- A skill `security-review` exige `origin/HEAD`; sem remote, a revisão do diff é manual.
- Build de produção para QA: `pnpm build`; web `next start --port 3200`, admin `--port 3201`.
  E2E: web :3100/:3102, admin :3101; parar servidores antes (`taskkill //PID <pid> //T //F`).
- "Corrigido em `<hash>`" no `docs/revisao-final.md` entra no commit seguinte (`docs(memory)`),
  porque um commit não contém o próprio hash.
- Scripts de investigação ficam no scratchpad da sessão, nunca no repo.
- Nunca ler `.env*`. `pnpm test` exige Docker + `pnpm exec supabase start`.

## Pendências pós-deploy
- SEC-4: sem `Strict-Transport-Security`; adicionar no `next.config.ts` ou confirmar no Deploy Pro.
- SEC-5: `[auth.email] enable_signup = true`; desligar no projeto de produção e testar signUp.
- SEC-6: Turnstile sem checagem de `hostname`; validar o hostname de produção.

## Pendências para o Rafael
- Rodar `pnpm build` e `pnpm test:e2e` (gate final); parar `pnpm dev` antes.
- Artigo manual `teste` (criado às 10:08 de 28/09) removido do banco local: sujava a integração.
- SEC-1 / F3-002: confirmar em qual header o Deploy entrega o IP real do visitante.
- ADR 0039: reenvio de lead de artigo excluído manda `article.id = null`; confirmar com o CRM.
- Deploy Pro: validar se o install do pnpm roda na raiz do monorepo; se falhar, VPS.
- Comando de start no Deploy Pro: `node .next/standalone/server.js` (`next start` avisa).
- Turnstile de teste no `.env.local`; DPO; aceites PUB-007/010/012; `corepack enable`; domínios.
