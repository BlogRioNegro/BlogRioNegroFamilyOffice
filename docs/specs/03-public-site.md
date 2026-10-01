---
id: 03-public-site
status: approved
ui_status: approved
fase: 4
depends_on: [01-data-model.md, 02-security-rls.md, 04-lead-capture.md, 06-design-system.md]
---

# 03 · Site público (`apps/web`)

## Requisitos

### PUB-001 · Home
Hero de boas-vindas com texto fixo no código e CTA para `/artigos`.
**Aceite:** `/` renderiza o hero sem consultar o banco; o CTA leva a `/artigos`.

### PUB-002 · Destaque automático
O destaque é o artigo com `published_at` mais recente (desempate `created_at desc`),
calculado por função de domínio `getFeaturedArticle` ([ADR 0004](../adr/0004-destaque-automatico.md)).
**Aceite:** com 0 artigos a listagem mostra estado vazio; com 1 artigo ele aparece só como
destaque; alterar `published_at` de outro artigo para mais recente troca o destaque.

### PUB-003 · Listagem `/artigos`
Coluna única: destaque no topo; abaixo, os demais em ordem `published_at desc`, sem repetir
o destaque. Card: capa + título (+ data).
**Aceite:** o destaque nunca aparece duas vezes; a ordem é estável com datas iguais.

### PUB-004 · "Carregar mais"
Lotes de 10 artigos. O botão "Carregar mais" busca o próximo lote sem recarregar a página.
Fallback para crawlers e sem JS: o botão é um link `/artigos?page=N` renderizado no server.
**Aceite:** sem JavaScript, `?page=2` mostra o 2º lote; com JS, o clique anexa o lote;
o botão some quando não há mais artigos; `page` inválido cai na página 1.

### PUB-005 · Página do artigo `/artigos/[slug]`
Mostra título, capa, data de publicação, resumo (se houver) e a **prévia**
([ADR 0007](../adr/0007-conteudo-gated-previa-publica.md)), seguida do botão
"Baixar artigo completo" que abre o modal de [04-lead-capture](04-lead-capture.md).
A página nunca consulta `article_contents` nem `article-files`.
**Aceite:** o HTML da página e o payload RSC não contêm nada além da prévia
(teste e2e compara com o conteúdo completo de um artigo seed).

### PUB-006 · Prévia `rich_text`
`preview_json` (3 primeiros blocos) serializado para HTML no server ([SEC-007](02-security-rls.md)).
**Aceite:** títulos, listas, links, citações e imagens da prévia renderizam; nada além
dos 3 blocos aparece.

### PUB-007 · Prévia `pdf`
O PDF de prévia (2 páginas, bucket público `article-previews`) é embutido na página.
**Aceite:** a prévia abre em desktop e mobile (iOS Safari e Chrome Android); se o navegador
não embutir, aparece um link "Ver prévia" para o mesmo arquivo.

### PUB-008 · Redirect de slug antigo
Slug não encontrado em `articles` é buscado em `article_slug_history`; se existir, responde
**301** para o slug atual ([ADR 0006](../adr/0006-slug-editavel-historico-301.md)).
**Aceite:** link antigo compartilhado abre o artigo com 301; slug inexistente retorna 404.

### PUB-009 · Renderização dinâmica
Rotas que leem artigos são dinâmicas, sem cache de dados
([ADR 0003](../adr/0003-renderizacao-dinamica.md)).
**Aceite:** artigo salvo no admin aparece no site no próximo request, sem rota de revalidate.

### PUB-010 · Metadata e Open Graph
`generateMetadata` por artigo: `title`, `description`, `canonical`, `og:title`,
`og:description`, `og:image` (capa, URL absoluta), `og:type=article`,
`article:published_time`, `twitter:card=summary_large_image`.
Descrição: `summary`; se vazio, rich_text usa os primeiros ~160 caracteres do texto da
prévia; pdf usa a descrição padrão do blog.
**Aceite:** preview correto no WhatsApp e no LinkedIn Post Inspector para um artigo de cada
tipo, com e sem resumo.

### PUB-011 · Sitemap e robots
`/sitemap.xml` com home, `/artigos` e todos os artigos (`lastmod = updated_at`);
`/robots.txt` apontando para o sitemap.
**Aceite:** sitemap válido; slugs antigos não aparecem.

### PUB-012 · RSS
`/rss.xml` (RSS 2.0) com os 20 artigos mais recentes: título, link, data, descrição
(mesma regra de PUB-010) e capa como `enclosure`.
**Aceite:** feed valida no W3C Feed Validator; não inclui conteúdo completo.

### PUB-013 · Rodapé
Em todas as páginas: CTA discreto "Conheça a Rio Negro" (`NEXT_PUBLIC_RIO_NEGRO_URL`, nova
aba), disclaimer regulatório (CVM 178/23 e contrato de distribuição com a XP) e link
"Privacidade" para `/privacidade`. Não há CTA no corpo do artigo
([ADR 0018](../adr/0018-cta-e-disclaimer-no-rodape.md)).
**Aceite:** rodapé presente em home, listagem, artigo, privacidade e 404; texto do
disclaimer idêntico ao rodapé de rionegroinvestimentos.com.br (copiado na F4-009).

### PUB-014 · Página `/privacidade`
Renderiza o texto definido em [LEAD-013](04-lead-capture.md).
**Aceite:** acessível pelo rodapé e pelo modal; indexável.

### PUB-015 · Páginas de erro
`not-found` e `error` com o layout do site e link para `/artigos`.
**Aceite:** erro de banco mostra a página de erro sem vazar detalhes ([SEC-008](02-security-rls.md)).

## UI

Referência: `design/prototipo/Site Publico.dc.html` (desktop 1440 px e mobile 390 px), só com
tokens e componentes de [06-design-system](06-design-system.md). Onde o protótipo diverge desta
spec, vale a spec (divergências abaixo).

### Estrutura comum
- **Header** (`SiteHeader`): 64 px, fundo `--color-bg`, borda inferior; logotipo escuro à esquerda
  (link para `/`) e link "Artigos" à direita, com sublinhado de 2 px quando ativo (`aria-current`).
  Mobile: igual, sem menu hambúrguer.
- **Conteúdo**: coluna de leitura de `--layout-reading` (720 px), centralizada. Mobile: margem
  lateral de 16 px, sem rolagem horizontal.
- **Rodapé** (`SiteFooter`, PUB-013): fundo `--color-surface-muted`; logotipo + "Conheça a Rio
  Negro" (nova aba), disclaimer regulatório (`text-xs`, `--color-text-muted`) e link "Privacidade".
  Mobile: empilha logotipo/CTA, disclaimer, "Privacidade".
- **Tipografia**: H1 `--font-size-h1` (36 px mobile, 48 px ≥ 768 px), peso 700; datas no formato
  "15 set. 2026" em `text-xs` e `--color-text-muted`.

### Home (`/`, PUB-001)
Hero sem consulta ao banco: H1 "Análises sobre investimentos, escritas pela equipe da Rio Negro.",
subtítulo "Artigos e estudos para ajudar você a entender o mercado e decidir com mais informação."
(`text-md`, `--color-text-muted`) e `Button` primário "Ver artigos" → `/artigos` (100% da largura
no mobile).

### Listagem (`/artigos`, PUB-002 a PUB-004)
- H1 "Artigos"; card de destaque no topo e, abaixo, os demais em **coluna única**.
- **Card de destaque**: superfície com `--radius-card` e `--shadow-card`; capa 16:9 e texto lado a
  lado a partir de 768 px (empilha no mobile, capa acima); título 24 px (mobile) / 30 px; data.
- **Card**: o card inteiro é o link; capa 16:9 na largura toda, título (Inter 18/600, até ~3
  linhas) e data. Sem capa: área neutra `--color-surface-muted`. Hover: borda `--color-border-strong`
  e título sublinhado; foco: anel de 2 px.
- **"Carregar mais"**: `Button` secundário centralizado, 44 px, largura mínima 240 px. Estados:
  carregando (`loading`, anunciado em região `aria-live`), erro ("Tentar novamente") e fim da lista
  (o botão some). Sem JS é um link `/artigos?page=N`.
- **Vazio**: superfície branca com borda e o texto "Nenhum artigo publicado ainda".

### Artigo (`/artigos/[slug]`, PUB-005 a PUB-007)
- `Button` link "Todos os artigos" (ícone seta à esquerda) → `/artigos`.
- H1, capa 16:9, formato (`TypeBadge`) + data e resumo (Source Serif 4, `text-lg` no mobile e `text-xl` ≥ 768 px, `--color-text-muted`), nesta ordem, como no protótipo ([ADR 0026](../adr/0026-ordem-da-pagina-do-artigo.md)).
- **Prévia `rich_text`**: texto em `--font-serif`, `--font-size-article` (18/1.7 mobile,
  20/1.7 ≥ 768 px), largura máxima `--measure-article`; H2/H3 em Inter 600; citações com borda
  esquerda de 2 px; imagens só com `alt`, sem legenda ([ADR 0031](../adr/0031-imagem-do-rich-text-so-com-alt.md)).
- **Prévia `pdf`**: área neutra com borda (`--radius-card`) contendo o PDF embutido e o rótulo
  "Prévia". Fallback quando o navegador não embute: "Seu navegador não exibe o PDF nesta página."
  + link "Ver prévia" para o mesmo arquivo.
- Abaixo da prévia: nota "Esta é uma prévia. O artigo completo está disponível para download." e
  `Button` primário "Baixar artigo completo" (100% no mobile), que abre o modal de
  [04-lead-capture](04-lead-capture.md). Nenhum CTA comercial no corpo.

### Privacidade (`/privacidade`, PUB-014)
H1 "Aviso de privacidade", data de atualização em `text-xs`, seções com H2 e texto em
`--font-serif` na coluna de leitura. O texto é o de LEAD-013, não o provisório do protótipo.

### 404 (PUB-015)
Rótulo "Erro 404" (`text-xs`, `--color-text-muted`), H1 "Página não encontrada", texto "O endereço
pode ter mudado ou o conteúdo não está mais disponível." e `Button` primário "Ver todos os
artigos" → `/artigos`.

### Erro (PUB-015)
Mesmo layout do 404, sem rótulo: H1 "Algo deu errado", texto "Não foi possível carregar esta página
agora. Tente novamente em instantes.", `Button` primário "Tentar novamente" (chama o `reset` do
error boundary) e `Button` link "Ver artigos" → `/artigos`
([ADR 0030](../adr/0030-textos-da-pagina-de-erro.md)). Nada do erro é exibido (SEC-008).

### Divergências do protótipo (vale a spec)
- Listagem em grade de colunas no protótipo → **coluna única** (PUB-003).
- Página do artigo sem capa no protótipo → **com capa** (PUB-005).
- Card com badge de tipo e destaque com excerto no protótipo → card com **capa, título e data**
  (PUB-003).
- Rótulo "páginas 1 e 2 de 18" → só "Prévia": o total de páginas não existe no modelo de dados.
- Rodapé com texto regulatório provisório → texto copiado de rionegroinvestimentos.com.br (F4-009).

## Fora de escopo

- CTA no corpo do artigo, busca, filtros, categorias, artigos relacionados.
- Comentários, curtidas, compartilhamento com contagem.
- Analytics e banner de cookies (sem cookies de rastreamento no lançamento).
- Liberar o restante do texto na página após o lead (o lead recebe o PDF, [LEAD-009](04-lead-capture.md)).
