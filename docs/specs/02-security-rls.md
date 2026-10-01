---
id: 02-security-rls
status: approved
fase: 3
depends_on: [00-overview.md, 01-data-model.md]
---

# 02 · Segurança e RLS

Tabelas e buckets: [01-data-model](01-data-model.md).

## RLS

### RLS-001 · RLS em todas as tabelas
**Aceite:** teste SQL (pgTAP ou script) falha se alguma tabela em `public` estiver com
`relrowsecurity = false`. Nenhuma política usa `using (true)` para escrita.

### RLS-002 · Função `is_admin()`
`security definer`, `stable`, `search_path` fixo; retorna `exists(select 1 from admin_users
where user_id = auth.uid())` ([ADR 0014](../adr/0014-admin-allowlist.md)).
**Aceite:** um usuário autenticado fora de `admin_users` recebe `false` e não escreve em
nenhuma tabela nem bucket.

### RLS-003 · Matriz de acesso

| Tabela | anon | authenticated não-admin | admin (`is_admin()`) | service role |
|---|---|---|---|---|
| `articles` | SELECT | SELECT | ALL | ALL |
| `article_contents` | — | — | ALL | ALL |
| `article_slug_history` | SELECT | SELECT | ALL | ALL |
| `leads` | — | — | SELECT, UPDATE (`webhook_*`), DELETE | ALL |
| `lead_rate_limits` | — | — | — | ALL |
| `admin_users` | — | — | SELECT próprio | ALL |

Leads **não têm INSERT** por anon nem por admin: só a Server Action do `apps/web` insere,
com service role ([LEAD-007](04-lead-capture.md)).
**Aceite:** testes de integração com os clients anon, autenticado comum e admin cobrem cada
célula da matriz (permitido e negado).

### RLS-004 · Políticas do Storage

| Bucket | Leitura | Escrita/remoção |
|---|---|---|
| `covers`, `article-images`, `article-previews` | pública | `is_admin()` |
| `article-files` | só service role (URL assinada) e `is_admin()` | `is_admin()` |

**Aceite:** request anon a um objeto de `article-files` retorna 400/404; URL assinada gerada
pelo server funciona por 60 s e expira depois ([LEAD-009](04-lead-capture.md)).

## Fronteira client/server

### SEC-001 · Cadastro desativado
Signup desativado no Supabase (local e prod). Conta fixa criada pelo dashboard.
**Aceite:** `supabase.auth.signUp` retorna erro nos dois ambientes; `config.toml` versiona
`enable_signup = false`.

### SEC-002 · Service role só no server do `apps/web`
**Aceite:**
- O client com service role vive em módulo com `import 'server-only'` em `apps/web/lib/services`.
- `apps/admin` não tem a variável; opera com a sessão do admin sob RLS.
- Build falha se o módulo for importado em Client Component; grep no bundle do client não
  encontra a chave.

### SEC-003 · Inventário de variáveis de ambiente

| Variável | App | Exposta ao client |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | web, admin | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web, admin | sim |
| `SUPABASE_SERVICE_ROLE_KEY` | web | **não** |
| `NEXT_PUBLIC_SITE_URL` | web, admin | sim |
| `ADMIN_SITE_URL` | admin | não |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | web | sim |
| `TURNSTILE_SECRET_KEY` | web | **não** |
| `LEAD_HASH_SECRET` | web | **não** |
| `LEAD_WEBHOOK_URL` | web, admin | **não** (opcional) |
| `LEAD_WEBHOOK_SECRET` | web, admin | **não** (opcional) |
| `NEXT_PUBLIC_RIO_NEGRO_URL` | web | sim |

Regras dos segredos: `LEAD_HASH_SECRET` e `LEAD_WEBHOOK_SECRET` têm no mínimo 32 caracteres.
Com `LEAD_WEBHOOK_URL` definida, `LEAD_WEBHOOK_SECRET` é obrigatório e a URL precisa ser `https`.

**Aceite:** cada app valida as variáveis com Zod na inicialização (`env.ts`) e falha no boot
se faltar uma obrigatória ou uma regra acima falhar; `.env.example` lista todas sem valores reais.

### SEC-004 · Hash de identificadores
IP e e-mail usados no rate limit, e o `ip_hash` do lead, são HMAC-SHA256 com
`LEAD_HASH_SECRET`. O IP em texto claro nunca é persistido nem logado.
**Aceite:** nenhuma coluna ou log contém IP em claro; teste unitário do hasher.

### SEC-005 · Autorização no admin em profundidade
Middleware redireciona sem sessão para `/login`; **toda** Server Action e route handler do
admin revalida a sessão e `is_admin()` antes de agir (o middleware não basta).
**Aceite:** chamar uma Server Action do admin sem cookie de sessão retorna erro de
autorização e não altera dados.

### SEC-006 · Headers de segurança
CSP com nonce gerado a cada request no `proxy.ts` de cada app ([ADR 0020](../adr/0020-csp-com-nonce.md)):
`script-src 'self' 'nonce-…' 'strict-dynamic'`, sem `'unsafe-inline'` em scripts; libera a origem do
Supabase (de `NEXT_PUBLIC_SUPABASE_URL`), o Turnstile (`challenges.cloudflare.com` em `script-src` e
`frame-src`) e o próprio domínio; `frame-ancestors 'none'`.
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` restritiva. Admin com `X-Robots-Tag: noindex`.
**Aceite:** checagem automatizada dos headers nas rotas principais dos dois apps, incluindo
nonce diferente a cada request.

### SEC-007 · Renderização segura de conteúdo
HTML gerado a partir de JSON do Tiptap é produzido no server por serializer com allowlist
de nós e marcas; links externos recebem `rel="noopener noreferrer nofollow"`.
**Aceite:** teste com JSON contendo `<script>`, `javascript:` e atributos `on*` não gera
nada executável.

### SEC-008 · Mensagens de erro
Erros ao client são genéricos; detalhes vão só para o log do server, sem dados pessoais.
**Aceite:** nenhuma resposta de erro inclui stack, SQL ou dados de outro lead.

## Fora de escopo

- MFA para o admin, WAF próprio (a StayCloud Pro fornece anti-DDoS), pentest externo.
- Criptografia de colunas além da padrão do Supabase.
