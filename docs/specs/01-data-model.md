---
id: 01-data-model
status: approved
fase: 3
depends_on: [00-overview.md]
---

# 01 · Modelo de dados

Políticas de acesso de cada tabela e bucket: [02-security-rls](02-security-rls.md).

## Requisitos

### DATA-001 · Tabela `articles` (dados públicos)

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `slug` | text unique not null | `^[a-z0-9]+(-[a-z0-9]+)*$`, máx. 120 |
| `title` | text not null | 3–160 caracteres |
| `summary` | text null | máx. 160 caracteres |
| `cover_path` | text not null | caminho no bucket `covers` |
| `content_type` | enum `article_content_type` (`pdf`, `rich_text`) not null | |
| `preview_json` | jsonb null | obrigatório se `rich_text`; nulo se `pdf` |
| `preview_pdf_path` | text null | obrigatório se `pdf`; nulo se `rich_text` |
| `published_at` | timestamptz not null | default `now()`, editável |
| `created_at` / `updated_at` | timestamptz not null | default `now()`; `updated_at` via trigger |

Não existe coluna de status nem de destaque ([ADR 0004](../adr/0004-destaque-automatico.md),
[ADR 0005](../adr/0005-publicacao-imediata.md)).

**Aceite:**
- CHECK garante a combinação `content_type` × `preview_json`/`preview_pdf_path`.
- Índice em `published_at desc, created_at desc`.
- Nenhuma coluna guarda conteúdo completo.

### DATA-002 · Tabela `article_contents` (conteúdo completo, privado)

| Coluna | Tipo | Regra |
|---|---|---|
| `article_id` | uuid PK, FK `articles.id` on delete cascade | 1:1 |
| `body_json` | jsonb null | documento Tiptap completo; obrigatório se `rich_text` |
| `full_pdf_path` | text not null | caminho no bucket `article-files` (upload ou PDF gerado) |
| `updated_at` | timestamptz not null | default `now()`; trigger |

**Aceite:** todo artigo tem exatamente uma linha em `article_contents`, criada na mesma
transação (função `save_article` ou Server Action transacional).

### DATA-003 · Tabela `article_slug_history`

| Coluna | Tipo | Regra |
|---|---|---|
| `old_slug` | text PK | mesmo formato de `articles.slug` |
| `article_id` | uuid not null, FK `articles.id` on delete cascade | |
| `created_at` | timestamptz not null | default `now()` |

O slug é **editável**; ao editar, o slug anterior entra aqui e passa a redirecionar com 301
([ADR 0006](../adr/0006-slug-editavel-historico-301.md)).

**Aceite:**
- Um slug não pode existir ao mesmo tempo em `articles.slug` e em `article_slug_history`
  de outro artigo (checado por trigger).
- Se o admin voltar a um slug antigo do próprio artigo, a linha de histórico é removida.

### DATA-004 · Tabela `leads`

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `article_id` | uuid null, FK `articles.id` **on delete set null** | |
| `article_title_snapshot` | text not null | título no momento do download |
| `name` | text not null | 2–120 |
| `email` | text not null | minúsculo, máx. 254 |
| `phone` | text not null | E.164 brasileiro, `^\+55\d{10,11}$` |
| `consent_at` | timestamptz not null | momento do aceite LGPD |
| `policy_version` | text not null | versão do aviso aceito |
| `marketing_opt_in` | boolean not null | default `false` |
| `ip_hash` | text not null | HMAC-SHA256 do IP ([SEC-004](02-security-rls.md)) |
| `webhook_status` | enum `webhook_status` (`disabled`, `pending`, `sent`, `failed`) not null | default `disabled` |
| `webhook_attempts` | int not null | default 0 |
| `webhook_last_error` | text null | máx. 500 |
| `created_at` | timestamptz not null | default `now()` |

Um registro por download ([ADR 0019](../adr/0019-lead-um-registro-por-download.md)).
Excluir artigo preserva leads ([ADR 0013](../adr/0013-exclusao-preserva-leads.md)).

**Aceite:** índices em `article_id`, `created_at desc` e `webhook_status` (parcial, `failed`).

### DATA-005 · Tabela `lead_rate_limits`

| Coluna | Tipo | Regra |
|---|---|---|
| `key` | text | `ip:<hash>` ou `email:<hash>` |
| `window_start` | timestamptz | início da janela de 10 min |
| `count` | int not null | |
| PK | (`key`, `window_start`) | |

**Aceite:** função `consume_rate_limit(key text, "limit" int, "window" interval)` faz upsert
atômico por janela fixa (`date_bin`, [ADR 0022](../adr/0022-convencoes-do-schema.md)) e retorna se passou; linhas com mais de 24 h são apagadas pela própria função.

### DATA-006 · Tabela `admin_users`

`user_id uuid PK FK auth.users.id on delete cascade`, `created_at timestamptz not null default now()`.
**Aceite:** populada por seed/migration manual com o UUID da conta fixa; sem tela de gestão.

### DATA-007 · Buckets do Storage

| Bucket | Público | Conteúdo | Tipos | Máx. |
|---|---|---|---|---|
| `covers` | sim | capas | JPG, PNG | 2 MiB |
| `article-images` | sim | imagens inline do editor | JPG, PNG | 2 MiB |
| `article-previews` | sim | PDF de prévia (2 páginas) | PDF | 20 MiB |
| `article-files` | **não** | PDF completo (upload ou gerado) | PDF | 20 MiB |

Caminhos: `<article_id>/<uuid>.<ext>`. Capa recomendada 16:9 (sem bloqueio por proporção).
**Aceite:** limites de tamanho e MIME configurados no próprio bucket e revalidados no server
por magic bytes ([ADM-006](05-admin-panel.md)), com os mesmos números lidos de uma constante única
([ADR 0022](../adr/0022-convencoes-do-schema.md)).

### DATA-008 · Migrations e types

**Aceite:**
- Toda mudança de schema é uma migration em `supabase/migrations/`, versionada.
- `pnpm db:types` gera `packages/db/src/types.gen.ts`; o arquivo gerado é commitado.
- `supabase db reset` recria o banco local com seed (admin local + 3 artigos de exemplo, com capas e
  prévias pdf enviadas ao Storage a partir de `supabase/storage`; [ADR 0027](../adr/0027-seed-de-arquivos-no-storage-local.md)).

## Fora de escopo

- Soft delete, versionamento de artigos, auditoria de edições.
- Contagem de visualizações ou downloads (derivável de `leads`).
- Retenção automática de leads (exclusão é manual, [ADR 0012](../adr/0012-lgpd-consentimento.md)).
