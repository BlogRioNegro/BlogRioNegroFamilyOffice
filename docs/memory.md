# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Projeto
Blog Rio Negro Family Office: clone do blog Rio Negro (commit `2e0ada6` do original), com a marca
trocada ([ADR 0042](adr/0042-clone-rio-negro-family-office.md)). Branch `main`, sem remote.
O original em `C:\Users\Rafael\projetos\rio-negro` é somente leitura.

## Fase
[tasks/clone-family-office.md](tasks/clone-family-office.md): CL-001 a CL-010 `[x]` (últimos commits:
CL-008 `ea12105` tema azul, CL-009 `2a191da` hero da home, CL-010 `dd03c69` redes sociais no rodapé).
Verificado em 2026-10-01: typecheck, lint, format:check, 385 unitários, test:e2e (75) e a11y (22).

## Próxima tarefa
Nenhuma task aberta. Próximo passo é do Rafael: conferir as capturas em `tests/e2e/__visual__/`
(`marca-*.png`, 1440 e 390 px) e criar a infraestrutura deste cliente.

## Marca aplicada (tudo de https://rionegromfo.com.br/, lido em 2026-10-01)
- Tema azul único, site e admin ([ADR 0043](adr/0043-tema-azul-em-todo-o-sistema.md)): fundo `#233645`,
  superfície `#334a5c`, texto claro; ação, link e foco no bege `#d8d2b8` (hover `#ece7d1`).
- Logo branca `RIO-NEGRO-copy.png` como `logo-branco.png`, 40 px de altura.
- Home: só o hero (H1 em serifa, 60 px no desktop), sem consulta ao banco.
- Redes sociais no rodapé só com `NEXT_PUBLIC_LINKEDIN_URL` / `NEXT_PUBLIC_INSTAGRAM_URL` (ADR 0044).
- Rodapé: "2024 RIO NEGRO FAMILY OFFICE • TODOS OS DIREITOS RESERVADOS". CTA "Conheça a Rio Negro
  Family Office" → `NEXT_PUBLIC_RIO_NEGRO_URL`. `policy_version = blog-2026-10-v1`.

## Regras do loop
- Código de server é duplicado por app (ADR 0021): mudar nas duas cópias.
- E2E: web :3100/:3102, admin :3101; parar servidores antes (`taskkill //PID <pid> //T //F`).
- Nunca ler `.env*`, nunca editar migration existente, nunca push/deploy/criar infraestrutura.
- `pnpm test` exige Docker + `pnpm exec supabase start` (parar antes o do original:
  `pnpm exec supabase stop --project-id rio-negro`).
- `pnpm build` exige as envs dos apps: sem `.env.local`, falha em `lib/env.ts` (por desenho).

## Pendências para o Rafael
- Criar `.env.local` dos dois apps (`NEXT_PUBLIC_RIO_NEGRO_URL=https://rionegromfo.com.br`) e
  conferir `apps/*/.env.example` (o agente não lê `.env*`).
- Repositório novo no GitHub; projeto Supabase, Turnstile, domínios e hospedagem novos (a definir).
- Dados "pendente" em `/privacidade`: razão social, CNPJ, endereço e contato do encarregado.
- Validação jurídica dos textos pelo cliente (inclui a finalidade "contato comercial sobre
  investimentos", herdada do original).
- Pedir ao cliente as URLs de LinkedIn e Instagram (o site não publica) e pôr nas duas envs; incluir
  as duas linhas também no `apps/web/.env.example`. Confirmar o "2024" do rodapé.
- Mudar cor é só nos tokens, nos três lugares que o `tokens.test.ts` compara (ui, export, spec 06).
- Node local é v24; o projeto fixa 22 no `.nvmrc`.
