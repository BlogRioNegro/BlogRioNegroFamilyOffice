# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Projeto
Blog Rio Negro Family Office: clone do blog Rio Negro (commit `2e0ada6` do original), com a marca
trocada ([ADR 0042](adr/0042-clone-rio-negro-family-office.md)). Branch `main`, sem remote.
O original em `C:\Users\Rafael\projetos\rio-negro` é somente leitura.

## Fase
[tasks/clone-family-office.md](tasks/clone-family-office.md): CL-001 a CL-007 `[x]` (último commit
de task: `ae096c8`). Gate final de 2026-10-01 verde: typecheck, lint, format:check, test (377
unitários + 90 de integração), build, test:e2e (73) e a11y (22, zero violações).

## Próxima tarefa
Nenhuma task aberta. Próximo passo é do Rafael: conferir as capturas em `tests/e2e/__visual__/`
(`marca-*.png`, 1440 e 390 px) e criar a infraestrutura deste cliente.

## Marca aplicada (tudo de https://rionegromfo.com.br/, lido em 2026-10-01)
- Azul de ação `#233645` (primary do kit do site); hover `#192631` (derivado); `--color-link`.
- Logo `RIO-NEGRO.png` (295×89). As duas PNGs do header/rodapé do site são brancas.
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
- Confirmar com o cliente: URLs de LinkedIn/Instagram (o site não publica) e o "2024" do rodapé.
- Logo a 28 px de altura fica com 93 px de largura; se quiser maior, é a classe `h-7` do `logo.tsx`.
- Node local é v24; o projeto fixa 22 no `.nvmrc`.
