# 0019 · Um registro de lead por download

- Status: accepted · Data: 2026-09-23
- Specs: [LEAD-008, LEAD-011](../specs/04-lead-capture.md)

## Decisão
Cada download gera um registro (e-mail + artigo), sem deduplicar. O formulário sempre abre
vazio; nenhum dado pessoal fica no navegador.

## Consequências
- Histórico de interesse por artigo preservado; o CRM deduplica por e-mail se quiser.
