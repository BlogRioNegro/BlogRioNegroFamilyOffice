# Revisão final · Fase 7

Auditoria somente leitura da branch `fase-7` (a partir da `fase-6`, commit `00afb7b`), em
2026-09-25, contra o Supabase local. Nenhum código de `apps/`, `packages/` ou `supabase/` foi
alterado; só entraram este relatório, `tests/e2e/a11y.spec.ts` e a devDependency `@axe-core/playwright`. Dados de exemplo nos testes e scripts são fictícios.

Tarefas: [F7-001](tasks/fase-7.md) (security review), F7-003 (QA exploratório) e F7-004
(acessibilidade).

## 1. Resumo

| Severidade | Qtde |
|---|---|
| Crítico | 0 |
| Alto | 0 |
| Médio | 2 |
| Baixo | 9 |

A11Y (F7-004): 0 violações axe em 22 cenários.

**Pronto para deploy: sim.** Nenhum achado bloqueia. Condições: confirmar o SEC-1 (header de IP)
no 1º deploy e concluir as tarefas de produção (F7-002, F7-005 a F7-009).

Correções mais urgentes: **QA-1** (CSP do Dialog após o login), **SEC-1** (IP do rate limit) e
**SEC-2** (nome em log e lead com nome de 1 emoji recusado).

## 2. Achados

Ordenados do mais grave para o menos grave. Esforço: P (< 1 h), M (meio dia), G (> 1 dia).

| ID | Sev. | Onde | Evidência | Correção sugerida | Esf. | Bloqueia? |
|---|---|---|---|---|---|---|
| SEC-1 | Médio | `apps/web/lib/domain/client-ip.ts:10` | O rate limit por IP (LEAD-006) usa o 1º valor de `X-Forwarded-For`, que o cliente controla se o proxy da hospedagem não o sobrescrever. Trocando o header a cada envio, o limite de 20/10 min por IP deixa de valer; restam o Turnstile e o limite por e-mail. Não verificado em produção: depende do header que o Deploy Pro entrega (pendência F3-002). | Ler o IP do header que o Deploy Pro garante (ou do último salto confiável) e testar isso no 1º deploy. | P | não (confirmar no deploy) |
| QA-1 | Médio | `apps/admin/components/style-nonce.tsx:9` (a cópia do web é igual) | Build de produção: depois do login (redirect da Server Action para `/artigos`), abrir o 1º `Dialog` ("Ações" a 390 px ou "Excluir" a 1440 px) gera `style-src-elem` bloqueado no `<style>` do `react-remove-scroll`. Após reload da página, 0 violações. A navegação por Server Action re-renderiza o layout com o nonce do request novo, e `setNonce` troca para ele, mas a CSP do documento continua a da 1ª carga. Efeito: o fundo não trava a rolagem e o console acusa violação. O e2e `csp-dialog.spec.ts` não pega o caso, porque navega com `page.goto`. | Fixar o nonce da 1ª carga (`setNonce` só na primeira chamada, ou ler o nonce de um `<script nonce>` do documento) e cobrir no e2e a abertura após o login. | P | não · **corrigido** em `2769954` |
| SEC-2 | Baixo | `apps/web/lib/domain/redact.ts:14` e `apps/web/lib/domain/lead.ts:45` | O redact mascara e-mail, telefone e IP, mas não o nome dentro do `details` do Postgres ("Failing row contains (…)"): script temporário com um erro 23514 no formato do Postgres manteve o nome em claro. O caminho é alcançável: `'😀'.length === 2` no JS (passa no `min(2)` do Zod) e `char_length = 1` no Postgres (viola o CHECK), então o insert falha e `lead.request_failed` loga o `details`. | Não logar `details` de erro do banco (só `code` e `message`) e validar o nome por code points (`[...name].length`). | P | não · **corrigido** em `8ec72fd` |
| SEC-3 | Baixo | `apps/web/next.config.ts`, `apps/admin/next.config.ts` | `X-Powered-By: Next.js` nas páginas dos dois apps (`next start`, script de headers). | `poweredByHeader: false` nos dois `next.config.ts`. | P | não · **corrigido** em `2b057df` |
| SEC-4 | Baixo | build de produção dos dois apps | Sem `Strict-Transport-Security` em nenhuma rota (script de headers). A CSP já tem `upgrade-insecure-requests`. | Adicionar HSTS no `next.config.ts` ou confirmar que o Deploy Pro envia. | P | não |
| SEC-5 | Baixo | `supabase/config.toml:228` | SEC-001 cumprido localmente (`POST /auth/v1/signup` → 422 `signup_disabled`), mas não há teste automatizado de `signUp`, e `[auth.email] enable_signup = true` contradiz o `[auth] enable_signup = false` que prevalece. | Pôr `false` também em `[auth.email]` e criar teste de integração do `signUp`. | P | não |
| SEC-6 | Baixo | `apps/web/lib/services/turnstile.ts:31` | O `siteverify` confere só `success`; `hostname` e `action` da resposta não são checados. | Recusar token cujo `hostname` não seja o de `NEXT_PUBLIC_SITE_URL`. | P | não |
| SEC-7 | Baixo | `apps/admin/app/auth-actions.ts:16` | O login do admin não tem limite próprio. O limite do Supabase Auth (`sign_in_sign_ups = 30`, por IP) vê o IP do servidor Next, compartilhado por todos: um atacante pode esgotar o limite e travar o login do admin. Não verificado empiricamente. | Limite por IP do cliente na action de login (mesma tabela `lead_rate_limits`, chave própria). | M | não |
| QA-2 | Baixo | chunk do Zod 4 no client (web e admin) | Ao carregar a página do artigo, o evento `securitypolicyviolation` registra `script-src` / `eval` bloqueado, sem mensagem no console. A origem é a sonda `allowsEval` do Zod (`Function("")` em try/catch), presente em 1 chunk de cada app. Inofensivo, mas polui relatórios de CSP (se um `report-to` for ligado). | `z.config({ jitless: true })` no client dos dois apps. | P | não |
| QA-3 | Baixo | `apps/admin/app/artigos/actions.ts:333` | `uploadArticleImage` envia a imagem do editor na hora para `article-images/<id>/`. Se o artigo nunca for salvo, ou a imagem sair do documento antes de salvar, nada a remove: o Storage local tinha 1 imagem numa pasta de artigo inexistente (`storage.objects`). O bucket é público. | Remover, ao salvar, as imagens da pasta que não estão no `body_json`, e limpar pastas sem artigo (rotina ou botão no admin). | M | não |
| QA-4 | Baixo | `supabase/seed.sql:18`, `:39`, `:57` | Os 3 artigos do seed apontam `full_pdf_path` para arquivos que não existem em `supabase/storage`. No ambiente local, todo download de artigo do seed grava o lead e responde "Não foi possível concluir." (log `lead.signed_url_failed`, "Object not found"). Só afeta dev/QA; em produção não há seed. | Adicionar os PDFs completos em `supabase/storage/article-files` (e o bucket no `config.toml`). | P | não |

## 3. Matriz RLS-* / SEC-*

| Critério | Status | Evidência |
|---|---|---|
| RLS-001 · RLS em todas as tabelas, sem `using (true)` para escrita | ✅ | `tests/integration/rls-enabled.test.ts` (3 testes verdes) |
| RLS-002 · `is_admin()` | ✅ | `tests/integration/is-admin.test.ts` (anon, autenticado comum e admin); escrita negada na matriz |
| RLS-003 · Matriz de acesso (anon, autenticado, admin) | ✅ | `tests/integration/rls-matrix.test.ts`: 18 testes cobrindo as 6 tabelas, permitido e negado; leads sem INSERT de anon nem admin. Produção fica para a F7-002 |
| RLS-004 · Storage | ✅ | `tests/integration/storage-policies.test.ts`: `article-files` 400/404 para anon, URL assinada funciona e expira, escrita só do admin em todos os buckets |
| SEC-001 · Signup desligado | ✅ local / produção na F7-008 | `POST /auth/v1/signup` local → 422 `signup_disabled`; ver SEC-5 |
| SEC-002 · Service role só no server do web | ✅ | Só `apps/web/lib/services/supabase-service-role.ts` (com `import 'server-only'`) cria o client; importado só por `leads.ts`, `rate-limit.ts` e `lead-webhook.ts` (todos `server-only`). Nenhuma referência em `apps/admin`. Varredura de `.next/static` dos dois apps: nem a chave local nem os nomes das variáveis secretas |
| SEC-003 · Env validado no boot | ✅ (exceto `.env.example`) | `lib/env.ts` + `instrumentation.ts` nos dois apps; `next start` com `LEAD_HASH_SECRET` curto (web) e `LEAD_WEBHOOK_URL` http (admin) aborta com "Variáveis de ambiente ausentes ou inválidas: …", sem o valor. `.env.example`: **não verificado** (regra: nunca ler `.env*`) |
| SEC-004 · Hash de identificadores | ✅ | `identifier-hash.test.ts`; `rate-limit.ts` usa HMAC para IP e e-mail; nenhum log com IP (lista de chamadas do logger revisada) |
| SEC-005 · Autorização em profundidade | ✅ | `require-admin-usage.test.ts` acha as 3 entradas de server (`artigos/actions.ts`, `leads/actions.ts`, `leads/exportar/route.ts`) e exige `requireAdmin()` na 1ª linha; `admin-article-actions.test.ts` chama cada uma sem cookie |
| SEC-006 · Headers de segurança | ✅ | `proxy.test.ts` dos dois apps; build de produção: CSP com nonce e `strict-dynamic`, sem `'unsafe-inline'` em script, nonce diferente em 3 requests, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`, admin com `X-Robots-Tag: noindex`. Ver SEC-3 e SEC-4 |
| SEC-007 · Renderização segura | ✅ | `apps/web/lib/domain/rich-text.test.ts` e `components/rich-text.test.tsx` (`<script>`, `javascript:`, `on*`, `rel="noopener noreferrer nofollow"`); nenhum `dangerouslySetInnerHTML` em `apps/` e `packages/` |
| SEC-008 · Erros genéricos | ✅ com ressalva | `failAction` nos dois apps devolve mensagem fixa; detalhes só no log. Ver SEC-2 (nome no log) |

### Outras verificações da F7-001

- **Skill `security-review`:** não rodou. Ela exige `origin/HEAD`, e o repositório não tem remote.
  O diff `main...fase-7` (417 arquivos) foi revisado à mão nos pontos de entrada: Server Actions,
  route handler, `proxy.ts`, upload, Turnstile, rate limit, webhook, CSV e renderer.
- **`pnpm audit --prod`:** "No known vulnerabilities found".
- **Segredos no histórico:** `git log -p --all`, excluindo `.env*` e o lockfile, buscando JWT,
  `sb_secret_`, `sb_publishable_`, `SUPABASE_SERVICE_ROLE_KEY=` e chaves privadas: nenhuma
  ocorrência. Os únicos `.env*` versionados são os dois `.env.example` (não lidos).
- **PII em log:** todas as chamadas de `logger`/`failAction` revisadas; o logger passa tudo por
  `redactPersonalData`. Único vazamento encontrado: SEC-2.

## 4. QA exploratório (F7-003)

Builds de produção (`pnpm build` + `next start`: web :3200, admin :3201), Chromium a 1440 × 900 e
390 × 844, com scripts Playwright temporários (sem Playwright MCP nesta sessão). Console, eventos
`securitypolicyviolation`, respostas HTTP ≥ 400 e `scrollWidth > clientWidth` monitorados em cada
passo. Conteúdo e leads de QA foram criados e removidos no fim (e-mails fictícios `qa-*`).

| Fluxo | 1440 | 390 | Observação |
|---|---|---|---|
| Home, listagem, /privacidade | ✅ | ✅ | 200, sem overflow, sem CSP |
| Artigo pdf e rich_text (criados no QA) | ✅ | ✅ | 200; prévia de 3 blocos no texto |
| 404 (`/artigos/nao-existe-qa`) | ✅ | ✅ | 404 com a página própria; o "Failed to load resource" do console é o próprio documento |
| Erro (`revoke select` temporário em `articles`) | ✅ | ✅ | 500 com "Algo deu errado"; grant restaurado no `finally` |
| 301 do slug antigo | ✅ | ✅ | 301 → slug novo, depois de editar o slug no admin |
| Modal de lead: aberto, erros (4 campos), enviando, sucesso ("Pronto!") | ✅ | ✅ | Turnstile gerou token; download iniciado |
| Modal: rate limit por e-mail (4º envio em 10 min) | não rodado | ✅ | "Muitas tentativas, tente em alguns minutos" |
| Modal: "O link de download expirou" | não verificado | não verificado | Exige esperar a URL de 60 s expirar e clicar em "Baixar novamente"; não automatizado |
| Teclado nos dialogs (Tab preso, Shift+Tab, Esc, foco volta ao gatilho) | ✅ | ✅ | Modal do web, "Excluir artigo?" e "Ações do artigo", por clique e por teclado. Numa rodada a 390 px o Tab saiu uma vez do modal; não se repetiu em 12 execuções (provável foco no iframe do Turnstile durante a carga) |
| Admin: login (erro e sucesso), lista, criar pdf, criar texto, editar slug, excluir | ✅ | ✅ (lista, form, dialogs) | Ver QA-1 (CSP após o login) |
| Admin: leads (geral e por artigo), CSV | ✅ | ✅ | CSV baixado; leads de artigo excluído seguem na lista geral com o título original |
| Admin: "Reenviar falhas" | não verificado no build | não verificado no build | O botão não apareceu, então o ambiente local não define o webhook (`.env.local` não foi lido); é o comportamento da spec. Coberto pelo e2e `admin-leads.spec.ts` e pela integração `admin-lead-webhook.test.ts` |

## 5. Acessibilidade (F7-004)

`tests/e2e/a11y.spec.ts` roda o axe (`@axe-core/playwright` 4.13, tags `wcag2a`, `wcag2aa`,
`wcag21a`, `wcag21aa`) só com `A11Y=1`, contra os servidores do e2e (web :3100 em `next dev` e
:3102 em build de produção). Comando: `A11Y=1 pnpm test:e2e a11y`.

| Tela / estado | 1440 | 390 |
|---|---|---|
| Home, listagem, artigo pdf, artigo rich_text, /privacidade, 404 | 0 violações | 0 violações |
| Página de erro (`revoke select` temporário) | 0 | 0 |
| Modal · aberto | 0 | 0 |
| Modal · erros de validação | 0 | 0 |
| Modal · erro no envio (Turnstile recusado, :3102) | 0 | 0 |
| Modal · sucesso ("Pronto!") | 0 | 0 |
| Modal · link expirado (relógio avançado 2 min com `page.clock`) | 0 | 0 |

Resultado: **22 cenários, 0 violações.** Para confirmar que não é um falso negativo, rodei o mesmo
`AxeBuilder` com as mesmas tags num HTML de teste (imagem sem `alt`, botão sem nome, campo sem
label, contraste baixo): ele acusou `image-alt`, `button-name`, `label` e `color-contrast`.

Limites da auditoria automática:
- O axe cobre só parte dos critérios WCAG; leitor de tela real (NVDA, VoiceOver) não foi usado.
- O iframe do Turnstile é de outra origem e não é inspecionado.
- O estado "Enviando…" é transitório e não foi auditado.
- O admin fica fora do escopo da DS-006. O teclado nos dialogs dele foi checado no QA (seção 4).
- Adicionar a devDependency fez o `pnpm` re-resolver o `vitest` da raiz no lockfile, com o peer
  opcional `happy-dom`; nenhuma versão mudou.

## 6. Fora do escopo

- **Header de IP no Deploy Pro** (SEC-1) e HSTS (SEC-4): dependem da infraestrutura da StayCloud
  (F3-002, F7-007).
- **Signup e allowlist em produção:** F7-008. **Matriz RLS em produção:** F7-002.
- **`next start` com `output: 'standalone'`:** o Next avisa que o servidor certo é
  `node .next/standalone/server.js`. Definir o comando de start no Deploy Pro (F7-007).
