# 0039 · Reenvio do webhook no admin: sessão do admin e artigo excluído

- Status: accepted · Data: 2026-09-25
- Specs: [ADM-014](../specs/05-admin-panel.md), [LEAD-012](../specs/04-lead-capture.md)
- Relacionadas: [ADR 0013](0013-exclusao-preserva-leads.md), [ADR 0032](0032-webhook-copiado-e-agendado-apos-insert.md)

## Contexto
A F6-012 copia `apps/web/lib/services/lead-webhook.ts` para o admin. A cópia do web grava o status
com a service role, que o admin não tem (SEC-002). E um lead `failed` pode ter perdido o artigo
(`article_id = null`, ADR 0013), caso que o payload `article: { id, title }` da LEAD-012 não previa.

## Decisão
- A cópia do admin (`apps/admin/lib/services/lead-webhook.ts`) mantém payload, assinatura e timeout,
  e grava `webhook_status`, `webhook_attempts` e `webhook_last_error` com a sessão do admin (RLS e
  `grant update` dessas colunas).
- Reenvio de lead de artigo excluído: `article: { id: null, title: <article_title_snapshot> }`,
  para o lead ainda chegar ao CRM (mesma linha da ADR 0032). **A confirmar** com quem integra o CRM.
- O reenvio é por filtro: na lista do artigo, só os `failed` dele; na lista geral, todos.
- Sem `LEAD_WEBHOOK_URL` o botão não aparece (ADM-014); a Server Action, se chamada, responde que o
  reenvio está desligado.

## Consequências
- O CRM precisa aceitar `article.id` nulo no reenvio.
- O e2e do admin usa `https://crm.invalid/webhook` (RFC 2606): o reenvio falha na hora, sem rede.
