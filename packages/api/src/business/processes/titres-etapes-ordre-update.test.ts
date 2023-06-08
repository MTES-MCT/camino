import { titresEtapesOrdreUpdateVisibleForTesting } from './titres-etapes-ordre-update.js'
import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'

import TitresDemarches from '../../database/models/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { vi, afterEach, describe, expect, test } from 'vitest'
import { newEtapeId } from '../../database/models/_format/id-create.js'
vi.mock('../../database/queries/titres-etapes', () => ({
  titreEtapeUpdate: vi.fn().mockResolvedValue(true),
}))

const titresDemarchesEtapes = {
  '': {
    etapes: [
      {id: newEtapeId(), ordre: 1, date: '1988-03-06',typeId: 'aac',
      statutId: 'acc',
      surface: 0,
      communes: null, },
      {id: newEtapeId(), ordre: 1, date: '1988-03-08',typeId: 'aac',
      statutId: 'acc',
      surface: 0,
      communes: null, },
    ],
    titre: null,
  } as TitresDemarches,
}

const titresDemarchesEtapesVides = {
  '': { etapes: [], titre: { typeId: '' } } as unknown as TitresDemarches,
}

console.info = vi.fn()
afterEach(() => {
  vi.resetAllMocks()
})
describe('ordre des étapes', () => {
  test("met à jour l'ordre de deux étapes", async () => {
    const titresEtapesUpdated = await titresEtapesOrdreUpdateVisibleForTesting(userSuper, titresDemarchesEtapes)
    expect(titresEtapesUpdated.length).toEqual(1)
    expect(titreEtapeUpdate).toHaveBeenCalled()
  })

  test("ne met aucun ordre d'étape à jour", async () => {
    const titresEtapesUpdated = await titresEtapesOrdreUpdateVisibleForTesting(userSuper, titresDemarchesEtapesVides)
    expect(titresEtapesUpdated.length).toEqual(0)
    expect(titreEtapeUpdate).not.toHaveBeenCalled()
  })

  test("ne met aucun ordre d'étape à jour (démarche sans étape)", async () => {
    const titresEtapesUpdated = await titresEtapesOrdreUpdateVisibleForTesting(userSuper, {})

    expect(titresEtapesUpdated.length).toEqual(0)
    expect(titreEtapeUpdate).not.toHaveBeenCalled()
  })
})
