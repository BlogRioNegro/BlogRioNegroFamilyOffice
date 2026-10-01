# 0044 · Redes sociais no rodapé, com URL em env opcional

- Status: accepted · Data: 2026-10-01
- Specs: [PUB-013](../specs/03-public-site.md), [SEC-003](../specs/02-security-rls.md)
- Relacionadas: [ADR 0024](0024-icones-via-packages-ui.md), [ADR 0042](0042-clone-rio-negro-family-office.md)
- Task: CL-010 em [clone-family-office](../tasks/clone-family-office.md)

## Contexto
O rodapé de https://rionegromfo.com.br/ mostra os ícones de LinkedIn e Instagram, mas as tags
`<a>` não têm `href` (conferido no HTML e no DOM renderizado, home e política, em 2026-10-01), e
nenhuma URL de rede social aparece no site. Dado do cliente não é inventado
([ADR 0042](0042-clone-rio-negro-family-office.md)), e o Rafael pediu os ícones no rodapé do blog.

## Decisão
Definida pelo responsável do projeto (Rafael):
- Ícones como no site (LinkedIn, depois Instagram), em botões redondos na cor de ação.
- As URLs vêm de duas envs **opcionais** do `apps/web`: `NEXT_PUBLIC_LINKEDIN_URL` e
  `NEXT_PUBLIC_INSTAGRAM_URL`. Sem a env, o ícone daquela rede não é renderizado: não existe ícone
  sem link nem URL de exemplo em produção.
- As duas só aceitam `https` (validação no `env.ts`).
- A regra de quais redes aparecem é a função pura `socialLinks` (`lib/domain/social-links.ts`).
- O `lucide-react` instalado (1.x) não traz mais ícones de marca. Os dois ícones ficam em
  `packages/ui/src/brand-icons.tsx`, no mesmo traço dos demais, e saem pelo subpath
  `@rio-negro/ui/icons` (a regra da [ADR 0024](0024-icones-via-packages-ui.md) continua valendo).
  Sem dependência nova.

## Consequências
- Para ligar os ícones basta definir as envs; não há mudança de código.
- Os E2E usam URLs de exemplo (`playwright.config.ts`) na instância principal e nenhuma na segunda
  instância, para cobrir os dois casos.
- Pendência: receber do cliente as URLs reais e incluí-las no `.env.local` e na hospedagem.
