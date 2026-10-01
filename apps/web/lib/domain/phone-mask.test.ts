import { describe, expect, it } from 'vitest'
import { toBrazilianE164 } from './lead'
import { maskPhone } from './phone-mask'

describe('maskPhone', () => {
  it.each([
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['119876', '(11) 9876'],
    ['1198765', '(11) 9876-5'],
    ['1134567890', '(11) 3456-7890'],
    ['11987654321', '(11) 98765-4321'],
    ['119876543219999', '(11) 98765-4321'],
    ['(11) 98765-4321', '(11) 98765-4321'],
    ['abc11def98765', '(11) 9876-5'],
  ])('%j → %j', (input, expected) => {
    expect(maskPhone(input)).toBe(expected)
  })

  it('remove o +55 do autocomplete tel', () => {
    expect(maskPhone('+55 11 98765-4321')).toBe('(11) 98765-4321')
    expect(maskPhone('+552134567890')).toBe('(21) 3456-7890')
  })

  it('o valor mascarado completo passa na normalização E.164 do schema', () => {
    expect(toBrazilianE164(maskPhone('11987654321'))).toBe('+5511987654321')
    expect(toBrazilianE164(maskPhone('2134567890'))).toBe('+552134567890')
  })
})
