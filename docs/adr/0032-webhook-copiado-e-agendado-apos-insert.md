# 0032 · Webhook do lead: código copiado para o admin e agendado após o insert

- Status: accepted · Data: 2026-09-25
- Specs: [LEAD-007, LEAD-012](../specs/04-lead-capture.md), [ADM-014](../specs/05-admin-panel.md)
- Relacionadas: [ADR 0015](0015-webhook-crm.md), [ADR 0021](0021-codigo-de-server-duplicado-por-app.md)

## Contexto
A [ADR 0021](0021-codigo-de-server-duplicado-por-app.md) deixou para a F5-007 decidir se o envio do
webhook seria a exceção à duplicação de código de server. O reenvio do admin (ADM-014) precisa do
mesmo payload e da mesma assinatura. A ordem de LEAD-007 também deixava um caso aberto: se a URL
assinada (etapa 6) falha depois do insert, o lead ficaria `pending` para sempre.

## Decisão
Definidas pelo responsável do projeto:
- **Código duplicado, sem pacote compartilhado.** O envio e a assinatura ficam em
  `apps/web/lib/services/lead-webhook.ts` e são copiados para o `apps/admin` na F6-012, como os
  demais utilitários de server (ADR 0021).
- **Vetor de teste fixo.** `tests/fixtures/lead-webhook-signature.json` (secret, timestamp, body e
  assinatura esperada, calculada à parte com `node:crypto`) é usado pelos testes dos dois apps,
  para garantir que a cópia assine igual.
- **Agendado sempre que o insert der certo.** Com `LEAD_WEBHOOK_URL` definida, o lead nasce
  `pending` e o envio é agendado com `after()` depois da tentativa da URL assinada, mesmo se ela
  falhar. Nenhum lead fica `pending` sem envio.

## Consequências
- Mudança no payload ou na assinatura exige alterar as duas cópias; o vetor fixo quebra o teste
  da cópia que ficar para trás.
- Um lead cuja URL falhou ainda chega ao CRM; o usuário pode tentar de novo, gerando outro lead
  ([ADR 0019](0019-lead-um-registro-por-download.md)).
