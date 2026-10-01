# 0020 · CSP com nonce por request

- Status: accepted · Data: 2026-09-23
- Specs: [SEC-006](../specs/02-security-rls.md)

## Contexto
O App Router injeta scripts inline (payload do RSC). Uma CSP sem nonce só funciona com
`'unsafe-inline'` em `script-src`, o que anula a proteção contra XSS.

## Decisão
- Cada app (web e admin) gera um nonce novo a cada request no `proxy.ts` e envia a CSP com
  `script-src 'self' 'nonce-<nonce>' 'strict-dynamic'`. O Next aplica o nonce aos próprios scripts.
- A CSP libera o próprio domínio, a origem de `NEXT_PUBLIC_SUPABASE_URL` e o Turnstile
  (`https://challenges.cloudflare.com` em `script-src` e `frame-src`), com `frame-ancestors 'none'`.
- `'unsafe-inline'` em scripts está descartado.
- `apps/web` (PUB-007, 2026-09-25): `frame-src` e `object-src` liberam só o caminho do bucket público
  de prévias (`<supabase>/storage/v1/object/public/article-previews/`), porque a prévia pdf é
  embutida num `<object>` (o Chrome aplica `frame-src`, o Firefox `object-src`). Antes,
  `object-src 'none'`.
- Estilos injetados em runtime (2026-09-25): o `Dialog` do Radix (`react-remove-scroll`) cria um
  `<style>` ao abrir. O layout raiz de cada app lê o `x-nonce` do request e o componente folha
  `StyleNonce` chama `setNonce` do `get-nonce` antes de qualquer `Dialog`. `style-src` segue sem
  `'unsafe-inline'` (e2e `csp-dialog.spec.ts`).

## Consequências
- Páginas com nonce precisam de render dinâmico; custa pouco porque a [ADR 0003](0003-renderizacao-dinamica.md)
  já deixa as rotas dinâmicas.
- Script de terceiro novo exige atualizar a CSP no `proxy.ts` dos dois apps.
