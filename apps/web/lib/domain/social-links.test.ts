import { describe, expect, it } from 'vitest'
import { socialLinks } from './social-links'

const LINKEDIN = 'https://www.linkedin.com/company/exemplo'
const INSTAGRAM = 'https://www.instagram.com/exemplo'

describe('socialLinks', () => {
  it('sem URL configurada não devolve nenhuma rede', () => {
    expect(socialLinks({})).toEqual([])
    expect(socialLinks({ linkedin: undefined, instagram: undefined })).toEqual([])
  })

  it('devolve só a rede que tem URL', () => {
    expect(socialLinks({ instagram: INSTAGRAM })).toEqual([
      { network: 'instagram', label: 'Instagram', href: INSTAGRAM },
    ])
  })

  it('mantém a ordem do site institucional: LinkedIn, depois Instagram', () => {
    const links = socialLinks({ instagram: INSTAGRAM, linkedin: LINKEDIN })

    expect(links.map((link) => link.network)).toEqual(['linkedin', 'instagram'])
    expect(links[0]).toEqual({ network: 'linkedin', label: 'LinkedIn', href: LINKEDIN })
  })
})
