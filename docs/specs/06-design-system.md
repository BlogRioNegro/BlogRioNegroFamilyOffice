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
Cores, tipografia, espaçamento, raio, sombras e componentes base, alinhados à identidade de
rionegroinvestimentos.com.br.
**Aceite:** design system publicado no Claude Design e aprovado pelo responsável do projeto.

### DS-002 · Protótipos (fase 1)
Home, listagem, artigo (prévia pdf e rich_text), modal de lead (todos os estados de
[04-lead-capture](04-lead-capture.md)), `/privacidade` e painel admin (login, lista, formulário, leads).
**Aceite:** cada tela listada existe no protótipo, em desktop e mobile.

### DS-003 · Tokens em `packages/ui` (fase 2)
Tokens do export do Claude Design em `packages/ui` (CSS variables + `@theme` do Tailwind v4, mesmos
nomes e valores; [ADR 0023](../adr/0023-tokens-por-export-do-claude-design.md)). Fontes Inter e Source
Serif 4 via `next/font/google`, a partir de `@rio-negro/ui/fonts`.
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
dos tokens: `bg-*`/`text-*`/`border-*` (cores), `font-sans`/`font-serif`, `rounded-control`/`rounded-card`,
`shadow-card`/`shadow-modal`, `text-xs`…`text-4xl` (com a entrelinha do nível) e espaçamento em múltiplos
de 4 px (`p-4` = `--space-4`). A paleta padrão do Tailwind é desativada.

| Token | Valor | Uso |
|---|---|---|
| `--rn-warm-0` | `#ffffff` | Paleta base (cinza quente). Não usar direto: usar os semânticos. |
| `--rn-warm-50` | `#f2f0ef` | Paleta base (cinza quente). Não usar direto: usar os semânticos. |
| `--rn-warm-100` | `#e9e6e4` | Paleta base (cinza quente). Não usar direto: usar os semânticos. |
| `--rn-warm-200` | `#dcd8d5` | Paleta base (cinza quente). Não usar direto: usar os semânticos. |
| `--rn-warm-400` | `#8c8782` | Paleta base (cinza quente). Não usar direto: usar os semânticos. |
| `--rn-warm-600` | `#5c5854` | Paleta base (cinza quente). Não usar direto: usar os semânticos. |
| `--rn-warm-800` | `#3a3735` | Paleta base (cinza quente). Não usar direto: usar os semânticos. |
| `--rn-warm-900` | `#1d1c1b` | Paleta base (cinza quente). Não usar direto: usar os semânticos. |
| `--rn-green-700` | `#2f6b3f` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-green-50` | `#e6f0e8` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-green-200` | `#b9d3bf` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-red-700` | `#a8322d` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-red-50` | `#f8e6e4` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-red-200` | `#e6bdb9` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-amber-700` | `#8a5a00` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-amber-50` | `#f7edd9` | Paleta de estado. Não usar direto: usar os semânticos. |
| `--rn-amber-200` | `#e3cb98` | Paleta de estado. Não usar direto: usar os semânticos. |
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
| `--line-height-md` | `1.7` | Altura de linha |
| `--font-size-lg` | `20px` | Corpo do artigo (desktop) |
| `--line-height-lg` | `1.7` | Altura de linha |
| `--font-size-xl` | `24px` | H3, título do modal |
| `--line-height-xl` | `1.35` | Altura de linha |
| `--font-size-2xl` | `30px` | H2, título do destaque |
| `--line-height-2xl` | `1.3` | Altura de linha |
| `--font-size-3xl` | `36px` | H1 mobile |
| `--line-height-3xl` | `1.2` | Altura de linha |
| `--font-size-4xl` | `48px` | H1 desktop |
| `--line-height-4xl` | `1.15` | Altura de linha |
| `--line-height-tight` | `1.2` | Altura de linha |
| `--line-height-snug` | `1.35` | Altura de linha |
| `--line-height-normal` | `1.5` | Altura de linha |
| `--line-height-relaxed` | `1.7` | Altura de linha |
| `--font-size-article` | `var(--font-size-md)` | Corpo do artigo (≥768px: var(--font-size-lg)) |
| `--line-height-article` | `var(--line-height-relaxed)` | Entrelinha do artigo |
| `--measure-article` | `68ch` | Largura máxima do texto do artigo |
| `--font-size-h1` | `var(--font-size-3xl)` | H1 (≥768px: var(--font-size-4xl)) |
| `--color-bg` | `var(--rn-warm-50)` | Fundo da página |
| `--color-surface` | `var(--rn-warm-0)` | Cards, modal, campos |
| `--color-surface-muted` | `var(--rn-warm-100)` | Superfície secundária, linhas de tabela |
| `--color-border` | `var(--rn-warm-200)` | Bordas e divisórias |
| `--color-border-strong` | `var(--rn-warm-400)` | Borda de campo e hover |
| `--color-text` | `var(--rn-warm-900)` | Texto principal |
| `--color-text-muted` | `var(--rn-warm-600)` | Legenda, data, texto regulatório |
| `--color-text-inverse` | `var(--rn-warm-50)` | Texto sobre ação primária |
| `--color-action-primary` | `var(--rn-warm-900)` | Botão primário |
| `--color-action-primary-hover` | `var(--rn-warm-800)` | Botão primário em hover |
| `--color-action-primary-text` | `var(--rn-warm-50)` | Texto do botão primário |
| `--color-disabled-bg` | `var(--rn-warm-100)` | Fundo de controle desabilitado |
| `--color-disabled-text` | `var(--rn-warm-600)` | Texto de controle desabilitado |
| `--color-success` | `var(--rn-green-700)` | Texto/ícone de sucesso |
| `--color-success-bg` | `var(--rn-green-50)` | Fundo de alerta de sucesso |
| `--color-success-border` | `var(--rn-green-200)` | Borda de alerta de sucesso |
| `--color-error` | `var(--rn-red-700)` | Texto/ícone de erro, campo inválido |
| `--color-error-bg` | `var(--rn-red-50)` | Fundo de alerta de erro |
| `--color-error-border` | `var(--rn-red-200)` | Borda de alerta de erro |
| `--color-warning` | `var(--rn-amber-700)` | Texto/ícone de aviso |
| `--color-warning-bg` | `var(--rn-amber-50)` | Fundo de alerta de aviso |
| `--color-warning-border` | `var(--rn-amber-200)` | Borda de alerta de aviso |
| `--color-focus-ring` | `var(--rn-warm-900)` | Anel de foco |
| `--color-overlay` | `rgba(29, 28, 27, 0.48)` | Fundo do modal |
| `--font-sans` | `var(--font-inter), system-ui, -apple-system, 'Segoe UI', sans-serif` | Interface (Inter, via next/font) |
| `--font-serif` | `var(--font-source-serif), 'Source Serif Pro', Georgia, 'Times New Roman', serif` | Corpo do artigo (Source Serif 4, via next/font) |
| `--font-weight-regular` | `400` | Peso da fonte |
| `--font-weight-medium` | `500` | Peso da fonte |
| `--font-weight-semibold` | `600` | Peso da fonte |
| `--font-weight-bold` | `700` | Peso da fonte |
| `--radius-control` | `6px` | Botão, campo, badge |
| `--radius-card` | `12px` | Card e modal |
| `--shadow-card` | `0 1px 2px rgba(29, 28, 27, 0.06), 0 1px 3px rgba(29, 28, 27, 0.04)` | Card |
| `--shadow-modal` | `0 12px 32px rgba(29, 28, 27, 0.14), 0 2px 6px rgba(29, 28, 27, 0.06)` | Modal |
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
identifica o controle ≥ 3:1 (1.4.11). Superfícies de referência: `--color-surface` (`#ffffff`) e
`--color-bg` (`#f2f0ef`). Controle desabilitado é isento (1.4.3).

**Foco visível (todos):** `:focus-visible` global em `packages/ui/src/styles.css`, contorno de 2 px
em `--color-focus-ring` (`#1d1c1b`) afastado 2 px: 17,02:1 sobre surface e 14,98:1 sobre bg. Nenhum
componente remove o `outline`.

| Componente | Contraste (valores reais) | Foco e teclado | Label e nome acessível |
|---|---|---|---|
| `Button` | primary: texto `#f2f0ef` sobre `#1d1c1b` 14,98:1 (hover `#3a3735` 10,40:1); secondary/ghost/link: `#1d1c1b` sobre surface 17,02:1 e sobre `surface-muted` (hover) 13,70:1; borda do secondary `#8c8782` 3,56:1 | `<button>` nativo (Enter/Espaço); `type="button"` por padrão; desabilitado e `loading` saem da ordem de clique | texto visível; ícone com `aria-hidden`; botões só de ícone (`icon`, `icon-sm`) exigem `aria-label` ou texto `sr-only`; `loading` marca `aria-busy` |
| `Label` | `#1d1c1b` sobre surface 17,02:1; "(opcional)" `#5c5854` 7,05:1 (6,21:1 sobre bg) | — | sempre visível, ligado por `htmlFor`; placeholder nunca substitui o label |
| `Input` | texto `#1d1c1b` 17,02:1; placeholder `#5c5854` 7,05:1; borda `#8c8782` 3,56:1 (3,13:1 contra bg); borda de erro `#a8322d` 6,65:1 | nativo | só é usado com `Label` (via `TextField` ou `htmlFor`); erro com `aria-invalid` |
| `FieldMessage` | ajuda `#5c5854` 7,05:1; erro `#a8322d` 6,65:1 sobre surface e 5,85:1 sobre bg | — | ligado ao campo por `aria-describedby`; erro tem ícone, não só cor (1.4.1) |
| `TextField` | herda `Label`, `Input` e `FieldMessage` | nativo | liga `id`, `htmlFor`, `aria-describedby` e `aria-invalid` sozinho |
| `Checkbox` | borda `#8c8782` 3,56:1; marcado: ícone `#f2f0ef` sobre `#1d1c1b` 14,98:1; label `#1d1c1b` 17,02:1 | Radix (`role="checkbox"`, Espaço alterna) | `<label htmlFor>` clicável; erro com `aria-invalid` + `aria-describedby`; nunca pré-marcado |
| `Alert` | título: sucesso `#2f6b3f` sobre `#e6f0e8` 5,46:1, erro `#a8322d` sobre `#f8e6e4` 5,52:1, aviso `#8a5a00` sobre `#f7edd9` 5,10:1; corpo `#1d1c1b` ≥ 14,12:1 | não recebe foco | `role="alert"` (erro) ou `role="status"`; ícone decorativo, o título carrega o sentido |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogClose` | título `#1d1c1b` 17,02:1; descrição `#5c5854` 7,05:1 | foco preso no conteúdo; **Esc** e clique no fundo fecham; o foco volta ao `DialogTrigger` (Radix) | `title` obrigatório → `aria-labelledby`; `description` → `aria-describedby`; "Fechar" de 44 px com texto `sr-only` |
| `StatusBadge` | Pendente `#8a5a00`/`#f7edd9` 5,10:1; Enviado `#2f6b3f`/`#e6f0e8` 5,46:1; Falhou `#a8322d`/`#f8e6e4` 5,52:1; Desativado `#5c5854`/`#e9e6e4` 5,67:1 | não recebe foco | o texto do status sempre visível; ponto de cor com `aria-hidden` |
| `TypeBadge` | PDF: `#1d1c1b` sobre `surface-muted` 13,70:1 (sem borda); Texto: `#1d1c1b` sobre surface 17,02:1 | não recebe foco | texto "PDF"/"Texto"; ícone com `aria-hidden` |
| `Table` e partes | célula `#1d1c1b` 17,02:1 (hover 13,70:1); cabeçalho `#5c5854` sobre bg 6,21:1 | contêiner rola na horizontal sem prender o foco; ações da linha são `Button` | `TableCaption` obrigatória (oculta visualmente); `TableHead` com `scope="col"` |

Divisórias em `--color-border` (`#dcd8d5`, 1,42:1) são decorativas e não identificam controle.

## Fora de escopo

- Tema escuro, animações elaboradas, ilustrações customizadas.
- Copiar código gerado pelo Claude Design para os apps.
