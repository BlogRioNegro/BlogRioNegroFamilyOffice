# 0003 · Renderização dinâmica sem cache de dados

- Status: accepted · Data: 2026-09-23
- Specs: [PUB-009](../specs/03-public-site.md)

## Contexto
O admin é outro app. Revalidação sob demanda exigiria uma rota protegida no web e um segredo
compartilhado, e na StayCloud pode haver várias instâncias com caches independentes.

## Decisão
Rotas que leem artigos são dinâmicas; cada request consulta o Supabase. Não existe rota de
revalidate nem segredo compartilhado entre apps.

## Consequências
- Conteúdo sempre atualizado; menos superfície de ataque.
- Latência um pouco maior; aceitável para o tráfego de um blog institucional.
- Se o tráfego crescer: ISR com revalidate por tempo (nova ADR).
