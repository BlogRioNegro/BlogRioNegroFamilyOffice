# 0012 · LGPD: consentimento, retenção e transparência

- Status: accepted · Data: 2026-09-23
- Specs: [LEAD-003, LEAD-004, LEAD-013](../specs/04-lead-capture.md), [PUB-014](../specs/03-public-site.md)

## Contexto
A política do site oficial pode não cobrir a coleta do blog. Aviso escondido invalida o
consentimento (LGPD, arts. 6º e 8º).

## Decisão
- Aviso curto e visível no modal, checkbox obrigatório e opt-in de comunicações separado e opcional.
- Registrar data/hora do aceite, versão do aviso e hash do IP.
- Página `/privacidade` do blog, resumida, linkando a política completa do site oficial.
- Leads sem prazo de retenção automático; exclusão manual no admin.
- Textos redigidos pelo projeto como rascunho, com validação jurídica na F7-006.

## Consequências
- Mudança de texto exige nova versão do aviso.
- Contato do encarregado (DPO) é pendência ([00-overview](../specs/00-overview.md)).
