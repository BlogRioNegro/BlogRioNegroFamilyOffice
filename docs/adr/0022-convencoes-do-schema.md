# 0022 · Convenções do schema

- Status: accepted · Data: 2026-09-24
- Specs: [DATA-001 a DATA-007](../specs/01-data-model.md), [ADM-006](../specs/05-admin-panel.md)

## Contexto
As migrations da fase 3 encontraram pontos que a spec 01 não definia: defaults, nulidade,
a assinatura de `consume_rate_limit` e a unidade dos limites dos buckets.

## Decisão
1. `created_at` e `updated_at` têm default `now()` em todas as tabelas.
2. `leads.id` tem default `gen_random_uuid()`.
3. `leads.webhook_status` e `article_slug_history.article_id` são `not null`.
4. `consume_rate_limit(key text, "limit" int, "window" interval)` conta por janela fixa, alinhada
   com `date_bin`. A brecha na virada da janela (até 2× o limite em pouco tempo) é aceita porque o
   Turnstile é a defesa principal contra bot ([ADR 0011](0011-antispam-turnstile-rate-limit.md)).
5. Limites dos buckets em MiB: 2 MiB para imagem e 20 MiB para PDF. A validação de upload da
   ADM-006 usa exatamente esses números, lidos de uma constante única.

## Consequências
- Inserts não precisam informar timestamps nem o id do lead.
- Mudar um limite de bucket exige migration **e** a mesma mudança na constante da ADM-006.
