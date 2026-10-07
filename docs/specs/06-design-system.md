---
id: 06-design-system
status: approved
fase: 2
depends_on: [00-overview.md]
---

# 06 · Design system

O export do Claude Design em `design/` é **referência visual**: os tokens entram em `packages/ui`
a partir dele ([ADR 0023](../adr/0023-tokens-por-export-do-claude-design.md)); telas são
reimplementadas como componentes seguindo as specs 03, 04 e 05, não copiadas.

`packages/ui` é a verdade no código e esta spec é a verdade na documentação: os dois concordam
(teste em `packages/ui/src/tokens.test.ts`).

## Requisitos

### DS-001 · Design system no Claude Design (fase 1)
Espaçamento, raio e componentes base, herdados do blog original. Cores, famílias de fonte e logo são
os do guia oficial da marca (`design/marca/INFO-RN-MFO.pdf`,
[ADR 0045](../adr/0045-marca-oficial-conforme-o-guia.md)), aplicados sobre o tema azul único
([ADR 0043](../adr/0043-tema-azul-em-todo-o-sistema.md)). O favicon e a tipografia de menu, rodapé e
texto corrido são os do site institucional
([ADR 0046](../adr/0046-tipografia-e-favicon-do-site-institucional.md)); os títulos seguem o guia
([ADR 0047](../adr/0047-titulos-em-roboto-slab-black.md)).
**Aceite:** design system publicado no Claude Design e aprovado pelo responsável do projeto.

### DS-002 · Protótipos (fase 1)
Home, listagem, artigo (prévia pdf e rich_text), modal de lead (todos os estados de
[04-lead-capture](04-lead-capture.md)), `/privacidade` e painel admin (login, lista, formulário, leads).
**Aceite:** cada tela listada existe no protótipo, em desktop e mobile.

### DS-003 · Tokens em `packages/ui` (fase 2)
Tokens do export do Claude Design em `packages/ui` (CSS variables + `@theme` do Tailwind v4, mesmos
nomes e valores; [ADR 0023](../adr/0023-tokens-por-export-do-claude-design.md)). Fontes do guia da marca
(Roboto e Roboto Slab) via `next/font/google`, a partir de `@rio-negro/ui/fonts`.
**Aceite:** os dois apps consomem os tokens de `@rio-negro/ui`; nenhum valor de cor ou fonte
hard-coded fora do pacote.

### DS-004 · Componentes base (fase 2)
shadcn/ui customizado com os tokens em `packages/ui`.
**Aceite:** lista de componentes registrada nesta spec; cada um com responsabilidade única.

### DS-005 · Seções de UI das specs (fase 2)
Preencher as seções "UI · pending-design" de 03, 04 e 05 e mudar `ui_status` para `approved`.
**Aceite:** nenhuma seção `pending-design` restante ao fim da fase 2.

### DS-006 · Acessibilidade
Contraste AA, foco visível, modal com foco preso e fechamento por Esc, labels em todos os campos.
**Aceite:** axe sem violações críticas nas telas da fase 4–6.

## Tokens

Fonte: `packages/ui/src/tokens.css` e `packages/ui/src/theme.css`. Utilitários do Tailwind derivados
dos tokens: `bg-*`/`text-*`/`border-*` (cores), `font-sans`/`font-serif`, `font-light`…`font-black`,
`rounded-control`/`rounded-card`, `shadow-card`/`shadow-modal`, `text-xs`…`text-3xl` e `text-h1` (com a
entrelinha do nível) e espaçamento em múltiplos de 4 px (`p-4` = `--space-4`). A
paleta padrão do Tailwind é desativada. As escalas próprias estão registradas no `tailwind-merge`
(`packages/ui/src/cn.ts`), para peso e família não se anularem.

### Tipografia
Famílias do guia da marca ([ADR 0045](../adr/0045-marca-oficial-conforme-o-guia.md)). Títulos em Roboto
Slab Black e subtítulos em Roboto Slab Regular, como manda o guia
([ADR 0047](../adr/0047-titulos-em-roboto-slab-black.md)); menu, rodapé e texto corrido como no site
institucional ([ADR 0046](../adr/0046-tipografia-e-favicon-do-site-institucional.md)).

| Papel | Onde | Classes | Tamanho (celular / ≥ 768 px) |
|---|---|---|---|
| Título principal | H1 de toda página, site e admin (inclui o hero da home e o login) | `font-serif font-black text-h1 wrap-anywhere` | 28 px / 36 px, entrelinha 1,2 |
| Título do destaque | card de destaque da listagem | `font-serif font-black text-xl md:text-2xl wrap-anywhere` | 24 px / 30 px, entrelinha 1,35 / 1,3 |
| Título de seção | H2 do artigo e de `/privacidade`, título do `Dialog` | `font-serif font-black text-xl wrap-anywhere` | 24 px, entrelinha 1,35 |
| Título de seção menor | H3 do artigo | `font-serif font-black text-md leading-snug wrap-anywhere` | 18 px, entrelinha 1,35 |
| Título de card | cards de artigo (site) e cards das listas no mobile (admin) | `font-serif font-black leading-snug wrap-anywhere` | 18 px (16 px no card de lead) |
| Subtítulo | resumo do artigo, descrição do `Dialog`, linha de apoio do H1 | `font-serif font-regular` | entrelinha 1,5 |
| Link do menu | navegação do header (site e admin) | `font-regular uppercase` | 16 px |
| Rodapé | linha de direitos reservados | `font-light` | 14 px |
| Texto | todo o resto | Roboto 400 | entrelinha 1,5 |

Todo título usa peso 900, caixa como foi digitada (sem `uppercase`) e espaçamento entre letras normal.
Nenhum título é maior nem igual ao H1 da página. `wrap-anywhere` deixa uma palavra maior que a linha
quebrar, para um título longo não estourar a tela a 390 px (teste em `tests/e2e/titles.spec.ts`).

| Token | Valor | Uso |
|---|---|---|
| `--rn-warm-50` | `#f2f0ef` | Fora do guia: off-white do texto. Não usar direto: usar os semânticos. |
| `--rn-blue-900` | `#1a3544` | Azul da faixa da logo branca no guia da marca (header, rodapé, superfície rebaixada). Não usar direto: usar os semânticos. |
| `--rn-blue-800` | `#223645` | Cor principal do guia da marca. Não usar direto: usar os semânticos. |
| `--rn-blue-700` | `#32566b` | Azul claro do degradê do guia (superfícies). Não usar direto: usar os semânticos. |
| `--rn-blue-600` | `#4a6378` | Fora do guia: fundo de controle desabilitado. Não usar direto: usar os semânticos. |
| `--rn-blue-400` | `#8ea3b3` | Fora do guia: borda de controle. Não usar direto: usar os semânticos. |
| `--rn-blue-200` | `#c9d4dc` | Fora do guia: texto secundário. Não usar direto: usar os semânticos. |
| `--rn-stone-500` | `#908c7a` | Cor secundária do guia (divisórias e detalhes decorativos; nunca texto pequeno). Não usar direto: usar os semânticos. |
| `--rn-sand-300` | `#d7d1b8` | Bege de apoio do guia (cor de ação). Não usar direto: usar os semânticos. |
| `--rn-sand-200` | `#ece7d1` | Fora do guia: hover da ação (bege mais claro). Não usar direto: usar os semânticos. |
| `--rn-green-300` | `#9fd8ad` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-green-900` | `#1f3d36` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-green-700` | `#3f6f5c` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-red-300` | `#ffb4ab` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-red-900` | `#4b2a31` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-red-700` | `#8c4a4d` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-amber-300` | `#f3d08a` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-amber-900` | `#453a24` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-amber-700` | `#85703d` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--gradient-brand` | `linear-gradient(90deg, var(--rn-blue-700), var(--rn-blue-900))` | Degradê do guia da marca; definido, sem uso em tela |
| `--space-1` | `4px` | Espaçamento (múltiplo de 4 px) |
| `--space-2` | `8px` | Espaçamento (múltiplo de 4 px) |
| `--space-3` | `12px` | Espaçamento (múltiplo de 4 px) |
| `--space-4` | `16px` | Espaçamento (múltiplo de 4 px) |
| `--space-6` | `24px` | Espaçamento (múltiplo de 4 px) |
| `--space-8` | `32px` | Espaçamento (múltiplo de 4 px) |
| `--space-12` | `48px` | Espaçamento (múltiplo de 4 px) |
| `--space-16` | `64px` | Espaçamento (múltiplo de 4 px) |
| `--space-24` | `96px` | Espaçamento (múltiplo de 4 px) |
| `--focus-ring-width` | `2px` | Espessura do anel de foco |
| `--focus-ring-offset` | `2px` | Distância do anel de foco |
| `--layout-reading` | `720px` | Largura da coluna de leitura (site) |
| `--layout-admin` | `1200px` | Largura do painel admin |
| `--control-height` | `44px` | Altura de botão e campo |
| `--control-height-sm` | `36px` | Altura de controle compacto |
| `--duration-fast` | `120ms` | Transição de cor |
| `--easing-standard` | `ease-out` | Curva das transições |
| `--font-size-xs` | `14px` | Legenda, data, texto regulatório |
| `--line-height-xs` | `1.5` | Altura de linha |
| `--font-size-sm` | `16px` | UI, botões, formulário, tabela |
| `--line-height-sm` | `1.5` | Altura de linha |
| `--font-size-md` | `18px` | Corpo do artigo (mobile), título de card |
| `--line-height-md` | `1.5` | Altura de linha (a do parágrafo do site institucional) |
| `--font-size-lg` | `20px` | Corpo do artigo (desktop) |
| `--line-height-lg` | `1.5` | Altura de linha (a do parágrafo do site institucional) |
| `--font-size-xl` | `24px` | H2 do artigo, título do modal, título do destaque (mobile) |
| `--line-height-xl` | `1.35` | Altura de linha |
| `--font-size-2xl` | `30px` | Título do destaque (desktop) |
| `--line-height-2xl` | `1.3` | Altura de linha |
| `--font-size-3xl` | `36px` | H1 desktop |
| `--line-height-3xl` | `1.2` | Altura de linha |
| `--line-height-tight` | `1.2` | Altura de linha do H1 (`text-h1`) |
| `--line-height-snug` | `1.35` | Altura de linha: títulos de card e H3 do artigo |
| `--line-height-normal` | `1.5` | Altura de linha: texto corrido e subtítulos |
| `--line-height-relaxed` | `1.7` | Altura de linha |
| `--font-size-article` | `var(--font-size-md)` | Corpo do artigo (≥768px: var(--font-size-lg)) |
| `--line-height-article` | `var(--line-height-normal)` | Entrelinha do artigo (a do parágrafo do site institucional) |
| `--measure-article` | `68ch` | Largura máxima do texto do artigo |
| `--font-size-h1` | `28px` | H1 de toda página, `text-h1` (≥768px: var(--font-size-3xl)) |
| `--color-bg` | `var(--rn-blue-800)` | Fundo da página |
| `--color-surface` | `var(--rn-blue-700)` | Cards, modal, campos |
| `--color-surface-muted` | `var(--rn-blue-900)` | Superfície secundária, linhas de tabela |
| `--color-border` | `var(--rn-stone-500)` | Bordas e divisórias |
| `--color-border-strong` | `var(--rn-blue-400)` | Borda de campo e hover |
| `--color-text` | `var(--rn-warm-50)` | Texto principal |
| `--color-text-muted` | `var(--rn-blue-200)` | Legenda, data, texto regulatório |
| `--color-text-inverse` | `var(--rn-blue-800)` | Texto sobre a cor de ação (bege) |
| `--color-action-primary` | `var(--rn-sand-300)` | Botão primário |
| `--color-action-primary-hover` | `var(--rn-sand-200)` | Botão primário em hover |
| `--color-action-primary-text` | `var(--rn-blue-800)` | Texto do botão primário |
| `--color-link` | `var(--rn-sand-300)` | Links (no texto, `Button` link e navegação) |
| `--color-disabled-bg` | `var(--rn-blue-600)` | Fundo de controle desabilitado |
| `--color-disabled-text` | `var(--rn-blue-400)` | Texto de controle desabilitado |
| `--color-success` | `var(--rn-green-300)` | Texto/ícone de sucesso |
| `--color-success-bg` | `var(--rn-green-900)` | Fundo de alerta de sucesso |
| `--color-success-border` | `var(--rn-green-700)` | Borda de alerta de sucesso |
| `--color-error` | `var(--rn-red-300)` | Texto/ícone de erro, campo inválido |
| `--color-error-bg` | `var(--rn-red-900)` | Fundo de alerta de erro |
| `--color-error-border` | `var(--rn-red-700)` | Borda de alerta de erro |
| `--color-warning` | `var(--rn-amber-300)` | Texto/ícone de aviso |
| `--color-warning-bg` | `var(--rn-amber-900)` | Fundo de alerta de aviso |
| `--color-warning-border` | `var(--rn-amber-700)` | Borda de alerta de aviso |
| `--color-focus-ring` | `var(--rn-sand-300)` | Anel de foco |
| `--color-overlay` | `rgba(13, 20, 26, 0.64)` | Fundo do modal |
| `--font-sans` | `var(--font-roboto), system-ui, -apple-system, 'Segoe UI', sans-serif` | Família de apoio do guia: corpo, interface, textos jurídicos (Roboto, via next/font) |
| `--font-serif` | `var(--font-roboto-slab), Georgia, 'Times New Roman', serif` | Títulos (peso 900) e subtítulos (400): Roboto Slab, via next/font |
| `--font-weight-light` | `300` | Linha de direitos do rodapé |
| `--font-weight-regular` | `400` | Texto, subtítulos e links do menu |
| `--font-weight-medium` | `500` | Botões, labels, badges |
| `--font-weight-semibold` | `600` | Peso da fonte |
| `--font-weight-bold` | `700` | Peso da fonte |
| `--font-weight-black` | `900` | Todos os títulos (Roboto Slab Black) |
| `--radius-control` | `6px` | Botão, campo, badge |
| `--radius-card` | `12px` | Card e modal |
| `--shadow-card` | `0 1px 2px rgba(13, 20, 26, 0.24), 0 1px 3px rgba(13, 20, 26, 0.16)` | Card |
| `--shadow-modal` | `0 12px 32px rgba(13, 20, 26, 0.4), 0 2px 6px rgba(13, 20, 26, 0.24)` | Modal |
| `--breakpoint-sm` | `390px` | Breakpoint |
| `--breakpoint-md` | `768px` | Breakpoint |
| `--breakpoint-lg` | `1280px` | Breakpoint |

## Componentes

Componentes base em `packages/ui/src/components` (shadcn/ui + Radix, só utilitários de token),
exportados por `@rio-negro/ui`. Esta tabela e os exports do pacote concordam (teste em
`packages/ui/src/components.test.tsx`). Ícones: `lucide-react`, que os apps importam de `@rio-negro/ui/icons` ([ADR 0024](../adr/0024-icones-via-packages-ui.md)); decorativos com `aria-hidden`.

| Componente | Responsabilidade | Estados |
|---|---|---|
| `Button` | Ação: `primary` (uma por área), `secondary`, `ghost` (ações de linha), `link` (no texto); `md` 44 px e `sm` 36 px; `asChild` para links | default, hover, foco, desabilitado, `loading` (spinner + `aria-busy`) |
| `Label` | Rótulo sempre visível acima do campo; `optional` acrescenta "(opcional)" | default |
| `Input` | Campo de texto de 44 px | default, hover, foco, erro (`aria-invalid`), desabilitado |
| `FieldMessage` | Ajuda (`help`) ou erro (`error`, com ícone) abaixo de um campo | help, error |
| `TextField` | Compõe `Label` + `Input` + `FieldMessage` e liga `aria-describedby`/`aria-invalid` | default, com ajuda, com erro, desabilitado |
| `Checkbox` | Consentimento e opções; label longa com link; nunca pré-marcado | desmarcado, marcado, foco, erro, desabilitado |
| `Alert` | Retorno em linha após uma ação | `success`/`warning` (`role="status"`), `error` (`role="alert"`) |
| `Dialog` | Raiz do diálogo (Radix) | aberto, fechado |
| `DialogTrigger` | Elemento que abre o diálogo e recebe o foco de volta ao fechar | default |
| `DialogContent` | Caixa do diálogo: 480 px no desktop, tela cheia < 768 px, título, "Fechar", rodapé | aberto (foco preso; Esc e clique no fundo fecham) |
| `DialogClose` | Fecha o diálogo a partir de uma ação do rodapé | default |
| `StatusBadge` | Status do envio ao CRM: Desativado, Pendente, Enviado, Falhou (cor + ponto + texto) | `disabled`, `pending`, `sent`, `failed` |
| `TypeBadge` | Formato do artigo: PDF ou Texto | `pdf`, `rich_text` |
| `Table` | Tabela do admin em superfície com borda e rolagem horizontal | default |
| `TableCaption` | Legenda acessível (oculta visualmente) | default |
| `TableHeader` | Cabeçalho em `--color-bg` | default |
| `TableBody` | Corpo da tabela | default |
| `TableRow` | Linha com divisória | default, hover |
| `TableHead` | Célula de cabeçalho (`scope="col"`) | default |
| `TableCell` | Célula de dado | default |

Componentes de tela ficam nos apps, compostos a partir destes, na fase que os usa:
`ArticleCard`, `FeaturedArticleCard`, `LoadMoreButton`, `SiteHeader` e `SiteFooter` (fase 4),
`PhoneInput` (fase 5), `Pagination` e a tabela de dados do admin (fase 6).

## Acessibilidade por componente (DS-006)

Contraste pela fórmula WCAG 2.1 com os valores da tabela Tokens: texto ≥ 4,5:1 (AA) e borda que
identifica o controle ≥ 3:1 (1.4.11). Superfícies de referência: `--color-surface` (`#32566b`),
`--color-bg` (`#223645`) e `--color-surface-muted` (`#1a3544`), as três do guia da marca
([ADR 0045](../adr/0045-marca-oficial-conforme-o-guia.md)). Controle desabilitado é isento (1.4.3).
O tema é escuro e único ([ADR 0043](../adr/0043-tema-azul-em-todo-o-sistema.md)): `color-scheme: dark`
no `body`, para os controles nativos (data, arquivo, barra de rolagem) acompanharem.

**Foco visível (todos):** `:focus-visible` global em `packages/ui/src/styles.css`, contorno de 2 px
em `--color-focus-ring` (`#d7d1b8`) afastado 2 px: 5,11:1 sobre surface, 8,15:1 sobre bg e 8,37:1
sobre surface-muted. Nenhum componente remove o `outline`.

**Cor de ação (bege de apoio do guia):** `--color-action-primary`, `--color-focus-ring` e
`--color-link` usam `#d7d1b8`; o hover da ação usa `#ece7d1` (fora do guia). O texto sobre a ação é a
cor principal do guia, `#223645`.

**Cor secundária do guia (`#908c7a`):** só em `--color-border`, ou seja, divisórias, contornos de card
e os anéis decorativos do hero. Nunca em texto: dá 3,70:1 sobre bg, 3,80:1 sobre surface-muted e
2,32:1 sobre surface, abaixo de AA para texto pequeno.

| Componente | Contraste (valores reais) | Foco e teclado | Label e nome acessível |
|---|---|---|---|
| `Button` | primary: texto `#223645` sobre `#d7d1b8` 8,15:1 (hover `#ece7d1` 10,06:1); secondary/ghost: `#f2f0ef` sobre surface 6,90:1 e sobre `surface-muted` (hover) 11,30:1; link: `#d7d1b8` sobre surface 5,11:1, sobre bg 8,15:1 e sobre `surface-muted` 8,37:1; borda do secondary `#8ea3b3` 3,00:1 | `<button>` nativo (Enter/Espaço); `type="button"` por padrão; desabilitado e `loading` saem da ordem de clique | texto visível; ícone com `aria-hidden`; botões só de ícone (`icon`, `icon-sm`) exigem `aria-label` ou texto `sr-only`; `loading` marca `aria-busy` |
| `Label` | `#f2f0ef` sobre surface 6,90:1; "(opcional)" `#c9d4dc` 5,20:1 (8,29:1 sobre bg) | — | sempre visível, ligado por `htmlFor`; placeholder nunca substitui o label |
| `Input` | texto `#f2f0ef` 6,90:1; placeholder `#c9d4dc` 5,20:1; borda `#8ea3b3` 3,00:1 (4,78:1 contra bg); borda de erro `#ffb4ab` 4,62:1 | nativo | só é usado com `Label` (via `TextField` ou `htmlFor`); erro com `aria-invalid` |
| `FieldMessage` | ajuda `#c9d4dc` 5,20:1; erro `#ffb4ab` 4,62:1 sobre surface e 7,36:1 sobre bg | — | ligado ao campo por `aria-describedby`; erro tem ícone, não só cor (1.4.1) |
| `TextField` | herda `Label`, `Input` e `FieldMessage` | nativo | liga `id`, `htmlFor`, `aria-describedby` e `aria-invalid` sozinho |
| `Checkbox` | borda `#8ea3b3` 3,00:1; marcado: ícone `#223645` sobre `#d7d1b8` 8,15:1; label `#f2f0ef` 6,90:1 | Radix (`role="checkbox"`, Espaço alterna) | `<label htmlFor>` clicável; erro com `aria-invalid` + `aria-describedby`; nunca pré-marcado |
| `Alert` | título: sucesso `#9fd8ad` sobre `#1f3d36` 7,25:1, erro `#ffb4ab` sobre `#4b2a31` 7,39:1, aviso `#f3d08a` sobre `#453a24` 7,54:1; corpo `#f2f0ef` ≥ 9,81:1 | não recebe foco | `role="alert"` (erro) ou `role="status"`; ícone decorativo, o título carrega o sentido |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogClose` | título `#f2f0ef` 6,90:1; descrição `#c9d4dc` 5,20:1 | foco preso no conteúdo; **Esc** e clique no fundo fecham; o foco volta ao `DialogTrigger` (Radix) | `title` obrigatório → `aria-labelledby`; `description` → `aria-describedby`; "Fechar" de 44 px com texto `sr-only` |
| `StatusBadge` | Pendente `#f3d08a`/`#453a24` 7,54:1; Enviado `#9fd8ad`/`#1f3d36` 7,25:1; Falhou `#ffb4ab`/`#4b2a31` 7,39:1; Desativado `#c9d4dc`/`#1a3544` 8,51:1 | não recebe foco | o texto do status sempre visível; ponto de cor com `aria-hidden` |
| `TypeBadge` | PDF: `#f2f0ef` sobre `surface-muted` 11,30:1 (sem borda); Texto: `#f2f0ef` sobre surface 6,90:1 | não recebe foco | texto "PDF"/"Texto"; ícone com `aria-hidden` |
| `Table` e partes | célula `#f2f0ef` 6,90:1 (hover 11,30:1); cabeçalho `#c9d4dc` sobre bg 8,29:1 | contêiner rola na horizontal sem prender o foco; ações da linha são `Button` | `TableCaption` obrigatória (oculta visualmente); `TableHead` com `scope="col"` |

Os pares mais próximos do limite, todos sobre surface (`#32566b`): erro `#ffb4ab` 4,62:1, sucesso
`#9fd8ad` 4,82:1, bege `#d7d1b8` 5,11:1 e a borda de controle `#8ea3b3` 3,00:1 (limite de 1.4.11).
Divisórias em `--color-border` (`#908c7a`) são decorativas e não identificam controle.

## Fora de escopo

- Tema claro (o tema azul é único), alternância de tema, animações elaboradas, ilustrações
  customizadas.
- Copiar código gerado pelo Claude Design para os apps.
