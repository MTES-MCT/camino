import { isNotNullNorUndefined, onlyUnique } from './typescript-tools'
import { Role } from './roles'
import { AdministrationId } from './static/administrations'
import { Departements } from './static/departement'

describe('isNotNullNorUndefined', () => {
  test('null or undefined', () => {
    expect(isNotNullNorUndefined(null)).toBe(false)
    expect(isNotNullNorUndefined(undefined)).toBe(false)
  })

  test('isNotNullNorUndefined', () => {
    const tested: { role: Role; administrationId: undefined | null | AdministrationId } | undefined | null = { role: 'admin', administrationId: null }
    expect(isNotNullNorUndefined(tested)).toBe(true)
  })
})

test('onlyUnique', () => {
  const departements = [Departements['01'], Departements['2A'], Departements['02'], Departements['01']]
  const actual = departements.filter(onlyUnique)
  expect(actual).toStrictEqual([Departements['01'], Departements['2A'], Departements['02']])
  const a = ['a', 1, 'a', 2, '1']
  const unique = a.filter(onlyUnique)
  expect(unique).toStrictEqual(['a', 1, 2, '1'])
})
