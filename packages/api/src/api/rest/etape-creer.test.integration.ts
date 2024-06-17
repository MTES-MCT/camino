import { dbManager } from '../../../tests/db-manager.js'
import { restPostCall } from '../../../tests/_utils/index.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreCreate } from '../../database/queries/titres.js'
import Titres from '../../database/models/titres.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { userSuper } from '../../database/user-super'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { demarcheIdValidator } from 'camino-common/src/demarche.js'
import { GraphqlEtapeCreation, defaultHeritageProps } from 'camino-common/src/etape-form.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { entrepriseIdValidator } from 'camino-common/src/entreprise.js'

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

const demarcheCreate = async () => {
  const titre = await titreCreate(
    {
      nom: 'mon titre',
      typeId: 'arm',
      titreStatutId: 'ind',
      propsTitreEtapesIds: {},
    },
    {}
  )

  const titreDemarche = await titreDemarcheCreate({
    titreId: titre.id,
    typeId: 'oct',
  })

  return titreDemarche.id
}

const blankEtapeProps: Pick<
  GraphqlEtapeCreation,
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
  | 'notes'
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
  notes: null,
  etapeAvis: [],
  entrepriseDocumentIds: [],
  heritageProps: defaultHeritageProps,
  heritageContenu: {},
  contenu: {},
} as const
describe('etapeCreer', () => {
  test('ne peut pas créer une étape (utilisateur non authentifié)', async () => {
    const result = await restPostCall(dbPool, '/rest/etapes', {}, undefined, { typeId: '', statutId: '', titreDemarcheId: '', date: '' } as unknown as GraphqlEtapeCreation)

    expect(result.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  })
  test('ne peut pas créer une étape (utilisateur administration)', async () => {
    const result = await restPostCall(dbPool, '/rest/etapes', {}, { role: 'editeur', administrationId: 'ope-onf-973-01' }, {
      typeId: '',
      statutId: '',
      titreDemarcheId: '',
      date: '',
    } as unknown as GraphqlEtapeCreation)

    expect(result.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    expect(result.body).toStrictEqual({ errorMessage: "l'étape n'est pas correctement formatée" })
  })

  test('ne peut pas créer une étape sur une démarche inexistante (utilisateur admin)', async () => {
    const res = await restPostCall(
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

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "errorMessage": "la démarche n'existe pas",
      }
    `)
  })

  test('ne peut pas créer une étape de mia faite avec le ptmg', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restPostCall(
      dbPool,
      '/rest/etapes',
      {},

      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      {
        typeId: 'sca',
        statutId: 'fai',
        titreDemarcheId,
        date: toCaminoDate('2018-01-01'),
        ...blankEtapeProps,
      }
    )

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "errorMessage": "droits insuffisants pour créer cette étape",
      }
    `)
  })
  test('ne peut pas créer une étape incohérente (asc avec statut fav) (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      {
        typeId: 'asc',
        statutId: 'fav',
        titreDemarcheId,
        date: toCaminoDate('2018-01-01'),
        ...blankEtapeProps,
      }
    )

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "errorMessage": "statut de l'étape "fav" invalide pour une étape asc pour une démarche de type octroi",
      }
    `)
  })

  test('peut créer une étape asc avec un statut fai (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restPostCall(dbPool, '/rest/etapes', {}, userSuper, {
      typeId: 'asc',
      statutId: 'fai',
      titreDemarcheId,
      date: toCaminoDate('2018-01-01'),
      ...blankEtapeProps,
    })

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })

  test('peut créer une étape MEN sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const res = await restPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      {
        typeId: 'men',
        statutId: 'fai',
        titreDemarcheId,
        date: toCaminoDate('2018-01-01'),
        ...blankEtapeProps,
      }
    )

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })

  test('ne peut pas créer une étape EDE sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
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

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "errorMessage": "statut de l'étape "fai" invalide pour une étape ede pour une démarche de type octroi",
      }
    `)
  })

  test('ne peut pas créer une étape avec des titulaires inexistants', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await restPostCall(dbPool, '/rest/etapes', {}, userSuper, {
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

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    expect(res.body).toMatchInlineSnapshot(`
      {
        "errorMessage": "certaines entreprises n'existent pas",
      }
    `)
  })

  test('peut créer une étape mfr en brouillon avec un champ obligatoire manquant (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const res = await restPostCall(dbPool, '/rest/etapes', {}, userSuper, {
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

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })
})
