# 0029 · Descrição padrão do blog = subtítulo da home

- Status: accepted · Data: 2026-09-25
- Specs: [PUB-001, PUB-010, PUB-012](../specs/03-public-site.md)

## Contexto
PUB-010 manda artigo pdf sem resumo usar "a descrição padrão do blog", mas nenhuma spec define
esse texto.

## Decisão
- A descrição padrão é o subtítulo aprovado da home: "Artigos e estudos para ajudar você a
  entender o mercado e decidir com mais informação." (`BLOG_DESCRIPTION`, em
  `apps/web/lib/domain/article-description.ts`).
- Ela também é a `description` do layout raiz. Títulos usam o template
  "<página> · Rio Negro Investimentos" e as URLs de metadata partem de `NEXT_PUBLIC_SITE_URL`.

## Consequências
- Um texto só para metadata, Open Graph e RSS; mudar o subtítulo da home não muda a descrição.
- O aceite manual de PUB-010 (WhatsApp e LinkedIn Post Inspector) depende de URL pública.
