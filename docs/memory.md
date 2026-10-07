# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Projeto
Blog Rio Negro Family Office: clone do blog Rio Negro (commit `2e0ada6` do original), com a marca
trocada ([ADR 0042](adr/0042-clone-rio-negro-family-office.md)). Remote `origin` =
`github.com/BlogRioNegro/BlogRioNegroFamilyOffice` (privado). **Push na `main` dispara deploy
automático na Vercel.** O original em `C:\Users\Rafael\projetos\rio-negro` é somente leitura.

## Fase
Branch `main`. A `titulos-black` entrou pelo PR #3 (`4dcfc8e`): TB-001 ([ADR 0047](adr/0047-titulos-em-roboto-slab-black.md)),
TB-002 ([ADR 0048](adr/0048-subtitulo-do-artigo.md)) e TB-003 ([ADR 0049](adr/0049-voltar-no-cabecalho-do-site.md)).
Depois, `c16a0df` (local, **sem push**): títulos em Roboto Slab Bold, `--font-weight-black` de 900 para 700.
Gate rápido em 2026-10-07: typecheck, lint, format e `tokens.test.ts` verdes. `pnpm build` compila, mas
falha na coleta de páginas (`/sitemap.xml`) por falta de `.env.local`. Integração, E2E e a11y não rodaram.

## Próxima tarefa
Nenhuma task aberta. Falta o `git push origin main` do `c16a0df` (ver Pendências).

## Marca e navegação
- Famílias, cores e logo: guia oficial (`design/marca/INFO-RN-MFO.pdf`, ADR 0045). Tema azul único (ADR 0043).
- Títulos (ADR 0047): Roboto Slab 700 (classe `font-black`, token em 700), caixa digitada, letras juntas.
  H1 de toda página (site e admin, hero e login inclusive) com `text-h1`: 28 px / 36 px ≥ 768 px.
  Nenhum outro título alcança o H1.
- Menu (400, maiúsculas), rodapé (300), texto corrido (entrelinha 1,5) e favicon: ADR 0046. Tipografia: spec 06.
- Subtítulo do artigo (ADR 0048): `<p>` em Roboto Slab 400 abaixo do título; "Título: Subtítulo" em
  `<title>`, OG e RSS (`articleFullTitle`). Nos E2E, `getByLabel('Título', { exact: true })`.
- Cabeçalho do site (ADR 0049, PUB-016): "Artigos" só na home; nas demais, "Voltar" (`back-link.tsx`), link
  para o nível acima e `router.back()` se houve navegação na visita (`lib/domain/visit-history`, em memória).
  O `SiteHeader` é renderizado por página, com o destino de reserva.

## Regras do loop
- Mudar cor ou fonte é só nos tokens, nos três lugares que o `tokens.test.ts` compara (ui, export, spec 06).
- Escala nova do Tailwind (tamanho, peso, entrelinha): registrar em `packages/ui/src/cn.ts`.
- Código de server é duplicado por app (ADR 0021): mudar nas duas cópias.
- E2E: web :3100/:3102, admin :3101; liberar as portas antes (`taskkill //PID <pid> //T //F`).
- Nunca ler `.env*`, nunca editar migration existente, nunca deploy nem `supabase db push`. Push só quando o Rafael pedir.
- `pnpm test` e os E2E exigem Docker + `pnpm exec supabase start`. Testar antes com `docker info`.

## Pendências para o Rafael
- **Push do `c16a0df` na `main` (publica na Vercel): não foi feito, porque o `pnpm build` local não fecha
  sem `.env.local`. Decidir: criar o `.env.local` e repetir o build, ou liberar o push assim mesmo.**
- `tests/e2e/titles.spec.ts` passou a esperar peso 700, mas os E2E não rodaram depois da troca.
- Criar `.env.local` dos dois apps: sem ele o `pnpm build` não fecha e o `pnpm dev` precisa das envs à mão.
- Hero da home: com o H1 em 36 px, os anéis de 720 px ficaram grandes ao lado do título. Reduzir é layout.
- Login do admin: "Entrar no painel" em 36 px pode quebrar em duas linhas no cartão.
- Favicon de 40 px perde nitidez em tela de alta densidade: pedir ao cliente um arquivo maior.
- Dados "pendente" em `/privacidade`; validação jurídica; URLs de LinkedIn/Instagram; "2024" do rodapé.
- Node local é v24; o projeto fixa 22 no `.nvmrc`.
