# 0049 · "Voltar" no cabeçalho do site

- Status: accepted · Data: 2026-10-07
- Specs: [PUB-016](../specs/03-public-site.md)
- Tasks: [titulos-black](../tasks/titulos-black.md) (TB-003)

## Contexto
O cabeçalho do site tinha um único item de menu, "Artigos". Na própria lista de artigos ele não levava
a lugar nenhum. O cliente pediu um "Voltar" no lugar dele.

## Decisão
Definida pelo cliente, via responsável do projeto (Rafael); o desenho técnico é desta ADR.

- **Home**: o item continua "Artigos" → `/artigos`. **Demais páginas** (lista, artigo, privacidade, 404
  e erro): o item é "Voltar", na mesma posição e com o mesmo estilo de texto, sem seta, fundo, contorno
  nem sublinhado de página ativa. O cabeçalho do admin não muda.
- **É um link** (`next/link`) para o nível acima: `/artigos` no artigo e `/` nas demais. Funciona sem
  JavaScript, em nova aba (Ctrl/Cmd, botão do meio) e quando a página foi aberta por um link externo.
- **Com JavaScript**, se há uma tela anterior do próprio blog nesta visita, o clique chama
  `router.back()`; senão segue o link.
- **"Tela anterior do blog"** é uma pilha de rotas em memória (`lib/domain/visit-history.ts`),
  alimentada por um componente client no layout raiz (`VisitTracker`). Um carregamento completo da
  página zera a pilha. Nada vai para `localStorage`, `sessionStorage` ou cookie.
- **Pilha, e não contador de mudanças de rota**: com um contador, quem abre um artigo por link externo,
  clica em "Voltar" (vai à lista), "Voltar" (volta ao artigo) e "Voltar" de novo seria mandado para
  fora do blog, ou ficaria com um botão morto numa aba nova. A pilha desempilha quando a mudança de
  rota vem do histórico do navegador (`popstate`) e bate com a rota anterior.
- O `SiteHeader` passa a ser renderizado por página (recebe `back`), e não pelo layout de `/artigos`,
  porque lista e artigo têm destinos de reserva diferentes. O `aria-current` do item "Artigos" saiu:
  ele só existe na home, onde nunca é a página atual.

## Consequências
- "Voltar" tem nome acessível "Voltar para a página anterior" e 44 px de altura (o item "Artigos"
  mantém os 40 px que tinha).
- Voltar e avançar pelos botões do navegador são distinguidos por comparação com a pilha; se a rota
  seguinte for igual à anterior, um "avançar" é lido como "voltar". O pior caso é o clique seguir o
  destino de reserva, que continua dentro do blog.
- Na lista aberta a partir de um artigo aberto direto, "Voltar" retorna ao artigo (a tela anterior), e
  não à home.
