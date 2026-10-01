# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Projeto
Blog Rio Negro Family Office: clone do blog Rio Negro (commit `2e0ada6` do original), com a marca
trocada ([ADR 0042](adr/0042-clone-rio-negro-family-office.md)). Branch `main`, sem remote.
O original em `C:\Users\Rafael\projetos\rio-negro` é somente leitura.

## Fase
Tasks do clone em [tasks/clone-family-office.md](tasks/clone-family-office.md).
Feito: base `9d72437`; CL-001 `43933eb`; CL-002 `4fd0250` (azul `#233645`, hover `#192631`, `--color-link`).

## Próxima tarefa
CL-003 · logo do site institucional. Ler: ADR 0042, ADR 0020 (`<img>`, sem `next/image`).

## Dados do cliente (só o que está em https://rionegromfo.com.br/, lido em 2026-10-01)
- Azul principal do kit do site: `#233645`. Logo para fundo claro: `RIO-NEGRO.png` (em `#233645`).
- Rodapé: "2024 RIO NEGRO FAMILY OFFICE • TODOS OS DIREITOS RESERVADOS" + "POLÍTICA DE PRIVACIDADE".
- Não constam no site: razão social, CNPJ, endereço, contato do encarregado, URLs de LinkedIn/Instagram.

## Regras do loop
- Um commit por task; antes de cada um: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` e os
  testes dos arquivos alterados. Depois, `docs(memory)`.
- Código de server é duplicado por app (ADR 0021): mudar nas duas cópias.
- E2E: web :3100/:3102, admin :3101; parar servidores antes (`taskkill //PID <pid> //T //F`).
- Nunca ler `.env*`, nunca editar migration existente, nunca push/deploy/criar infraestrutura.
- `pnpm test` exige Docker + `pnpm exec supabase start` (o do projeto original precisa estar parado:
  `pnpm exec supabase stop --project-id rio-negro`).
- Scripts de investigação ficam no scratchpad da sessão, nunca no repo.

## Pendências para o Rafael
- Hospedagem a definir; repositório novo no GitHub; projeto Supabase, Turnstile e domínios novos.
- Criar `.env.local` dos dois apps (`NEXT_PUBLIC_RIO_NEGRO_URL=https://rionegromfo.com.br`).
- Conferir `apps/*/.env.example`: o agente não lê `.env*`, então o valor de exemplo de
  `NEXT_PUBLIC_RIO_NEGRO_URL` pode ainda ser o do cliente original.
- Dados "pendente" (razão social, CNPJ, endereço, DPO) e validação jurídica dos textos pelo cliente.
- Node local é v24; o projeto fixa 22 no `.nvmrc`.
