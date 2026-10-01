# 0015 · Webhook de leads para o CRM

- Status: accepted · Data: 2026-09-23
- Specs: [LEAD-012](../specs/04-lead-capture.md), [ADM-014](../specs/05-admin-panel.md)

## Contexto
No futuro os leads irão para um CRM; o código já deve suportar a integração.

## Decisão
Webhook opcional, ligado por variável de ambiente, assinado com HMAC, enviado em segundo plano,
com status por lead e reenvio manual das falhas no admin. Nunca bloqueia o download.

## Consequências
- Ligar o CRM é só configurar duas variáveis.
- Sem fila automática de retry.
