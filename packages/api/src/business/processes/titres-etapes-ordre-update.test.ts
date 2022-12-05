import { titresEtapesOrdreUpdate } from './titres-etapes-ordre-update.js'
import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { titresDemarchesGet } from '../../database/queries/titres-demarches.js'

import {
  titresDemarchesEtapes,
  titresDemarchesEtapesVides
} from './__mocks__/titres-etapes-ordre-update-demarches.js'
import TitresDemarches from '../../database/models/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { vi, afterEach, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres-etapes', () => ({
  titreEtapeUpdate: vi.fn().mockResolvedValue(true)
}))

vi.mock('../../database/queries/titres-demarches', () => ({
  titresDemarchesGet: vi.fn()
}))

const titresDemarchesGetMock = vi.mocked(titresDemarchesGet, true)

console.info = vi.fn()
afterEach(() => {
  vi.resetAllMocks()
})
describe('ordre des étapes', () => {
  test("met à jour l'ordre de deux étapes", async () => {
    titresDemarchesGetMock.mockResolvedValue(titresDemarchesEtapes)
    const titresEtapesUpdated = await titresEtapesOrdreUpdate(userSuper)
    expect(titresEtapesUpdated.length).toEqual(1)
    expect(titreEtapeUpdate).toHaveBeenCalled()
  })

  test("ne met aucun ordre d'étape à jour", async () => {
    titresDemarchesGetMock.mockResolvedValue(titresDemarchesEtapesVides)
    const titresEtapesUpdated = await titresEtapesOrdreUpdate(userSuper)
    expect(titresEtapesUpdated.length).toEqual(0)
    expect(titreEtapeUpdate).not.toHaveBeenCalled()
  })

  test("ne met aucun ordre d'étape à jour (démarche sans étape)", async () => {
    titresDemarchesGetMock.mockResolvedValue([{} as TitresDemarches])
    const titresEtapesUpdated = await titresEtapesOrdreUpdate(userSuper)

    expect(titresEtapesUpdated.length).toEqual(0)
    expect(titreEtapeUpdate).not.toHaveBeenCalled()
  })
})
