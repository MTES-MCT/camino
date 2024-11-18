import { dbManager } from '../../../tests/db-manager'
import { restNewPostCall } from '../../../tests/_utils/index'
import Titres from '../../database/models/titres'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { userSuper } from '../../database/user-super'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { RestEtapeCreation, defaultHeritageProps } from 'camino-common/src/etape-form'
import { HTTP_STATUS } from 'camino-common/src/http'
import { toCaminoDate } from 'camino-common/src/date'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { newDemarcheId, newTitreId } from '../../database/models/_format/id-create'
import { insertTitreGraph } from '../../../tests/integration-test-helper'

console.info = vi.fn()
console.error = vi.fn()
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

const demarcheCreate = async (titreTypeId: TitreTypeId = 'arm') => {
  const titreId = newTitreId()
  const titreDemarcheId = newDemarcheId()
  await insertTitreGraph({
    id: titreId,
    nom: 'mon titre',
    typeId: titreTypeId,
    titreStatutId: 'ind',
    propsTitreEtapesIds: {},
    demarches: [
      {
        id: titreDemarcheId,
        titreId: titreId,
        typeId: 'oct',
      },
    ],
  })

  return titreDemarcheId
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
  duree: null,
  dateDebut: null,
  dateFin: null,
  substances: [],
  geojson4326Perimetre: null,
  geojsonOriginePerimetre: null,
  geojson4326Points: null,
  geojsonOriginePoints: null,
  geojsonOrigineForages: null,
  geojsonOrigineGeoSystemeId: null,
  titulaireIds: [],
  amodiataireIds: [],
  note: { valeur: '', is_avertissement: false },
  etapeAvis: [],
  entrepriseDocumentIds: [],
  heritageProps: defaultHeritageProps,
  heritageContenu: {},
  contenu: {},
} as const
describe('etapeCreer', () => {
  test('ne peut pas créer une étape (utilisateur non authentifié)', async () => {
    const result = await restNewPostCall(dbPool, '/rest/etapes', {}, undefined, { typeId: '', statutId: '', titreDemarcheId: '', date: '' } as unknown as RestEtapeCreation)

    expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
  })
  test('ne peut pas créer une étape (utilisateur administration)', async () => {
    const result = await restNewPostCall(dbPool, '/rest/etapes', {}, { role: 'editeur', administrationId: 'ope-onf-973-01' }, {
      typeId: 'mfr',
      statutId: 'fai',
      titreDemarcheId: '',
      date: '',
    } as unknown as RestEtapeCreation)

    expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(result.body).toMatchInlineSnapshot(`
      {
        "detail": "La valeur du champ "date" est invalide.",
        "message": "Problème de validation de données",
        "status": 400,
        "zodErrorReadableMessage": "Validation error: Invalid at "date"; date invalide at "date"; Required at "duree"; Required at "dateDebut"; Required at "dateFin"; Required at "substances"; Required at "geojson4326Perimetre"; Required at "geojson4326Points"; Required at "geojsonOriginePoints"; Required at "geojsonOriginePerimetre"; Required at "geojsonOrigineForages"; Required at "geojsonOrigineGeoSystemeId"; Required at "titulaireIds"; Required at "amodiataireIds"; Required at "note"; Required at "contenu"; Required at "heritageProps"; Required at "heritageContenu"; Required at "etapeDocuments"; Required at "entrepriseDocumentIds"; Required at "etapeAvis"",
      }
    `)
  })

  test('ne peut pas créer une étape sur une démarche inexistante (utilisateur admin)', async () => {
    const res = await restNewPostCall(
      dbPool,
      '/rest/etapes',
      {},
      { role: 'admin', administrationId: 'ope-onf-973-01' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        titreDemarcheId: demarcheIdValidator.parse(''),
        date: toCaminoDate('2018-01-01'),
        ...blankEtapeProps,
      }
    )

    expect(res.statusCode).toBe(HTTP_STATUS.NOT_FOUND)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "extra": "L'utilisateur n'a pas accès à la démarche",
        "message": "la démarche n'existe pas",
        "status": 404,
      }
    `)
  })

  test('ne peut pas créer une étape incohérente (asc avec statut fav) (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restNewPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      {
        typeId: 'asc',
        statutId: 'fav',
        titreDemarcheId,
        date: toCaminoDate('2018-01-01'),
        ...blankEtapeProps,
      }
    )

    expect(res.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "extra": "les étapes de la démarche TDE ne sont pas valides",
        "message": "l'étape n'est pas valide",
        "status": 400,
      }
    `)
  })

  test('peut créer une étape asc avec un statut fai (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restNewPostCall(dbPool, '/rest/etapes', {}, userSuper, {
      typeId: 'asc',
      statutId: 'fai',
      titreDemarcheId,
      date: toCaminoDate('2018-01-01'),
      ...blankEtapeProps,
    })

    expect(res.statusCode).toBe(HTTP_STATUS.OK)
  })

  test('peut créer une étape MEN sur un titre ARM en tant que DGTM (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    // une demande antérieure au 01/01/2018 est obligatoire pour pouvoir créer une MEN
    await restNewPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      {
        typeId: 'mfr',
        statutId: 'fai',
        titreDemarcheId,
        date: toCaminoDate('2017-01-01'),
        ...blankEtapeProps,
      }
    )
    const res = await restNewPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      {
        typeId: 'men',
        statutId: 'fai',
        titreDemarcheId,
        date: toCaminoDate('2018-01-01'),
        ...blankEtapeProps,
      }
    )
    expect(res.statusCode, JSON.stringify(res.body)).toBe(HTTP_STATUS.OK)
  })

  test('ne peut pas créer une étape EDE sur un titre ARM en tant que DGTM (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restNewPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      {
        typeId: 'ede',
        statutId: 'fai',
        titreDemarcheId,
        date: toCaminoDate('2018-01-01'),
        ...blankEtapeProps,
        heritageContenu: {
          deal: { motifs: { actif: false }, agent: { actif: false } },
        },
        contenu: {
          deal: { motifs: 'motif', agent: 'agent' },
        },
      }
    )

    expect(res.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "extra": "les étapes de la démarche TDE ne sont pas valides",
        "message": "l'étape n'est pas valide",
        "status": 400,
      }
    `)
  })

  test('ne peut pas créer une étape avec des titulaires inexistants', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restNewPostCall(dbPool, '/rest/etapes', {}, userSuper, {
      typeId: 'ede',
      statutId: 'fav',
      titreDemarcheId,
      date: toCaminoDate('2018-01-01'),
      ...blankEtapeProps,
      titulaireIds: [entrepriseIdValidator.parse('inexistant')],
      heritageContenu: {
        deal: { motifs: { actif: false }, agent: { actif: false } },
      },
      contenu: {
        deal: { motifs: 'motif', agent: 'agent' },
      },
    })

    expect(res.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "message": "certaines entreprises n'existent pas",
        "status": 400,
      }
    `)
  })

  test('peut créer une étape mfr en brouillon avec un champ obligatoire manquant (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const res = await restNewPostCall(dbPool, '/rest/etapes', {}, userSuper, {
      typeId: 'mfr',
      statutId: 'fai',
      titreDemarcheId,
      date: toCaminoDate('2018-01-01'),
      ...blankEtapeProps,
      heritageContenu: {
        arm: {
          mecanise: { actif: true },
          franchissements: { actif: true },
        },
      },
    })

    expect(res.statusCode).toBe(HTTP_STATUS.OK)
  })
})
