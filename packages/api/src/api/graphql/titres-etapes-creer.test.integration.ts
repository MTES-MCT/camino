import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreEtapePropsIds } from '../../business/utils/titre-etape-heritage-props-find.js'
import Titres from '../../database/models/titres.js'
import TitresTypesDemarchesTypesEtapesTypes from '../../database/models/titres-types--demarches-types-etapes-types.js'
import TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes from '../../database/models/titres-types--demarches-types-etapes-types-justificatifs-types.js'
import { documentCreate } from '../../database/queries/documents.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { isAdministrationRole, Role } from 'camino-common/src/roles.js'
import { userSuper } from '../../database/user-super'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import type { Pool } from 'pg'
import { newDocumentId } from '../../database/models/_format/id-create.js'

vi.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))
vi.mock('../../tools/file-stream-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))
vi.mock('../../tools/file-delete', () => ({
  __esModule: true,
  default: vi.fn(),
}))
console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool

  await TitresTypesDemarchesTypesEtapesTypesJustificatifsTypes.query().delete()

  const mfrTDE = (await TitresTypesDemarchesTypesEtapesTypes.query()
    .where('titreTypeId', 'arm')
    .andWhere('demarcheTypeId', 'oct')
    .andWhere('etapeTypeId', 'mfr')
    .first()) as TitresTypesDemarchesTypesEtapesTypes
  await TitresTypesDemarchesTypesEtapesTypes.query().upsertGraph(mfrTDE)
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

describe('etapeCreer', () => {
  const etapeCreerQuery = queryImport('titre-etape-creer')

  test.each([undefined, 'editeur' as Role])('ne peut pas créer une étape (utilisateur %s)', async (role: Role | undefined) => {
    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      { etape: { typeId: '', statutId: '', titreDemarcheId: '', date: '' } },
      role && isAdministrationRole(role) ? { role, administrationId: 'ope-onf-973-01' } : undefined
    )

    expect(res.body.errors[0].message).toBe("la démarche n'existe pas")
  })

  test('ne peut pas créer une étape sur une démarche inexistante (utilisateur admin)', async () => {
    const res = await graphQLCall(dbPool, etapeCreerQuery, { etape: { typeId: '', statutId: '', titreDemarcheId: '', date: '' } }, { role: 'admin', administrationId: 'ope-onf-973-01' })

    expect(res.body.errors[0].message).toBe("la démarche n'existe pas")
  })

  test('ne peut pas créer une étape de mia faite avec le ptmg', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mia',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
        },
      },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants pour créer cette étape')
  })
  test('ne peut pas créer une étape incohérente (mia avec statut fav) (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      {
        etape: {
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

    expect(res.body.errors[0].message).toBe('statut de l\'étape "fav" invalide pour une type d\'étape mia pour une démarche de type octroi')
  })

  test('peut créer une étape mia avec un statut fai (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mia',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
        },
      },
      userSuper
    )

    expect(res.body.errors).toBeUndefined()
  })

  test('peut créer une étape MEN sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      {
        etape: {
          typeId: 'men',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
        },
      },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors).toBeUndefined()
  })

  test('ne peut pas créer une étape EDE sur un titre ARM en tant que PTMG (utilisateur admin)', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      {
        etape: {
          typeId: 'ede',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
          heritageContenu: {
            deal: { motifs: { actif: false }, agent: { actif: false } },
          },
          contenu: {
            deal: { motifs: 'motif', agent: 'agent' },
          },
        },
      },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors[0].message).toBe('statut de l\'étape "fai" invalide pour une type d\'étape ede pour une démarche de type octroi')
  })

  test('ne peut pas créer une étape mfr avec un statut fai avec un champ obligatoire manquant (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const idDom = newDocumentId(toCaminoDate('2020-01-01'), 'dom')
    const idFor = newDocumentId(toCaminoDate('2020-01-01'), 'for')
    const idJpa = newDocumentId(toCaminoDate('2020-01-01'), 'jpa')
    const idCar = newDocumentId(toCaminoDate('2020-01-01'), 'car')
    await documentCreate({
      id: idDom,
      typeId: 'dom',
      date: toCaminoDate('2020-01-01'),
      uri: 'https://camino.beta.gouv.fr',
    })
    await documentCreate({
      id: idFor,
      typeId: 'for',
      date: toCaminoDate('2020-01-01'),
      uri: 'https://camino.beta.gouv.fr',
    })
    await documentCreate({
      id: idJpa,
      typeId: 'jpa',
      date: toCaminoDate('2020-01-01'),
      uri: 'https://camino.beta.gouv.fr',
    })
    await documentCreate({
      id: idCar,
      typeId: 'car',
      date: toCaminoDate('2020-01-01'),
      uri: 'https://camino.beta.gouv.fr',
    })
    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mfr',
          statutId: 'fai',
          titreDemarcheId,
          date: '2018-01-01',
          duree: 10,
          heritageProps: titreEtapePropsIds.reduce(
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
              mecanise: { actif: true },
              franchissements: { actif: true },
            },
          },
          substances: ['auru'],
          documentIds: [idDom, idFor, idJpa, idCar],
          points: [
            {
              groupe: 1,
              contour: 1,
              point: 1,
              references: [{ geoSystemeId: '4326', coordonnees: { x: 1, y: 2 } }],
            },
            {
              groupe: 1,
              contour: 1,
              point: 2,
              references: [{ geoSystemeId: '4326', coordonnees: { x: 2, y: 2 } }],
            },
            {
              groupe: 1,
              contour: 1,
              point: 3,
              references: [{ geoSystemeId: '4326', coordonnees: { x: 2, y: 1 } }],
            },
            {
              groupe: 1,
              contour: 1,
              point: 4,
              references: [{ geoSystemeId: '4326', coordonnees: { x: 1, y: 1 } }],
            },
          ],
        },
      },
      userSuper
    )

    expect(res.body.errors[0].message).toMatchInlineSnapshot(`"impossible d’éditer la durée"`)
  })

  test('peut créer une étape mfr avec un statut aco avec un champ obligatoire manquant (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      {
        etape: {
          typeId: 'mfr',
          statutId: 'aco',
          titreDemarcheId,
          date: '2018-01-01',
          heritageProps: titreEtapePropsIds.reduce(
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
              mecanise: { actif: true },
              franchissements: { actif: true },
            },
          },
        },
      },
      userSuper
    )

    expect(res.body.errors).toBeUndefined()
  })
})
