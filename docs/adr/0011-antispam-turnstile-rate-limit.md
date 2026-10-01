# 0011 · Anti-spam: Turnstile + rate limit no Postgres

- Status: accepted · Data: 2026-09-23
- Specs: [LEAD-005, LEAD-006](../specs/04-lead-capture.md), [DATA-005](../specs/01-data-model.md)

## Contexto
Formulário público. Operadoras móveis usam CGNAT: muitos usuários legítimos compartilham o
mesmo IP, então um limite por IP apertado bloqueia gente real.

## Decisão
- Cloudflare Turnstile é a defesa principal contra bot.
- Rate limit complementar em tabela Postgres (sem serviço extra), por IP e por e-mail, com
  chaves em HMAC. Limites em LEAD-006.

## Consequências
- Limite por IP folgado tolera CGNAT; o limite por e-mail barra repetição do mesmo contato.
- Sem Redis/Upstash.
