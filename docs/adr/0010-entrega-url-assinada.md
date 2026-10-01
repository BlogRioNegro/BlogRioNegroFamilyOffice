# 0010 · Entrega por URL assinada, sem e-mail

- Status: accepted · Data: 2026-09-23
- Specs: [LEAD-009](../specs/04-lead-capture.md)

## Decisão
Após o insert do lead, a Server Action devolve uma URL assinada de 60 s do bucket privado e o
download inicia. Nenhum e-mail é enviado.

## Consequências
- Sem provedor de e-mail nem domínio de envio.
- O e-mail do lead não é verificado (aceito; o CRM qualifica depois).
