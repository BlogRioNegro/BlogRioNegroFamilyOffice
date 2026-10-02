# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Projeto
Blog Rio Negro Family Office: clone do blog Rio Negro (commit `2e0ada6` do original), com a marca
trocada ([ADR 0042](adr/0042-clone-rio-negro-family-office.md)). Remote `origin` =
`github.com/BlogRioNegro/BlogRioNegroFamilyOffice` (privado). **Push na `main` dispara deploy
automático na Vercel.** O original em `C:\Users\Rafael\projetos\rio-negro` é somente leitura.

## Fase
Branch `marca-oficial` (sem push): guia oficial da marca, [tasks/marca-oficial.md](tasks/marca-oficial.md).
MO-001 a MO-004 `[x]`: cores `1b0beda`, fontes `117ac30`, logo e favicon `b997977`, docs `c0268b3` (ADR 0045).
Gate de 2026-10-02: test (386 unitários + 90 de integração), test:e2e (75) e a11y (22) verdes;
`pnpm build` falha só por falta de `.env.local` (o build do web roda dentro do e2e).

## Próxima tarefa
Nenhuma task aberta. O Rafael confere as capturas (`tests/e2e/__visual__/marca-*.png`) e decide o
merge de `marca-oficial` na `main` (push na `main` = deploy na Vercel).

## Marca (guia oficial: `design/marca/INFO-RN-MFO.pdf`)
- Logo branca e favicon "RN" recortados do PDF do guia (`logo-branco.png`, `app/icon.png` nos dois apps).
- Fontes do guia: Roboto Slab 900 (títulos), Roboto Slab 400 (subtítulos), Roboto (resto).
- Tema azul único, site e admin (ADR 0043). Cores do guia: fundo `#223645`, superfície `#32566b`,
  header/rodapé/superfície rebaixada `#1a3544`, ação/link/foco `#d7d1b8`, divisórias `#908c7a`.
  `--gradient-brand` definido, sem uso em tela. Fora do guia: hover, bordas de controle, texto
  secundário e cores de estado.
- Home: só o hero, sem consulta ao banco. Redes sociais no rodapé por env opcional (ADR 0044).
- Rodapé: "2024 RIO NEGRO FAMILY OFFICE • TODOS OS DIREITOS RESERVADOS". `policy_version = blog-2026-10-v1`.

## Regras do loop
- Mudar cor ou fonte é só nos tokens, nos três lugares que o `tokens.test.ts` compara (ui, export, spec 06).
- Código de server é duplicado por app (ADR 0021): mudar nas duas cópias.
- E2E: web :3100/:3102, admin :3101; parar servidores antes (`taskkill //PID <pid> //T //F`).
- Nunca ler `.env*`, nunca editar migration, nunca deploy. Push só quando o Rafael pedir.
- `pnpm test` exige Docker + `pnpm exec supabase start` (parar antes o do original:
  `pnpm exec supabase stop --project-id rio-negro`).
- O projeto está vinculado a um Supabase remoto (`supabase link`): a stack local sobe com as versões
  do remoto. Se o Storage local der `42P10`, rodar `pnpm exec supabase db reset --local` (só o local).
- As portas 3000/3001 podem estar com o `pnpm dev` do projeto original: usar 3200/3201 no clone.
- `pnpm build` exige as envs dos apps: sem `.env.local`, falha em `lib/env.ts` (por desenho).
- `tokens.test.ts` pode estourar os 5 s com a máquina carregada; rodar de novo antes de investigar.

## Pendências para o Rafael
- Criar `.env.local` dos dois apps para o `pnpm build` local passar.
- O `pnpm dev` do projeto original (3000/3001) fala com o Supabase local que estiver no ar: hoje é o
  do clone. Para voltar ao original: parar o do clone e rodar `supabase start` lá.
- Conferir `apps/*/.env.example` (o agente não lê `.env*`) e incluir as duas envs de redes sociais.
- Dados "pendente" em `/privacidade`: razão social, CNPJ, endereço e contato do encarregado.
- Validação jurídica dos textos pelo cliente; URLs de LinkedIn/Instagram; confirmar o "2024" do rodapé.
- Node local é v24; o projeto fixa 22 no `.nvmrc`.
