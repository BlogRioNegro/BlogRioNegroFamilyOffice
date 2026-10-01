// PUB-013 · Redes sociais do rodapé, na ordem do site institucional. Só entra a rede que tem URL
// configurada: o site mostra os ícones sem link, então a URL vem de env opcional (ADR 0044).

export type SocialNetwork = 'linkedin' | 'instagram'

export type SocialLink = { network: SocialNetwork; label: string; href: string }

const NETWORKS: { network: SocialNetwork; label: string }[] = [
  { network: 'linkedin', label: 'LinkedIn' },
  { network: 'instagram', label: 'Instagram' },
]

export function socialLinks(urls: Partial<Record<SocialNetwork, string>>): SocialLink[] {
  return NETWORKS.flatMap(({ network, label }) => {
    const href = urls[network]
    return href ? [{ network, label, href }] : []
  })
}
