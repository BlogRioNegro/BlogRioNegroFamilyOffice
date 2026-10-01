# 0043 · Tema azul em todo o sistema

- Status: accepted · Data: 2026-10-01
- Specs: [DS-003, DS-006](../specs/06-design-system.md), [PUB-001](../specs/03-public-site.md),
  [05-admin-panel](../specs/05-admin-panel.md)
- Substitui: as seções "Azul de ação (CL-002)" e "Logo (CL-003)" da
  [ADR 0042](0042-clone-rio-negro-family-office.md)
- Tasks: CL-008 e CL-009 em [clone-family-office](../tasks/clone-family-office.md)

## Contexto
Na CL-002 o azul da marca entrou só como cor de ação, sobre o tema claro herdado do blog original.
Ao ver o resultado, o Rafael pediu para inverter: o azul como cor primária de todo o sistema e a
home melhorada.

## Decisão
Definida pelo responsável do projeto (Rafael), em 2026-10-01:
- **Tema escuro único**, no site e no admin: fundo no azul da marca, texto claro. Não há tema
  claro nem alternância.
- **Cor de ação**: o bege `#D8D2B8`, a cor `accent` do kit do site institucional, que é o fundo dos
  botões do site sobre o azul. Texto do botão no azul da marca.
- **Home**: só o hero, redesenhado, sem conteúdo novo e sem consulta ao banco (PUB-001 fica).
- **Logo**: versão branca do site, com 40 px de altura no header (o header continua com 64 px).

Cores, todas lidas do CSS de https://rionegromfo.com.br/ em 2026-10-01, salvo onde indicado:
| Token | Valor | Origem |
|---|---|---|
| `--color-bg` | `#233645` | `primary` do kit do site |
| `--color-surface` | `#334a5c` | `secondary` do kit (fundo de seção no site) |
| `--color-surface-muted` | `#192631` | derivado do azul da marca (mesmo matiz, mais escuro) |
| `--color-border` | `#4a6378` | derivado (divisória decorativa) |
| `--color-border-strong` | `#8ea3b3` | derivado (borda de controle, ≥ 3:1) |
| `--color-text` | `#f2f0ef` | off-white que o blog já usava |
| `--color-text-muted` | `#c9d4dc` | texto claro usado no site sobre o azul |
| `--color-action-primary`, `--color-link`, `--color-focus-ring` | `#d8d2b8` | `accent` do kit (botões do site) |
| `--color-action-primary-hover` | `#ece7d1` | bege claro do site (campos do formulário) |
| estados (sucesso, erro, aviso) | verdes, vermelhos e âmbares claros sobre fundos escuros | derivados, para contraste AA no tema escuro |

Implementação:
- Só os tokens mudam (`packages/ui/src/tokens.css` + `theme.css`, export do design e spec 06, que o
  `tokens.test.ts` compara). Os componentes já usavam tokens semânticos, então não foram reescritos.
- A ordem relativa das superfícies foi espelhada: `surface` é a mais clara, `bg` a intermediária e
  `surface-muted` a mais escura, como no tema claro.
- A paleta `--rn-warm-*` de cinzas saiu (fica só `--rn-warm-50`, do texto); entram `--rn-blue-*` e
  `--rn-sand-*`. Paletas de estado renomeadas para os novos tons (`-300`, `-700`, `-900`).
- `color-scheme: dark` no `body` (controles nativos) e `theme: 'dark'` no widget do Turnstile.
- Logo: `RIO-NEGRO-copy.png` (249×75, branca, a do rodapé do site) como `logo-branco.png` nos dois
  apps; `logo.tsx` passa de `h-7` para `h-10`.
- Hero da home: H1 em `--font-serif`, novo `--font-size-5xl` (60 px) no desktop, filete bege e anéis
  decorativos em CSS. Nenhum texto novo: o H1 continua o definido na CL-004.

## Consequências
- Contraste (WCAG 2.1) recalculado na spec 06: texto principal ≥ 8,13:1, texto secundário ≥ 6,13:1,
  botão primário 8,21:1, bordas de controle ≥ 3,53:1. A auditoria axe (`A11Y=1`) continua sem violações.
- As capas dos artigos e o PDF embutido da prévia são conteúdo e continuam claros; o PDF gerado pelo
  admin (ADR 0036) não muda.
- `design/` (protótipos e UI kits) continua mostrando o tema claro do original: é só referência de
  layout. Os tokens do export (`design/design-system/tokens`) acompanham o código.
- Voltar ao tema claro seria reverter os tokens desta ADR; não há suporte a dois temas.
