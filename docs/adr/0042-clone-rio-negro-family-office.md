# 0042 · Clone do blog para a Rio Negro Family Office

- Status: accepted · Data: 2026-10-01
- Specs: [00-overview](../specs/00-overview.md), [PUB-001, PUB-013](../specs/03-public-site.md),
  [LEAD-010, LEAD-013](../specs/04-lead-capture.md), [DS-003](../specs/06-design-system.md)
- Substitui: [ADR 0002](0002-hospedagem-staycloud.md) e [ADR 0038](0038-staycloud-deploy-pro-node-22.md) (hospedagem)
- Tasks: [clone-family-office](../tasks/clone-family-office.md)

## Contexto
O blog da Rio Negro Investimentos ficou pronto e um segundo cliente, a **Rio Negro Family Office**
(site institucional: https://rionegromfo.com.br/), quer o mesmo produto: artigos, captura de lead
para liberar o download e painel admin de uma pessoa. Só a marca muda.

## Decisão
Definida pelo responsável do projeto (Rafael):
- Este repositório é um **clone** da `main` do blog original no commit `2e0ada6`, com histórico git
  novo e sem remote. O original não é alterado.
- Nome do site: "Blog Rio Negro Family Office"; nome da marca: "Rio Negro Family Office".
- Muda só a marca: cor de ação, logo, textos da home, rodapé, CTA e identificação legal.
  Tipografia, espaçamentos, componentes, schema e regras de negócio ficam como estão.
- Todo dado do cliente vem do site institucional. O que não está lá fica como "pendente" no
  texto e entra nas Pendências do [memory](../memory.md); nada é inventado.
- Nomes internos **não** são renomeados: pacotes `@rio-negro/*`, prefixo de token `--rn-*`, env
  `NEXT_PUBLIC_RIO_NEGRO_URL`, headers `X-RioNegro-*` do webhook e o admin local do seed.
- Supabase local com `project_id = "rio-negro-family-office"` (não divide containers nem dados
  com o projeto original).
- **Hospedagem a definir pelo Rafael.** As ADRs 0002 e 0038 (StayCloud) eram do cliente original e
  não valem aqui. O que continua valendo delas é só o código agnóstico de hospedagem
  (`output: 'standalone'`, Node 22, sem APIs exclusivas de um provedor).
- Repositório no GitHub, projeto Supabase de produção, chaves do Turnstile e domínios são novos
  para este cliente e criados pelo Rafael; o agente não faz push, deploy nem cria infraestrutura.

## Consequências
- `docs/tasks/fase-*.md` e `docs/revisao-final.md` são o histórico herdado do original e ficam
  como registro; o trabalho deste cliente está em `docs/tasks/clone-family-office.md`.
- As demais ADRs (0001 a 0041) continuam valendo, com as trocas de marca registradas aqui.
- Correção feita no blog original depois do commit `2e0ada6` precisa ser portada à mão.
