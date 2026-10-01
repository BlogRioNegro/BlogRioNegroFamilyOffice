# 0038 · Deploy no StayCloud Deploy Pro com Node 22

- Status: accepted · Data: 2026-09-25
- Specs: [OVW-004](../specs/00-overview.md)
- Complementa: [ADR 0002](0002-hospedagem-staycloud.md)

## Contexto
A [ADR 0002](0002-hospedagem-staycloud.md) previa a hospedagem Pro da StayCloud. Essa hospedagem
compartilhada só oferece Node 16, e o Next 16 exige Node >= 20.9 (o `file-type` 22,
[ADR 0034](0034-validacao-de-upload-e-limite-de-corpo.md), pede Node 22). Um VPS chegou a ser
considerado; o suporte da StayCloud confirmou Node 22 no Deploy Pro.

## Decisão
Definida pelo responsável do projeto:
- Web e admin rodam no **StayCloud Deploy Pro**, com deploy a partir do GitHub: dois projetos,
  com diretório raiz `apps/web` e `apps/admin`.
- Node 22: `package.json` raiz declara `engines.node >= 20.9` e `.nvmrc` fixa `22` (os dois ficam).
- Variáveis de ambiente configuradas no painel de cada projeto.
- Continua valendo o código agnóstico de hospedagem da ADR 0002.

## Consequências
- Validar no primeiro deploy se o install do pnpm roda na raiz do monorepo (workspace); se falhar,
  o fallback é um VPS da StayCloud (Node 22 + Nginx), registrado em nova ADR.
- O app lê o IP do visitante do 1º valor de `X-Forwarded-For` (rate limit e `ip_hash`); o spike da
  F3-002 confirma em qual header o Deploy entrega o IP real.
