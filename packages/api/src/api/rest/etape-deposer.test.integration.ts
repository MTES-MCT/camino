import { dbManager } from '../../../tests/db-manager'
import { restNewPutCall } from '../../../tests/_utils/index'
import Titres from '../../database/models/titres'
import { userSuper } from '../../database/user-super'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { RestEtapeCreation, defaultHeritageProps } from 'camino-common/src/etape-form'
import { HTTP_STATUS } from 'camino-common/src/http'
import { toCaminoDate } from 'camino-common/src/date'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { insertTitreGraph } from '../../../tests/integration-test-helper'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { communeIdValidator } from 'camino-common/src/static/communes'
import { km2Validator } from 'camino-common/src/number'
import { SUBSTANCES_FISCALES_IDS } from 'camino-common/src/static/substancesFiscales'
import { entrepriseUpsert } from '../../database/queries/entreprises'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'

console.info = vi.fn()
console.error = vi.fn()
console.debug = vi.fn()
console.warn = vi.fn()
let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

beforeEach(async () => {
  await Titres.query().delete()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const entrepriseId1 = entrepriseIdValidator.parse('entreprisepourdepot')

const perimetreSimple: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [7.252418901, 47.828347504],
          [7.251749335, 47.827897983],
          [7.252418901, 47.827448465],
          [7.253088467, 47.827897983],
          [7.252418901, 47.828347504],
        ],
      ],
    ],
  },
}
const blankEtapeProps: Pick<
  RestEtapeCreation,
  | 'etapeDocuments'
  | 'duree'
  | 'dateDebut'
  | 'dateFin'
  | 'substances'
  | 'geojson4326Perimetre'
  | 'geojsonOriginePerimetre'
  | 'geojson4326Points'
  | 'geojsonOriginePoints'
  | 'geojsonOrigineForages'
  | 'geojsonOrigineGeoSystemeId'
  | 'titulaireIds'
  | 'amodiataireIds'
  | 'note'
  | 'etapeAvis'
  | 'entrepriseDocumentIds'
  | 'heritageProps'
  | 'heritageContenu'
  | 'contenu'
> = {
  etapeDocuments: [],
  duree: 2,
  dateDebut: null,
  dateFin: null,
  substances: [SUBSTANCES_FISCALES_IDS.or],
  geojson4326Perimetre: perimetreSimple,
  geojsonOriginePerimetre: perimetreSimple,
  geojson4326Points: null,
  geojsonOriginePoints: null,
  geojsonOrigineForages: null,
  geojsonOrigineGeoSystemeId: '2154',
  titulaireIds: [entrepriseId1],
  amodiataireIds: [],
  note: { valeur: '', is_avertissement: false },
  etapeAvis: [],
  entrepriseDocumentIds: [],
  heritageProps: defaultHeritageProps,
  heritageContenu: {},
  contenu: {},
} as const
describe('etapeDeposer', () => {
  test('ne peut pas déposer une étape (utilisateur non authentifié)', async () => {
    const etapeId = newEtapeId()
    const result = await restNewPutCall(dbPool, '/rest/etapes/:etapeId/depot', { etapeId }, undefined, {})

    expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
  })

  test('peut déposer une demande de Permis exclusif de carrières', async () => {
    const titreId = newTitreId('titreId')
    const demarcheId = newDemarcheId('demarcheId')
    const demandeId = newEtapeId('etapeIdDemande')

    await entrepriseUpsert({
      id: entrepriseId1,
      nom: `${entrepriseId1}`,
      archive: false,
    })

    await insertTitreGraph({
      id: titreId,
      nom: 'test',
      typeId: TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES,
      titreStatutId: TitresStatutIds.DemandeInitiale,
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId: titreId,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          statutId: DemarchesStatutsIds.EnInstruction,
          etapes: [
            {
              id: demandeId,
              date: toCaminoDate('2024-11-01'),
              isBrouillon: ETAPE_IS_BROUILLON,
              titreDemarcheId: demarcheId,
              typeId: ETAPES_TYPES.demande,
              statutId: ETAPES_STATUTS.FAIT,
              communes: [{ id: communeIdValidator.parse('31200'), surface: 12 }],
              surface: km2Validator.parse(12),
              substances: [SUBSTANCES_FISCALES_IDS.or],
              titulaireIds: [entrepriseId1],
              duree: 4,
            },
          ],
        },
      ],
    })

    const res = await restNewPutCall(
      dbPool,
      '/rest/etapes',
      {},
      { ...testBlankUser, role: 'super' },
      {
        id: demandeId,
        typeId: ETAPES_TYPES.demande,
        statutId: ETAPES_STATUTS.FAIT,
        titreDemarcheId: demarcheId,
        date: toCaminoDate('2024-11-03'),
        ...blankEtapeProps,
      }
    )

    expect(res.body).toMatchInlineSnapshot(`
      {
        "id": "etapeIdDemande",
      }
    `)

    const resDepot = await restNewPutCall(dbPool, '/rest/etapes/:etapeId/depot', { etapeId: demandeId }, userSuper, {})
    expect(resDepot.body).toMatchInlineSnapshot(`
      {
        "id": "etapeIdDemande",
      }
    `)
  })
})
