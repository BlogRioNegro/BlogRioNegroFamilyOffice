# 0030 · Textos e ações da página de erro

- Status: accepted · Data: 2026-09-25
- Specs: [PUB-015](../specs/03-public-site.md), [SEC-008](../specs/02-security-rls.md)

## Contexto
PUB-015 pede as páginas `not-found` e `error`, mas o protótipo só tem o 404 e nenhuma spec
definia os textos da página de erro.

## Decisão
Definida pelo responsável do projeto: mesmo layout do 404, título "Algo deu errado", texto
"Não foi possível carregar esta página agora. Tente novamente em instantes.", botão primário
"Tentar novamente" (chama o `reset` do error boundary) e link "Ver artigos" para `/artigos`.

## Consequências
- `apps/web/components/error-state.tsx` é o layout comum de `app/not-found.tsx` e `app/error.tsx`.
- A página de erro nunca mostra mensagem, digest ou stack do erro.
