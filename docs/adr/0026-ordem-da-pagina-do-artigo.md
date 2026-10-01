# 0026 · Cabeçalho da página do artigo segue o protótipo

- Status: accepted · Data: 2026-09-25
- Specs: [PUB-005](../specs/03-public-site.md)

## Contexto
A seção UI da spec 03 listava "H1, data, capa e resumo (no tamanho do corpo)". O protótipo aprovado
(`design/prototipo/Site Publico.dc.html`, telas "Artigo Texto" e "Artigo PDF") mostra H1, capa,
formato + data e o resumo em Source Serif 4 maior que o corpo. A diferença é só visual; não
muda regra de negócio.

## Decisão
A página do artigo segue o protótipo: H1, capa 16:9, `TypeBadge` + data, resumo em
`font-serif` `text-lg`/`text-xl` com `--color-text-muted`. A spec 03 foi atualizada.

## Consequências
- Telas do artigo iguais ao protótipo em desktop e mobile.
- O `TypeBadge` segue o `rn-badge` do export do design system (PDF em fundo cinza), ver [ADR 0028](0028-badges-e-botoes-iguais-ao-design-system.md).
