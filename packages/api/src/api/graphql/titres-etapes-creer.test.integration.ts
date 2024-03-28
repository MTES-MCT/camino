import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreCreate } from '../../database/queries/titres.js'
import Titres from '../../database/models/titres.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { isAdministrationRole, Role } from 'camino-common/src/roles.js'
import { userSuper } from '../../database/user-super'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import type { Pool } from 'pg'
import { newEtapeDocumentId } from '../../database/models/_format/id-create.js'
import { ETAPE_HERITAGE_PROPS } from 'camino-common/src/heritage.js'

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

    expect(res.body.errors).toBe(undefined)
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

    expect(res.body.errors).toBe(undefined)
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
    const idDom = newEtapeDocumentId(toCaminoDate('2020-01-01'), 'dom')
    const idFor = newEtapeDocumentId(toCaminoDate('2020-01-01'), 'for')
    const idJpa = newEtapeDocumentId(toCaminoDate('2020-01-01'), 'jpa')
    const idCar = newEtapeDocumentId(toCaminoDate('2020-01-01'), 'car')
    // FIXME
    // await documentCreate({
    //   id: idDom,
    //   typeId: 'dom',
    //   date: toCaminoDate('2020-01-01'),
    //   fichier: true,
    // })
    // await documentCreate({
    //   id: idFor,
    //   typeId: 'for',
    //   date: toCaminoDate('2020-01-01'),
    //   fichier: true,
    // })
    // await documentCreate({
    //   id: idJpa,
    //   typeId: 'jpa',
    //   date: toCaminoDate('2020-01-01'),
    //   fichier: true,
    // })
    // await documentCreate({
    //   id: idCar,
    //   typeId: 'car',
    //   date: toCaminoDate('2020-01-01'),
    //   fichier: true,
    // })
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
              mecanise: { actif: true },
              franchissements: { actif: true },
            },
          },
          substances: ['auru'],
          // FIXME
          documentIds: [idDom, idFor, idJpa, idCar],
          geojson4326Perimetre: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [1, 2],
                    [2, 3],
                  ],
                ],
              ],
            },
          },
        },
      },
      userSuper
    )

    expect(res.body.errors[0].message).toMatchInlineSnapshot(
      "\"impossible d’éditer la durée, le document d'entreprise « Attestation fiscale » obligatoire est manquant, le document d'entreprise « Curriculum vitae » obligatoire est manquant, le document d'entreprise « Justificatif d’identité » obligatoire est manquant, le document d'entreprise « Justificatif des capacités techniques » obligatoire est manquant, le document d'entreprise « Kbis » obligatoire est manquant, le document d'entreprise « Justificatif des capacités financières » obligatoire est manquant\""
    )
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
              mecanise: { actif: true },
              franchissements: { actif: true },
            },
          },
        },
      },
      userSuper
    )

    expect(res.body.errors).toBe(undefined)
  })
})
