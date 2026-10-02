# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Projeto
Blog Rio Negro Family Office: clone do blog Rio Negro (commit `2e0ada6` do original), com a marca
trocada ([ADR 0042](adr/0042-clone-rio-negro-family-office.md)). Remote `origin` =
`github.com/BlogRioNegro/BlogRioNegroFamilyOffice` (privado). **Push na `main` dispara deploy
automático na Vercel.** O original em `C:\Users\Rafael\projetos\rio-negro` é somente leitura.

## Fase
Branch `marca-oficial` (sem push): guia oficial da marca, [tasks/marca-oficial.md](tasks/marca-oficial.md).
Feito: MO-001 cores (`1b0beda`); MO-002 fontes (`117ac30`).

## Próxima tarefa
MO-003 · logo e favicon extraídos do PDF do guia (script temporário com Playwright + pdf.js da CDN).

## Marca (guia oficial: `design/marca/INFO-RN-MFO.pdf`)
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
- Conferir `apps/*/.env.example` (o agente não lê `.env*`) e incluir as duas envs de redes sociais.
- Dados "pendente" em `/privacidade`: razão social, CNPJ, endereço e contato do encarregado.
- Validação jurídica dos textos pelo cliente; URLs de LinkedIn/Instagram; confirmar o "2024" do rodapé.
- Node local é v24; o projeto fixa 22 no `.nvmrc`.
