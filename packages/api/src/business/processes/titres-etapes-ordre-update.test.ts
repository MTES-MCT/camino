import { titresEtapesOrdreUpdateVisibleForTesting } from './titres-etapes-ordre-update'
import { titreEtapeUpdate } from '../../database/queries/titres-etapes'

import { userSuper } from '../../database/user-super'
import { vi, afterEach, describe, expect, test } from 'vitest'
import { newDemarcheId, newEtapeId } from '../../database/models/_format/id-create'
import { caminoDateValidator } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitreId, titreIdValidator } from 'camino-common/src/validators/titres'
import { TitreEtapeForMachine } from '../rules-demarches/machine-common'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { ZERO_KM2 } from 'camino-common/src/number'
vi.mock('../../database/queries/titres-etapes', () => ({
  titreEtapeUpdate: vi.fn().mockResolvedValue(true),
}))

const demarcheId = newDemarcheId()
const titresDemarchesEtapes: {
  [key: DemarcheId]: {
    etapes: TitreEtapeForMachine[]
    id: DemarcheId
    typeId: DemarcheTypeId
    titreTypeId: TitreTypeId
    titreId: TitreId
  }
} = {
  [demarcheId]: {
    id: demarcheId,
    typeId: 'amo',
    titreTypeId: 'apc',
    titreId: titreIdValidator.parse('titreId'),
    etapes: [
      {
        id: newEtapeId(),
        ordre: 1,
        date: caminoDateValidator.parse('1988-03-06'),
        typeId: 'asc',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: ZERO_KM2,
        communes: null,
      },
      {
        id: newEtapeId(),
        ordre: 1,
        date: caminoDateValidator.parse('1988-03-08'),
        typeId: 'asc',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: ZERO_KM2,
        communes: null,
      },
    ],
  },
}

const titresDemarchesEtapesVides: {
  [key: DemarcheId]: {
    etapes: TitreEtapeForMachine[]
    id: DemarcheId
    typeId: DemarcheTypeId
    titreTypeId: TitreTypeId
    titreId: TitreId
  }
} = {
  [demarcheId]: { id: demarcheId, typeId: 'amo', titreTypeId: 'apc', titreId: titreIdValidator.parse('titreId'), etapes: [] },
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
