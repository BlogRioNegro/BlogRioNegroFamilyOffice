# 0046 · Tipografia e favicon do site institucional

- Status: accepted · Data: 2026-10-05
- Specs: [DS-001, DS-003](../specs/06-design-system.md), [03-public-site](../specs/03-public-site.md)
- Substitui: o "Roboto Slab Black (900) em títulos" e o favicon "RN" da
  [ADR 0045](0045-marca-oficial-conforme-o-guia.md) (famílias, cores e logo de lá continuam valendo)
- Tasks: [ajuste-tipografia](../tasks/ajuste-tipografia.md) (AJ-001 e AJ-002)

## Contexto
Com o guia aplicado (ADR 0045), o cliente achou os títulos em Roboto Slab 900 pesados e pediu a
tipografia "leve e fina" do site institucional, <https://rionegromfo.com.br/>, e o favicon de lá.

## Decisão
Definida pelo cliente, via responsável do projeto (Rafael):

- As **famílias não mudam**: Roboto Slab em títulos e subtítulos, Roboto em todo o resto. Nenhuma
  família nova (o site usa Open Sans e Inter em alguns widgets; o blog não).
- **Peso, entrelinha, espaçamento entre letras e maiúsculas** passam a copiar o site institucional.
- Os **tamanhos de fonte do blog não mudam** (incluindo o H1 de 60 px do hero).
- O **favicon** passa a ser o do site institucional.
- Cores do guia e tema azul não mudam.

### Medição (2026-10-05)
Estilos computados da home do site, com um script temporário de Playwright (não versionado), a 1440
e a 390 px. Os valores são iguais nas duas larguras, salvo onde indicado.

| Elemento do site | Família | Tamanho | Peso | Entrelinha | Entre letras | Maiúsculas |
|---|---|---|---|---|---|---|
| Título do hero ("Gestão, proteção e perpetuidade…", `h6`) | Roboto Slab | 25 px | 200 | 30 px (1,2) | normal | `uppercase` |
| Título de seção ("SOBRE NÓS", "O QUE FAZEMOS", `h1`/`h2`) | Roboto Slab | 33 px (25 px a 390) | 200 | 1 | 10 px | digitado em maiúsculas |
| Título de card de serviço (`h5`) | Roboto Slab | 20 px | 500 | 24 px (1,2) | normal | não |
| Título de card de notícia (`h3`, widget) | Inter | 20 px | 500 | 31 px | −0,2 px | não |
| Parágrafo ("Com experiências individuais…") | Roboto Slab | 16 px | 400 | 24 px (1,5) | normal | não |
| Texto de card de serviço | Roboto Slab | 14 px | 300 | 21 px (1,5) | normal | não |
| Link do menu | Roboto Slab | 16 px | 400 | 20 px (1,25) | normal | `uppercase` |
| Botão "Enviar" | Roboto Slab | 15 px | 400 | 1 | normal | não |
| Botão "VER MAIS" | Open Sans | 15 px | 500 | 1 | normal | digitado em maiúsculas |
| Linha de direitos do rodapé | Roboto Slab | 16 px | 300 | 24 px (1,5) | normal | digitado em maiúsculas |

Observações:
- O site **não usa `h1` no título principal**: o título do hero é um `h6`. Os `h1` do site são
  títulos de seção. Por isso o H1 do blog segue o título do hero (o mais destacado da página), e os
  títulos de seção do blog seguem os `h1`/`h2` de seção do site.
- A referência dizia que menu e botões usam Open Sans 500/600. A medição encontrou o menu em Roboto
  Slab 400 e só o botão "VER MAIS" em Open Sans 500. Vale o medido.
- Um título de seção ("SAIU NA MÍDIA") usa 5 px entre letras a 390 px; os demais, 10 px nas duas
  larguras. Vale 10 px.
- O título de card de notícia vem de um widget em Inter; a referência dos cards é o `h5` em Roboto
  Slab (mesmo peso, 500).

### Site → blog
| Elemento do site | Elemento do blog | Antes | Depois |
|---|---|---|---|
| Título do hero | H1 de toda página, site e admin (hero da home, "Artigos", título do artigo, `/privacidade`, erro, "Leads", formulário, login) | Roboto Slab 900, entrelinha 1,1 a 1,35 conforme o tamanho | Roboto Slab **200**, entrelinha **1,2**, **maiúsculas** |
| Título de seção | H2 e H3 do artigo (site e editor do admin), H2 de `/privacidade`, título do `Dialog` | Roboto Slab 900, entrelinha 1,35 | Roboto Slab **200**, entrelinha **1**, **10 px** entre letras, **maiúsculas** |
| Título de card de serviço | título do card e do destaque (site), título dos cards da lista no mobile (admin) | Roboto Slab 900, entrelinha 1,3 a 1,35 | Roboto Slab **500**, entrelinha **1,2** |
| Parágrafo | corpo do artigo (site e editor do admin) e texto de `/privacidade` | Roboto 400, entrelinha 1,7 | Roboto 400, entrelinha **1,5** |
| Parágrafo | subtítulos em Roboto Slab (resumo do artigo, descrição do `Dialog`, linha de apoio do H1) | 400, resumo com entrelinha 1,35 | 400, entrelinha **1,5** |
| Parágrafo | texto de interface (base do `body`) | Roboto 400, entrelinha 1,5 | igual |
| Link do menu | links do header (site e admin, incluindo "Sair") | Roboto 500 | Roboto **400**, **maiúsculas** |
| Botão | `Button` | Roboto 500 | igual (500, o peso do "VER MAIS") |
| Linha de direitos do rodapé | linha de direitos do rodapé do site | Roboto 400 | Roboto **300** |

Tokens: saem `--font-weight-black`; entram `--font-weight-extralight: 200`, `--font-weight-light: 300`,
`--line-height-section: 1` e `--letter-spacing-section: 10px`. `--line-height-4xl` e `--line-height-5xl`
(níveis de H1) vão para 1,2; `--line-height-md` e `--line-height-lg` (níveis de corpo) vão para 1,5 e
`--line-height-article` passa a `--line-height-normal`.
As maiúsculas são CSS (`uppercase`): o texto no banco e no código não muda, e leitores de tela leem
o texto original.

### Não aplicado, de propósito
- **Tamanhos de fonte**: ficam os do blog (decisão acima). Diferenças: título principal 25 px no site
  contra 36/48/60 px no blog; título de seção 33 px (25 px a 390) contra 24 e 18 px; título de card
  20 px contra 18 px (24/30 px no destaque); parágrafo 16 px contra 18/20 px no artigo; botão 15 px
  contra 16 px; rodapé 16 px contra 14 px.
- **Entrelinha de menu (1,25) e de botão (1)**: são controles de uma linha, em que a entrelinha só
  define a altura da caixa. O `Button` tem altura fixa (`--control-height`) e o link do menu define
  a área de toque; mudar seria mexer em layout.
- **Maiúsculas em botão**: no site só o "VER MAIS" está em maiúsculas, e digitado assim; o "Enviar"
  não. Não há regra para copiar.
- **Texto de card de serviço (14 px, peso 300)**: os cards do blog só têm data e título.

### Sem equivalente no site (ficam como estavam)
`Label` (500), `Input`, `FieldMessage`, `Checkbox`, cabeçalho de tabela (600), células em destaque do
admin (500), título do `Alert` (600), `StatusBadge` e `TypeBadge` (500), negrito do artigo (700),
datas e legendas, textos jurídicos e a nota "Esta é uma prévia…".

### Favicon
- Origem: `https://rionegromfo.com.br/wp-content/uploads/2024/08/fav.png`, o arquivo que os três
  `<link>` de ícone do site apontam (`icon` 32×32, `icon` 192×192 e `apple-touch-icon`). Baixado em
  2026-10-05 com um script Node temporário (não versionado), com autorização do Rafael.
- É um PNG de **40×40 px**, RGBA, 1.107 bytes: um "R" bege sobre fundo transparente. Copiado byte a
  byte, sem redesenhar, recolorir nem ampliar, para `app/icon.png` dos dois apps e
  `design/design-system/assets/favicon.png`.
- Tem menos de 180 px de lado: em atalho de tela inicial e em aba de alta densidade o navegador
  amplia a imagem e ela perde nitidez. Para corrigir, só com um arquivo maior vindo do cliente.
- O proxy do admin continua liberando `/icon.png` sem sessão (ADR 0045).

## Consequências
- Um título em maiúsculas ocupa mais largura, e o de seção ainda soma 10 px por letra. Todo título
  nesses dois papéis leva `wrap-anywhere`, que deixa uma palavra maior que a linha quebrar em vez de
  estourar a tela a 390 px. A quebra é sem hífen e no meio da palavra: a 390 px, um título de seção
  de 24 px comporta cerca de 14 letras por linha (em `/privacidade`, "COMPARTILHAMENTO" quebra em
  "COMPARTILHAME" + "NTO").
- Nenhum texto com menos de 18 px ficou em peso 200: o menor é o H3 do artigo, com 18 px. Em peso 300
  há só a linha de direitos do rodapé (14 px, `--color-text-muted`).
- O contraste não muda (as cores são as mesmas), mas traço fino claro sobre fundo escuro perde nitidez:
  não usar peso menor que os desta ADR.
- `font-regular`, `font-extralight` e as demais escalas próprias estão registradas no `tailwind-merge`
  (`packages/ui/src/cn.ts`, com teste), para o peso não anular a família quando as classes se combinam.
- `apps/admin/lib/services/article-pdf.tsx` (PDF dos artigos) e `design/prototipo/` não mudam.
