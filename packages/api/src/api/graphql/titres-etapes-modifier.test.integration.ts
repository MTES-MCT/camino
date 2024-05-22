import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport, restCall } from '../../../tests/_utils/index.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'
import Titres from '../../database/models/titres.js'
import { userSuper } from '../../database/user-super.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { isAdministrationRole, Role } from 'camino-common/src/roles.js'
import { toCaminoDate } from 'camino-common/src/date.js'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { ETAPE_HERITAGE_PROPS } from 'camino-common/src/heritage.js'
import { EtapeTypeId, canBeBrouillon } from 'camino-common/src/static/etapesTypes.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { idGenerate } from '../../database/models/_format/id-create.js'
import { copyFileSync, mkdirSync } from 'fs'
import { TempEtapeDocument } from 'camino-common/src/etape.js'
import { tempDocumentNameValidator } from 'camino-common/src/document.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { Knex } from 'knex'
import { testDocumentCreateTemp } from '../../../tests/_utils/administrations-permissions.js'

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
  const etapeModifierQuery = queryImport('titre-etape-modifier')

  test.each([undefined, 'editeur' as Role])('ne peut pas modifier une étape (utilisateur %s)', async (role: Role | undefined) => {
    const res = await graphQLCall(
      dbPool,
      etapeModifierQuery,
      {
        etape: {
          id: '',
          typeId: '',
          statutId: '',
          titreDemarcheId: '',
          date: '',
        },
      },
      role && isAdministrationRole(role) ? { role, administrationId: 'ope-onf-973-01' } : undefined
    )

    expect(res.body.errors[0].message).toBe("l'étape n'existe pas")
  })

  test('ne peut pas modifier une étape sur une démarche inexistante (utilisateur super)', async () => {
    const res = await graphQLCall(
      dbPool,
      etapeModifierQuery,
      {
        etape: {
          id: '',
          typeId: '',
          statutId: '',
          titreDemarcheId: '',
          date: '',
        },
      },
      userSuper
    )

    expect(res.body.errors[0].message).toBe("l'étape n'existe pas")
  })

  test('peut modifier une étape mfr en brouillon (utilisateur super)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate()
    const res = await graphQLCall(
      dbPool,
      etapeModifierQuery,
      {
        etape: {
          id: titreEtapeId,
          typeId: 'mfr',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
          heritageProps: ETAPE_HERITAGE_PROPS.reduce(
            (acc, prop) => {
              acc[prop] = { actif: false }

              return acc
            },
            {} as {
              [key: string]: { actif: boolean }
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
        },
      },
      userSuper
    )

    expect(res.body.errors).toBe(undefined)
  })

  test("ne peut pas modifier une étape avec des entreprises qui n'existent pas", async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate()
    const res = await graphQLCall(
      dbPool,
      etapeModifierQuery,
      {
        etape: {
          id: titreEtapeId,
          typeId: 'mfr',
          statutId: 'fai',
          titulaireIds: ['inexistant'],
          titreDemarcheId,
          date: '2018-01-01',
          heritageProps: ETAPE_HERITAGE_PROPS.reduce(
            (acc, prop) => {
              acc[prop] = { actif: false }

              return acc
            },
            {} as {
              [key: string]: { actif: boolean }
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
        },
      },
      userSuper
    )

    expect(res.body.errors[0].message).toBe("certaines entreprises n'existent pas")
  })

  test("peut supprimer un document d'une demande en brouillon (utilisateur super)", async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate()

    const documentToInsert = testDocumentCreateTemp('aac')

    const etape = {
      id: titreEtapeId,
      typeId: 'mfr',
      statutId: 'fai',
      titreDemarcheId,
      date: '2018-01-01',
      heritageProps: ETAPE_HERITAGE_PROPS.reduce(
        (acc, prop) => {
          acc[prop] = { actif: false }

          return acc
        },
        {} as {
          [key: string]: { actif: boolean }
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

    let res = await graphQLCall(dbPool, etapeModifierQuery, { etape }, userSuper)

    expect(res.body.errors).toBe(undefined)

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
    res = await graphQLCall(dbPool, etapeModifierQuery, { etape: { ...etape, etapeDocuments: [] } }, userSuper)

    expect(res.body.errors).toBe(undefined)
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

    const etape = {
      id: titreEtapeId,
      typeId: 'dae',
      statutId: 'exe',
      titreDemarcheId,
      date: '2018-01-01',
      heritageProps: ETAPE_HERITAGE_PROPS.reduce(
        (acc, prop) => {
          acc[prop] = { actif: false }

          return acc
        },
        {} as {
          [key: string]: { actif: boolean }
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

    let res = await graphQLCall(dbPool, etapeModifierQuery, { etape }, userSuper)

    expect(res.body.errors).toBe(undefined)

    res = await graphQLCall(dbPool, etapeModifierQuery, { etape: { ...etape, etapeDocuments: [] } }, userSuper)

    expect(res.body.errors[0].message).toBe('Impossible de supprimer les documents')
  })

  test('peut modifier une étape mia avec un statut fai (utilisateur super)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('mia')

    const res = await graphQLCall(
      dbPool,
      etapeModifierQuery,
      {
        etape: {
          id: titreEtapeId,
          typeId: 'mia',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
          etapeDocuments: [],
        },
      },
      userSuper
    )

    expect(res.body.errors).toBe(undefined)
  })

  test('ne peut pas modifier une étape mia avec un statut fav (utilisateur admin)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('mia')

    const res = await graphQLCall(
      dbPool,
      etapeModifierQuery,
      {
        etape: {
          id: titreEtapeId,
          typeId: 'mia',
          statutId: 'fav',
          titreDemarcheId,
          date: '2018-01-01',
        },
      },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors[0].message).toBe("l'étape n'existe pas")
  })

  test('peut modifier une étape MEN sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('men')
    const res = await graphQLCall(
      dbPool,
      etapeModifierQuery,
      {
        etape: {
          id: titreEtapeId,
          typeId: 'men',
          statutId: 'fai',
          titreDemarcheId,
          date: '2016-01-01',
          etapeDocuments: [],
        },
      },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors).toBe(undefined)
  })

  test('ne peut pas modifier une étape EDE sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const { titreDemarcheId, titreEtapeId } = await etapeCreate('ede')
    const res = await graphQLCall(
      dbPool,
      etapeModifierQuery,
      {
        etape: {
          id: titreEtapeId,
          typeId: 'ede',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
          heritageContenu: {
            deal: { motifs: { actif: false }, agent: { actif: false } },
          },
          contenu: { deal: { motifs: 'motif', agent: 'agent' } },
        },
      },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors[0].message).toBe("l'étape n'existe pas")
  })
})
