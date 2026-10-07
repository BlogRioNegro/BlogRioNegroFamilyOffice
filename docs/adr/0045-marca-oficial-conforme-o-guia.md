# 0045 · Marca oficial conforme o guia

- Status: accepted · Data: 2026-10-02
- Specs: [DS-001, DS-003, DS-006](../specs/06-design-system.md), [03-public-site](../specs/03-public-site.md)
- Substitui: os valores de cor, as fontes e a logo da [ADR 0043](0043-tema-azul-em-todo-o-sistema.md)
  (o tema azul único de lá continua valendo)
- Tasks: [marca-oficial](../tasks/marca-oficial.md) (MO-001 a MO-004)
- Substituída em parte pela [ADR 0046](0046-tipografia-e-favicon-do-site-institucional.md): o peso
  900 dos títulos e o favicon "RN" (famílias, cores e logo continuam valendo). O peso 900 dos títulos
  voltou com a [ADR 0047](0047-titulos-em-roboto-slab-black.md)

## Contexto
Até aqui a marca vinha do CSS do site institucional, com valores vizinhos dos oficiais (`#233645`,
`#334a5c`, `#d8d2b8`) e fontes herdadas do blog original (Inter e Source Serif 4). O cliente
entregou o guia oficial, de uma página: `design/marca/INFO-RN-MFO.pdf`.

## Decisão
Definida pelo responsável do projeto (Rafael): os estilos são **exatamente** os do guia, sem
elemento visual novo. Só se recolore e se troca a tipografia do que já existe, mais logo e favicon.

### Cores (hex exato do guia, conferido pela cor pintada no PDF)
| Cor do guia | Hex | Primitivo | Papel no sistema |
|---|---|---|---|
| Principal | `#223645` | `--rn-blue-800` | fundo da página (`--color-bg`), cabeçalho de tabela, texto sobre a ação (`--color-action-primary-text`, `--color-text-inverse`) |
| Azul claro do degradê | `#32566b` | `--rn-blue-700` | superfícies: cards, modal, campos (`--color-surface`) |
| Faixa da logo branca / fim do degradê | `#1a3544` | `--rn-blue-900` | header, rodapé e superfície rebaixada (`--color-surface-muted`) |
| Apoio (bege) | `#d7d1b8` | `--rn-sand-300` | ação, link e foco (`--color-action-primary`, `--color-link`, `--color-focus-ring`) |
| Secundária | `#908c7a` | `--rn-stone-500` | divisórias, contornos de card e os anéis do hero (`--color-border`); nunca texto |
| Degradê `#32566b` → `#1a3544` | — | `--gradient-brand` | token definido, **sem uso em nenhuma tela** |

### Fontes
- **Roboto Slab Black (900)** em títulos: `h1` a `h3`, títulos de card e de diálogo, incluindo o H1
  do hero (`font-serif font-black`).
- **Roboto Slab Regular (400)** em subtítulos: resumo do artigo, descrição do diálogo e a linha de
  apoio sob os títulos (`font-serif font-regular`).
- **Roboto** em todo o resto: corpo do artigo, interface, formulários, tabelas, textos jurídicos.
- Carregadas por `next/font/google` em `packages/ui/src/fonts.ts` e servidas pelo próprio app (a CSP
  mantém `font-src 'self'`). O token `--font-serif` passa a ser a Roboto Slab; novo
  `--font-weight-black: 900`.

### Logo e favicon
- Origem: o próprio PDF, renderizado em escala 4 com um script temporário (Playwright + pdf.js da
  CDN, não versionado) e recortado pela caixa delimitadora dos pixels, com o alfa calculado pela
  distância ao fundo.
- Logo branca (da faixa `#1a3544`): `logo-branco.png`, 528×160, nos dois apps e em
  `design/design-system/assets`. É o mesmo desenho da que vinha do site (249×75), mais nítida.
- Logo escura (do topo do guia, pintada em `#1a3544`): `design/design-system/assets/logo-escuro.png`,
  1055×320. Os apps não a usam, porque o tema é escuro.
- Favicon "RN" branco sobre `#1a3544`: `app/icon.png` (512×512) nos dois apps e
  `design/design-system/assets/favicon.png`. O proxy do admin libera `/icon.png` sem sessão.

### Erros de digitação do PDF
- O rótulo da cor principal diz "R35 G54 B69" (`#233645`), mas a cor pintada e o hex escrito são
  `#223645` (R34). Vale `#223645`.
- O rótulo do início do degradê diz "#29495d", mas a cor pintada é `#32566b`, que bate com o RGB
  escrito ao lado (R50 G86 B107). Vale `#32566b`.

### Fora do guia (tons que ele não define; ficam como estavam)
- Texto principal `#f2f0ef` e texto secundário `#c9d4dc`.
- Hover da ação `#ece7d1`; borda de controle `#8ea3b3`; fundo de controle desabilitado `#4a6378`.
- Cores de estado: sucesso `#9fd8ad` / `#1f3d36` / `#3f6f5c`, erro `#ffb4ab` / `#4b2a31` /
  `#8c4a4d`, aviso `#f3d08a` / `#453a24` / `#85703d`.
- Sobreposição do modal e sombras.

## Consequências
- Contraste (WCAG 2.1) na spec 06. Todos os papéis de texto passam em AA. Os mais justos ficam sobre
  a superfície `#32566b`: erro 4,62:1, sucesso 4,82:1, bege 5,11:1; a borda de controle fica em 3,00:1,
  no limite de 1.4.11. A auditoria axe (`A11Y=1`) segue sem violações.
- A secundária `#908c7a` não passa como texto pequeno (3,70:1 sobre o fundo), então ficou só em
  elementos decorativos, sem alterar a cor.
- O header passou de `--color-bg` para `--color-surface-muted`, para a logo branca ficar sobre
  `#1a3544`, como no guia.
- `apps/admin/lib/services/article-pdf.tsx` (PDF dos artigos) e `design/prototipo/` não mudam.
- Trocar qualquer cor ou fonte continua sendo só nos tokens, nos três lugares que o
  `tokens.test.ts` compara.
