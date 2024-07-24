import { EtapesStatuts } from './etapesStatuts'
import { ETAPES_TYPES } from './etapesTypes'
import { getEtapesStatuts } from './etapesTypesEtapesStatuts'
import { test, expect } from 'vitest'

test('getEtapesStatuts', () => {
  expect(getEtapesStatuts(ETAPES_TYPES.abandonDeLaDemande)).toStrictEqual([EtapesStatuts.fai])
})
