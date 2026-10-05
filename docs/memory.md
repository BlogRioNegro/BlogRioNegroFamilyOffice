# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Projeto
Blog Rio Negro Family Office: clone do blog Rio Negro (commit `2e0ada6` do original), com a marca
trocada ([ADR 0042](adr/0042-clone-rio-negro-family-office.md)). Remote `origin` =
`github.com/BlogRioNegro/BlogRioNegroFamilyOffice` (privado). **Push na `main` dispara deploy
automático na Vercel.** O original em `C:\Users\Rafael\projetos\rio-negro` é somente leitura.

## Fase
Branch `ajuste-tipografia` (a partir da `main`, sem push): [tasks/ajuste-tipografia.md](tasks/ajuste-tipografia.md),
[ADR 0046](adr/0046-tipografia-e-favicon-do-site-institucional.md). AJ-001 `[x]` em `9442277`, AJ-002 `[x]` em `e46dba2`.
Gate de 2026-10-05, sem Docker: typecheck, lint, format e 395 testes unitários verdes. Não rodaram:
integração, E2E e a11y (Docker fora do ar) e o `pnpm build` (falta `.env.local`).

## Próxima tarefa
Nenhuma task aberta. Com o Docker de volta: `pnpm test`, `pnpm test:e2e` e `A11Y=1 pnpm test:e2e a11y`, e as
capturas com banco (listagem, artigo, modal de lead, lista do admin). O Rafael confere
`tests/e2e/__visual__/tipografia-*.png` e decide o merge na `main` (push = deploy na Vercel).

## Marca
- Famílias, cores e logo: guia oficial (`design/marca/INFO-RN-MFO.pdf`, ADR 0045). Tema azul único (ADR 0043).
- Peso, entrelinha, espaçamento e maiúsculas: medidos no site institucional (ADR 0046, com a tabela).
  H1 Roboto Slab 200 em maiúsculas; títulos de seção e de diálogo 200, maiúsculas, 10 px entre letras;
  títulos de card 500; menu 400 em maiúsculas; rodapé 300; corpo com entrelinha 1,5.
- Papéis e classes de tipografia: spec 06, seção Tipografia. Títulos em maiúsculas levam `wrap-anywhere`.
- Favicon: o do site institucional, PNG de 40×40 px (`app/icon.png` nos dois apps e no export).
- Home: só o hero, sem consulta ao banco. Redes sociais no rodapé por env opcional (ADR 0044).

## Regras do loop
- Mudar cor ou fonte é só nos tokens, nos três lugares que o `tokens.test.ts` compara (ui, export, spec 06).
- Escala nova do Tailwind (peso, entrelinha, espaçamento): registrar em `packages/ui/src/cn.ts`.
- Código de server é duplicado por app (ADR 0021): mudar nas duas cópias.
- E2E: web :3100/:3102, admin :3101; parar servidores antes (`taskkill //PID <pid> //T //F`).
- Nunca ler `.env*`, nunca editar migration, nunca deploy. Push só quando o Rafael pedir.
- `pnpm test` e os E2E exigem Docker + `pnpm exec supabase start`. Testar antes com `docker info`.
- Sem banco: subir os apps com as envs de teste do `tests/e2e/playwright.config.ts` em 3200/3201
  (home, `/privacidade`, erro 404 e login do admin abrem sem Supabase).
- `pnpm build` exige as envs dos apps: sem `.env.local`, falha em `lib/env.ts` (por desenho).

## Pendências para o Rafael
- Consertar o Docker Desktop (erro 500 no engine em 2026-10-05, virtualização do Windows).
- Favicon de 40 px perde nitidez em atalho e tela de alta densidade: pedir ao cliente um arquivo maior.
- A 390 px, título de seção com palavra de mais de ~14 letras quebra no meio (ex.: "COMPARTILHAMENTO").
- Criar `.env.local` dos dois apps para o `pnpm build` local passar.
- Conferir `apps/*/.env.example` (o agente não lê `.env*`) e incluir as duas envs de redes sociais.
- Dados "pendente" em `/privacidade`: razão social, CNPJ, endereço e contato do encarregado.
- Validação jurídica dos textos pelo cliente; URLs de LinkedIn/Instagram; confirmar o "2024" do rodapé.
- Node local é v24; o projeto fixa 22 no `.nvmrc`.
