import { EtapesStatuts, EtapeStatutKey, ETAPES_STATUTS, isEtapeStatutKey } from './etapesStatuts'
import { ETAPES_TYPES } from './etapesTypes'
import { EtapesTypesEtapesStatuts, EtapeTypeEtapeStatut, getEtapesStatuts } from './etapesTypesEtapesStatuts'
import { test, expect } from 'vitest'

test('getEtapesStatuts', () => {
  expect(getEtapesStatuts(ETAPES_TYPES.abandonDeLaDemande)).toStrictEqual([EtapesStatuts.fai])
})

function assertEtapeTypeKey(probableTypeKey: string): asserts probableTypeKey is keyof typeof EtapesTypesEtapesStatuts {
  if (!(probableTypeKey in EtapesTypesEtapesStatuts)) {
    throw new Error(`le typeKey ${probableTypeKey} n'existe pas`)
  }
}

function assertEtapeStatutTypeKey(probableEtapeStatutKey: string): asserts probableEtapeStatutKey is EtapeStatutKey {
  if (!isEtapeStatutKey(probableEtapeStatutKey)) {
    throw new Error(`le statutKey ${probableEtapeStatutKey} n'existe pas`)
  }
}

test('checkConsistency', () => {
  for (const etapeTypeKey of Object.keys(ETAPES_TYPES)) {
    assertEtapeTypeKey(etapeTypeKey)
    for (const etapeStatutKey of Object.keys(EtapesTypesEtapesStatuts[etapeTypeKey])) {
      assertEtapeStatutTypeKey(etapeStatutKey)
      const toto = EtapesTypesEtapesStatuts[etapeTypeKey] as { [key in EtapeStatutKey]?: EtapeTypeEtapeStatut }

      expect(toto[etapeStatutKey]?.etapeTypeId).toBe(ETAPES_TYPES[etapeTypeKey])
      expect(toto[etapeStatutKey]?.etapeStatutId).toBe(ETAPES_STATUTS[etapeStatutKey])
    }
  }
})
