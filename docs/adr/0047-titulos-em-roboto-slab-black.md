# 0047 · Títulos em Roboto Slab Black

- Status: accepted · Data: 2026-10-07
- Specs: [DS-003](../specs/06-design-system.md), [03-public-site](../specs/03-public-site.md)
- Substitui: a parte de **títulos** da [ADR 0046](0046-tipografia-e-favicon-do-site-institucional.md)
  (peso 200/500, maiúsculas, 10 px entre letras, entrelinha 1 e 1,2 e "os tamanhos do blog não mudam").
  Menu, botões, rodapé, texto corrido e favicon de lá continuam valendo
- Tasks: [titulos-black](../tasks/titulos-black.md) (TB-001)

## Contexto
Com a ADR 0046 os títulos ficaram finos (peso 200), em maiúsculas e com as letras afastadas. O cliente
pediu a correção: títulos em Roboto Slab Black, menores e com as letras juntas. O guia da marca
(`design/marca/INFO-RN-MFO.pdf`) já mandava isso: Roboto Slab Black em títulos, Roboto Slab Regular em
subtítulos e Roboto como apoio ([ADR 0045](0045-marca-oficial-conforme-o-guia.md)).

## Decisão
Definida pelo cliente, via responsável do projeto (Rafael). Vale para todo título do site e do admin:
H1 de página (incluindo o hero da home e o login), títulos de seção, de card, de destaque e de diálogo.

- **Peso** 900 (`font-black`). A Roboto Slab do `next/font` é variável, então o 900 já vem no arquivo.
- **Caixa** como o texto foi digitado: sai o `uppercase`.
- **Espaçamento entre letras** normal: saem `tracking-section` e o token `--letter-spacing-section`.
- **Entrelinha** a que cada título tinha antes da ADR 0046: a do nível de tamanho (1,2 no H1, 1,35 em
  24 px, 1,3 em 30 px) e `leading-snug` (1,35) nos títulos de card e no H3 do artigo.
- **H1 de toda página**: 36 px a partir de 768 px e 28 px abaixo disso, pela classe nova `text-h1`
  (`--font-size-h1`). O hero da home deixa de ser exceção.
- **Nenhum outro título** é maior nem igual ao H1. Os que eram ficariam um degrau abaixo na escala; na
  prática nenhum precisou descer, porque o maior deles é o do destaque (24 px no celular, 30 px no desktop).
- **Subtítulos e linhas de apoio**: Roboto Slab Regular (400), como já estavam.

### Antes → depois
| Título | Antes (ADR 0046) | Depois |
|---|---|---|
| H1 do hero da home | 36 / 60 px, 200, maiúsculas, entrelinha 1,2 | **28 / 36 px**, **900**, caixa normal, entrelinha 1,2 |
| H1 do site (Artigos, artigo, `/privacidade`, 404, erro) | 36 / 48 px, 200, maiúsculas | **28 / 36 px**, **900**, caixa normal |
| H1 do admin (Artigos, Leads, formulário) | 30 px, 200, maiúsculas | **28 / 36 px**, **900**, caixa normal |
| H1 do login do admin | 24 px, 200, maiúsculas | **28 / 36 px**, **900**, caixa normal |
| Título do destaque | 24 / 30 px, 500, entrelinha 1,2 | 24 / 30 px, **900**, entrelinha **1,35 / 1,3** |
| H2 do artigo e de `/privacidade`, título do `Dialog` | 24 px, 200, maiúsculas, 10 px entre letras, entrelinha 1 | 24 px, **900**, caixa normal, letras juntas, entrelinha **1,35** |
| H3 do artigo | 18 px, 200, maiúsculas, 10 px entre letras, entrelinha 1 | 18 px, **900**, caixa normal, letras juntas, entrelinha **1,35** |
| Título de card (site e admin) | 18 px, 500, entrelinha 1,2 | 18 px, **900**, entrelinha **1,35** |
| Nome no card de lead (admin, mobile) | 16 px, 500, entrelinha 1,2 | 16 px, **900**, entrelinha 1,5 |

Os tamanhos são celular / a partir de 768 px.

### Tokens
Saem `--font-weight-extralight`, `--font-size-4xl`, `--font-size-5xl` (e as entrelinhas deles),
`--line-height-section` e `--letter-spacing-section`. Entra `--font-weight-black: 900`.
`--font-size-h1` passa a 28 px, e a `--font-size-3xl` (36 px) a partir de 768 px. Iguais em `packages/ui`,
no export do design e na spec 06. `text-h1` e `font-black` estão no `tailwind-merge` (`packages/ui/src/cn.ts`).

### Não muda
Famílias, cores, tema, texto corrido (entrelinha 1,5), menu e botões (com as maiúsculas e o peso de
hoje), rodapé (peso 300), layout e as tags HTML.

### Atualização: peso 700
Por decisão do cliente, o peso dos títulos passou a 700 (Bold). O token `--font-weight-black` passou de
900 a 700 nos três lugares (`packages/ui`, export do design e spec 06); o nome do token e a classe
`font-black` ficam. Onde este documento diz 900, vale 700. Tamanho, caixa, espaçamento entre letras e
entrelinha não mudaram.

## Consequências
- O hero da home ficou com o título no tamanho das outras páginas. O espaçamento vertical não foi
  alterado: o bloco continua centralizado na altura livre, com 32 px entre título e botão. Os anéis
  decorativos (720 px) ficaram grandes em relação ao título; reduzi-los é mudança de layout, fora desta task.
- Com o H1 do admin em 36 px, "Entrar no painel" ocupa a largura do cartão de login e pode quebrar em
  duas linhas em telas estreitas.
- Todo título continua com `wrap-anywhere`: a 390 px, um título de 60 caracteres com uma palavra de 20
  letras não estoura a tela (`tests/e2e/titles.spec.ts`).
- Não há mais utilitário de texto maior que o H1 (`text-4xl` e `text-5xl` deixaram de existir).
