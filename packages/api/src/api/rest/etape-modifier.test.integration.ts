import { dbManager } from '../../../tests/db-manager.js'
import { restPutCall, restCall } from '../../../tests/_utils/index.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'
import Titres from '../../database/models/titres.js'
import { userSuper } from '../../database/user-super.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { caminoDateValidator, toCaminoDate } from 'camino-common/src/date.js'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { ETAPE_HERITAGE_PROPS, EtapeHeritageProps } from 'camino-common/src/heritage.js'
import { EtapeTypeId, canBeBrouillon } from 'camino-common/src/static/etapesTypes.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { idGenerate } from '../../database/models/_format/id-create.js'
import { copyFileSync, mkdirSync } from 'fs'
import { TempEtapeDocument } from 'camino-common/src/etape.js'
import { tempDocumentNameValidator } from 'camino-common/src/document.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { Knex } from 'knex'
import { testDocumentCreateTemp } from '../../../tests/_utils/administrations-permissions.js'
import { RestEtapeModification } from 'camino-common/src/etape-form.js'
import { EntrepriseId } from 'camino-common/src/entreprise.js'

vi.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
let knexInstance: Knex
beforeAll(async () => {
  const { pool, knex } = await dbManager.populateDb()
  dbPool = pool
  knexInstance = knex
})

beforeEach(async () => {
  await knexInstance.raw('delete from etapes_documents')
  await Titres.query().delete()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

async function etapeCreate(typeId?: EtapeTypeId) {
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

  const myTypeId = isNotNullNorUndefined(typeId) ? typeId : 'mfr'
  const titreEtape = await titreEtapeCreate(
    {
      typeId: myTypeId,
      statutId: 'fai',
      ordre: 1,
      titreDemarcheId: titreDemarche.id,
      date: toCaminoDate('2018-01-01'),
      isBrouillon: canBeBrouillon(myTypeId),
    },
    userSuper,
    titre.id
  )

  return { titreDemarcheId: titreDemarche.id, titreEtapeId: titreEtape.id }
}

describe('etapeModifier', () => {
  test('ne peut pas modifier une étape (utilisateur anonyme)', async () => {
    const result = await restPutCall(dbPool, '/rest/etapes', {}, undefined, { id: '', typeId: '', statutId: '', titreDemarcheId: '', date: '' } as unknown as RestEtapeModification)

    expect(result.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  })

  test('ne peut pas modifier une étape mal formatée (utilisateur super)', async () => {
    const result = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, {
      id: '',
      typeId: '',
      statutId: '',
      date: '',
    } as unknown as RestEtapeModification)

    expect(result.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  })

  test('peut modifier une étape mfr en brouillon (utilisateur super)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate()
    const result = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, {
      id: titreEtapeId,
      typeId: 'mfr',
      statutId: 'fai',
      titreDemarcheId,
      date: caminoDateValidator.parse('2018-01-01'),
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
      daeDocument: null,
      aslDocument: null,
      heritageProps: ETAPE_HERITAGE_PROPS.reduce(
        (acc, prop) => {
          acc[prop] = { actif: false }

          return acc
        },
        {} as {
          [key in EtapeHeritageProps]: { actif: boolean }
        }
      ),
      heritageContenu: {
        arm: {
          mecanise: { actif: false },
          franchissements: { actif: false },
        },
      },
      contenu: {
        arm: { mecanise: true, franchissements: 3 },
      },
      etapeDocuments: [],
    })
    expect(result.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })

  test("ne peut pas modifier une étape avec des entreprises qui n'existent pas", async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate()
    const result = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, {
      id: titreEtapeId,
      typeId: 'mfr',
      statutId: 'fai',
      titulaireIds: ['inexistant' as EntrepriseId],
      titreDemarcheId,
      date: caminoDateValidator.parse('2018-01-01'),
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
      amodiataireIds: [],
      notes: null,
      etapeAvis: [],
      entrepriseDocumentIds: [],
      daeDocument: null,
      aslDocument: null,
      heritageProps: ETAPE_HERITAGE_PROPS.reduce(
        (acc, prop) => {
          acc[prop] = { actif: false }

          return acc
        },
        {} as {
          [key in EtapeHeritageProps]: { actif: boolean }
        }
      ),
      heritageContenu: {
        arm: {
          mecanise: { actif: false },
          franchissements: { actif: false },
        },
      },
      contenu: {
        arm: { mecanise: true, franchissements: 3 },
      },
      etapeDocuments: [],
    })

    expect(result.body.errorMessage).toBe("certaines entreprises n'existent pas")
  })

  test("peut supprimer un document d'une demande en brouillon (utilisateur super)", async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate()

    const documentToInsert = testDocumentCreateTemp('aac')

    const etape: RestEtapeModification = {
      id: titreEtapeId,
      typeId: 'mfr',
      statutId: 'fai',
      titreDemarcheId,
      date: caminoDateValidator.parse('2018-01-01'),
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
      amodiataireIds: [],
      titulaireIds: [],
      notes: null,
      etapeAvis: [],
      entrepriseDocumentIds: [],
      daeDocument: null,
      aslDocument: null,
      heritageProps: ETAPE_HERITAGE_PROPS.reduce(
        (acc, prop) => {
          acc[prop] = { actif: false }

          return acc
        },
        {} as {
          [key in EtapeHeritageProps]: { actif: boolean }
        }
      ),
      heritageContenu: {
        arm: {
          mecanise: { actif: false },
          franchissements: { actif: false },
        },
      },
      contenu: {
        arm: { mecanise: true, franchissements: 3 },
      },
      etapeDocuments: [documentToInsert],
    }

    let res = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, etape)

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)

    const documents = await restCall(dbPool, '/rest/etapes/:etapeId/etapeDocuments', { etapeId: titreEtapeId }, userSuper)
    expect(documents.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(documents.body.etapeDocuments).toHaveLength(1)
    expect(documents.body.etapeDocuments[0]).toMatchInlineSnapshot(
      { id: expect.any(String) },
      `
      {
        "description": "desc",
        "entreprises_lecture": true,
        "etape_document_type_id": "aac",
        "id": Any<String>,
        "public_lecture": true,
      }
    `
    )
    res = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, { ...etape, etapeDocuments: [] })

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })

  test("ne peut pas supprimer un document obligatoire d'une étape qui n'est pas en brouillon (utilisateur super)", async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('dae')
    const dir = `${process.cwd()}/files/tmp/`

    const fileName = `existing_temp_file_${idGenerate()}`
    mkdirSync(dir, { recursive: true })
    copyFileSync(`./src/tools/small.pdf`, `${dir}/${fileName}`)
    const documentToInsert: TempEtapeDocument = {
      etape_document_type_id: 'aac',
      entreprises_lecture: true,
      public_lecture: true,
      description: 'desc',
      temp_document_name: tempDocumentNameValidator.parse(fileName),
    }

    const etape: RestEtapeModification = {
      id: titreEtapeId,
      typeId: 'dae',
      statutId: 'exe',
      titreDemarcheId,
      date: caminoDateValidator.parse('2018-01-01'),
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
      amodiataireIds: [],
      titulaireIds: [],
      notes: null,
      etapeAvis: [],
      entrepriseDocumentIds: [],
      daeDocument: null,
      aslDocument: null,

      heritageProps: ETAPE_HERITAGE_PROPS.reduce(
        (acc, prop) => {
          acc[prop] = { actif: false }

          return acc
        },
        {} as {
          [key in EtapeHeritageProps]: { actif: boolean }
        }
      ),
      heritageContenu: {
        mea: {
          arrete: { actif: false },
        },
      },
      contenu: {
        mea: { arrete: 'arrete' },
      },
      etapeDocuments: [documentToInsert],
    }

    let res = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, etape)

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)

    res = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, { ...etape, etapeDocuments: [] })

    expect(res.body.errorMessage).toBe('Impossible de supprimer les documents')
  })

  test('peut modifier une étape mia avec un statut fai (utilisateur super)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('asc')

    const res = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, {
      id: titreEtapeId,
      typeId: 'asc',
      statutId: 'fai',
      titreDemarcheId,
      date: caminoDateValidator.parse('2018-01-01'),
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
      amodiataireIds: [],
      titulaireIds: [],
      notes: null,
      etapeAvis: [],
      entrepriseDocumentIds: [],
      daeDocument: null,
      aslDocument: null,
      heritageProps: ETAPE_HERITAGE_PROPS.reduce(
        (acc, prop) => {
          acc[prop] = { actif: false }

          return acc
        },
        {} as {
          [key in EtapeHeritageProps]: { actif: boolean }
        }
      ),
      heritageContenu: {},
      contenu: {},
    })

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })

  test('peut modifier une étape MEN sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('men')
    const res = await restPutCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      {
        id: titreEtapeId,
        typeId: 'men',
        statutId: 'fai',
        titreDemarcheId,
        date: caminoDateValidator.parse('2016-01-01'),
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
        amodiataireIds: [],
        titulaireIds: [],
        notes: null,
        etapeAvis: [],
        entrepriseDocumentIds: [],
        daeDocument: null,
        aslDocument: null,
        heritageProps: ETAPE_HERITAGE_PROPS.reduce(
          (acc, prop) => {
            acc[prop] = { actif: false }

            return acc
          },
          {} as {
            [key in EtapeHeritageProps]: { actif: boolean }
          }
        ),
        heritageContenu: {},
        contenu: {},
      }
    )

    expect(res.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })

  test('ne peut pas modifier une étape EDE sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('ede')
    const res = await restPutCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      {
        id: titreEtapeId,
        typeId: 'ede',
        statutId: 'fai',
        titreDemarcheId,
        date: caminoDateValidator.parse('2018-01-01'),
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
        amodiataireIds: [],
        titulaireIds: [],
        notes: null,
        etapeAvis: [],
        entrepriseDocumentIds: [],
        daeDocument: null,
        aslDocument: null,
        etapeDocuments: [],
        heritageProps: ETAPE_HERITAGE_PROPS.reduce(
          (acc, prop) => {
            acc[prop] = { actif: false }

            return acc
          },
          {} as {
            [key in EtapeHeritageProps]: { actif: boolean }
          }
        ),
        heritageContenu: {
          deal: { motifs: { actif: false }, agent: { actif: false } },
        },
        contenu: { deal: { motifs: 'motif', agent: 'agent' } },
      }
    )

    expect(res.body.errorMessage).toBe("l'étape n'existe pas")
  })
})
