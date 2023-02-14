import { EtapesStatuts } from './etapesStatuts.js'
import { ETAPES_TYPES } from './etapesTypes.js'
import { getEtapesStatuts } from './etapesTypesEtapesStatuts.js'
import { test, expect } from 'vitest'

test('getEtapesStatuts', () => {
  expect(getEtapesStatuts(ETAPES_TYPES.abandonDeLaDemande)).toStrictEqual([EtapesStatuts.fai])
})
