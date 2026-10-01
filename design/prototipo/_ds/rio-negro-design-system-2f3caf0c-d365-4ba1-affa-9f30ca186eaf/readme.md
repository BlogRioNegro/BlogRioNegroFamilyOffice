# Rio Negro — Design System do blog

Blog institucional da **Rio Negro Assessoria de Investimentos** (parceira XP). Publica artigos sobre investimentos — a maioria em PDF — e capta leads de investidores pessoa física. Duas superfícies:

1. **Site público de leitura** — listagem de artigos, página de artigo (texto ou PDF), modal de captação de lead.
2. **Painel admin interno** — tabela de artigos, edição/publicação, lista de leads com status de envio do PDF.

Tom: sóbrio, confiável, editorial. Objetivo nº 1: leitura confortável de textos longos.

## Fontes recebidas
- `uploads/rionegro-logo-escuro.png` e `uploads/rionegro-logo-branco.png` (256×42, PNG transparente) → copiados para `assets/`.
- Briefing em texto (cores, tipografia, base, componentes, restrições). Não houve Figma, código nem telas de referência; as telas dos UI kits foram derivadas do briefing.

## Índice
- `Design System.html` — página única: tokens, cores, tipografia, base, todos os componentes em todos os estados, telas e tabela de contraste.
- `styles.css` — ponto de entrada (só `@import`).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css` (espaço, raio, sombra, layout, foco, movimento), `base.css` (reset, foco global, `.rn-article`).
- `components/components.css` — estilos das classes `rn-*`.
- `components/<grupo>/` — componentes React (`.jsx` + `.d.ts` + `.prompt.md`) e um card `@dsCard` por pasta.
- `guidelines/` — cards de fundamentos + `contrast-data.json`.
- `ui_kits/blog/`, `ui_kits/admin/` — protótipos clicáveis.
- `assets/` — logotipos.
- `SKILL.md` — skill para Claude Code.

## Componentes
- **actions/** — `Button` (primary, secondary, ghost, link; md/sm; iconLeft/iconRight/iconOnly; loading; disabled), `LoadMoreButton`.
- **forms/** — `Input`, `PhoneInput` (máscara "(99) 99999-9999", exporta `maskPhone`), `Checkbox`, `Label`, `FieldMessage` (ajuda/erro).
- **content/** — `ArticleCard` (capa 16:9, tipo, data, título), `FeaturedArticleCard`.
- **feedback/** — `Alert` (success/error/warning), `Modal` (480 px / tela cheia < 768 px), `TypeBadge` (PDF, Texto), `StatusBadge` (Desativado, Pendente, Enviado, Falhou).
- **data/** — `DataTable` (ações por linha, hover, carregando, vazio), `Pagination`.
- **layout/** — `SiteHeader` (logotipo + "Artigos"), `SiteFooter` (CTA "Conheça a Rio Negro", texto regulatório, "Privacidade").
- **core/** — `Icon`.

Estados de documentação: passe `className="is-hover"` ou `"is-focus"` para renderizar hover/foco estáticos.

### Intentional additions
- `Icon` — wrapper com traçados do Lucide; botões de ícone, alertas e badges precisam de glifos consistentes.
- `--color-border-strong` (#8C8782) — a borda pedida (#DCD8D5) não atinge 3:1 para contorno de campo.
- Tela "Leads" e botão "Reenviar" no admin — necessários para exibir os badges de status de envio em contexto.

## CONTENT FUNDAMENTALS
- **Idioma:** português do Brasil, sempre.
- **Pessoa:** fala com o leitor como "você"; a empresa fala como "a Rio Negro" ou "nossa equipe", sem "eu".
- **Tom:** sóbrio e informativo, próximo de um jornal de economia. Frases completas, sem gíria, sem exclamações em excesso (no máximo um "Pronto!" em confirmação).
- **Caixa:** sentença em tudo — títulos, botões, labels ("Carregar mais", "Receber PDF", "Novo artigo"). Nada em CAIXA ALTA, exceto siglas (PDF, IPCA, CVM).
- **Botões:** verbo no infinitivo + objeto: "Receber PDF", "Salvar alterações", "Tentar novamente".
- **Erros:** dizem o que fazer, não só o que deu errado: "Informe um e-mail válido, como nome@exemplo.com.br."
- **Datas:** "12 set. 2026" no site; "12/09/2026" no admin.
- **Números:** vírgula decimal (4,5:1), "R$ 1.000,00".
- **Sem emoji**, sem elementos sociais (curtidas, comentários, contadores de compartilhamento).
- **Regulatório:** o texto do rodapé é longo e obrigatório; o conteúdo em `SiteFooter` é um rascunho a ser trocado pelo aprovado pelo compliance.

## VISUAL FOUNDATIONS
- **Cor:** base clara. Fundo off-white quente `#F2F0EF` (cor principal), superfícies brancas, cinza quente `#E9E6E4` para hover/destaque, texto quase preto quente `#1D1C1B`. Ação primária = o próprio texto escuro (botão preto quente). Verde, vermelho e âmbar escuros só para estados, com fundos bem claros. **Sem tema escuro, sem gradientes.**
- **Tipografia:** Inter para toda a interface e títulos; Source Serif 4 só para leitura (corpo do artigo e prévias). Artigo 18/20 px, altura 1.7, 68ch. Títulos com peso 600–700 e entrelinha apertada (1.15–1.35).
- **Espaço:** múltiplos de 4 px; respiro generoso (48–96 px entre seções). Coluna de leitura centralizada de 720 px; admin em 1200 px.
- **Fundos:** planos. Sem texturas, padrões, ilustrações ou imagens full-bleed. Capas de artigo 16:9 são a única imagem; sem capa, área neutra `--color-surface-muted`.
- **Cards:** branco, borda 1 px `#DCD8D5`, raio 12 px, `--shadow-card` quase imperceptível. Hover: borda escurece para `#8C8782` e o título ganha sublinhado. O card inteiro é o link.
- **Bordas:** 1 px. `--color-border` para divisões, `--color-border-strong` para contorno de controles.
- **Sombras:** só duas — card e modal. Sem sombra interna.
- **Raio:** 6 px controles, badges e alertas; 12 px cards, tabela e modal. Modal no mobile: 0.
- **Hover:** escurece (primário → `#3A3735`) ou ganha fundo cinza quente (secundário, ghost, linha de tabela). Links engrossam o sublinhado de 1 → 2 px.
- **Press:** sem encolhimento; a cor de hover basta.
- **Foco:** anel 2 px `#1D1C1B` com offset 2 px em tudo que é focável (`:focus-visible`).
- **Desabilitado:** fundo `#E9E6E4` + texto `#5C5854` (continua legível, 5,67:1). Sem opacidade.
- **Carregando:** spinner de linha dentro do botão; esqueletos estáticos (blocos cinza) em cards e tabela — sem shimmer.
- **Animação:** apenas transição de cor de 120 ms ease-out e o giro do spinner. `prefers-reduced-motion` desliga tudo.
- **Transparência/blur:** só no overlay do modal (`rgba(29,28,27,.48)`), sem blur.
- **Layout fixo:** nada fixo além do overlay do modal; header rola com a página.

## ICONOGRAPHY
- Não foi fornecido conjunto de ícones. Usamos **Lucide** (traço 2 px, pontas arredondadas, 24×24), embutido em `components/core/Icon.jsx` como traçados copiados — sem dependência de CDN. **Substituição sinalizada.**
- Ícones são funcionais e sempre acompanham texto (exceto botões de ícone, que têm `aria-label`). Tamanhos: 20 px (md), 16 px (sm), 14 px em badges.
- Sem emoji, sem caracteres unicode como ícone, sem ícones coloridos/ilustrados. Cor = `currentColor`.
- Logotipo: `assets/logo-escuro.png` sobre fundos claros (padrão em todo o blog); `assets/logo-branco.png` apenas sobre `#1D1C1B`. Ambos são PNG de 256×42 — para telas de alta densidade, pedir SVG.

## Fontes
Inter e Source Serif 4 são carregadas do Google Fonts (`tokens/fonts.css`). Não há arquivos de fonte locais no projeto.

## Mapa para Tailwind
`colors: { bg: 'var(--color-bg)', surface: { DEFAULT: 'var(--color-surface)', muted: 'var(--color-surface-muted)' }, border: { DEFAULT: 'var(--color-border)', strong: 'var(--color-border-strong)' }, text: { DEFAULT: 'var(--color-text)', muted: 'var(--color-text-muted)', inverse: 'var(--color-text-inverse)' }, action: { primary: 'var(--color-action-primary)', 'primary-hover': 'var(--color-action-primary-hover)' }, success: {...}, error: {...}, warning: {...} }`, `borderRadius: { control: '6px', card: '12px' }`, `boxShadow: { card, modal }`, `screens: { sm: '390px', md: '768px', lg: '1280px' }`, `spacing` = escala 4 px.
