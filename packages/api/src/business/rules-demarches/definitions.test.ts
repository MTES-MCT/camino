import { isDemarcheDefinitionMachine, isDemarcheDefinitionRestriction } from './definitions.js'
import { restrictionsArmRet } from './arm/ret.js'
import { ArmOctMachine } from './arm/oct.machine.js'
import { expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'

test('isDemarcheDefinitionMachine', () => {
  expect(
    isDemarcheDefinitionMachine({
      titreTypeId: 'pxm',
      demarcheTypeIds: [],
      dateDebut: toCaminoDate('2022-01-01'),
      machine: new ArmOctMachine(),
    })
  ).toBe(true)
  expect(
    isDemarcheDefinitionMachine({
      titreTypeId: 'pxm',
      demarcheTypeIds: [],
      dateDebut: toCaminoDate('2022-01-01'),
      restrictions: restrictionsArmRet,
    })
  ).toBe(false)
  expect(isDemarcheDefinitionMachine(undefined)).toBe(false)
})
test('isDemarcheDefinitionRestriction', () => {
  expect(
    isDemarcheDefinitionRestriction({
      titreTypeId: 'pxm',
      demarcheTypeIds: [],
      dateDebut: toCaminoDate('2022-01-01'),
      machine: new ArmOctMachine(),
    })
  ).toBe(false)
  expect(
    isDemarcheDefinitionRestriction({
      titreTypeId: 'pxm',
      demarcheTypeIds: [],
      dateDebut: toCaminoDate('2022-01-01'),
      restrictions: restrictionsArmRet,
    })
  ).toBe(true)
})
