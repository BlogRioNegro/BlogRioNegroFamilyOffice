# 0005 · Publicação imediata, sem rascunho nem agendamento

- Status: accepted · Data: 2026-09-23
- Specs: [ADM-004, ADM-010](../specs/05-admin-panel.md), [DATA-001](../specs/01-data-model.md)

## Contexto
Uma única pessoa publica; simplicidade é prioridade.

## Decisão
Salvar = publicar. `published_at` default agora, editável (inclusive retroativa), usada só
para exibição e ordenação. Data futura não agenda.

## Consequências
- RLS de `articles` libera SELECT público de todas as linhas (não há estado não publicado).
- Artigo incompleto não pode ser salvo "para depois".
