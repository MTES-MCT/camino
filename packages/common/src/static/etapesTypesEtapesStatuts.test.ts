import { EtapesStatuts } from './etapesStatuts'
import { ETAPES_TYPES, EtapeTypeId } from './etapesTypes'
import { getEtapesStatuts } from './etapesTypesEtapesStatuts'
import { test, expect } from 'vitest'

test('getEtapesStatuts', () => {
  expect(getEtapesStatuts(ETAPES_TYPES.paiementDesFraisDeDossierComplementaires)).toStrictEqual([EtapesStatuts.fai])
  expect(() => getEtapesStatuts('notExisting' as EtapeTypeId)).toThrowErrorMatchingInlineSnapshot(`[Error: Cas impossible, cet etapeTypeId n'existe pas]`)
})
