# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Projeto
Blog Rio Negro Family Office: clone do blog Rio Negro (commit `2e0ada6` do original), com a marca
trocada ([ADR 0042](adr/0042-clone-rio-negro-family-office.md)). Remote `origin` =
`github.com/BlogRioNegro/BlogRioNegroFamilyOffice` (privado). **Push na `main` dispara deploy
automático na Vercel.** O original em `C:\Users\Rafael\projetos\rio-negro` é somente leitura.

## Fase
Branch `titulos-black` (a partir da `main`, sem push): [tasks/titulos-black.md](tasks/titulos-black.md).
TB-001 `[x]` em `6f91dee` ([ADR 0047](adr/0047-titulos-em-roboto-slab-black.md)); TB-002 `[x]` em `9e77489`
([ADR 0048](adr/0048-subtitulo-do-artigo.md), migration `20261007120000_article_subtitle.sql`). Docker e
Supabase local funcionando em 2026-10-07 (modo completo). A branch `ajuste-titulos` é experimento descartado.

## Próxima tarefa
TB-003 ("Voltar" no cabeçalho do site, no lugar de "Artigos", fora da home). Spec a ler: 03.

## Marca
- Famílias, cores e logo: guia oficial (`design/marca/INFO-RN-MFO.pdf`, ADR 0045). Tema azul único (ADR 0043).
- Títulos (ADR 0047): Roboto Slab 900, caixa digitada, letras juntas. H1 de toda página (site e admin,
  hero e login inclusive) com `text-h1`: 28 px / 36 px ≥ 768 px. Nenhum outro título alcança o H1.
  Não existem mais `text-4xl`, `text-5xl`, `font-extralight`, `leading-section` nem `tracking-section`.
- Menu (400, maiúsculas), rodapé (300), texto corrido (entrelinha 1,5) e favicon: ADR 0046.
- Papéis, classes e tamanhos: spec 06, seção Tipografia. Todo título leva `wrap-anywhere`.
- Subtítulo do artigo (ADR 0048): `<p>` em Roboto Slab 400 abaixo do título; "Título: Subtítulo" em
  `<title>`, OG e RSS (`articleFullTitle`). Nos E2E, `getByLabel('Título', { exact: true })`.
- Home: só o hero, sem consulta ao banco. Redes sociais no rodapé por env opcional (ADR 0044).

## Regras do loop
- Mudar cor ou fonte é só nos tokens, nos três lugares que o `tokens.test.ts` compara (ui, export, spec 06).
- Escala nova do Tailwind (tamanho, peso, entrelinha): registrar em `packages/ui/src/cn.ts`.
- Código de server é duplicado por app (ADR 0021): mudar nas duas cópias.
- E2E: web :3100/:3102, admin :3101; liberar as portas antes (`taskkill //PID <pid> //T //F`).
- Nunca ler `.env*`, nunca editar migration existente, nunca deploy nem `supabase db push`. Push só quando o Rafael pedir.
- `pnpm test` e os E2E exigem Docker + `pnpm exec supabase start`. Testar antes com `docker info`.
  O outro projeto usa as mesmas portas: `pnpm exec supabase stop --project-id rio-negro` antes.

## Pendências para o Rafael
- **ANTES do merge na main: (1) gate completo com Docker verde; (2) o Rafael aplica a migration do
  subtítulo no Supabase de PRODUÇÃO (`supabase db push`). Código novo sem a coluna em produção derruba o site.**
- Hero da home: com o H1 em 36 px, os anéis de 720 px ficaram grandes ao lado do título. Reduzir é layout.
- Login do admin: "Entrar no painel" em 36 px pode quebrar em duas linhas no cartão.
- Favicon de 40 px perde nitidez em tela de alta densidade: pedir ao cliente um arquivo maior.
- Criar `.env.local` dos dois apps para o `pnpm build`; conferir `apps/*/.env.example` (redes sociais).
- Dados "pendente" em `/privacidade`; validação jurídica; URLs de LinkedIn/Instagram; "2024" do rodapé.
- Node local é v24; o projeto fixa 22 no `.nvmrc`.
