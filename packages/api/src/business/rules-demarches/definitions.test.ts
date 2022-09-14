import {
  isDemarcheDefinitionMachine,
  isDemarcheDefinitionRestriction
} from './definitions'
import { restrictionsArmRet } from './arm/ret'
import { ArmOctMachine } from './arm/oct.machine'

test('isDemarcheDefinitionMachine', () => {
  expect(
    isDemarcheDefinitionMachine({
      titreTypeId: '',
      demarcheTypeIds: [],
      dateDebut: '',
      machine: new ArmOctMachine()
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
      machine: new ArmOctMachine()
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
