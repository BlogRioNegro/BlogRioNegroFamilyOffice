# 0042 · Clone do blog para a Rio Negro Family Office

- Status: accepted · Data: 2026-10-01
- Specs: [00-overview](../specs/00-overview.md), [PUB-001, PUB-013](../specs/03-public-site.md),
  [LEAD-010, LEAD-013](../specs/04-lead-capture.md), [DS-003](../specs/06-design-system.md)
- Substitui: [ADR 0002](0002-hospedagem-staycloud.md) e [ADR 0038](0038-staycloud-deploy-pro-node-22.md) (hospedagem)
- Tasks: [clone-family-office](../tasks/clone-family-office.md)
- As seções "Azul de ação (CL-002)" e "Logo (CL-003)" foram substituídas pela
  [ADR 0043](0043-tema-azul-em-todo-o-sistema.md): o azul passou a ser a base de todo o sistema.

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

## Azul de ação (CL-002)
- Hex exato: **`#233645`**, a cor global `primary` do kit do site
  (`--e-global-color-primary` em `wp-content/uploads/elementor/css/post-6.css`, lido em 2026-10-01).
- Onde aparece no site: fundo do botão de envio do formulário de contato (texto branco), botão
  "Estou Ciente" do aviso de cookies, títulos e textos de destaque, sublinhado do item ativo do menu,
  ícones do rodapé, fundo do rodapé e a própria logo.
- Outros azuis do site, descartados como cor de ação: `#334A5C` é a cor `secondary` do kit (só
  fundo de seção e texto de lista); `#294152` aparece uma vez num fundo; `#1863DC` e `#0056A7`
  são o padrão do plugin de cookies (CookieYes), não da marca.
- Tokens: primitivos `--rn-blue-800: #233645` e `--rn-blue-900: #192631` (mesmo matiz e
  saturação, luminosidade de 20% para 14,5%: é derivado, não vem do site). Semânticos:
  `--color-action-primary` e `--color-focus-ring` = blue-800; `--color-action-primary-hover` =
  blue-900; novo `--color-link` = blue-800 (`Button` link, links no texto e navegação do header).
- Fundos, textos e bordas continuam nos neutros `--rn-warm-*`.
- Contraste (WCAG 2.1): texto `#f2f0ef` sobre `#233645` 10,97:1 e sobre `#192631` 13,56:1; link
  `#233645` sobre `#ffffff` 12,46:1, sobre `#f2f0ef` 10,97:1 e sobre `#e9e6e4` 10,03:1. Todos AA.

## Logo (CL-003)
- O site tem três PNGs em `https://rionegromfo.com.br/wp-content/uploads/2024/08/` (lidos em 2026-10-01):
  `RIO-NEGRO-1.png` (189×57, header) e `RIO-NEGRO-copy.png` (249×75, rodapé) são **brancas**
  (100% dos pixels opacos em `#ffffff`), feitas para o fundo escuro do site; `RIO-NEGRO.png`
  (295×89, em `#233645`) é a logo declarada no JSON-LD da home e a única legível em fundo claro.
- `RIO-NEGRO.png` substitui `logo-escuro.png` em `apps/web/components`, `apps/admin/components`
  e `design/design-system/assets`, sem edição da imagem. `RIO-NEGRO-copy.png` substitui
  `design/design-system/assets/logo-branco.png` (referência; o blog não usa logo branca).
- `logo.tsx` não muda (`<img>`, ADR 0020, 28 px de altura). Como a logo nova é mais alta em
  proporção (3,3:1 contra 6,1:1), ela aparece com 93×28 px. `alt`: "Rio Negro Family Office".
- O restante de `design/` (readme, protótipos, UI kits) continua mostrando a marca original: é
  só referência visual de layout.

## Home (CL-004)
- `h1`: "Artigos, estudos e perspectivas da nossa equipe de consultores e especialistas." (texto definido pelo Rafael).
- O parágrafo de subtítulo foi removido; o botão "Ver artigos" fica.

## Rodapé e CTA (CL-005)
- Rodapé de https://rionegromfo.com.br/ em 2026-10-01, inteiro: a linha
  "2024 RIO NEGRO FAMILY OFFICE • TODOS OS DIREITOS RESERVADOS", o link "POLÍTICA DE PRIVACIDADE"
  (para a política do site) e os ícones de LinkedIn e Instagram **sem `href`**. Não há endereço,
  CNPJ nem aviso legal.
- No blog: a linha de direitos entra literal (caixa alta e "2024" como no site, sem "©") no lugar
  do disclaimer e do copyright do original. Nenhuma frase do disclaimer antigo (XP, CVM, CNPJ da
  Assessoria) foi reaproveitada.
- LinkedIn/Instagram não entram: o site não publica as URLs.
- O link interno "Privacidade" → `/privacidade` fica (o fluxo de lead depende dele); a política
  completa do site é linkada a partir dessa página, não do rodapé.
- CTA "Conheça a Rio Negro Family Office" no rodapé e na tela de sucesso do modal, para
  `NEXT_PUBLIC_RIO_NEGRO_URL` (valor do cliente: `https://rionegromfo.com.br`). Ajusta a
  [ADR 0018](0018-cta-e-disclaimer-no-rodape.md).

## Nome da marca no resto (CL-006)
Varredura: `git grep -iE "rio negro|rionegro"` em `apps`, `packages`, `supabase` e `tests`.

Mudou (o que o usuário vê):
- `apps/web/app/layout.tsx`: título padrão e template "<página> · Blog Rio Negro Family Office";
  `og:site_name` "Blog Rio Negro Family Office".
- `apps/web/app/rss.xml/route.ts`: título do feed "Blog Rio Negro Family Office".
- `BLOG_DESCRIPTION` (descrição de metadata, Open Graph e RSS): era o subtítulo da home, que saiu
  na CL-004; passa a ser o `h1` da home (ajusta a [ADR 0029](0029-descricao-padrao-do-blog.md)).
- `apps/web/app/privacidade/page.tsx`: `description` da página cita o "Blog Rio Negro Family Office".
- Header do site e do admin: `aria-label` "Rio Negro Family Office, página inicial" / ", painel".
- Admin: títulos "<tela> · Rio Negro Family Office Admin" (login, artigos, novo, editar, leads) e
  "Rio Negro Family Office · Admin" no layout. `alt` das logos na CL-003.
- CTA e rodapé na CL-005; aviso do modal, opt-in e `/privacidade` na CL-007.

Ficou de propósito (nomes internos ou dado de teste, nada disso aparece para o visitante):
- Pacotes `@rio-negro/*`, prefixo `--rn-*`, env `NEXT_PUBLIC_RIO_NEGRO_URL` e a prop `rioNegroUrl`.
- Headers `X-RioNegro-Timestamp` e `X-RioNegro-Signature` do webhook (contrato com o CRM, LEAD-012).
- Admin local do seed `admin@rionegro.local` / `rionegro-dev-local` e os e-mails `@rionegro.local`
  dos testes de integração e e2e.
- Fixtures de teste: `https://rionegro.example`, `rionegro.com.br`, `xp.com.br` (links de exemplo
  em testes de rich text e de env) e `contato@rionegroinvestimentos.com.br` (login recusado no e2e).
- Comentário de cabeçalho de `packages/ui/src/tokens.css`.
- Textos do seed: os artigos de exemplo não citam a marca; só o e-mail do admin local, que fica.
- `apps/*/.env.example`: o agente não lê `.env*`; conferir à mão.

## Privacidade e aviso de lead (CL-007)
- Fonte: https://rionegromfo.com.br/politica-de-privacidade/ (lido em 2026-10-01). A página é um
  texto genérico que só nomeia "Rio Negro Familly Office" (sic). **Não constam**: razão social,
  CNPJ, endereço e contato do encarregado.
- A estrutura dos textos do blog fica (controlador, dados coletados, finalidades, base legal,
  compartilhamento, retenção, direitos do titular, política completa). Mudou só a identificação:
  - Controlador: "Rio Negro Family Office. [razão social, CNPJ e endereço — pendente]".
  - Direitos do titular: "[contato do encarregado — pendente]" (já era pendente no original).
  - "CRM da Rio Negro" e "novidades da Rio Negro" (aviso do modal e opt-in) passam a citar a
    "Rio Negro Family Office".
  - Política completa: `https://rionegromfo.com.br/politica-de-privacidade/`.
- A política do site não foi copiada para o blog.
- `policy_version`: `blog-2026-09-v1` → `blog-2026-10-v1` (LEAD-013: mudar o texto exige nova versão).
  Sem migration: é uma constante gravada em cada lead.
- A finalidade "contato comercial sobre investimentos" veio do original e fica até a validação
  jurídica dos textos pelo cliente, que é pendência.

## Consequências
- `docs/tasks/fase-*.md` e `docs/revisao-final.md` são o histórico herdado do original e ficam
  como registro; o trabalho deste cliente está em `docs/tasks/clone-family-office.md`.
- As demais ADRs (0001 a 0041) continuam valendo, com as trocas de marca registradas aqui.
- Correção feita no blog original depois do commit `2e0ada6` precisa ser portada à mão.
