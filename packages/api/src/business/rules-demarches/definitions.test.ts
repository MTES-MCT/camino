import {
  isDemarcheDefinitionMachine,
  isDemarcheDefinitionRestriction
} from './definitions'
import { armOctMachine } from './arm/oct.machine'
import { restrictionsArmRet } from './arm/ret'

test('isDemarcheDefinitionMachine', () => {
  expect(
    isDemarcheDefinitionMachine({
      titreTypeId: '',
      demarcheTypeIds: [],
      dateDebut: '',
      machine: armOctMachine
    })
  ).toBe(true)
  expect(
    isDemarcheDefinitionMachine({
      titreTypeId: '',
      demarcheTypeIds: [],
      dateDebut: '',
      restrictions: restrictionsArmRet
    })
  ).toBe(false)
  expect(isDemarcheDefinitionMachine(undefined)).toBe(false)
})
test('isDemarcheDefinitionRestriction', () => {
  expect(
    isDemarcheDefinitionRestriction({
      titreTypeId: '',
      demarcheTypeIds: [],
      dateDebut: '',
      machine: armOctMachine
    })
  ).toBe(false)
  expect(
    isDemarcheDefinitionRestriction({
      titreTypeId: '',
      demarcheTypeIds: [],
      dateDebut: '',
      restrictions: restrictionsArmRet
    })
  ).toBe(true)
})
