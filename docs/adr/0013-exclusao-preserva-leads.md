# 0013 · Exclusão de artigo preserva os leads

- Status: accepted · Data: 2026-09-23
- Specs: [DATA-004](../specs/01-data-model.md), [ADM-012](../specs/05-admin-panel.md)

## Decisão
O admin pode excluir artigos. `leads.article_id` usa `on delete set null` e cada lead guarda
uma cópia do título do artigo no momento do download.

## Consequências
- Leads continuam listáveis e exportáveis com o título original após a exclusão.
