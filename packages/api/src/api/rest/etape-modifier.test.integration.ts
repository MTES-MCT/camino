import { dbManager } from '../../../tests/db-manager'
import { restPutCall, restCall, restPostCall } from '../../../tests/_utils/index'
import Titres from '../../database/models/titres'
import { userSuper } from '../../database/user-super'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { caminoDateValidator, toCaminoDate } from 'camino-common/src/date'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { ETAPE_HERITAGE_PROPS, EtapeHeritageProps } from 'camino-common/src/heritage'
import { idGenerate } from '../../database/models/_format/id-create'
import { copyFileSync, mkdirSync } from 'fs'
import { TempEtapeDocument } from 'camino-common/src/etape'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { HTTP_STATUS } from 'camino-common/src/http'
import { Knex } from 'knex'
import { testDocumentCreateTemp } from '../../../tests/_utils/administrations-permissions'
import { RestEtapeCreation, RestEtapeModification } from 'camino-common/src/etape-form'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { etapeCreate } from './rest-test-utils'

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

describe('etapeModifier', () => {
  test('ne peut pas modifier une étape (utilisateur anonyme)', async () => {
    const result = await restPutCall(dbPool, '/rest/etapes', {}, undefined, { id: '', typeId: '', statutId: '', titreDemarcheId: '', date: '' } as unknown as RestEtapeModification)

    expect(result.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
  })

  test('ne peut pas modifier une étape mal formatée (utilisateur super)', async () => {
    const result = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, {
      id: '',
      typeId: '',
      statutId: '',
      date: '',
    } as unknown as RestEtapeModification)

    expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
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
      note: { valeur: '', is_avertissement: false },
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
    expect(result.statusCode).toBe(HTTP_STATUS.OK)
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
      note: { valeur: '', is_avertissement: false },
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
      note: { valeur: '', is_avertissement: false },
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

    expect(res.statusCode).toBe(HTTP_STATUS.OK)

    const documents = await restCall(dbPool, '/rest/etapes/:etapeId/etapeDocuments', { etapeId: titreEtapeId }, userSuper)
    expect(documents.statusCode).toBe(HTTP_STATUS.OK)
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

    expect(res.statusCode).toBe(HTTP_STATUS.OK)
  })

  test("ne peut pas supprimer un document obligatoire d'une étape qui n'est pas en brouillon (utilisateur super)", async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('dae', caminoDateValidator.parse('2018-01-01'), 'axm')
    const dir = `${process.cwd()}/files/tmp/`

    const fileName = `existing_temp_file_${idGenerate()}`
    mkdirSync(dir, { recursive: true })
    copyFileSync(`./src/tools/small.pdf`, `${dir}/${fileName}`)
    const documentToInsert: TempEtapeDocument = {
      etape_document_type_id: 'arp',
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
      note: { valeur: '', is_avertissement: false },
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

    expect(res.statusCode).toBe(HTTP_STATUS.OK)

    res = await restPutCall(dbPool, '/rest/etapes', {}, userSuper, { ...etape, etapeDocuments: [] })

    expect(res.body.errorMessage).toBe('le document "Arrêté préfectoral" (arp) est obligatoire')
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
      note: { valeur: '', is_avertissement: false },
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

    expect(res.statusCode).toBe(HTTP_STATUS.OK)
  })

  test('peut modifier une étape MEN sur un titre ARM en tant que DGTM (utilisateur admin)', async () => {
    const { titreDemarcheId } = await etapeCreate('mfr', caminoDateValidator.parse('2017-12-31'))

    const menEtape: RestEtapeCreation = {
      typeId: 'men',
      statutId: 'fai',
      titreDemarcheId,
      date: toCaminoDate('2020-01-01'),
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
      note: { valeur: '', is_avertissement: false },
      etapeAvis: [],
      entrepriseDocumentIds: [],
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
    const res = await restPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      menEtape
    )

    const titreEtapeId = res.body

    const putRes = await restPutCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      {
        id: titreEtapeId,
        daeDocument: null,
        aslDocument: null,
        ...menEtape,
      }
    )

    expect(putRes.statusCode).toBe(HTTP_STATUS.OK)
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
        note: { valeur: '', is_avertissement: false },
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
