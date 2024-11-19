import { dbManager } from '../../../tests/db-manager'
import { restNewPutCall, restCall, restNewPostCall } from '../../../tests/_utils/index'
import Titres from '../../database/models/titres'
import { userSuper } from '../../database/user-super'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { caminoDateValidator, toCaminoDate } from 'camino-common/src/date'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { ETAPE_HERITAGE_PROPS, EtapeHeritageProps } from 'camino-common/src/heritage'
import { idGenerate, newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { copyFileSync, mkdirSync } from 'fs'
import { ETAPE_IS_NOT_BROUILLON, TempEtapeDocument } from 'camino-common/src/etape'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { HTTP_STATUS } from 'camino-common/src/http'
import { Knex } from 'knex'
import { testDocumentCreateTemp } from '../../../tests/_utils/administrations-permissions'
import { RestEtapeCreation, RestEtapeModification } from 'camino-common/src/etape-form'
import { EntrepriseId, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { etapeCreate } from './rest-test-utils'
import { insertTitreGraph, ITitreInsert, multiPolygonWith4Points } from '../../../tests/integration-test-helper'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { DOCUMENTS_TYPES_IDS } from 'camino-common/src/static/documentsTypes'

vi.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))

console.info = vi.fn()
console.error = vi.fn()
console.debug = vi.fn()
console.warn = vi.fn()

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
    const result = await restNewPutCall(dbPool, '/rest/etapes', {}, undefined, { id: '', typeId: '', statutId: '', titreDemarcheId: '', date: '' } as unknown as RestEtapeModification)

    expect(result.body).toMatchInlineSnapshot(`
      {
        "message": "Accès interdit",
        "status": 403,
      }
    `)
  })

  test('ne peut pas modifier une étape mal formatée (utilisateur super)', async () => {
    const result = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, {
      id: '',
      typeId: 'mfr',
      statutId: 'fai',
      date: '',
    } as unknown as RestEtapeModification)

    expect(result.body).toMatchInlineSnapshot(`
      {
        "detail": "La valeur du champ "date" est invalide.",
        "message": "Problème de validation de données",
        "status": 400,
        "zodErrorReadableMessage": "Validation error: Invalid at "date"; date invalide at "date"; Required at "duree"; Required at "dateDebut"; Required at "dateFin"; Required at "substances"; Required at "geojson4326Perimetre"; Required at "geojson4326Points"; Required at "geojsonOriginePoints"; Required at "geojsonOriginePerimetre"; Required at "geojsonOrigineForages"; Required at "geojsonOrigineGeoSystemeId"; Required at "titulaireIds"; Required at "amodiataireIds"; Required at "note"; Required at "contenu"; Required at "titreDemarcheId"; Required at "heritageProps"; Required at "heritageContenu"; Required at "etapeDocuments"; Required at "entrepriseDocumentIds"; Required at "etapeAvis"",
      }
    `)
  })

  test("peut modifier une étape fondamentale avec de l'héritage (utilisateur super)", async () => {
    const mfrId = newEtapeId('titre-id-demarche-id-mfr')
    const rcoId = newEtapeId('titre-id-demarche-id-rco')
    const demarcheId = newDemarcheId('titre-id-demarche-id')
    const titreEtapesPubliques: ITitreInsert = {
      id: newTitreId('titre-id'),
      nom: 'mon titre',
      typeId: 'cxw',
      titreStatutId: 'ind',
      publicLecture: true,
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId: newTitreId('titre-id'),
          typeId: 'oct',
          statutId: 'acc',
          publicLecture: true,
          etapes: [
            {
              id: mfrId,
              typeId: 'mfr',
              ordre: 0,
              titreDemarcheId: demarcheId,
              statutId: 'acc',
              date: toCaminoDate('2020-02-02'),
              administrationsLocales: ['dea-guyane-01'],
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              substances: ['auru'],
              titulaireIds: [entrepriseIdValidator.parse('entrepriseId')],
              geojson4326Perimetre: multiPolygonWith4Points,
              geojsonOriginePerimetre: multiPolygonWith4Points,
              geojsonOrigineGeoSystemeId: '4326',
              duree: 12,
            },
            {
              id: newEtapeId('titre-id-enregistrement'),
              date: toCaminoDate('2020-02-02'),
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              titreDemarcheId: demarcheId,
              typeId: ETAPES_TYPES.enregistrementDeLaDemande,
              statutId: 'fai',
            },
            {
              id: rcoId,
              typeId: 'rco',
              ordre: 0,
              titreDemarcheId: demarcheId,
              statutId: 'fai',
              date: toCaminoDate('2020-02-02'),
              administrationsLocales: ['dea-guyane-01'],
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              duree: null,
              heritageProps: {
                duree: { actif: false },
                amodiataires: { actif: true, etapeId: mfrId },
                dateDebut: { actif: true, etapeId: mfrId },
                dateFin: { actif: true, etapeId: mfrId },
                perimetre: { actif: true, etapeId: mfrId },
                substances: { actif: true, etapeId: mfrId },
                titulaires: { actif: true, etapeId: mfrId },
              },
            },
          ],
        },
      ],
    }
    await insertTitreGraph(titreEtapesPubliques)
    const result = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, {
      id: rcoId,
      typeId: 'rco',
      statutId: 'fai',
      titreDemarcheId: demarcheId,
      date: caminoDateValidator.parse('2020-02-02'),
      duree: null,
      dateDebut: null,
      dateFin: null,
      substances: ['geob'],
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
      heritageProps: {
        ...ETAPE_HERITAGE_PROPS.reduce(
          (acc, prop) => {
            acc[prop] = { actif: true }

            return acc
          },
          {} as {
            [key in EtapeHeritageProps]: { actif: boolean }
          }
        ),
        duree: { actif: true },
      },
      heritageContenu: {},
      contenu: {},
      etapeDocuments: [],
    })
    expect(result.statusCode, JSON.stringify(result.body)).toBe(HTTP_STATUS.OK)
  })

  test('peut modifier une étape mfr en brouillon (utilisateur super)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate()
    const result = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, {
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
    const result = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, {
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

    expect(result.body).toMatchInlineSnapshot(`
      {
        "message": "certaines entreprises n'existent pas",
        "status": 400,
      }
    `)
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

    let res = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, etape)

    expect(res.statusCode, JSON.stringify(res.body)).toBe(HTTP_STATUS.OK)

    let documents = await restCall(dbPool, '/rest/etapes/:etapeId/etapeDocuments', { etapeId: titreEtapeId }, userSuper)
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
    res = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, { ...etape, etapeDocuments: [] })

    expect(res.statusCode).toBe(HTTP_STATUS.OK)

    documents = await restCall(dbPool, '/rest/etapes/:etapeId/etapeDocuments', { etapeId: titreEtapeId }, userSuper)
    expect(documents.statusCode).toBe(HTTP_STATUS.OK)
    expect(documents.body.etapeDocuments).toHaveLength(0)
  })

  test("ne peut pas supprimer un document obligatoire d'une étape qui n'est pas en brouillon (utilisateur super)", async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate(ETAPES_TYPES.avisDesCollectivites, caminoDateValidator.parse('2018-01-01'), 'axm')
    const dir = `${process.cwd()}/files/tmp/`

    const fileName = `existing_temp_file_${idGenerate()}`
    mkdirSync(dir, { recursive: true })
    copyFileSync(`./src/tools/small.pdf`, `${dir}/${fileName}`)
    const documentToInsert: TempEtapeDocument = {
      etape_document_type_id: DOCUMENTS_TYPES_IDS.lettreDeSaisineDesCollectivites,
      entreprises_lecture: true,
      public_lecture: true,
      description: 'desc',
      temp_document_name: tempDocumentNameValidator.parse(fileName),
    }

    const etape: RestEtapeModification = {
      id: titreEtapeId,
      typeId: ETAPES_TYPES.avisDesCollectivites,
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

    let res = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, etape)

    expect(res.statusCode, JSON.stringify(res.body)).toBe(HTTP_STATUS.OK)

    res = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, { ...etape, etapeDocuments: [] })

    expect(res.body).toMatchInlineSnapshot(`
      {
        "detail": "le document "Lettre de saisine des collectivités" (ldc) est obligatoire",
        "message": "l'étape n'est pas valide",
        "status": 400,
      }
    `)
  })

  test('peut modifier une étape mia avec un statut fai (utilisateur super)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('asc')

    const res = await restNewPutCall(dbPool, '/rest/etapes', {}, userSuper, {
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
      date: toCaminoDate('2018-01-01'),
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
    const res = await restNewPostCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      menEtape
    )

    const titreEtapeId = res.body.id

    const putRes = await restNewPutCall(
      dbPool,
      '/rest/etapes',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      {
        id: titreEtapeId,
        ...menEtape,
      }
    )

    expect(putRes.statusCode, JSON.stringify(putRes.body)).toBe(HTTP_STATUS.OK)
  })

  test('ne peut pas modifier une étape EDE sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('ede')
    const res = await restNewPutCall(
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

    expect(res.body).toMatchInlineSnapshot(`
      {
        "message": "L'étape n'existe pas",
        "status": 404,
      }
    `)
  })
})
