import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreCreate } from '../../database/queries/titres.js'
import Titres from '../../database/models/titres.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { isAdministrationRole, Role } from 'camino-common/src/roles.js'
import { userSuper } from '../../database/user-super'

import { afterAll, beforeEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { ETAPE_HERITAGE_PROPS } from 'camino-common/src/heritage.js'
import { testDocumentCreateTemp } from '../../../tests/_utils/administrations-permissions.js'

vi.mock('../../tools/dir-create', () => ({
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
          etapeDocuments: [],
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
          etapeDocuments: [],
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
          etapeDocuments: [],
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
          etapeDocuments: [],
        },
      },
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      }
    )

    expect(res.body.errors[0].message).toBe('statut de l\'étape "fai" invalide pour une type d\'étape ede pour une démarche de type octroi')
  })

  test('ne peut pas créer une étape avec des titulaires inexistants', async () => {
    const titreDemarcheId = await demarcheCreate()

    const res = await graphQLCall(
      dbPool,
      etapeCreerQuery,
      {
        etape: {
          typeId: 'ede',
          statutId: 'fav',
          titreDemarcheId,
          titulaireIds: ['inexistant'],
          date: '2018-01-01',
          heritageContenu: {
            deal: { motifs: { actif: false }, agent: { actif: false } },
          },
          contenu: {
            deal: { motifs: 'motif', agent: 'agent' },
          },
          etapeDocuments: [],
        },
      },
      {
        role: 'super',
      }
    )

    expect(res.body.errors[0].message).toBe('certaines entreprises n\'existent pas')
  })

  test('ne peut pas créer une étape mfr avec un statut fai avec un champ obligatoire manquant (utilisateur super)', async () => {
    const titreDemarcheId = await demarcheCreate()
    const dom = testDocumentCreateTemp('dom')
    const forDoc = testDocumentCreateTemp('for')
    const jpa = testDocumentCreateTemp('jpa')
    const car = testDocumentCreateTemp('car')

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
          etapeDocuments: [dom, forDoc, jpa, car],
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
          etapeDocuments: [],
        },
      },
      userSuper
    )

    expect(res.body.errors).toBe(undefined)
  })
})
